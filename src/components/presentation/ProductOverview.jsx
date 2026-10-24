import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Sparkles, 
  ArrowRight,
  Info,
  Shield,
  Clock,
  Layers,
  CheckCircle2,
  Share2,
  BookOpen
} from 'lucide-react';
import { getAssetUrl } from '../../utils/assetHelper';

export default function ProductOverview({
  product,
  onStartCustomize,
  onOpenCompare,
  onLaunchFullscreenVideo,
  brandName = '',
  onOpenCatalog
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [activeMediaTab, setActiveMediaTab] = useState('image'); // 'image', 'video', 'pallu', 'closeup'
  const videoRef = React.useRef(null);

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

  const formatInr = (val) => `₹${(parseFloat(val) || 0).toLocaleString('en-IN')}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* LEFT COLUMN: Large High-Res Showcase & Video Player (7 Cols) */}
      <div className="lg:col-span-7 space-y-4">
        
        {/* Main Media Stage */}
        <div className="relative aspect-[4/5] sm:aspect-[4/3] rounded-3xl overflow-hidden glass-card border border-white/10 shadow-2xl bg-zinc-950 flex items-center justify-center">
          
          {activeMediaTab === 'video' ? (
            <div 
              className="relative w-full h-full cursor-pointer overflow-hidden flex items-center justify-center bg-black"
              onClick={togglePlay}
            >
              <video
                ref={videoRef}
                src={product.demo_video_url || getAssetUrl('/assets/videos/saree-crimson-runway-walk.mp4')}
                loop
                muted={isMuted}
                playsInline
                autoPlay
                className="w-full h-full object-cover"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

              {/* REAL-TIME CLIENT BRAND NAME SET DIRECTLY ON RUNWAY STAGE SIGNBOARD (OVER COUTURE WEEK) */}
              {brandName && (
                <div 
                  className="absolute top-[3%] left-1/2 -translate-x-1/2 w-[44%] h-[9.8%] flex flex-col items-center justify-center pointer-events-none z-20 text-center select-none"
                >
                  <div className="w-full h-full rounded-md bg-gradient-to-b from-[#0a0a0c]/98 via-[#131318]/95 to-[#0b0b0e]/92 border border-white/10 px-2 py-0.5 flex flex-col items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.85)]">
                    <span 
                      className="font-serif font-black text-white/95 uppercase tracking-[0.2em] text-[10px] sm:text-xs md:text-sm leading-tight drop-shadow line-clamp-1"
                      style={{ textShadow: '0 0 10px rgba(255,255,255,0.35), 0 2px 4px rgba(0,0,0,0.95)' }}
                    >
                      {brandName}
                    </span>
                    <span className="text-[6px] sm:text-[7px] font-sans font-bold tracking-[0.35em] uppercase text-zinc-400 mt-0.5">
                      FASHION WEEK
                    </span>
                  </div>
                </div>
              )}

              {/* Minimal Top-Right Controls for Audio and Fullscreen (Non-obstructive) */}
              <div className="absolute top-3 right-3 flex items-center gap-2 z-30 pointer-events-auto">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMuted(!isMuted);
                  }}
                  className="p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/90 transition border border-white/10 shadow-lg"
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                {onLaunchFullscreenVideo && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onLaunchFullscreenVideo(product);
                    }}
                    className="p-2 rounded-full bg-black/60 backdrop-blur-md text-amber-300 hover:bg-black/90 hover:text-white transition border border-amber-500/30 shadow-lg"
                    title="Enter Fullscreen Runway Walk Theater"
                  >
                    <Maximize className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="relative w-full h-full">
              <img
                src={
                  activeMediaTab === 'pallu'
                    ? product.pallu_image || getAssetUrl('/assets/products/saree-crimson-meenakari-real.jpg')
                    : activeMediaTab === 'closeup'
                    ? product.close_up_image || getAssetUrl('/assets/products/saree-stack-5colors.jpg')
                    : product.hero_image || getAssetUrl('/assets/products/model-crimson-runway.jpg')
                }
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
              
              {/* REAL-TIME CLIENT BRAND NAME SET DIRECTLY ON RUNWAY STAGE SIGNBOARD */}
              {brandName && activeMediaTab === 'image' && (
                <div 
                  className="absolute top-[3%] left-1/2 -translate-x-1/2 w-[44%] h-[9.8%] flex flex-col items-center justify-center pointer-events-none z-20 text-center select-none"
                >
                  <div className="w-full h-full rounded-md bg-gradient-to-b from-[#0a0a0c]/98 via-[#131318]/95 to-[#0b0b0e]/92 border border-white/10 px-2 py-0.5 flex flex-col items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.85)]">
                    <span 
                      className="font-serif font-black text-white/95 uppercase tracking-[0.2em] text-[10px] sm:text-xs md:text-sm leading-tight drop-shadow line-clamp-1"
                      style={{ textShadow: '0 0 10px rgba(255,255,255,0.35), 0 2px 4px rgba(0,0,0,0.95)' }}
                    >
                      {brandName}
                    </span>
                    <span className="text-[6px] sm:text-[7px] font-sans font-bold tracking-[0.35em] uppercase text-zinc-400 mt-0.5">
                      FASHION WEEK
                    </span>
                  </div>
                </div>
              )}
              
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-none">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-amber-300">
                    {product.collection || 'Heritage Master Series'} • Traditional Royal Saree Showcase
                  </span>
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-white drop-shadow">
                    {product.name}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-zinc-400 block">Starting Base Rate</span>
                  <span className="text-xl sm:text-2xl font-bold gold-gradient-text font-serif">
                    {formatInr(product.base_price)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Media Thumbnail Selector Tabs */}
        <div className="grid grid-cols-4 gap-2.5">
          <button
            onClick={() => setActiveMediaTab('image')}
            className={`p-2 rounded-2xl glass-card border text-center transition ${
              activeMediaTab === 'image' ? 'border-amber-400 bg-amber-500/10' : 'border-white/10 hover:border-white/20'
            }`}
          >
            <p className="text-xs font-semibold text-white">Model Drape</p>
            <p className="text-[10px] text-zinc-400">Full Saree</p>
          </button>

          <button
            onClick={() => setActiveMediaTab('video')}
            className={`p-2 rounded-2xl glass-card border text-center transition ${
              activeMediaTab === 'video' ? 'border-amber-400 bg-amber-500/10' : 'border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-center gap-1">
              <Play className="w-3 h-3 text-amber-400" />
              <p className="text-xs font-semibold text-white">Runway Video</p>
            </div>
            <p className="text-[10px] text-zinc-400">Catwalk Walk</p>
          </button>

          <button
            onClick={() => setActiveMediaTab('pallu')}
            className={`p-2 rounded-2xl glass-card border text-center transition ${
              activeMediaTab === 'pallu' ? 'border-amber-400 bg-amber-500/10' : 'border-white/10 hover:border-white/20'
            }`}
          >
            <p className="text-xs font-semibold text-white">Pallu Turn</p>
            <p className="text-[10px] text-zinc-400">Zari Brocade</p>
          </button>

          <button
            onClick={() => setActiveMediaTab('closeup')}
            className={`p-2 rounded-2xl glass-card border text-center transition ${
              activeMediaTab === 'closeup' ? 'border-amber-400 bg-amber-500/10' : 'border-white/10 hover:border-white/20'
            }`}
          >
            <p className="text-xs font-semibold text-white">Macro Grain</p>
            <p className="text-[10px] text-zinc-400">Warp & Weft</p>
          </button>
        </div>

      </div>

      {/* RIGHT COLUMN: Product Technical Specifications & Call-to-Actions (5 Cols) */}
      <div className="lg:col-span-5 space-y-4">
        
        {/* Primary Action Card */}
        <div className="glass-card rounded-3xl p-6 border border-white/10 shadow-2xl space-y-5">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                {product.product_code}
              </span>
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Active Surat Loom Catalog
              </span>
            </div>
            <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
              {product.name}
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              {product.pattern_description || 'Surat jacquard weave with precision electronic loom finish.'}
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-zinc-950/60 border border-white/5 text-center">
            <div>
              <p className="text-[10px] text-zinc-400">Min Order (MOQ)</p>
              <p className="text-sm font-bold text-white">{product.moq || 10} Sarees</p>
            </div>
            <div className="border-x border-white/10">
              <p className="text-[10px] text-zinc-400">Lead Time</p>
              <p className="text-sm font-bold text-amber-300">{product.lead_time_days || 10} Days</p>
            </div>
            <div>
              <p className="text-[10px] text-zinc-400">Fabric GSM</p>
              <p className="text-sm font-bold text-white">{product.gsm || 185} GSM</p>
            </div>
          </div>

          {/* Prominent Customize Product Button */}
          <div className="space-y-2.5 pt-2">
            <button
              onClick={onStartCustomize}
              className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl gold-gradient-bg text-zinc-950 font-bold text-sm sm:text-base shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition group"
            >
              <Sparkles className="w-5 h-5 text-zinc-950 group-hover:rotate-12 transition" />
              <span>LAUNCH INTERACTIVE CUSTOMIZATION STUDIO</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
            </button>

            <button
              onClick={onOpenCompare}
              className="w-full py-2.5 px-4 rounded-xl glass-pill text-zinc-300 hover:text-white border border-white/10 hover:border-white/20 text-xs font-semibold transition flex items-center justify-center gap-2"
            >
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>Side-by-Side Architectural Comparison</span>
            </button>

            {onOpenCatalog && (
              <button
                onClick={onOpenCatalog}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-semibold transition flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>Browse Master Saree Catalog</span>
              </button>
            )}
          </div>
        </div>

        {/* Detailed Textile Specifications Sheet */}
        <div className="glass-card rounded-3xl p-5 border border-white/10 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Textile Master Specifications
          </h4>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-zinc-400">Fabric Composition</span>
              <span className="text-white font-medium text-right max-w-[60%]">{product.fabric_composition}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-zinc-400">Weave Type</span>
              <span className="text-white font-medium">{product.weave_type}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-zinc-400">Length & Width</span>
              <span className="text-white font-medium">{product.saree_length} • {product.fabric_width}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-zinc-400">Border Specification</span>
              <span className="text-white font-medium text-right max-w-[60%]">{product.border_type}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-zinc-400">Pallu Architecture</span>
              <span className="text-white font-medium text-right max-w-[60%]">{product.pallu_design}</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
