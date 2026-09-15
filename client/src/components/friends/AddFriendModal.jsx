import React, { useState } from 'react';
import { X, Search, UserPlus, Check, Clock, Loader2, Sparkles } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../layout/Toast';

export default function AddFriendModal({ onClose, onRequestSent }) {
  const [handle, setHandle] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [sendingId, setSendingId] = useState(null);
  const { showToast } = useToast();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!handle.trim()) return;

    try {
      setSearching(true);
      const data = await api.get(`/users/search?q=${encodeURIComponent(handle.trim())}`);
      setResults(data.users || []);
    } catch (err) {
      showToast(err.message || 'Search failed', 'error');
    } finally {
      setSearching(false);
    }
  };

  const sendRequest = async (targetUser) => {
    try {
      setSendingId(targetUser.id);
      const data = await api.post('/friends/request', { targetUserId: targetUser.user_id });
      showToast(data.message || `Request sent to ${targetUser.username}!`);
      // Update relationship locally
      setResults((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, relationship: 'request_sent' } : u))
      );
      if (onRequestSent) onRequestSent();
    } catch (err) {
      showToast(err.message || 'Failed to send request', 'error');
    } finally {
      setSendingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in select-none">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-zinc-100 animate-slide-up">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-zinc-400 hover:text-white p-1 rounded-full hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-2 text-brand text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Discover People</span>
          </div>
          <h3 className="text-2xl font-bold tracking-tight text-white">Add Friend by User ID</h3>
          <p className="text-xs text-zinc-400 mt-1">Search for your friend's unique handle (e.g. @ayan_4821)</p>
        </div>

        <form onSubmit={handleSearch} className="mb-5">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="Enter @user_id or name"
                required
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-brand text-xs text-white placeholder-zinc-500 outline-none transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={searching}
              className="px-4 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-subtle disabled:opacity-50"
            >
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
            </button>
          </div>
        </form>

        {/* Results List */}
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {results.length > 0 ? (
            results.map((u) => {
              const isFriend = u.relationship === 'friends';
              const isSent = u.relationship === 'request_sent';
              const isRecv = u.relationship === 'request_received';

              return (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-center gap-3 truncate">
                    <img
                      src={u.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt={u.username}
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                      }}
                      className="w-10 h-10 rounded-2xl object-cover"
                    />
                    <div className="truncate">
                      <div className="text-xs font-semibold text-white truncate">{u.username}</div>
                      <div className="text-[11px] text-zinc-500 font-mono">{u.user_id}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isFriend && (
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Friends
                      </span>
                    )}

                    {isSent && (
                      <span className="px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-400 text-[11px] font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Sent
                      </span>
                    )}

                    {isRecv && (
                      <span className="px-2.5 py-1 rounded-lg bg-brand/15 text-brand text-[11px] font-semibold">
                        Pending
                      </span>
                    )}

                    {!isFriend && !isSent && !isRecv && (
                      <button
                        onClick={() => sendRequest(u)}
                        disabled={sendingId === u.id}
                        className="px-3 py-1.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-semibold flex items-center gap-1.5 shadow-subtle transition-all disabled:opacity-50"
                      >
                        {sendingId === u.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <UserPlus className="w-3.5 h-3.5" />
                        )}
                        <span>Add</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-zinc-500 text-xs">
              Search by username or exact ID like <span className="font-mono text-zinc-400">@sarah_sky</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
