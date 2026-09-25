import React, { useState, useEffect, useRef } from 'react';
import {
  Check,
  CheckCheck,
  Reply,
  Smile,
  MoreHorizontal,
  CornerUpRight,
  Copy,
  Edit2,
  Trash2,
  Clock,
  Sparkles,
  Star,
  Pin,
  CheckSquare,
  Square
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { useToast } from '../layout/Toast';
import { resolveMediaUrl } from '../../services/api';
import ImageGrid from '../media/ImageGrid';
import VideoPlayer from '../media/VideoPlayer';
import VoiceNotePlayer from '../media/VoiceNotePlayer';
import FileCard from '../media/FileCard';
import MessageFloatingBar from './MessageFloatingBar';
import { jumpToMessage } from './PinnedMessagesBanner';

const QUICK_REACTIONS = ['❤️', '😂', '🔥', '👍', '😭', '🎉', '😍', '👎'];

function DisappearingCountdown({ expiresAt, onExpire }) {
  const [remaining, setRemaining] = useState('');

  useEffect(() => {
    let fired = false;
    const calc = () => {
      const diffMs = new Date(expiresAt) - new Date();
      if (diffMs <= 0) {
        setRemaining('expired');
        if (!fired && onExpire) {
          fired = true;
          onExpire();
        }
        return;
      }
      const secs = Math.ceil(diffMs / 1000);
      if (secs < 60) setRemaining(`${secs}s`);
      else if (secs < 3600) setRemaining(`${Math.ceil(secs / 60)}m`);
      else if (secs < 86400) setRemaining(`${Math.ceil(secs / 3600)}h`);
      else setRemaining(`${Math.ceil(secs / 86400)}d`);
    };

    calc();
    const timer = setInterval(calc, 500);
    return () => clearInterval(timer);
  }, [expiresAt, onExpire]);

  if (!remaining || remaining === 'expired') return null;

  return (
    <span
      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-400 font-mono text-[9px] font-semibold"
      title="Disappearing timer"
    >
      <Clock className="w-2.5 h-2.5" />
      <span>{remaining}</span>
    </span>
  );
}

export default function MessageBubble({
  message,
  isGroup = false,
  onReply,
  onEdit,
  onForward,
  onDeleteRequest,
  onOpenViewOnce,
  onOpenStickerPack,
  onOpenMoreActions,
  onViewReactions
}) {
  const { user } = useAuth();
  const {
    reactMessage,
    activeTheme,
    expireMessageLocally,
    isSelectionMode,
    selectedMessageIds,
    toggleSelectMessage
  } = useChat();
  const { showToast } = useToast();

  const bubbleRef = useRef(null);
  const longPressTimerRef = useRef(null);
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });

  const [isDisappearingNow, setIsDisappearingNow] = useState(false);
  const [showDesktopReactions, setShowDesktopReactions] = useState(false);
  const [floatingBarAnchor, setFloatingBarAnchor] = useState(null);

  // Swipe-to-reply gesture state
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  const isOutgoing = message.sender_id === user?.id;
  const isDeleted = message.is_deleted === 1;
  const isSelected = selectedMessageIds.has(message.id);

  const handleExpire = () => {
    setIsDisappearingNow(true);
    setTimeout(() => {
      if (expireMessageLocally) {
        expireMessageLocally(message.id);
      }
    }, 400);
  };

  // System notification messages (e.g. disappearing timer changed)
  if (message.type === 'system') {
    return (
      <div
        id={`message-${message.id}`}
        className="flex items-center justify-center my-3 px-4 select-none animate-fade-in"
      >
        <div className="px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800/80 text-zinc-300 text-xs font-medium flex items-center gap-2 shadow-xs backdrop-blur-xs">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>{message.content}</span>
        </div>
      </div>
    );
  }

  if (isDisappearingNow) {
    return (
      <div className="transition-all duration-400 opacity-0 scale-75 max-h-0 my-0 overflow-hidden" />
    );
  }

  // Copy helper
  const handleCopy = () => {
    if (message.content) {
      navigator.clipboard.writeText(message.content);
      showToast('Message copied to clipboard');
    }
  };

  // Reaction helper
  const handleReaction = async (emoji) => {
    try {
      await reactMessage(message.id, emoji);
      setShowDesktopReactions(false);
    } catch (e) {
      // Handled in context
    }
  };

  // Single-tap / click on message bubble
  const handleBubbleClick = (e) => {
    // If in selection mode, toggle selection
    if (isSelectionMode) {
      e.stopPropagation();
      toggleSelectMessage(message.id);
      return;
    }

    // On mobile / touch or clicking bubble, trigger floating action bar
    if (window.innerWidth < 768 || e.pointerType === 'touch') {
      e.stopPropagation();
      if (floatingBarAnchor) {
        setFloatingBarAnchor(null);
      } else if (bubbleRef.current) {
        setFloatingBarAnchor(bubbleRef.current.getBoundingClientRect());
      }
    }
  };

  // Touch Handlers for Long Press & Swipe to Reply
  const handleTouchStart = (e) => {
    if (isDeleted) return;
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };

    // Long-press timer (450ms) to trigger selection mode
    longPressTimerRef.current = setTimeout(() => {
      if (navigator.vibrate) navigator.vibrate(30);
      toggleSelectMessage(message.id);
      longPressTimerRef.current = null;
    }, 450);
  };

  const handleTouchMove = (e) => {
    if (!touchStartRef.current) return;
    const touch = e.touches[0];
    const diffX = touch.clientX - touchStartRef.current.x;
    const diffY = touch.clientY - touchStartRef.current.y;

    // If scrolling vertically, cancel long-press and swipe
    if (Math.abs(diffY) > 10) {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
      if (isSwiping) {
        setIsSwiping(false);
        setSwipeOffset(0);
      }
      return;
    }

    // Horizontal swipe (swipe right for incoming, or swipe left for outgoing)
    if (Math.abs(diffX) > 15 && !isSelectionMode) {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
      setIsSwiping(true);
      // Damping curve
      const direction = isOutgoing ? -1 : 1;
      const validDiff = isOutgoing ? Math.min(0, diffX) : Math.max(0, diffX);
      const damped = Math.sign(validDiff) * Math.min(65, Math.pow(Math.abs(validDiff), 0.85));
      setSwipeOffset(damped);
    }
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (isSwiping) {
      const threshold = 45;
      if (Math.abs(swipeOffset) >= threshold) {
        // Trigger swipe-to-reply feedback
        if (navigator.vibrate) navigator.vibrate(20);
        if (onReply) onReply(message);
      }
      setIsSwiping(false);
      setSwipeOffset(0);
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Group reactions by emoji
  const reactionCounts = (message.reactions || []).reduce((acc, r) => {
    if (!acc[r.emoji]) acc[r.emoji] = { count: 0, users: [], hasReacted: false };
    acc[r.emoji].count += 1;
    acc[r.emoji].users.push(r.username);
    if (r.user_id === user?.id) acc[r.emoji].hasReacted = true;
    return acc;
  }, {});

  return (
    <div
      id={`message-${message.id}`}
      className={`group relative flex items-center gap-2.5 my-1.5 px-3 sm:px-4 max-w-full select-text transition-colors duration-200 ${
        isOutgoing ? 'flex-row-reverse' : 'flex-row'
      } ${isSelected ? 'bg-brand/10 py-1 rounded-2xl' : ''}`}
      onMouseLeave={() => {
        setShowDesktopReactions(false);
      }}
    >
      {/* Selection Checkbox */}
      {isSelectionMode && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleSelectMessage(message.id);
          }}
          className="p-1.5 rounded-full text-brand hover:scale-110 transition-transform flex-shrink-0"
        >
          {isSelected ? (
            <div className="w-5 h-5 rounded-full bg-brand flex items-center justify-center text-white shadow-xs">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          ) : (
            <div className="w-5 h-5 rounded-full border-2 border-zinc-600 hover:border-zinc-400 bg-transparent" />
          )}
        </button>
      )}

      {/* Swipe to reply reveal indicator */}
      {isSwiping && (
        <div
          className={`absolute flex items-center justify-center w-8 h-8 rounded-full bg-brand/20 text-brand border border-brand/30 transition-all ${
            isOutgoing ? 'right-2' : 'left-2'
          }`}
          style={{
            transform: `scale(${Math.min(1.2, Math.abs(swipeOffset) / 40)})`
          }}
        >
          <Reply className="w-4 h-4" />
        </div>
      )}

      {/* Avatar for incoming in groups */}
      {!isOutgoing && (
        <img
          src={
            message.sender_avatar ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
          }
          alt={message.sender_name}
          className="w-7 h-7 rounded-full object-cover mt-auto mb-1 flex-shrink-0 border border-zinc-800"
        />
      )}

      {/* Main Bubble Container */}
      <div
        style={{
          transform: swipeOffset ? `translateX(${swipeOffset}px)` : undefined,
          transition: isSwiping ? 'none' : 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        className={`relative max-w-[85%] sm:max-w-[70%] flex flex-col ${
          isOutgoing ? 'items-end' : 'items-start'
        }`}
      >
        {/* Sender Name for incoming group messages */}
        {isGroup && !isOutgoing && (
          <span className="text-[11px] font-semibold text-brand mb-1 ml-2">
            {message.sender_name}
          </span>
        )}

        {/* Reply Quotation Preview (Click to jump to quoted message) */}
        {message.reply_to && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              jumpToMessage(message.reply_to.id);
            }}
            className={`mb-1 px-3 py-1.5 rounded-xl text-xs border-l-2 max-w-full truncate opacity-90 cursor-pointer hover:opacity-100 transition-opacity ${
              isOutgoing
                ? 'bg-zinc-800/80 border-brand text-zinc-300'
                : 'bg-zinc-900 border-brand text-zinc-300'
            }`}
            title="Click to jump to quoted message"
          >
            <span className="font-semibold text-brand block text-[10px]">
              Replying to {message.reply_to.sender_name}
            </span>
            <span className="truncate block text-zinc-400">
              {message.reply_to.content || `[${message.reply_to.type}]`}
            </span>
          </div>
        )}

        {/* Bubble Box */}
        <div
          ref={bubbleRef}
          onClick={handleBubbleClick}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className={`relative rounded-3xl px-4 py-2.5 shadow-subtle cursor-pointer select-text transition-all ${
            isDeleted
              ? 'bg-zinc-900/60 border border-zinc-800 text-zinc-500 italic text-xs'
              : message.type === 'sticker'
              ? 'bg-transparent shadow-none p-0'
              : isOutgoing
              ? 'rounded-br-sm'
              : 'rounded-bl-sm'
          } ${
            !isDeleted && message.type !== 'sticker' && !activeTheme
              ? isOutgoing
                ? 'bg-brand text-white'
                : 'bg-zinc-800/90 border border-zinc-700/50 text-zinc-100'
              : ''
          } ${isSelected ? 'ring-2 ring-brand ring-offset-2 ring-offset-zinc-950' : ''}`}
          style={
            !isDeleted && message.type !== 'sticker' && activeTheme
              ? isOutgoing
                ? {
                    backgroundColor: activeTheme.sent_bubble_bg,
                    color: activeTheme.sent_bubble_text || '#ffffff'
                  }
                : {
                    backgroundColor: activeTheme.received_bubble_bg,
                    color: activeTheme.received_bubble_text || '#f4f4f5'
                  }
              : undefined
          }
        >
          {/* Content by Type */}
          {isDeleted ? (
            <span>This message was deleted</span>
          ) : message.view_once === 1 ? (
            /* View Once Media Item */
            message.view_once_opened === 1 ? (
              <div className="flex items-center gap-2.5 py-1 px-1 select-none text-zinc-400">
                <div className="w-7 h-7 rounded-full bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center text-zinc-400">
                  <Check className="w-4 h-4 text-zinc-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-zinc-300">
                    {message.type === 'video'
                      ? 'Video'
                      : message.type === 'audio' || message.type === 'voice'
                      ? 'Voice message'
                      : 'Photo'}
                  </span>
                  <span className="text-[10px] text-zinc-500">Opened</span>
                </div>
              </div>
            ) : !isOutgoing ? (
              <button
                type="button"
                onClick={() => onOpenViewOnce && onOpenViewOnce(message)}
                className="flex items-center gap-2.5 py-1 px-1 hover:opacity-95 transition-all select-none text-left group/vo"
              >
                <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 font-black text-xs flex items-center justify-center group-hover/vo:scale-105 transition-transform shadow-inner">
                  ①
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-amber-300 group-hover/vo:text-amber-200">
                    {message.type === 'video'
                      ? 'Video'
                      : message.type === 'audio' || message.type === 'voice'
                      ? 'Voice Message'
                      : 'Photo'}
                  </span>
                  <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                    Tap to view • View once
                  </span>
                </div>
              </button>
            ) : (
              <div className="flex items-center gap-2.5 py-1 px-1 select-none">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 font-black text-xs flex items-center justify-center">
                  ①
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-amber-300">
                    {message.type === 'video'
                      ? 'Video'
                      : message.type === 'audio' || message.type === 'voice'
                      ? 'Voice Message'
                      : 'Photo'}
                  </span>
                  <span className="text-[10px] text-zinc-400">View once (Sent)</span>
                </div>
              </div>
            )
          ) : (
            <>
              {message.type === 'text' && (
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {message.content}
                </p>
              )}

              {message.type === 'image' && (
                <ImageGrid
                  images={
                    Array.isArray(message.metadata?.images)
                      ? message.metadata.images
                      : [{ url: message.content, name: message.metadata?.filename }]
                  }
                />
              )}

              {message.type === 'video' && (
                <VideoPlayer src={message.content} filename={message.metadata?.filename} />
              )}

              {(message.type === 'audio' || message.type === 'voice') && (
                <VoiceNotePlayer
                  src={message.content}
                  waveforms={message.metadata?.waveforms}
                  duration={message.metadata?.duration}
                  isOutgoing={isOutgoing}
                />
              )}

              {message.type === 'file' && (
                <FileCard
                  url={message.content}
                  filename={message.metadata?.filename}
                  filesize={message.metadata?.filesize}
                  mimeType={message.metadata?.mimeType}
                  isOutgoing={isOutgoing}
                />
              )}

              {message.type === 'sticker' && (
                <div className="p-1 group/stk relative">
                  <img
                    src={resolveMediaUrl(message.metadata?.sticker_url || message.content)}
                    alt={message.metadata?.name || 'Sticker'}
                    className="w-36 h-36 object-contain filter drop-shadow-lg select-none hover:scale-105 transition-transform cursor-pointer"
                    onClick={() => {
                      const pId =
                        message.metadata?.pack_id ||
                        (typeof message.content === 'string' &&
                        message.content.startsWith('pack_')
                          ? message.content.split('_').slice(0, 3).join('_')
                          : null);
                      if (pId && onOpenStickerPack) {
                        onOpenStickerPack(pId);
                      }
                    }}
                  />
                  {(message.metadata?.pack_id || message.metadata?.pack_name) && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (message.metadata?.pack_id && onOpenStickerPack) {
                          onOpenStickerPack(message.metadata.pack_id);
                        }
                      }}
                      className="opacity-0 group-hover/stk:opacity-100 transition-opacity absolute -bottom-1.5 right-1 px-2.5 py-0.5 rounded-full bg-zinc-950/95 hover:bg-zinc-900 border border-zinc-700/80 text-[10px] text-brand font-bold shadow-lg flex items-center gap-1 backdrop-blur"
                    >
                      <Sparkles className="w-3 h-3 text-brand" />
                      <span>{message.metadata.pack_name || 'View Pack'}</span>
                    </button>
                  )}
                </div>
              )}
            </>
          )}

          {/* Time, badges & checks */}
          {message.type !== 'sticker' && (
            <div
              className={`flex items-center gap-1.5 mt-1 justify-end text-[10px] select-none ${
                isOutgoing ? 'text-white/80' : 'text-zinc-400'
              }`}
            >
              {/* Starred indicator */}
              {message.is_saved && !isDeleted && (
                <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" title="Saved" />
              )}
              {/* Pinned indicator */}
              {message.is_pinned && !isDeleted && (
                <Pin className="w-2.5 h-2.5 text-indigo-400 fill-indigo-400" title="Pinned" />
              )}
              {/* Disappearing Countdown badge */}
              {message.disappearing_enabled === 1 && message.expires_at && !isDeleted && (
                <DisappearingCountdown expiresAt={message.expires_at} onExpire={handleExpire} />
              )}
              {/* Edited indicator */}
              {message.is_edited === 1 && !isDeleted && (
                <span className="italic opacity-80 text-[9px]">(edited)</span>
              )}
              <span>{formatTime(message.created_at)}</span>
              {isOutgoing && !isDeleted && (
                <CheckCheck className="w-3.5 h-3.5 text-white stroke-[2.5]" />
              )}
            </div>
          )}
        </div>

        {/* Reactions Counter Badges (Click to view reaction list) */}
        {Object.keys(reactionCounts).length > 0 && !isDeleted && (
          <div className="flex flex-wrap gap-1 mt-1 -mb-1">
            {Object.entries(reactionCounts).map(([emoji, data]) => (
              <button
                key={emoji}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onViewReactions) onViewReactions(message);
                  else handleReaction(emoji);
                }}
                title={`Reactions: ${data.users.join(', ')}`}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border shadow-subtle transition-all active:scale-90 ${
                  data.hasReacted
                    ? 'bg-brand/20 border-brand text-brand font-semibold'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                <span>{emoji}</span>
                {data.count > 1 && <span className="text-[10px]">{data.count}</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Desktop Inline Hover Action Bar (😊 ↩ ↗ ⋯) */}
      {!isDeleted && !isSelectionMode && (
        <div
          className={`hidden md:flex absolute top-0 opacity-0 group-hover:opacity-100 transition-all duration-150 items-center gap-0.5 p-1 rounded-2xl bg-zinc-900/95 border border-zinc-800 shadow-xl z-20 backdrop-blur-md ${
            isOutgoing ? 'right-full mr-2' : 'left-full ml-2'
          }`}
        >
          {/* Reaction trigger */}
          <button
            type="button"
            onClick={() => setShowDesktopReactions(!showDesktopReactions)}
            className="p-1.5 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            title="React"
          >
            <Smile className="w-3.5 h-3.5 text-amber-400" />
          </button>

          {/* Reply trigger */}
          <button
            type="button"
            onClick={() => onReply && onReply(message)}
            className="p-1.5 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            title="Reply"
          >
            <Reply className="w-3.5 h-3.5 text-brand" />
          </button>

          {/* Forward trigger */}
          {message.view_once !== 1 && (
            <button
              type="button"
              onClick={() => onForward && onForward(message)}
              className="p-1.5 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              title="Forward"
            >
              <CornerUpRight className="w-3.5 h-3.5 text-emerald-400" />
            </button>
          )}

          {/* More actions trigger */}
          <button
            type="button"
            onClick={() => onOpenMoreActions && onOpenMoreActions(message)}
            className="p-1.5 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            title="More Options"
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>

          {/* Desktop Quick Reaction Popup */}
          {showDesktopReactions && (
            <div className="absolute top-full mt-1.5 left-0 p-1.5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl flex items-center gap-1 z-30 animate-slide-up">
              {QUICK_REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleReaction(emoji)}
                  className="w-7 h-7 rounded-xl hover:bg-zinc-800 flex items-center justify-center text-sm transition-transform hover:scale-125"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mobile Floating Action Bar on single tap */}
      {floatingBarAnchor && (
        <MessageFloatingBar
          message={message}
          anchorRect={floatingBarAnchor}
          onReact={handleReaction}
          onReply={() => onReply && onReply(message)}
          onForward={() => onForward && onForward(message)}
          onCopy={handleCopy}
          onMore={() => onOpenMoreActions && onOpenMoreActions(message)}
          onClose={() => setFloatingBarAnchor(null)}
        />
      )}
    </div>
  );
}
