import React, { useState } from 'react';
import {
  Search,
  Plus,
  Users,
  Pin,
  VolumeX,
  Check,
  CheckCheck,
  Image,
  Video,
  Mic,
  FileText,
  Sticker,
  MoreVertical,
  Trash2,
  BellOff,
  BellRing,
  Sparkles
} from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { useToast } from '../layout/Toast';

export default function ChatList({ onOpenNewGroup, onOpenFriends, onOpenStickerStore }) {
  const { chats, activeChatId, setActiveChatId, onlineUserIds, refreshChats } = useChat();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'direct', 'groups', 'unread'
  const [contextMenuChat, setContextMenuChat] = useState(null);
  const [contextPos, setContextPos] = useState({ x: 0, y: 0 });

  const formatMessageTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const handleContextMenu = (e, chat) => {
    e.preventDefault();
    setContextMenuChat(chat);
    setContextPos({ x: e.clientX, y: e.clientY });
  };

  const togglePin = async (chat) => {
    try {
      await api.post(`/chats/${chat.id}/pin`, {});
      showToast(chat.is_pinned ? 'Chat unpinned' : 'Chat pinned');
      refreshChats();
    } catch (e) {
      showToast('Action failed', 'error');
    }
    setContextMenuChat(null);
  };

  const toggleMute = async (chat) => {
    try {
      await api.post(`/chats/${chat.id}/mute`, {});
      showToast(chat.is_muted ? 'Notifications unmuted' : 'Chat muted');
      refreshChats();
    } catch (e) {
      showToast('Action failed', 'error');
    }
    setContextMenuChat(null);
  };

  const deleteChat = async (chat) => {
    if (window.confirm(`Remove conversation "${chat.title}"?`)) {
      try {
        await api.del(`/chats/${chat.id}`);
        showToast('Conversation removed');
        if (activeChatId === chat.id) setActiveChatId(null);
        refreshChats();
      } catch (e) {
        showToast('Failed to remove chat', 'error');
      }
    }
    setContextMenuChat(null);
  };

  // Filter chats
  const filteredChats = chats.filter((c) => {
    // Tab filter
    if (filter === 'direct' && c.type !== 'direct') return false;
    if (filter === 'groups' && c.type !== 'group') return false;
    if (filter === 'unread' && (!c.unread_count || c.unread_count === 0)) return false;

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchHandle = c.other_user?.user_id?.toLowerCase().includes(q);
      const matchLastMsg = c.last_message?.content?.toLowerCase().includes(q);
      return matchTitle || matchHandle || matchLastMsg;
    }
    return true;
  });

  return (
    <div
      className="w-full md:w-80 lg:w-96 h-full bg-zinc-950 border-r border-zinc-800/80 flex flex-col select-none flex-shrink-0"
      onClick={() => setContextMenuChat(null)}
    >
      {/* Header */}
      <div className="p-4 border-b border-zinc-800/60 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">Messages</h2>
          <p className="text-xs text-zinc-500 font-mono mt-0.5">{user?.user_id}</p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenStickerStore}
            className="p-2 rounded-xl bg-brand/10 hover:bg-brand/20 text-brand border border-brand/20 transition-colors"
            title="Sticker Store"
          >
            <Sparkles className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenNewGroup}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors"
            title="Create New Group"
          >
            <Users className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="px-4 pt-3 pb-2">
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-brand transition-all"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 px-4 py-1.5 border-b border-zinc-800/40 overflow-x-auto">
        {[
          { id: 'all', label: 'All' },
          { id: 'direct', label: 'Direct' },
          { id: 'groups', label: 'Groups' },
          { id: 'unread', label: 'Unread' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              filter === tab.id
                ? 'bg-zinc-800 text-brand shadow-subtle border border-zinc-700/60'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Chat List Items */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredChats.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center p-6 text-center text-zinc-500">
            <p className="text-sm font-medium text-zinc-300">No conversations found</p>
            <p className="text-xs text-zinc-500 mt-1">
              Find friends with their User ID or start a new group.
            </p>
            <button
              onClick={onOpenFriends}
              className="mt-4 px-4 py-2 rounded-xl bg-brand text-white text-xs font-semibold shadow-glow shadow-brand/20 hover:bg-brand-hover transition-all"
            >
              Add Friends by ID
            </button>
          </div>
        ) : (
          filteredChats.map((chat) => {
            const isActive = activeChatId === chat.id;
            const isGroup = chat.type === 'group';
            const isOnline =
              !isGroup && chat.other_user && onlineUserIds.has(chat.other_user.id);

            return (
              <div
                key={chat.id}
                onClick={() => setActiveChatId(chat.id)}
                onContextMenu={(e) => handleContextMenu(e, chat)}
                className={`relative group flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${
                  isActive
                    ? 'bg-brand/15 border border-brand/30 shadow-subtle'
                    : 'hover:bg-zinc-900/90 border border-transparent'
                }`}
              >
                {/* Avatar with status dot */}
                <div className="relative flex-shrink-0">
                  <img
                    src={
                      chat.avatar ||
                      (isGroup
                        ? 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100&auto=format&fit=crop&q=80'
                        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80')
                    }
                    alt={chat.title}
                    onError={(e) => {
                      e.currentTarget.src = isGroup
                        ? 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100&auto=format&fit=crop&q=80'
                        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80';
                    }}
                    className="w-12 h-12 rounded-2xl object-cover border border-zinc-800"
                  />
                  {!isGroup && isOnline && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-zinc-950" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4
                      className={`text-sm font-semibold truncate ${
                        isActive ? 'text-white' : 'text-zinc-200 group-hover:text-white'
                      }`}
                    >
                      {chat.title}
                    </h4>
                    <span className="text-[11px] text-zinc-500 flex-shrink-0 ml-1">
                      {formatMessageTime(chat.last_message?.created_at || chat.updated_at)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400 truncate max-w-[180px]">
                      {chat.last_message ? (
                        <>
                          {chat.last_message.type === 'image' && <Image className="w-3.5 h-3.5 flex-shrink-0 text-emerald-400" />}
                          {chat.last_message.type === 'video' && <Video className="w-3.5 h-3.5 flex-shrink-0 text-purple-400" />}
                          {chat.last_message.type === 'voice' && <Mic className="w-3.5 h-3.5 flex-shrink-0 text-brand" />}
                          {chat.last_message.type === 'file' && <FileText className="w-3.5 h-3.5 flex-shrink-0 text-blue-400" />}
                          {chat.last_message.type === 'sticker' && <Sticker className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" />}
                          <span className="truncate">{chat.last_message.content || `[${chat.last_message.type}]`}</span>
                        </>
                      ) : (
                        <span className="text-zinc-600 italic">No messages yet</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0 ml-1">
                      {chat.is_pinned && <Pin className="w-3 h-3 text-brand fill-current" />}
                      {chat.is_muted && <VolumeX className="w-3 h-3 text-zinc-600" />}
                      {chat.unread_count > 0 && (
                        <span className="min-w-[18px] h-[18px] px-1.5 rounded-full bg-brand text-white text-[10px] font-bold flex items-center justify-center shadow-subtle animate-pulse">
                          {chat.unread_count > 99 ? '99+' : chat.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Right-click Context Menu */}
      {contextMenuChat && (
        <div
          style={{ top: contextPos.y, left: Math.min(contextPos.x, window.innerWidth - 180) }}
          className="fixed z-50 w-44 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl p-1.5 flex flex-col gap-0.5 animate-slide-up text-xs text-zinc-200 select-none"
        >
          <button
            onClick={() => togglePin(contextMenuChat)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-zinc-800 text-left transition-colors"
          >
            <Pin className="w-3.5 h-3.5 text-brand" />
            <span>{contextMenuChat.is_pinned ? 'Unpin conversation' : 'Pin to top'}</span>
          </button>
          <button
            onClick={() => toggleMute(contextMenuChat)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-zinc-800 text-left transition-colors"
          >
            {contextMenuChat.is_muted ? <BellRing className="w-3.5 h-3.5 text-zinc-400" /> : <BellOff className="w-3.5 h-3.5 text-zinc-400" />}
            <span>{contextMenuChat.is_muted ? 'Unmute alerts' : 'Mute alerts'}</span>
          </button>
          <button
            onClick={() => deleteChat(contextMenuChat)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-rose-500/10 text-rose-400 text-left transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete chat</span>
          </button>
        </div>
      )}
    </div>
  );
}
