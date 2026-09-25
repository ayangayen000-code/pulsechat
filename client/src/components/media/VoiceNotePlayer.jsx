import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import { resolveMediaUrl } from '../../services/api';

export default function VoiceNotePlayer({ src, waveforms = [], duration = 0, isOutgoing = false }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [speed, setSpeed] = useState(1.0);
  const audioRef = useRef(null);
  const animFrameRef = useRef(null);

  // Generate fallback waveform if not provided
  const bars = waveforms && waveforms.length > 0
    ? waveforms
    : [20, 45, 70, 35, 90, 80, 50, 65, 40, 85, 95, 60, 30, 75, 55, 40, 65, 80, 50, 30];

  const totalDuration = duration || 8.0;

  const togglePlay = () => {
    if (!audioRef.current && src) {
      const audio = new Audio(resolveMediaUrl(src));
      audio.playbackRate = speed;
      audio.onended = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };
      audioRef.current = audio;
    }

    if (isPlaying) {
      if (audioRef.current) audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (audioRef.current) {
        audioRef.current.playbackRate = speed;
        audioRef.current.play().catch(() => {
          // Fallback to synthetic animation
        });
      }
      setIsPlaying(true);
    }
  };

  // Simulated progress timer if no real audio or during playback
  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 0.1 * speed;
          if (next >= totalDuration) {
            setIsPlaying(false);
            return 0;
          }
          return next;
        });
      }, 100);
    } else {
      if (interval) clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying, speed, totalDuration]);

  const cycleSpeed = (e) => {
    e.stopPropagation();
    const speeds = [1.0, 1.5, 2.0];
    const nextIdx = (speeds.indexOf(speed) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setSpeed(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progress = Math.min(1, currentTime / (totalDuration || 1));

  return (
    <div className={`flex items-center gap-3 p-1.5 min-w-[220px] sm:min-w-[260px] select-none ${isOutgoing ? 'text-white' : 'text-zinc-200'}`}>
      {/* Play/Pause Button */}
      <button
        type="button"
        onClick={togglePlay}
        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-transform active:scale-90 ${
          isOutgoing
            ? 'bg-white text-brand shadow-sm hover:bg-zinc-100'
            : 'bg-brand text-white shadow-glow shadow-brand/20 hover:bg-brand-hover'
        }`}
      >
        {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
      </button>

      {/* Waveform Visualization */}
      <div className="flex-1 flex flex-col justify-center gap-1.5">
        <div className="flex items-center gap-1 h-7 cursor-pointer" onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const ratio = Math.max(0, Math.min(1, clickX / rect.width));
          setCurrentTime(ratio * totalDuration);
          if (audioRef.current) {
            audioRef.current.currentTime = ratio * totalDuration;
          }
        }}>
          {bars.map((height, i) => {
            const barProgress = i / bars.length;
            const isFilled = barProgress <= progress;
            return (
              <div
                key={i}
                style={{ height: `${Math.max(15, height)}%` }}
                className={`w-1 rounded-full transition-colors duration-100 ${
                  isFilled
                    ? isOutgoing ? 'bg-white' : 'bg-brand'
                    : isOutgoing ? 'bg-white/40' : 'bg-zinc-700/60'
                }`}
              />
            );
          })}
        </div>

        {/* Time and Speed */}
        <div className="flex items-center justify-between text-[11px] opacity-80">
          <span>{isPlaying ? formatTime(currentTime) : formatTime(totalDuration)}</span>
          <button
            type="button"
            onClick={cycleSpeed}
            className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase transition-colors ${
              isOutgoing ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
            }`}
          >
            {speed}x
          </button>
        </div>
      </div>
    </div>
  );
}
