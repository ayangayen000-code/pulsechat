import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { X, Copy, Check, QrCode, Sparkles } from 'lucide-react';
import { useToast } from '../layout/Toast';

export default function QRCodeModal({ userId, username, onClose }) {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (userId) {
      QRCode.toDataURL(
        `pulsechat:user:${userId}`,
        {
          width: 320,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#ffffff'
          }
        },
        (err, url) => {
          if (!err) setQrDataUrl(url);
        }
      );
    }
  }, [userId]);

  const copyId = () => {
    navigator.clipboard.writeText(userId);
    setCopied(true);
    showToast('User ID copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in select-none">
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl relative text-zinc-100 text-center animate-slide-up">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-zinc-400 hover:text-white p-1 rounded-full hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-5">
          <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mx-auto mb-3">
            <QrCode className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold tracking-tight text-white">{username}</h3>
          <p className="text-xs font-mono text-zinc-400 mt-0.5">{userId}</p>
        </div>

        {/* QR Code Container */}
        <div className="p-4 bg-white rounded-3xl inline-block shadow-xl mb-5">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt={`QR code for ${userId}`} className="w-56 h-56 rounded-2xl" />
          ) : (
            <div className="w-56 h-56 flex items-center justify-center text-zinc-400 text-xs">
              Generating QR Code...
            </div>
          )}
        </div>

        <p className="text-xs text-zinc-400 mb-5">
          Friends can scan this QR code or search your unique ID to connect.
        </p>

        <button
          onClick={copyId}
          className="w-full h-11 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all active:scale-98"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Copied ID' : 'Copy Unique User ID'}</span>
        </button>
      </div>
    </div>
  );
}
