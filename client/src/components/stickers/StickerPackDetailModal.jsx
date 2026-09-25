import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Download,
  Check,
  Trash2,
  Share2,
  Tag,
  User,
  Heart,
  Loader2,
  Maximize2
} from 'lucide-react';
import { api, resolveMediaUrl } from '../../services/api';

export default function StickerPackDetailModal({
  packId,
  isOpen,
  onClose,
  onInstalledChange
}) {
  const [pack, setPack] = useState(null);
  const [stickers, setStickers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [zoomedSticker, setZoomedSticker] = useState(null);

  useEffect(() => {
    if (!packId || !isOpen) return;

    let isMounted = true;
    async function loadPackDetails() {
      try {
        setLoading(true);
        const data = await api.get(`/stickers/packs/${packId}`);
        if (isMounted) {
          setPack(data.pack);
          setStickers(data.stickers || []);
        }
      } catch (err) {
        console.error('Failed to load pack details:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadPackDetails();
    return () => {
      isMounted = false;
    };
  }, [packId, isOpen]);

  if (!isOpen) return null;

  const handleToggleInstall = async () => {
    if (!pack) return;
    try {
      setIsActionLoading(true);
      if (pack.is_installed) {
        // Uninstall
        await api.delete(`/stickers/my/${pack.id}`);
        setPack((prev) => ({ ...prev, is_installed: false }));
        if (onInstalledChange) onInstalledChange(pack.id, false);
      } else {
        // Install
        await api.post(`/stickers/my/${pack.id}`);
        setPack((prev) => ({
          ...prev,
          is_installed: true,
          downloads_count: (prev.downloads_count || 0) + 1
        }));
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 2400);
        if (onInstalledChange) onInstalledChange(pack.id, true);
      }
    } catch (err) {
      console.error('Failed to toggle sticker pack:', err);
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-xl max-h-[90vh] bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slide-up">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-zinc-900/40">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-brand/10 text-brand border border-brand/20">
              {pack?.category || 'Sticker Pack'}
            </span>
            {pack?.is_featured === 1 && (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                ⭐ Featured
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center text-zinc-500">
            <Loader2 className="w-8 h-8 animate-spin text-brand mb-3" />
            <span className="text-sm font-medium">Loading sticker pack...</span>
          </div>
        ) : pack ? (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col gap-6">
            {/* Hero Pack Overview Card */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
              {/* Cover Icon */}
              <div className="relative w-24 h-24 rounded-2xl bg-zinc-800/60 p-2 flex items-center justify-center flex-shrink-0 border border-zinc-700/60 shadow-lg">
                <img
                  src={resolveMediaUrl(pack.icon_url || pack.cover_image)}
                  alt={pack.name}
                  className="max-w-full max-h-full object-contain filter drop-shadow-md"
                />
              </div>

              {/* Meta Info */}
              <div className="flex-1 flex flex-col text-center sm:text-left gap-1.5 min-w-0">
                <h2 className="text-xl font-bold text-white tracking-tight truncate">
                  {pack.name}
                </h2>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-zinc-400">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-zinc-500" />
                    <span className="text-zinc-300 font-medium">{pack.creator_name || 'Pulse Studio'}</span>
                  </span>
                  <span>•</span>
                  <span>{stickers.length} Stickers</span>
                  <span>•</span>
                  <span>{((pack.downloads_count || 0)).toLocaleString()} adds</span>
                </div>
                {pack.description && (
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed line-clamp-2">
                    {pack.description}
                  </p>
                )}
              </div>

              {/* Install / Remove Button */}
              <div className="sm:self-center flex-shrink-0 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleToggleInstall}
                  disabled={isActionLoading}
                  className={`w-full sm:w-auto px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 ${
                    pack.is_installed
                      ? justAdded
                        ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                        : 'bg-zinc-800 hover:bg-rose-500/20 text-zinc-300 hover:text-rose-400 border border-zinc-700/70 hover:border-rose-500/40'
                      : 'bg-brand hover:bg-brand-hover text-white shadow-glow shadow-brand/25'
                  }`}
                >
                  {isActionLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : pack.is_installed ? (
                    justAdded ? (
                      <>
                        <Check className="w-4 h-4 text-white stroke-[3]" />
                        <span>Added ✓</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Installed</span>
                      </>
                    )
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Add Pack</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Grid of all stickers */}
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Pack Stickers ({stickers.length})
                </span>
                <span className="text-[11px] text-zinc-500">Tap sticker to view details</span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {stickers.map((stk) => (
                  <div
                    key={stk.id}
                    onClick={() => setZoomedSticker(stk)}
                    className="group relative aspect-square rounded-2xl bg-zinc-900/70 hover:bg-zinc-800/90 border border-zinc-800/80 hover:border-zinc-700/80 p-3 flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-subtle"
                  >
                    <img
                      src={resolveMediaUrl(stk.image_url)}
                      alt={stk.name}
                      className="max-w-full max-h-full object-contain filter drop-shadow-md group-hover:scale-110 transition-transform"
                    />
                    <span className="text-[10px] text-zinc-400 font-medium truncate w-full text-center mt-1 group-hover:text-white transition-colors">
                      {stk.name}
                    </span>
                    <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900/90 p-1 rounded-full text-zinc-400">
                      <Maximize2 className="w-3 h-3" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-zinc-500 text-sm">
            Sticker pack not found.
          </div>
        )}

        {/* Zoomed Sticker Preview Sub-modal */}
        {zoomedSticker && (
          <div
            onClick={() => setZoomedSticker(null)}
            className="absolute inset-0 z-20 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-fade-in"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xs bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex flex-col items-center text-center shadow-2xl relative animate-scale-up"
            >
              <button
                onClick={() => setZoomedSticker(null)}
                className="absolute top-4 right-4 w-7 h-7 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <div className="w-40 h-40 my-2 flex items-center justify-center">
                <img
                  src={resolveMediaUrl(zoomedSticker.image_url)}
                  alt={zoomedSticker.name}
                  className="max-w-full max-h-full object-contain filter drop-shadow-2xl animate-bounce-subtle"
                />
              </div>

              <h3 className="text-base font-bold text-white mt-3">
                {zoomedSticker.name}
              </h3>
              <span className="text-xs text-brand font-medium mt-0.5">
                {pack.name}
              </span>

              {zoomedSticker.tags && (
                <div className="flex flex-wrap gap-1.5 justify-center mt-3">
                  {zoomedSticker.tags.split(',').map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-lg bg-zinc-800/80 text-[10px] text-zinc-400 border border-zinc-700/50"
                    >
                      #{tag.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
