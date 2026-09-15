import React, { useState, useEffect, useRef } from 'react';
import { Smile, Reply, CornerUpRight, Copy, MoreHorizontal } from 'lucide-react';

const QUICK_REACTIONS = ['❤️', '😂', '🔥', '👍', '😭', '🎉', '😍', '👎'];

export default function MessageFloatingBar({
  message,
  anchorRect,
  onReact,
  onReply,
  onForward,
  onCopy,
  onMore,
  onClose
}) {
  const barRef = useRef(null);
  const [showReactions, setShowReactions] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, placement: 'top' });

  // Calculate intelligent screen positioning
  useEffect(() => {
    if (!anchorRect) return;

    const barWidth = showReactions ? 340 : 220;
    const barHeight = 44;
    const padding = 12;

    // Center horizontally relative to anchor, clamped to viewport boundaries
    let left = anchorRect.left + anchorRect.width / 2 - barWidth / 2;
    left = Math.max(padding, Math.min(window.innerWidth - barWidth - padding, left));

    // Determine whether to place above or below bubble
    let top = anchorRect.top - barHeight - 10;
    let placement = 'top';

    if (top < 60) {
      // If too close to top bar, flip below the bubble
      top = anchorRect.bottom + 10;
      placement = 'bottom';
    }

    setCoords({ top, left, placement });
  }, [anchorRect, showReactions]);

  // Click outside to dismiss
  useEffect(() => {
    const handlePointerDown = (e) => {
      if (barRef.current && !barRef.current.contains(e.target)) {
        onClose();
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);
    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, [onClose]);

  if (!anchorRect) return null;

  return (
    <div
      ref={barRef}
      style={{
        position: 'fixed',
        top: `${coords.top}px`,
        left: `${coords.left}px`,
        zIndex: 50
      }}
      className="animate-slide-up flex items-center gap-1 p-1 rounded-2xl bg-zinc-900/95 border border-zinc-700/70 shadow-2xl backdrop-blur-xl select-none"
    >
      {/* Quick Reaction Pills */}
      {showReactions ? (
        <div className="flex items-center gap-1 px-1">
          {QUICK_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => {
                onReact(emoji);
                onClose();
              }}
              className="w-8 h-8 rounded-xl hover:bg-zinc-800 flex items-center justify-center text-lg active:scale-125 transition-transform"
            >
              {emoji}
            </button>
          ))}
          <div className="h-4 w-px bg-zinc-800 mx-0.5" />
          <button
            type="button"
            onClick={() => setShowReactions(false)}
            className="p-1.5 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            title="Back to actions"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* Action Buttons */
        <div className="flex items-center gap-0.5">
          {/* React */}
          <button
            type="button"
            onClick={() => setShowReactions(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-medium transition-colors active:scale-95"
            title="React with emoji"
          >
            <Smile className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">React</span>
          </button>

          {/* Reply */}
          <button
            type="button"
            onClick={() => {
              onReply();
              onClose();
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-medium transition-colors active:scale-95"
            title="Reply"
          >
            <Reply className="w-4 h-4 text-brand" />
            <span className="hidden sm:inline">Reply</span>
          </button>

          {/* Forward */}
          <button
            type="button"
            onClick={() => {
              onForward();
              onClose();
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-medium transition-colors active:scale-95"
            title="Forward message"
          >
            <CornerUpRight className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Forward</span>
          </button>

          {/* Copy (if text or link) */}
          <button
            type="button"
            onClick={() => {
              onCopy();
              onClose();
            }}
            className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors active:scale-95"
            title="Copy"
          >
            <Copy className="w-4 h-4" />
          </button>

          {/* More actions */}
          <button
            type="button"
            onClick={() => {
              onMore();
              onClose();
            }}
            className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors active:scale-95"
            title="More actions"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
