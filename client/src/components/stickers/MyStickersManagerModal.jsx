import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowUp,
  ArrowDown,
  Trash2,
  Sparkles,
  ShoppingBag,
  Loader2,
  Check,
  Eye
} from 'lucide-react';
import { api } from '../../services/api';

export default function MyStickersManagerModal({
  isOpen,
  onClose,
  onOpenStore,
  onOpenPackPreview
}) {
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingOrder, setSavingOrder] = useState(false);

  const loadMyPacks = async () => {
    try {
      setLoading(true);
      const data = await api.get('/stickers/my');
      setPacks(data.packs || []);
    } catch (err) {
      console.error('Failed to load my stickers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadMyPacks();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleMove = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= packs.length) return;

    const reordered = [...packs];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);
    setPacks(reordered);

    try {
      setSavingOrder(true);
      await api.put('/stickers/my/reorder', {
        packIds: reordered.map((p) => p.id)
      });
    } catch (err) {
      console.error('Failed to reorder packs:', err);
    } finally {
      setSavingOrder(false);
    }
  };

  const handleRemove = async (packId) => {
    try {
      await api.delete(`/stickers/my/${packId}`);
      setPacks((prev) => prev.filter((p) => p.id !== packId));
    } catch (err) {
      console.error('Failed to remove pack:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-lg max-h-[85vh] bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-zinc-900/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">My Sticker Library</h2>
              <p className="text-[11px] text-zinc-400">
                {packs.length} pack{packs.length === 1 ? '' : 's'} installed in chat tray
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body list */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center text-zinc-500">
              <Loader2 className="w-7 h-7 animate-spin text-brand mb-2" />
              <span className="text-xs font-medium">Loading your packs...</span>
            </div>
          ) : packs.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6">
              <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-3">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">No sticker packs added</h3>
              <p className="text-xs text-zinc-400 max-w-xs mb-4">
                Explore the sticker store to find cute, funny, anime, and meme sticker packs.
              </p>
              <button
                onClick={() => {
                  onClose();
                  if (onOpenStore) onOpenStore();
                }}
                className="px-4 py-2 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-semibold shadow-glow shadow-brand/20 transition-all flex items-center gap-1.5"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Browse Store</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {packs.map((pack, idx) => (
                <div
                  key={pack.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 hover:border-zinc-700 transition-colors gap-3 group"
                >
                  {/* Left Pack Info */}
                  <div
                    onClick={() => {
                      if (onOpenPackPreview) onOpenPackPreview(pack.id);
                    }}
                    className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
                  >
                    <div className="w-12 h-12 rounded-xl bg-zinc-800/60 p-1.5 border border-zinc-700/50 flex-shrink-0 flex items-center justify-center">
                      <img
                        src={pack.icon_url || pack.cover_image}
                        alt={pack.name}
                        className="max-w-full max-h-full object-contain filter drop-shadow-sm"
                      />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white truncate hover:text-brand transition-colors">
                          {pack.name}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700/60 flex-shrink-0">
                          {pack.category}
                        </span>
                      </div>
                      <span className="text-xs text-zinc-500 mt-0.5">
                        {pack.sticker_count || (pack.stickers ? pack.stickers.length : 0)} stickers • {pack.creator_name || 'Pulse'}
                      </span>
                    </div>
                  </div>

                  {/* Actions (Move Up/Down & Delete) */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      type="button"
                      disabled={idx === 0 || savingOrder}
                      onClick={() => handleMove(idx, -1)}
                      title="Move Up in Tray"
                      className="w-8 h-8 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 disabled:opacity-30 text-zinc-300 flex items-center justify-center transition-colors"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === packs.length - 1 || savingOrder}
                      onClick={() => handleMove(idx, 1)}
                      title="Move Down in Tray"
                      className="w-8 h-8 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 disabled:opacity-30 text-zinc-300 flex items-center justify-center transition-colors"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(pack.id)}
                      title="Remove from Library"
                      className="w-8 h-8 rounded-xl bg-zinc-800/80 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 flex items-center justify-center transition-colors ml-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800/80 bg-zinc-900/40 flex items-center justify-between">
          <span className="text-xs text-zinc-500">
            Top packs appear first in your chat composer.
          </span>
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onOpenStore) onOpenStore();
            }}
            className="px-4 py-2 rounded-xl bg-brand/10 hover:bg-brand/20 text-brand text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Sticker Store</span>
          </button>
        </div>
      </div>
    </div>
  );
}
