import React, { useEffect } from 'react';
import {
  Reply,
  CornerUpRight,
  Copy,
  Link2,
  Star,
  Pin,
  Edit2,
  Trash2,
  CheckSquare,
  Smile,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';

export default function MessageActionsBottomSheet({
  message,
  isOpen,
  onClose,
  onReply,
  onForward,
  onCopy,
  onCopyLink,
  onEdit,
  onDelete,
  onToggleSave,
  onTogglePin,
  onViewReactions,
  onSelect
}) {
  const { user } = useAuth();
  const { activeChat } = useChat();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !message) return null;

  const isOutgoing = message.sender_id === user?.id;
  const isDeleted = message.is_deleted === 1;
  const isViewOnce = message.view_once === 1;
  const isGroup = activeChat?.type === 'group';
  const isAdmin = isGroup && (activeChat?.owner_id === user?.id || (activeChat?.user_role === 'admin' || activeChat?.user_role === 'owner'));
  const canPin = !isGroup || isAdmin || isOutgoing;
  const isSaved = !!message.is_saved;
  const isPinned = !!message.is_pinned;

  const getMessagePreview = () => {
    if (isDeleted) return 'This message was deleted';
    if (isViewOnce) return 'View Once media';
    if (message.type === 'image') return 'Photo';
    if (message.type === 'video') return 'Video';
    if (message.type === 'audio' || message.type === 'voice') return 'Voice note';
    if (message.type === 'file') return message.metadata?.filename || 'File attachment';
    if (message.type === 'sticker') return message.metadata?.name || 'Sticker';
    return message.content;
  };

  const actionItemClass =
    'flex items-center gap-3.5 px-4 py-3.5 rounded-2xl hover:bg-zinc-800/80 active:bg-zinc-800 text-zinc-200 text-sm font-medium transition-colors w-full text-left min-h-[48px]';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs select-none">
      {/* Backdrop tap to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Sheet Container */}
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-t-3xl sm:rounded-3xl shadow-2xl p-4 sm:p-5 z-10 animate-slide-up flex flex-col max-h-[85vh] overflow-y-auto">
        {/* Mobile drag handle */}
        <div className="sm:hidden w-12 h-1.5 rounded-full bg-zinc-700 mx-auto mb-3" />

        {/* Message preview card */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 mb-3">
          <img
            src={message.sender_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
            alt={message.sender_name}
            className="w-9 h-9 rounded-full object-cover border border-zinc-800 flex-shrink-0"
          />
          <div className="truncate flex-1">
            <span className="text-xs font-bold text-brand block truncate">
              {isOutgoing ? 'You' : message.sender_name}
            </span>
            <span className="text-xs text-zinc-400 block truncate">
              {getMessagePreview()}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Actions List */}
        <div className="flex flex-col gap-0.5">
          {/* Reply */}
          {!isDeleted && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onReply(message);
              }}
              className={actionItemClass}
            >
              <Reply className="w-5 h-5 text-brand" />
              <span>Reply</span>
            </button>
          )}

          {/* Forward (Disabled for View-Once) */}
          {!isDeleted && !isViewOnce && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onForward(message);
              }}
              className={actionItemClass}
            >
              <CornerUpRight className="w-5 h-5 text-emerald-400" />
              <span>Forward</span>
            </button>
          )}

          {/* Copy Text */}
          {!isDeleted && message.type === 'text' && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onCopy(message);
              }}
              className={actionItemClass}
            >
              <Copy className="w-5 h-5 text-zinc-300" />
              <span>Copy Text</span>
            </button>
          )}

          {/* Copy Message Deep Link */}
          {!isDeleted && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onCopyLink(message);
              }}
              className={actionItemClass}
            >
              <Link2 className="w-5 h-5 text-zinc-300" />
              <span>Copy Message Link</span>
            </button>
          )}

          {/* Star / Save (Disabled for View-Once) */}
          {!isDeleted && !isViewOnce && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onToggleSave(message);
              }}
              className={actionItemClass}
            >
              <Star
                className={`w-5 h-5 ${isSaved ? 'text-amber-400 fill-amber-400' : 'text-amber-400'}`}
              />
              <span>{isSaved ? 'Unsave Message' : 'Save Message'}</span>
            </button>
          )}

          {/* Pin / Unpin */}
          {!isDeleted && canPin && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onTogglePin(message);
              }}
              className={actionItemClass}
            >
              <Pin className={`w-5 h-5 ${isPinned ? 'text-indigo-400 fill-indigo-400' : 'text-indigo-400'}`} />
              <span>{isPinned ? 'Unpin from Top' : 'Pin to Top'}</span>
            </button>
          )}

          {/* Edit (only own text messages) */}
          {!isDeleted && isOutgoing && message.type === 'text' && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(message);
              }}
              className={actionItemClass}
            >
              <Edit2 className="w-5 h-5 text-sky-400" />
              <span>Edit Message</span>
            </button>
          )}

          {/* Reaction details (if has reactions) */}
          {message.reactions && message.reactions.length > 0 && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onViewReactions(message);
              }}
              className={actionItemClass}
            >
              <Smile className="w-5 h-5 text-amber-400" />
              <span>Reactions ({message.reactions.length})</span>
            </button>
          )}

          {/* Select messages mode */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onSelect(message);
            }}
            className={actionItemClass}
          >
            <CheckSquare className="w-5 h-5 text-zinc-300" />
            <span>Select Messages</span>
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onDelete(message);
            }}
            className={`${actionItemClass} text-rose-400 hover:bg-rose-500/10 active:bg-rose-500/20`}
          >
            <Trash2 className="w-5 h-5 text-rose-400" />
            <span>Delete Message</span>
          </button>
        </div>
      </div>
    </div>
  );
}
