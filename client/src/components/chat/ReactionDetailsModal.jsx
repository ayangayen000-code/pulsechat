import React, { useState, useEffect } from 'react';
import { Smile, X } from 'lucide-react';
import { api } from '../../services/api';

export default function ReactionDetailsModal({ isOpen, onClose, message }) {
  const [reactions, setReactions] = useState([]);
  const [activeEmoji, setActiveEmoji] = useState('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && message) {
      // Use existing reactions or fetch fresh details
      if (message.reactions) {
        setReactions(message.reactions);
      }
      setLoading(true);
      api
        .get(`/messages/${message.id}/reactions`)
        .then((data) => {
          if (data.reactions) {
            setReactions(data.reactions);
          }
        })
        .catch((err) => {
          console.error('Failed to load reaction details:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, message]);

  if (!isOpen || !message) return null;

  const emojiCounts = reactions.reduce((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
    return acc;
  }, {});

  const filteredReactions =
    activeEmoji === 'all'
      ? reactions
      : reactions.filter((r) => r.emoji === activeEmoji);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-slide-up">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smile className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Reactions</h3>
            <span className="text-xs text-zinc-400">({reactions.length})</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Emoji Tabs */}
        <div className="flex items-center gap-1.5 p-2 px-3 border-b border-zinc-800/80 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveEmoji('all')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
              activeEmoji === 'all'
                ? 'bg-zinc-800 text-white shadow-xs'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            All {reactions.length}
          </button>
          {Object.entries(emojiCounts).map(([emoji, count]) => (
            <button
              key={emoji}
              type="button"
              onClick={() => setActiveEmoji(emoji)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                activeEmoji === emoji
                  ? 'bg-zinc-800 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <span>{emoji}</span>
              <span className="text-[10px] text-zinc-400">{count}</span>
            </button>
          ))}
        </div>

        {/* User list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {filteredReactions.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500">
              No reactions
            </div>
          ) : (
            filteredReactions.map((r, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-zinc-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={
                      r.avatar ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                    }
                    alt={r.username}
                    className="w-9 h-9 rounded-full object-cover border border-zinc-800"
                  />
                  <div>
                    <span className="text-xs font-bold text-zinc-100 block">
                      {r.display_name || r.username}
                    </span>
                    <span className="text-[10px] text-zinc-500 block">
                      @{r.username}
                    </span>
                  </div>
                </div>
                <span className="text-xl">{r.emoji}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
