import React, { useState } from 'react';
import { X, Upload, Plus, Loader2, Sparkles } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../layout/Toast';

export default function CreateStickerPackModal({ onClose, onCreated }) {
  const [name, setName] = useState('');
  const [stickers, setStickers] = useState([]); // [{ name, image_url }]
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  const handleFilesSelected = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      setUploading(true);
      setError('');
      const data = await api.uploadMultiple(files);
      const newItems = data.files.map((f, i) => ({
        name: f.originalName.replace(/\.[^/.]+$/, ''),
        image_url: f.url
      }));
      setStickers((prev) => [...prev, ...newItems]);
    } catch (err) {
      setError(err.message || 'Sticker upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const removeSticker = (idx) => {
    setStickers((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a sticker pack name.');
      return;
    }
    if (stickers.length === 0) {
      setError('Please add at least one sticker.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      await api.post('/stickers/packs', {
        name: name.trim(),
        icon_url: stickers[0].image_url,
        stickers
      });
      showToast('Sticker pack created successfully!');
      if (onCreated) onCreated();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create sticker pack.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in select-none">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-zinc-100 animate-slide-up">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-zinc-400 hover:text-white p-1 rounded-full hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-2 text-brand text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Custom Pack Creator</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Create Sticker Pack</h2>
          <p className="text-xs text-zinc-400 mt-1">Upload transparent PNGs or WEBP images to share in chats.</p>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Pack Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Meme Squad Vol. 1"
              required
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-brand text-sm text-white placeholder-zinc-600 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Stickers ({stickers.length})
            </label>
            <div className="grid grid-cols-4 gap-2.5 max-h-48 overflow-y-auto p-2 bg-zinc-950 rounded-2xl border border-zinc-800/80">
              {stickers.map((s, idx) => (
                <div key={idx} className="relative group aspect-square rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center p-1">
                  <img src={s.image_url} alt={s.name} className="max-w-full max-h-full object-contain" />
                  <button
                    type="button"
                    onClick={() => removeSticker(idx)}
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}

              <label className="aspect-square rounded-xl border border-dashed border-zinc-700 hover:border-brand flex flex-col items-center justify-center text-zinc-500 hover:text-brand cursor-pointer transition-colors bg-zinc-900/50">
                {uploading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Upload className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-medium">Upload</span>
                  </>
                )}
                <input
                  type="file"
                  multiple
                  accept="image/png,image/webp,image/gif"
                  onChange={handleFilesSelected}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving || uploading}
            className="w-full mt-2 h-12 rounded-xl bg-brand hover:bg-brand-hover text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-glow shadow-brand/20 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Publish Sticker Pack'}
          </button>
        </form>
      </div>
    </div>
  );
}
