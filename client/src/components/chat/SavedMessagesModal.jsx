import React, { useState, useEffect, useMemo } from 'react';
import {
  Star,
  Search,
  X,
  CornerUpRight,
  Trash2,
  Copy,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useToast } from '../layout/Toast';
import { jumpToMessage } from './PinnedMessagesBanner';

export default function SavedMessagesModal({ isOpen, onClose, onForwardMessage }) {
  const { savedMessages, loadSavedMessages, unsaveMessage, setActiveChatId } = useChat();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadSavedMessages();
    }
  }, [isOpen, loadSavedMessages]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return savedMessages;
    const q = searchQuery.toLowerCase();
    return savedMessages.filter(
      (m) =>
        m.content?.toLowerCase().includes(q) ||
        m.sender_name?.toLowerCase().includes(q) ||
        m.conversation_title?.toLowerCase().includes(q)
    );
  }, [savedMessages, searchQuery]);

  if (!isOpen) return null;

  const handleJumpToChat = (item) => {
    onClose();
    setActiveChatId(item.conversation_id);
    setTimeout(() => {
      jumpToMessage(item.message_id || item.id);
    }, 400);
  };

  const handleUnsave = async (item) => {
    try {
      await unsaveMessage(item.message_id || item.id);
      showToast('Removed from Saved Messages');
    } catch (err) {
      showToast('Failed to remove saved message', 'error');
    }
  };

  const handleCopy = (item) => {
    if (item.content) {
      navigator.clipboard.writeText(item.content);
      showToast('Copied to clipboard');
    }
  };

  const formatTimestamp = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-slide-up">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Star className="w-5 h-5 fill-amber-400/20" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Saved Messages</h3>
              <p className="text-xs text-zinc-400">
                {savedMessages.length} starred {savedMessages.length === 1 ? 'item' : 'items'}
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
              placeholder="Search saved messages..."
              className="bg-transparent border-none outline-none text-xs w-full text-zinc-200 placeholder-zinc-500"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 text-xs flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-zinc-800/60 flex items-center justify-center text-amber-400 mb-2">
                <Star className="w-6 h-6" />
              </div>
              <p className="font-semibold text-zinc-300">No saved messages found</p>
              <p className="text-[11px] text-zinc-500 mt-1 max-w-xs">
                Star any important message in your chats to save it here for quick reference.
              </p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id || item.message_id}
                className="group relative p-3.5 rounded-2xl bg-zinc-950/60 hover:bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col gap-2"
              >
                {/* Header: Sender & Conv name & Date */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-bold text-brand truncate">
                      {item.sender_name}
                    </span>
                    <span className="text-[11px] text-zinc-500 truncate">
                      in {item.conversation_title || 'Chat'}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-500 flex-shrink-0">
                    {formatTimestamp(item.created_at)}
                  </span>
                </div>

                {/* Content */}
                <div className="text-xs text-zinc-200 leading-relaxed break-words">
                  {item.type === 'text' && <p>{item.content}</p>}
                  {item.type === 'image' && (
                    <div className="flex items-center gap-2 text-zinc-400">
                      <span className="font-semibold text-zinc-300">📷 Photo</span>
                    </div>
                  )}
                  {item.type === 'video' && (
                    <div className="flex items-center gap-2 text-zinc-400">
                      <span className="font-semibold text-zinc-300">🎥 Video</span>
                    </div>
                  )}
                  {(item.type === 'audio' || item.type === 'voice') && (
                    <div className="flex items-center gap-2 text-zinc-400">
                      <span className="font-semibold text-zinc-300">🎙️ Voice Note</span>
                    </div>
                  )}
                  {item.type === 'file' && (
                    <div className="flex items-center gap-2 text-zinc-400">
                      <span className="font-semibold text-zinc-300">📁 File</span>
                    </div>
                  )}
                  {item.type === 'sticker' && (
                    <div className="flex items-center gap-2 text-zinc-400">
                      <span className="font-semibold text-zinc-300">✨ Sticker</span>
                    </div>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-zinc-900 text-xs">
                  <button
                    type="button"
                    onClick={() => handleJumpToChat(item)}
                    className="inline-flex items-center gap-1.5 text-brand hover:text-brand-hover font-semibold transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Jump to Chat</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {item.type === 'text' && (
                      <button
                        type="button"
                        onClick={() => handleCopy(item)}
                        className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                        title="Copy text"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        if (onForwardMessage) onForwardMessage(item.message_id || item.id);
                      }}
                      className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                      title="Forward"
                    >
                      <CornerUpRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleUnsave(item)}
                      className="p-1.5 rounded-lg hover:bg-rose-500/15 text-zinc-400 hover:text-rose-400 transition-colors"
                      title="Unsave"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
