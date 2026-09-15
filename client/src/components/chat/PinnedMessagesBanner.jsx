import React, { useState } from 'react';
import { Pin, X, ChevronRight, ChevronLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';

export function jumpToMessage(messageId) {
  const el = document.getElementById(`message-${messageId}`);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.remove('animate-pulse-highlight');
    // Trigger reflow to restart animation if clicked again
    void el.offsetWidth;
    el.classList.add('animate-pulse-highlight');
  }
}

export default function PinnedMessagesBanner() {
  const { user } = useAuth();
  const { pinnedMessages, unpinMessage, activeChat } = useChat();
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!pinnedMessages || pinnedMessages.length === 0) return null;

  const safeIndex = Math.min(currentIndex, pinnedMessages.length - 1);
  const currentPin = pinnedMessages[safeIndex];

  const isGroup = activeChat?.type === 'group';
  const isAdmin = isGroup && (activeChat?.owner_id === user?.id || (activeChat?.user_role === 'admin' || activeChat?.user_role === 'owner'));
  const canUnpin = !isGroup || isAdmin || currentPin.pinned_by === user?.id;

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % pinnedMessages.length);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + pinnedMessages.length) % pinnedMessages.length);
  };

  const handleUnpin = (e) => {
    e.stopPropagation();
    unpinMessage(currentPin.message_id || currentPin.id);
  };

  const handleClick = () => {
    jumpToMessage(currentPin.message_id || currentPin.id);
  };

  return (
    <div className="sticky top-2 z-20 mx-3 sm:mx-4 mb-2">
      <div
        onClick={handleClick}
        className="group flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-2xl bg-zinc-900/90 hover:bg-zinc-900 border border-brand/30 shadow-lg backdrop-blur-md cursor-pointer transition-all active:scale-99"
      >
        {/* Left: Pin icon + Sender & Preview */}
        <div className="flex items-center gap-2.5 truncate flex-1">
          <div className="w-8 h-8 rounded-xl bg-brand/15 border border-brand/30 flex items-center justify-center text-brand flex-shrink-0">
            <Pin className="w-4 h-4 fill-brand/30" />
          </div>
          <div className="truncate flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-brand uppercase tracking-wider">
                {pinnedMessages.length > 1
                  ? `Pinned Message (${safeIndex + 1}/${pinnedMessages.length})`
                  : 'Pinned Message'}
              </span>
              <span className="text-[10px] text-zinc-500">• {currentPin.sender_name}</span>
            </div>
            <p className="text-xs text-zinc-200 truncate mt-0.5">
              {currentPin.content || (currentPin.type ? `[${currentPin.type}]` : 'Pinned attachment')}
            </p>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {pinnedMessages.length > 1 && (
            <div className="flex items-center gap-0.5 mr-1">
              <button
                type="button"
                onClick={handlePrev}
                className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white"
                title="Previous pinned message"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white"
                title="Next pinned message"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {canUnpin && (
            <button
              type="button"
              onClick={handleUnpin}
              className="p-1.5 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              title="Unpin message"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
