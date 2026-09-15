import React, { useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Download } from 'lucide-react';

export default function VideoPlayer({ src, filename }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const p = (videoRef.current.currentTime / videoRef.current.duration) * 100;
    setProgress(p || 0);
  };

  const handleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  return (
    <div className="relative rounded-2xl overflow-hidden bg-black max-w-sm sm:max-w-md group shadow-md select-none">
      <video
        ref={videoRef}
        src={src}
        muted={isMuted}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        playsInline
        className="w-full max-h-80 object-cover cursor-pointer"
        onClick={togglePlay}
      />

      {/* Center Play Button when paused */}
      {!isPlaying && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg"
        >
          <Play className="w-5 h-5 fill-current ml-0.5" />
        </button>
      )}

      {/* Bottom Controls Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-2.5 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-between gap-3 text-white opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={togglePlay} className="hover:text-brand transition-colors">
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
        </button>

        {/* Progress Bar */}
        <div
          className="flex-1 h-1.5 bg-white/30 rounded-full overflow-hidden cursor-pointer"
          onClick={(e) => {
            if (!videoRef.current) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const ratio = clickX / rect.width;
            videoRef.current.currentTime = ratio * videoRef.current.duration;
          }}
        >
          <div style={{ width: `${progress}%` }} className="h-full bg-brand transition-all" />
        </div>

        <div className="flex items-center gap-2">
          <button onClick={toggleMute} className="hover:text-brand transition-colors">
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <a
            href={src}
            download={filename || 'video.mp4'}
            target="_blank"
            rel="noreferrer"
            className="hover:text-brand transition-colors"
          >
            <Download className="w-4 h-4" />
          </a>

          <button onClick={handleFullscreen} className="hover:text-brand transition-colors">
            <Maximize className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
