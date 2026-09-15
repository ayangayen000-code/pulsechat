import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, AlertTriangle, Eye, Loader2, Volume2 } from 'lucide-react';
import { useChat } from '../../context/ChatContext';

export default function ViewOnceModal({ message, isOpen, onClose }) {
  const { consumeViewOnce } = useChat();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mediaData, setMediaData] = useState(null);

  useEffect(() => {
    let isMounted = true;
    if (!isOpen || !message) return;

    const fetchMedia = async () => {
      try {
        setLoading(true);
        setError(null);
        // If content is already present in message (rare), use it; otherwise fetch atomically
        if (message.content && !message.content.startsWith('blob:')) {
          setMediaData({
            type: message.type,
            content: message.content,
            metadata: message.metadata
          });
          setLoading(false);
          // Still trigger consumption on backend
          await consumeViewOnce(message.id).catch(() => {});
          return;
        }

        const data = await consumeViewOnce(message.id);
        if (isMounted) {
          setMediaData(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'This media has already been viewed or is expired.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchMedia();

    return () => {
      isMounted = false;
    };
  }, [message?.id, isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleClose = () => {
    // Clear media content from component memory
    setMediaData(null);
    onClose();
  };

  if (!isOpen || !message) return null;

  const mediaType = mediaData?.type || message.type || 'image';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/95 backdrop-blur-md animate-fade-in select-none"
      onClick={handleClose}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div
        className="relative w-full max-w-3xl bg-zinc-950/90 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-zinc-800/80 bg-zinc-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold text-xs flex items-center justify-center shadow-inner">
              ①
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">View Once Media</h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                  Single View
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Sent by {message.sender_name || 'Sender'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <X className="w-4 h-4" />
            <span>Close</span>
          </button>
        </div>

        {/* Security & Transparent Notice Banner */}
        <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 flex items-center gap-2 text-xs text-amber-300/90">
          <ShieldAlert className="w-4 h-4 flex-shrink-0 text-amber-400" />
          <span className="text-[11px] leading-snug">
            Designed to prevent reopening, not guaranteed to prevent copying. Closing this window will permanently consume access.
          </span>
        </div>

        {/* Media Viewing Canvas */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 min-h-[300px] max-h-[70vh] overflow-hidden bg-black/50">
          {loading ? (
            <div className="flex flex-col items-center gap-3 text-zinc-400">
              <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
              <span className="text-xs font-medium">Opening secure one-time media...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-3 text-center max-w-sm p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
              <AlertTriangle className="w-10 h-10 text-amber-400" />
              <h4 className="text-sm font-bold text-white">Media Expired or Already Viewed</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">{error}</p>
              <button
                type="button"
                onClick={handleClose}
                className="mt-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold"
              >
                Close
              </button>
            </div>
          ) : mediaData?.content ? (
            <div className="w-full h-full flex items-center justify-center">
              {mediaType === 'image' && (
                <img
                  src={mediaData.content}
                  alt="View once"
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                  className="max-w-full max-h-[65vh] object-contain rounded-2xl shadow-2xl select-none pointer-events-auto"
                />
              )}

              {mediaType === 'video' && (
                <video
                  src={mediaData.content}
                  controls
                  autoPlay
                  controlsList="nodownload"
                  onContextMenu={(e) => e.preventDefault()}
                  className="max-w-full max-h-[65vh] rounded-2xl shadow-2xl"
                />
              )}

              {(mediaType === 'audio' || mediaType === 'voice') && (
                <div className="w-full max-w-md p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-400 flex items-center justify-center shadow-lg">
                    <Volume2 className="w-8 h-8" />
                  </div>
                  <span className="text-sm font-bold text-white">View Once Audio Message</span>
                  <audio
                    src={mediaData.content}
                    controls
                    autoPlay
                    controlsList="nodownload"
                    className="w-full"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-zinc-500">No media content available</div>
          )}
        </div>

        {/* Bottom Bar */}
        <div className="px-5 py-3 border-t border-zinc-800/80 bg-zinc-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-zinc-400">
            <Eye className="w-3.5 h-3.5 text-zinc-500" />
            <span>Once closed, this photo cannot be viewed again.</span>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 text-xs font-bold shadow-md shadow-amber-500/20 transition-all active:scale-95"
          >
            Done Viewing
          </button>
        </div>
      </div>
    </div>
  );
}
