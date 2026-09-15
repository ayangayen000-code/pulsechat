import React, { useRef, useEffect, useState } from 'react';
import { ArrowDown, MessageCircle } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import MessageBubble from './MessageBubble';
import PinnedMessagesBanner from './PinnedMessagesBanner';

function formatDateDivider(dateStr) {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function MessageList({
  onReply,
  onEdit,
  onForward,
  onDeleteRequest,
  onOpenMoreActions,
  onViewReactions,
  onOpenViewOnce,
  onOpenStickerPack
}) {
  const { messages, activeChat, typingUsers, loadingMessages } = useChat();
  const bottomRef = useRef(null);
  const containerRef = useRef(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  // Auto-scroll on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, typingUsers]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isUp = scrollHeight - scrollTop - clientHeight > 150;
    setShowScrollBottom(isUp);
  };

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Group messages by date
  const grouped = [];
  let lastDate = null;
  messages.forEach((m) => {
    const d = formatDateDivider(m.created_at);
    if (d !== lastDate) {
      grouped.push({ type: 'divider', date: d, id: `div_${m.id}` });
      lastDate = d;
    }
    grouped.push({ type: 'message', message: m, id: m.id });
  });

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto px-1 sm:px-2 py-3 relative flex flex-col justify-start"
    >
      {/* Real Pinned Messages Banner */}
      <PinnedMessagesBanner />

      {/* Messages or Empty State */}
      {loadingMessages ? (
        <div className="flex-1 flex items-center justify-center text-zinc-500 text-xs">
          Loading conversation history...
        </div>
      ) : messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-zinc-500 my-auto select-none">
          <div className="w-14 h-14 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-brand mb-3">
            <MessageCircle className="w-7 h-7" />
          </div>
          <h4 className="text-sm font-semibold text-zinc-200">Start the conversation</h4>
          <p className="text-xs text-zinc-400 mt-1 max-w-xs">
            Send a message, voice recording, or custom sticker to begin chatting.
          </p>
        </div>
      ) : (
        grouped.map((item) => {
          if (item.type === 'divider') {
            return (
              <div key={item.id} className="flex items-center justify-center my-4 select-none">
                <span className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800/80 text-[11px] font-medium text-zinc-400 shadow-sm">
                  {item.date}
                </span>
              </div>
            );
          }
          return (
            <MessageBubble
              key={item.id}
              message={item.message}
              isGroup={activeChat?.type === 'group'}
              onReply={onReply}
              onEdit={onEdit}
              onForward={onForward}
              onDeleteRequest={onDeleteRequest}
              onOpenMoreActions={onOpenMoreActions}
              onViewReactions={onViewReactions}
              onOpenViewOnce={onOpenViewOnce}
              onOpenStickerPack={onOpenStickerPack}
            />
          );
        })
      )}

      {/* Typing Indicator */}
      {typingUsers && typingUsers.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-2 text-xs text-zinc-400 animate-fade-in select-none">
          <div className="flex gap-1 py-1 px-2.5 rounded-full bg-zinc-900 border border-zinc-800">
            <div className="w-1.5 h-1.5 rounded-full bg-brand animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-brand animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-brand animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span className="text-[11px] text-zinc-400 font-medium">
            {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
          </span>
        </div>
      )}

      <div ref={bottomRef} className="h-2" />

      {/* Floating Scroll-to-bottom button */}
      {showScrollBottom && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-20 right-6 sm:right-10 p-2.5 rounded-full bg-brand text-white shadow-glow shadow-brand/30 hover:bg-brand-hover transition-all z-20 animate-slide-up"
          title="Jump to latest message"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
