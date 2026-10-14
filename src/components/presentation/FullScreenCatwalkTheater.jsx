import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  X, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  SlidersHorizontal,
  ChevronRight,
  Maximize2
} from 'lucide-react';

export default function FullScreenCatwalkTheater({
  product,
  onComplete,
  onSkipToCustomize
}) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(6);
  const videoRef = useRef(null);

  if (!product) return null;

  // Resolve matching video URL
  const videoUrl = product.demo_video_url || (() => {
    const code = (product.product_code || '').toLowerCase();
    if (code.includes('indigo') || code.includes('blue')) return '/assets/videos/saree-indigo-runway-walk.mp4';
    if (code.includes('rani') || code.includes('pink')) return '/assets/videos/saree-rani-runway-walk.mp4';
    if (code.includes('gold') || code.includes('mustard')) return '/assets/videos/saree-mustard-runway-walk.mp4';
    if (code.includes('teal') || code.includes('green')) return '/assets/videos/saree-teal-runway-walk.mp4';
    return '/assets/videos/saree-crimson-runway-walk.mp4';
  })();

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (videoRef.current.duration) {
        setDuration(videoRef.current.duration);
      }
    }
  };

  const handleVideoEnded = () => {
    // When the catwalk runway walk finishes, transition straight to the presentation customization screen!
    if (onComplete) {
      onComplete();
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col justify-between overflow-hidden select-none animate-fadeIn">
      
      {/* 1. TOP CINEMATIC HEADER BAR */}
      <div className="relative z-20 w-full p-4 sm:p-6 bg-gradient-to-b from-black/95 via-black/70 to-transparent flex items-center justify-between gap-4">
        {/* Brand Crest */}
        <div className="flex items-center space-x-3">
          <img 
            src="/assets/ssp-logo.svg" 
            alt="SSP Logo" 
            className="w-10 h-10 object-contain rounded-xl shadow-lg shadow-amber-500/20 border border-amber-500/30"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-sm sm:text-base tracking-wider text-white">
                SAHJANAND POLYWEAVES
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                PVT. LTD.
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 tracking-wide line-clamp-1">
              {product.product_code} — {product.name}
            </p>
          </div>
        </div>

        {/* Top Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onSkipToCustomize || onComplete}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl gold-gradient-bg text-zinc-950 font-bold text-xs shadow-lg shadow-amber-500/25 hover:scale-105 active:scale-95 transition"
          >
            <span className="hidden sm:inline">Customize Saree</span>
            <span className="sm:hidden">Customize</span>
            <ChevronRight className="w-3.5 h-3.5 font-bold" />
          </button>
          
          <button
            onClick={onComplete}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition active:scale-95"
            title="Exit Fullscreen Presentation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 2. FULLSCREEN RUNWAY CATWALK VIDEO VIEWPORT */}
      <div className="relative flex-1 w-full flex items-center justify-center overflow-hidden bg-black">
        <video
          ref={videoRef}
          src={videoUrl}
          autoPlay
          playsInline
          muted={isMuted}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleVideoEnded}
          className="w-full h-full object-contain max-h-screen"
        />

        {/* Soft Luxury Runway Vignette */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-black/30" />

        {/* Center Live Badge */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 pointer-events-none">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-950/80 border border-amber-500/40 text-[11px] font-semibold text-amber-300 backdrop-blur-md shadow-xl">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            LIVE RUNWAY SHOWCASE • FULLSCREEN PRESENTATION
          </span>
        </div>
      </div>

      {/* 3. BOTTOM CINEMATIC CONTROLS & TRANSITION BAR */}
      <div className="relative z-20 w-full p-4 sm:p-6 bg-gradient-to-t from-black/95 via-black/75 to-transparent space-y-3">
        
        {/* Progress Bar */}
        <div className="w-full bg-white/15 h-1.5 rounded-full overflow-hidden">
          <div 
            className="h-full gold-gradient-bg transition-all duration-200"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Video Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="p-2.5 rounded-xl bg-zinc-900/90 border border-white/20 text-white hover:bg-zinc-800 transition active:scale-95"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={toggleMute}
              className="p-2.5 rounded-xl bg-zinc-900/90 border border-white/20 text-white hover:bg-zinc-800 transition active:scale-95"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <span className="text-xs text-zinc-400 font-mono">
              {Math.floor(currentTime)}s / {Math.floor(duration)}s
            </span>
          </div>

          {/* Auto-Transition Notice & Big Action Button */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <span className="text-[11px] text-zinc-400 italic hidden md:inline">
              Video will automatically open Customization Studio when finished
            </span>
            <button
              onClick={onSkipToCustomize || onComplete}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl gold-gradient-bg text-zinc-950 font-bold text-xs sm:text-sm shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>CUSTOMIZE THIS SAREE NOW</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
