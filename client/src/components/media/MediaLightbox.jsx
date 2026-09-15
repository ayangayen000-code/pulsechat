import React, { useState } from 'react';
import { X, Download, ZoomIn, ZoomOut } from 'lucide-react';

export default function MediaLightbox({ src, alt, type = 'image', onClose }) {
  const [zoom, setZoom] = useState(1);

  const handleZoomIn = () => setZoom((z) => Math.min(3, z + 0.5));
  const handleZoomOut = () => setZoom((z) => Math.max(1, z - 0.5));

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-between p-4 animate-fade-in select-none">
      {/* Top Header */}
      <div className="w-full max-w-5xl flex items-center justify-between py-2 z-10">
        <span className="text-sm font-medium text-zinc-300 truncate max-w-xs">{alt || 'Media Viewer'}</span>
        <div className="flex items-center gap-3">
          {type === 'image' && (
            <>
              <button
                onClick={handleZoomOut}
                disabled={zoom <= 1}
                className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-white disabled:opacity-40 transition-colors"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={handleZoomIn}
                disabled={zoom >= 3}
                className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-white disabled:opacity-40 transition-colors"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </>
          )}
          <a
            href={src}
            download={alt || 'media'}
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-white transition-colors"
          >
            <Download className="w-4 h-4" />
          </a>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-800/80 hover:bg-rose-600 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center overflow-hidden w-full max-w-5xl p-4">
        {type === 'image' ? (
          <img
            src={src}
            alt={alt}
            style={{ transform: `scale(${zoom})`, transition: 'transform 0.2s ease-out' }}
            className="max-h-[80vh] max-w-full object-contain rounded-xl shadow-2xl cursor-grab active:cursor-grabbing"
          />
        ) : (
          <video src={src} controls autoPlay className="max-h-[80vh] max-w-full rounded-xl shadow-2xl" />
        )}
      </div>

      <div className="text-xs text-zinc-500 py-2">
        Click outside or press Esc to dismiss
      </div>
    </div>
  );
}
