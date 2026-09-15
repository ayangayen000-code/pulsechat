import React, { useState, useMemo } from 'react';
import { CornerUpRight, Search, Check, X, Users, MessageSquare } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useToast } from '../layout/Toast';

export default function ForwardMessageModal({ isOpen, onClose, messageIds = [] }) {
  const { chats, forwardMessages } = useChat();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChatIds, setSelectedChatIds] = useState(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return chats;
    const q = searchQuery.toLowerCase();
    return chats.filter((c) => c.title?.toLowerCase().includes(q));
  }, [chats, searchQuery]);

  if (!isOpen || !messageIds || messageIds.length === 0) return null;

  const toggleSelectChat = (chatId) => {
    setSelectedChatIds((prev) => {
      const next = new Set(prev);
      if (next.has(chatId)) {
        next.delete(chatId);
      } else {
        next.add(chatId);
      }
      return next;
    });
  };

  const handleForward = async () => {
    if (selectedChatIds.size === 0) return;
    try {
      setIsSubmitting(true);
      await forwardMessages(messageIds, Array.from(selectedChatIds));
      showToast(
        `Forwarded ${messageIds.length} ${
          messageIds.length === 1 ? 'message' : 'messages'
        } to ${selectedChatIds.size} ${
          selectedChatIds.size === 1 ? 'chat' : 'chats'
        }`
      );
      setSelectedChatIds(new Set());
      onClose();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to forward messages', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-slide-up">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CornerUpRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Forward Message</h3>
              <p className="text-xs text-zinc-400">
                {messageIds.length} {messageIds.length === 1 ? 'message' : 'messages'} selected
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-zinc-800/60">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-zinc-950 border border-zinc-800/80 text-zinc-300">
            <Search className="w-4 h-4 text-zinc-500 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="bg-transparent border-none outline-none text-xs w-full text-zinc-200 placeholder-zinc-500"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {filteredChats.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500">
              No conversations found
            </div>
          ) : (
            filteredChats.map((chat) => {
              const isSelected = selectedChatIds.has(chat.id);
              return (
                <div
                  key={chat.id}
                  onClick={() => toggleSelectChat(chat.id)}
                  className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-white'
                      : 'hover:bg-zinc-800/60 text-zinc-200 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <img
                      src={
                        chat.avatar ||
                        (chat.type === 'group'
                          ? 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100&auto=format&fit=crop&q=80'
                          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80')
                      }
                      alt={chat.title}
                      className="w-10 h-10 rounded-full object-cover border border-zinc-800 flex-shrink-0"
                    />
                    <div className="truncate text-left">
                      <span className="text-sm font-semibold block truncate">
                        {chat.title}
                      </span>
                      <span className="text-xs text-zinc-400 block truncate">
                        {chat.type === 'group' ? 'Group conversation' : `@${chat.other_user?.user_id || 'direct'}`}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${
                      isSelected
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-zinc-700 bg-zinc-800/50'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 flex items-center justify-between bg-zinc-950/40">
          <span className="text-xs text-zinc-400">
            {selectedChatIds.size} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={selectedChatIds.size === 0 || isSubmitting}
              onClick={handleForward}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-glow shadow-emerald-600/20 transition-all flex items-center gap-1.5"
            >
              <CornerUpRight className="w-4 h-4" />
              <span>Forward {selectedChatIds.size > 0 ? `(${selectedChatIds.size})` : ''}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
