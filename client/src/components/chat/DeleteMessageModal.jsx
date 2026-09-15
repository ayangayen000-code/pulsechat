import React, { useState } from 'react';
import { Trash2, X, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { useToast } from '../layout/Toast';

export default function DeleteMessageModal({
  isOpen,
  onClose,
  message = null,
  messageIds = []
}) {
  const { user } = useAuth();
  const { activeChat, deleteMessage, batchDeleteMessages } = useChat();
  const { showToast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const isBatch = messageIds.length > 0;
  const isGroup = activeChat?.type === 'group';
  const isAdmin = isGroup && (activeChat?.owner_id === user?.id || (activeChat?.user_role === 'admin' || activeChat?.user_role === 'owner'));

  // Can delete for everyone if:
  // - single message: user is sender or group admin
  // - batch messages: all are sender's, or user is group admin
  const canDeleteForEveryone = isBatch
    ? isAdmin
    : message && (message.sender_id === user?.id || isAdmin);

  const handleDelete = async (deleteType) => {
    try {
      setIsDeleting(true);
      if (isBatch) {
        await batchDeleteMessages(messageIds, deleteType);
        showToast(
          `Deleted ${messageIds.length} ${
            messageIds.length === 1 ? 'message' : 'messages'
          }`
        );
      } else if (message) {
        await deleteMessage(message.id, deleteType);
        showToast('Message deleted');
      }
      onClose();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete message', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl p-5 z-10 animate-slide-up flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 flex-shrink-0">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Delete Message</h3>
            <p className="text-xs text-zinc-400">
              {isBatch
                ? `Delete ${messageIds.length} selected messages?`
                : 'Choose how you want to delete this message'}
            </p>
          </div>
        </div>

        {/* Info Note */}
        <div className="p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 mb-4 text-xs text-zinc-400 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <span>
            "Delete for me" only removes the message from your device. "Delete for everyone" removes it for all participants.
          </span>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          {canDeleteForEveryone && (
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => handleDelete('everyone')}
              className="w-full py-3 px-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-glow shadow-rose-600/20 active:scale-98 disabled:opacity-50"
            >
              Delete for Everyone
            </button>
          )}

          <button
            type="button"
            disabled={isDeleting}
            onClick={() => handleDelete('me')}
            className="w-full py-3 px-4 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-semibold transition-all active:scale-98 disabled:opacity-50"
          >
            Delete for Me
          </button>

          <button
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-2xl text-zinc-400 hover:text-white hover:bg-zinc-800/40 text-xs font-medium transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
