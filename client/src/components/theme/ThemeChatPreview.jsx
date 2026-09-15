import React from 'react';
import { CheckCheck, Mic, Play, Smile, Paperclip, Send, Image as ImageIcon } from 'lucide-react';

/**
 * Realistic Live Chat Preview Component
 * Displays a 100% realistic representation of the conversation view
 * dynamically styled with the provided theme settings.
 */
export default function ThemeChatPreview({ theme, activeChat }) {
  const isImage = theme?.background_type === 'image' && !!theme?.background_image;
  const isGradient = theme?.background_type === 'gradient' && !!theme?.background_value;
  const isSolid = theme?.background_type === 'solid' || (!isImage && !isGradient);

  // Derive background styling
  let backgroundStyle = {};
  if (isGradient) {
    backgroundStyle.backgroundImage = theme.background_value;
  } else if (isSolid) {
    backgroundStyle.backgroundColor = theme?.background_value || '#09090b';
  } else {
    backgroundStyle.backgroundColor = theme?.background_value || '#09090b';
  }

  const wallpaperStyle = isImage
    ? {
        backgroundImage: `url(${theme.background_image})`,
        backgroundPosition: theme.background_position || 'center',
        backgroundSize: theme.background_size || 'cover',
        backgroundRepeat: 'no-repeat',
        filter: `blur(${theme.background_blur || 0}px) brightness(${theme.background_brightness ?? 100}%)`,
        opacity: (theme.background_opacity ?? 100) / 100,
        transform: `scale(${theme.zoom || 1})`
      }
    : null;

  const overlayStyle = {
    backgroundColor: theme?.overlay_color || '#000000',
    opacity: (theme?.overlay_opacity ?? 0) / 100
  };

  const sentBubbleStyle = {
    backgroundColor: theme?.sent_bubble_bg || '#6366f1',
    color: theme?.sent_bubble_text || '#ffffff'
  };

  const receivedBubbleStyle = {
    backgroundColor: theme?.received_bubble_bg || '#27272a',
    color: theme?.received_bubble_text || '#f4f4f5'
  };

  const accentColor = theme?.accent_color || '#6366f1';
  const inputBg = theme?.input_bg || '#18181b';
  const isDark = theme?.is_dark !== 0;

  const contactName = activeChat?.title || 'Sarah Jenkins';
  const contactHandle = activeChat?.other_user?.user_id || '@sarah_sky';
  const contactAvatar =
    activeChat?.avatar ||
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80';

  return (
    <div
      className={`w-full h-full rounded-3xl overflow-hidden flex flex-col relative border shadow-2xl transition-all duration-300 select-none ${
        isDark ? 'border-zinc-800 text-white' : 'border-zinc-300 text-zinc-900'
      }`}
      style={backgroundStyle}
    >
      {/* Wallpaper Layer */}
      {wallpaperStyle && (
        <div
          className="absolute inset-0 pointer-events-none transition-all duration-300 z-0 origin-center"
          style={wallpaperStyle}
        />
      )}

      {/* Overlay Tint Layer */}
      {theme?.overlay_opacity > 0 && (
        <div
          className="absolute inset-0 pointer-events-none transition-all duration-300 z-0"
          style={overlayStyle}
        />
      )}

      {/* Header Bar */}
      <div className="relative z-10 px-4 py-3 bg-zinc-950/75 backdrop-blur-md border-b border-zinc-800/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <img
              src={contactAvatar}
              alt={contactName}
              className="w-9 h-9 rounded-full object-cover border border-zinc-700"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-zinc-950" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white leading-tight">{contactName}</h4>
            <span className="text-[10px] text-zinc-400 font-mono">{contactHandle} • Online</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-zinc-800/80 text-zinc-300 border border-zinc-700/50">
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: accentColor }} />
          <span>Live Preview</span>
        </div>
      </div>

      {/* Chat Messages Body */}
      <div className="relative z-10 flex-1 p-4 overflow-y-auto space-y-3">
        {/* Date Divider */}
        <div className="flex items-center justify-center my-1">
          <span className="px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 text-[10px] font-medium text-zinc-300">
            Today
          </span>
        </div>

        {/* 1. Received Text Message */}
        <div className="flex items-start gap-2 max-w-[85%]">
          <img
            src={contactAvatar}
            alt={contactName}
            className="w-6 h-6 rounded-full object-cover mt-1 flex-shrink-0"
          />
          <div
            className="px-3.5 py-2 rounded-2xl rounded-tl-sm text-xs shadow-md backdrop-blur-xs leading-relaxed"
            style={receivedBubbleStyle}
          >
            <p>Hey! Check out this new chat theme ✨</p>
            <span className="text-[9px] opacity-70 block text-right mt-1">10:42 AM</span>
          </div>
        </div>

        {/* 2. Sent Text Message */}
        <div className="flex justify-end">
          <div
            className="max-w-[85%] px-3.5 py-2 rounded-2xl rounded-tr-sm text-xs shadow-md backdrop-blur-xs leading-relaxed"
            style={sentBubbleStyle}
          >
            <p>Looks incredible! The colors match perfectly 👌</p>
            <div className="flex items-center justify-end gap-1 mt-1 text-[9px] opacity-80">
              <span>10:43 AM</span>
              <CheckCheck className="w-3 h-3 text-cyan-300" />
            </div>
          </div>
        </div>

        {/* 3. Received Voice Message Sample */}
        <div className="flex items-start gap-2 max-w-[85%]">
          <img
            src={contactAvatar}
            alt={contactName}
            className="w-6 h-6 rounded-full object-cover mt-1 flex-shrink-0"
          />
          <div
            className="px-3 py-2 rounded-2xl rounded-tl-sm text-xs shadow-md backdrop-blur-xs flex items-center gap-2.5 min-w-[190px]"
            style={receivedBubbleStyle}
          >
            <button
              className="w-7 h-7 rounded-full flex items-center justify-center text-white flex-shrink-0 shadow-sm"
              style={{ backgroundColor: accentColor }}
            >
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
            </button>
            <div className="flex-1 min-w-0">
              {/* Mini Audio Waveform Simulation */}
              <div className="flex items-center gap-0.5 h-4">
                {[4, 10, 14, 8, 16, 12, 6, 15, 11, 7, 13, 9, 5].map((h, i) => (
                  <span
                    key={i}
                    className="w-1 rounded-full opacity-80"
                    style={{
                      height: `${h}px`,
                      backgroundColor: i < 5 ? accentColor : 'rgba(255,255,255,0.4)'
                    }}
                  />
                ))}
              </div>
              <div className="flex justify-between items-center text-[9px] opacity-70 mt-0.5">
                <span>0:18</span>
                <span>1.0x</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Sent Media Card Sample */}
        <div className="flex justify-end">
          <div
            className="max-w-[75%] p-1.5 rounded-2xl rounded-tr-sm text-xs shadow-md backdrop-blur-xs overflow-hidden"
            style={sentBubbleStyle}
          >
            <div className="relative rounded-xl overflow-hidden aspect-video bg-black/30">
              <img
                src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&auto=format&fit=crop&q=80"
                alt="Sample Landscape"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[9px] text-white flex items-center gap-1">
                <ImageIcon className="w-2.5 h-2.5 text-cyan-300" />
                <span>Photo</span>
              </div>
            </div>
            <div className="flex items-center justify-between px-2 pt-1.5 text-[9px] opacity-80">
              <span className="truncate">Sunset hike 🌄</span>
              <div className="flex items-center gap-1 flex-shrink-0">
                <span>10:45 AM</span>
                <CheckCheck className="w-3 h-3 text-cyan-300" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Composer Input Bar */}
      <div className="relative z-10 p-3 bg-zinc-950/75 backdrop-blur-md border-t border-zinc-800/60 flex items-center gap-2">
        <button
          className="p-1.5 rounded-xl text-zinc-400 hover:text-white transition-colors"
          style={{ color: accentColor }}
        >
          <Paperclip className="w-4 h-4" />
        </button>

        <div
          className="flex-1 px-3 py-1.5 rounded-2xl border flex items-center justify-between shadow-inner"
          style={{
            backgroundColor: inputBg,
            borderColor: 'rgba(255,255,255,0.1)'
          }}
        >
          <span className="text-xs text-zinc-400">Type a message...</span>
          <Smile className="w-4 h-4 text-zinc-400" />
        </div>

        <button
          className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-md transition-transform active:scale-95"
          style={{ backgroundColor: accentColor }}
        >
          <Send className="w-3.5 h-3.5 ml-0.5" />
        </button>
      </div>
    </div>
  );
}
