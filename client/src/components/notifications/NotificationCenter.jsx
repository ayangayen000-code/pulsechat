import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCheck,
  Trash2,
  MessageSquare,
  UserPlus,
  Users,
  Smile,
  Reply,
  Loader2
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { useToast } from '../layout/Toast';

export default function NotificationCenter({ onOpenChat, onOpenFriends }) {
  const { setUnreadNotificationsCount } = useAuth();
  const { setActiveChatId } = useChat();
  const { showToast } = useToast();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await api.get('/notifications');
      setNotifications(data.notifications || []);
      setUnreadNotificationsCount(
        (data.notifications || []).filter((n) => !n.is_read).length
      );
    } catch (e) {
      console.error('Failed to load notifications:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markAllRead = async () => {
    try {
      await api.post('/notifications/read-all', {});
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadNotificationsCount(0);
      showToast('All notifications marked as read');
    } catch (e) {
      showToast('Action failed', 'error');
    }
  };

  const clearAll = async () => {
    if (window.confirm('Clear all notifications?')) {
      try {
        await api.del('/notifications');
        setNotifications([]);
        setUnreadNotificationsCount(0);
        showToast('Notifications cleared');
      } catch (e) {
        showToast('Action failed', 'error');
      }
    }
  };

  const handleNotificationClick = async (n) => {
    // Mark as read
    if (!n.is_read) {
      try {
        await api.post(`/notifications/${n.id}/read`, {});
        setNotifications((prev) =>
          prev.map((item) => (item.id === n.id ? { ...item, is_read: true } : item))
        );
      } catch (e) {}
    }

    if (n.data?.conversationId) {
      if (onOpenChat) onOpenChat(n.data.conversationId);
      else setActiveChatId(n.data.conversationId);
    } else if (n.type.includes('friend')) {
      if (onOpenFriends) onOpenFriends();
    }
  };

  const getIcon = (type) => {
    if (type === 'friend_request' || type === 'friend_accepted')
      return <UserPlus className="w-4 h-4 text-brand" />;
    if (type === 'added_to_group' || type === 'group_invite')
      return <Users className="w-4 h-4 text-purple-400" />;
    if (type === 'reaction')
      return <Smile className="w-4 h-4 text-amber-400" />;
    if (type === 'reply')
      return <Reply className="w-4 h-4 text-emerald-400" />;
    return <MessageSquare className="w-4 h-4 text-blue-400" />;
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex-1 h-full bg-zinc-950 flex flex-col select-none overflow-y-auto">
      {/* Top Header */}
      <div className="p-4 sm:p-6 border-b border-zinc-800/60 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Notifications</h1>
          <p className="text-xs text-zinc-400 mt-0.5">Stay updated with activity across your chats</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={markAllRead}
            disabled={notifications.length === 0}
            className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-40"
          >
            <CheckCheck className="w-4 h-4 text-brand" />
            <span className="hidden sm:inline">Mark All Read</span>
          </button>
          <button
            onClick={clearAll}
            disabled={notifications.length === 0}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-rose-500/20 hover:text-rose-400 border border-zinc-800 text-zinc-400 text-xs font-semibold transition-colors disabled:opacity-40"
            title="Clear all notifications"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 p-4 sm:p-6 max-w-3xl">
        {loading ? (
          <div className="h-64 flex items-center justify-center text-zinc-500">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center text-zinc-500">
            <Bell className="w-10 h-10 mb-3 text-zinc-600" />
            <h4 className="text-sm font-semibold text-zinc-300">You're all caught up</h4>
            <p className="text-xs text-zinc-500 mt-1">No new notifications right now.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`flex items-start gap-3.5 p-3.5 rounded-2xl cursor-pointer transition-all border ${
                  !n.is_read
                    ? 'bg-brand/10 border-brand/30 text-white'
                    : 'bg-zinc-900/40 border-zinc-800/80 hover:bg-zinc-900 text-zinc-300'
                }`}
              >
                <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 flex-shrink-0 mt-0.5">
                  {getIcon(n.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-white truncate">{n.title}</h4>
                    <span className="text-[10px] text-zinc-500 flex-shrink-0">{formatTime(n.created_at)}</span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{n.content}</p>
                </div>

                {!n.is_read && (
                  <span className="w-2 h-2 rounded-full bg-brand flex-shrink-0 mt-2" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
