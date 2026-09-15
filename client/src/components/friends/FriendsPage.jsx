import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  QrCode,
  Search,
  MessageSquare,
  Check,
  X,
  Shield,
  MoreHorizontal,
  Trash2,
  Ban,
  Clock,
  Loader2
} from 'lucide-react';
import { api } from '../../services/api';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../layout/Toast';
import AddFriendModal from './AddFriendModal';
import QRCodeModal from './QRCodeModal';

export default function FriendsPage({ onOpenChat }) {
  const { user, setPendingRequestsCount } = useAuth();
  const { createDirectChat, onlineUserIds } = useChat();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('friends'); // 'friends', 'requests', 'sent', 'blocked'
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [sent, setSent] = useState([]);
  const [blocked, setBlocked] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [actionMenuUser, setActionMenuUser] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [friendsRes, reqRes, sentRes, blockedRes] = await Promise.all([
        api.get('/friends'),
        api.get('/friends/requests'),
        api.get('/friends/sent'),
        api.get('/friends/blocked')
      ]);

      setFriends(friendsRes.friends || []);
      setRequests(reqRes.requests || []);
      setSent(sentRes.sent || []);
      setBlocked(blockedRes.blocked || []);
      setPendingRequestsCount(reqRes.requests?.length || 0);
    } catch (err) {
      console.error('Failed to load friends data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStartChat = async (friendId) => {
    try {
      const convId = await createDirectChat(friendId);
      if (onOpenChat) onOpenChat(convId);
    } catch (e) {
      showToast('Failed to start chat', 'error');
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await api.post('/friends/accept', { requestId });
      showToast('Friend request accepted!');
      loadData();
    } catch (e) {
      showToast('Action failed', 'error');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await api.post('/friends/reject', { requestId });
      showToast('Friend request declined');
      loadData();
    } catch (e) {
      showToast('Action failed', 'error');
    }
  };

  const handleCancelRequest = async (requestId) => {
    try {
      await api.post('/friends/cancel', { requestId });
      showToast('Request cancelled');
      loadData();
    } catch (e) {
      showToast('Action failed', 'error');
    }
  };

  const handleRemoveFriend = async (friendId) => {
    if (window.confirm('Remove this friend?')) {
      try {
        await api.post('/friends/remove', { friendId });
        showToast('Friend removed');
        loadData();
      } catch (e) {
        showToast('Failed to remove friend', 'error');
      }
    }
    setActionMenuUser(null);
  };

  const handleBlockUser = async (targetUserId) => {
    if (window.confirm('Block this user? You will not receive messages from them.')) {
      try {
        await api.post('/friends/block', { targetUserId });
        showToast('User blocked');
        loadData();
      } catch (e) {
        showToast('Failed to block user', 'error');
      }
    }
    setActionMenuUser(null);
  };

  const handleUnblockUser = async (targetUserId) => {
    try {
      await api.post('/friends/unblock', { targetUserId });
      showToast('User unblocked');
      loadData();
    } catch (e) {
      showToast('Failed to unblock', 'error');
    }
  };

  const filteredFriends = friends.filter((f) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return f.username.toLowerCase().includes(q) || f.user_id.toLowerCase().includes(q);
  });

  return (
    <div
      className="flex-1 h-full bg-zinc-950 flex flex-col select-none overflow-y-auto"
      onClick={() => setActionMenuUser(null)}
    >
      {/* Top Header */}
      <div className="p-4 sm:p-6 border-b border-zinc-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Friends & Connections</h1>
          <p className="text-xs text-zinc-400 mt-0.5">Manage your private network using unique User IDs</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowQrModal(true)}
            className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <QrCode className="w-4 h-4 text-brand" />
            <span>My QR Code</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-semibold flex items-center gap-2 shadow-glow shadow-brand/20 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Friend by ID</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-2 px-4 sm:px-6 pt-3 pb-2 border-b border-zinc-800/40 overflow-x-auto">
        {[
          { id: 'friends', label: 'Friends', count: friends.length },
          { id: 'requests', label: 'Requests', count: requests.length },
          { id: 'sent', label: 'Sent', count: sent.length },
          { id: 'blocked', label: 'Blocked', count: blocked.length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === tab.id
                ? 'bg-zinc-800 text-brand shadow-subtle border border-zinc-700/60'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${
                activeTab === tab.id ? 'bg-brand/20 text-brand' : 'bg-zinc-800 text-zinc-400'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 p-4 sm:p-6">
        {loading ? (
          <div className="h-64 flex items-center justify-center text-zinc-500">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : activeTab === 'friends' ? (
          /* Friends Tab */
          <div>
            {/* Search filter for friends */}
            <div className="relative mb-4 max-w-md">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search friends by name or ID..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 outline-none focus:border-brand"
              />
            </div>

            {filteredFriends.length === 0 ? (
              <div className="h-60 flex flex-col items-center justify-center text-center text-zinc-500">
                <Users className="w-10 h-10 mb-3 text-zinc-600" />
                <h4 className="text-sm font-semibold text-zinc-300">No friends found</h4>
                <p className="text-xs text-zinc-500 mt-1 max-w-xs">
                  Find your friends using their unique User ID or share your QR code.
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-4 px-4 py-2 rounded-xl bg-brand text-white text-xs font-semibold hover:bg-brand-hover shadow-subtle transition-all"
                >
                  Add Friend
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredFriends.map((f) => {
                  const isOnline = onlineUserIds.has(f.id);
                  return (
                    <div
                      key={f.id}
                      className="p-4 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700/80 transition-all flex flex-col justify-between relative group"
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3 truncate">
                          <div className="relative flex-shrink-0">
                            <img
                              src={f.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                              alt={f.username}
                              onError={(e) => {
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                              }}
                              className="w-12 h-12 rounded-2xl object-cover border border-zinc-800"
                            />
                            {isOnline && (
                              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-zinc-950" />
                            )}
                          </div>
                          <div className="truncate">
                            <h4 className="text-sm font-bold text-white truncate">{f.username}</h4>
                            <span className="text-xs font-mono text-zinc-400">{f.user_id}</span>
                            <div className="text-[11px] text-zinc-500 truncate mt-0.5">
                              {f.bio || (isOnline ? 'Active now' : 'Offline')}
                            </div>
                          </div>
                        </div>

                        {/* More Action Menu */}
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActionMenuUser(actionMenuUser?.id === f.id ? null : f);
                            }}
                            className="p-1.5 rounded-xl text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>

                          {actionMenuUser?.id === f.id && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-0 top-full mt-1 w-36 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl p-1.5 flex flex-col gap-0.5 z-30 animate-slide-up text-xs"
                            >
                              <button
                                onClick={() => handleRemoveFriend(f.id)}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-rose-500/10 text-rose-400 text-left transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Remove</span>
                              </button>
                              <button
                                onClick={() => handleBlockUser(f.id)}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-zinc-800 text-zinc-300 text-left transition-colors"
                              >
                                <Ban className="w-3.5 h-3.5" />
                                <span>Block User</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Message Trigger */}
                      <button
                        onClick={() => handleStartChat(f.id)}
                        className="w-full py-2 rounded-xl bg-zinc-800 hover:bg-brand hover:text-white text-zinc-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-subtle"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Message</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : activeTab === 'requests' ? (
          /* Requests Tab */
          <div>
            {requests.length === 0 ? (
              <div className="h-60 flex flex-col items-center justify-center text-center text-zinc-500">
                <Check className="w-10 h-10 mb-3 text-emerald-500/50" />
                <h4 className="text-sm font-semibold text-zinc-300">All caught up!</h4>
                <p className="text-xs text-zinc-500 mt-1">No pending friend requests at this time.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {requests.map((r) => (
                  <div
                    key={r.request_id}
                    className="p-4 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col justify-between"
                  >
                    <div className="flex items-center gap-3 mb-4 truncate">
                      <img
                        src={r.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                        alt={r.username}
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                        }}
                        className="w-12 h-12 rounded-2xl object-cover"
                      />
                      <div className="truncate">
                        <h4 className="text-sm font-bold text-white truncate">{r.username}</h4>
                        <span className="text-xs font-mono text-zinc-400">{r.user_id}</span>
                        <div className="text-[11px] text-zinc-500 truncate">{r.bio || 'Wants to connect with you'}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAcceptRequest(r.request_id)}
                        className="flex-1 py-2 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-subtle transition-all"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Accept</span>
                      </button>
                      <button
                        onClick={() => handleRejectRequest(r.request_id)}
                        className="flex-1 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Decline</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : activeTab === 'sent' ? (
          /* Sent Tab */
          <div>
            {sent.length === 0 ? (
              <div className="h-60 flex flex-col items-center justify-center text-center text-zinc-500">
                <Clock className="w-10 h-10 mb-3 text-zinc-600" />
                <h4 className="text-sm font-semibold text-zinc-300">No pending sent requests</h4>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {sent.map((s) => (
                  <div key={s.request_id} className="p-4 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-3 truncate">
                      <img
                        src={s.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                        alt={s.username}
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                        }}
                        className="w-10 h-10 rounded-2xl object-cover"
                      />
                      <div className="truncate">
                        <h4 className="text-xs font-bold text-white truncate">{s.username}</h4>
                        <span className="text-[11px] font-mono text-zinc-500">{s.user_id}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCancelRequest(s.request_id)}
                      className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-rose-500/20 hover:text-rose-400 text-zinc-300 text-xs font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Blocked Tab */
          <div>
            {blocked.length === 0 ? (
              <div className="h-60 flex flex-col items-center justify-center text-center text-zinc-500">
                <Shield className="w-10 h-10 mb-3 text-zinc-600" />
                <h4 className="text-sm font-semibold text-zinc-300">No blocked users</h4>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {blocked.map((b) => (
                  <div key={b.id} className="p-4 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-3 truncate">
                      <img
                        src={b.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                        alt={b.username}
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                        }}
                        className="w-10 h-10 rounded-2xl object-cover opacity-60"
                      />
                      <div className="truncate">
                        <h4 className="text-xs font-bold text-zinc-300 truncate">{b.username}</h4>
                        <span className="text-[11px] font-mono text-zinc-500">{b.user_id}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleUnblockUser(b.id)}
                      className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors"
                    >
                      Unblock
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showAddModal && (
        <AddFriendModal
          onClose={() => setShowAddModal(false)}
          onRequestSent={loadData}
        />
      )}

      {showQrModal && (
        <QRCodeModal
          userId={user?.user_id}
          username={user?.username}
          onClose={() => setShowQrModal(false)}
        />
      )}
    </div>
  );
}
