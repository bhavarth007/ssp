import React, { useRef, useState, useEffect } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2, 
  Sparkles, 
  CheckCircle2,
  User,
  Eye,
  Camera,
  Layers,
  Play,
  Pause,
  Sliders,
  Grid,
  Package,
  Scissors
} from 'lucide-react';
import { getAssetUrl } from '../../utils/assetHelper';

export default function FabricPreviewCanvas({
  selectedProduct,
  customization,
  onReset
}) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [viewMode, setViewMode] = useState('model'); // 'model' | 'video' | 'pattern' | 'flatlay' | 'macro'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlayingVideo, setIsPlayingVideo] = useState(true);
  const containerRef = useRef(null);
  const videoRef = useRef(null);

  // Active Customization Parameters
  const colorName = (customization?.colour?.name || selectedProduct?.base_colour || '').toLowerCase();
  const baseColorHex = customization?.colour?.hex_code || selectedProduct?.base_colour_hex || '#7B1113';
  const zariTone = customization?.zari?.finish_tone || 'Gold';
  const zariName = customization?.zari?.name || 'Surat Tested Gold Zari';
  const designName = (customization?.design?.name || 'Royal Meenakari Floral Brocade').toLowerCase();
  const threadName = customization?.thread?.name || 'High-Tenacity Mercerized Resham';
  
  const hasDiang = customization?.processes?.some(p => 
    p.process_code?.includes('DIANG') || p.name?.toLowerCase().includes('diang')
  );
  const hasTassels = customization?.processes?.some(p => 
    p.process_code?.includes('TASSEL') || p.name?.toLowerCase().includes('tassel')
  );

  // 1. Select the base authentic 4K photograph of the runway model matching the active color
  const getBaseModelImage = () => {
    if (colorName.includes('blue') || colorName.includes('indigo') || colorName.includes('navy')) {
      return getAssetUrl('/assets/products/model-indigo-runway.jpg');
    }
    if (colorName.includes('pink') || colorName.includes('rani') || colorName.includes('magenta')) {
      return getAssetUrl('/assets/products/model-rani-pink-runway.jpg');
    }
    if (colorName.includes('gold') || colorName.includes('mustard') || colorName.includes('yellow')) {
      return getAssetUrl('/assets/products/model-mustard-gold-runway.jpg');
    }
    if (colorName.includes('green') || colorName.includes('emerald') || colorName.includes('teal')) {
      return getAssetUrl('/assets/products/model-teal-green-runway.jpg');
    }
    return getAssetUrl('/assets/products/model-crimson-runway.jpg');
  };

  // Custom dye tone adjustments for non-catalog reactive colors (no bounding box)
  const getCustomSilkFilter = () => {
    if (colorName.includes('wine') || colorName.includes('plum')) {
      return { filter: 'hue-rotate(295deg) saturate(1.15)' };
    }
    if (colorName.includes('ivory') || colorName.includes('pearl')) {
      return { filter: 'sepia(0.2) brightness(1.22) saturate(0.65)' };
    }
    if (colorName.includes('black')) {
      return { filter: 'brightness(0.42) contrast(1.3)' };
    }
    return { filter: 'none' };
  };

  // 2. Select the matching 4K catwalk walking motion video
  const getRunwayVideo = () => {
    if (colorName.includes('blue') || colorName.includes('indigo') || colorName.includes('navy')) {
      return getAssetUrl('/assets/videos/saree-indigo-runway-walk.mp4');
    }
    if (colorName.includes('pink') || colorName.includes('rani') || colorName.includes('magenta')) {
      return getAssetUrl('/assets/videos/saree-rani-runway-walk.mp4');
    }
    if (colorName.includes('gold') || colorName.includes('mustard') || colorName.includes('yellow')) {
      return getAssetUrl('/assets/videos/saree-mustard-runway-walk.mp4');
    }
    if (colorName.includes('green') || colorName.includes('emerald') || colorName.includes('teal')) {
      return getAssetUrl('/assets/videos/saree-teal-runway-walk.mp4');
    }
    return getAssetUrl('/assets/videos/saree-crimson-runway-walk.mp4');
  };

  // 3. Flatlay & Macro Closeups
  const getFlatlayImage = () => {
    if (selectedProduct?.product_code === 'SP-MEENA-01') return getAssetUrl('/assets/products/saree-crimson-meenakari-real.jpg');
    return getAssetUrl('/assets/products/saree-stack-5colors.jpg');
  };

  const getMacroImage = () => {
    if (selectedProduct?.product_code === 'SP-MEENA-01') return getAssetUrl('/assets/products/crimson-medallion-detail.jpg');
    if (selectedProduct?.product_code === 'SP-INDIGO-02') return getAssetUrl('/assets/products/indigo-fabric-detail.jpg');
    if (selectedProduct?.product_code === 'SP-RANI-03') return getAssetUrl('/assets/products/rani-fabric-detail.jpg');
    if (selectedProduct?.product_code === 'SP-GOLD-04') return getAssetUrl('/assets/products/mustard-fabric-detail.jpg');
    if (selectedProduct?.product_code === 'SP-TEAL-05') return getAssetUrl('/assets/products/teal-fabric-detail.jpg');
    return getAssetUrl(selectedProduct?.close_up_image || '/assets/products/crimson-medallion-detail.jpg');
  };

  // 4. Metallic Zari Specification Palette
  const getZariPalette = () => {
    switch (zariTone) {
      case 'Antique Gold':
        return {
          primary: '#D97706',
          highlight: '#FDE68A',
          glow: 'rgba(217, 119, 6, 0.45)',
          gradient: 'linear-gradient(135deg, #78350f 0%, #b45309 35%, #fde68a 50%, #92400e 75%, #451a03 100%)',
          filter: 'sepia(0.6) saturate(1.8) hue-rotate(-15deg)'
        };
      case 'Rose Gold':
        return {
          primary: '#E11D48',
          highlight: '#FECDD3',
          glow: 'rgba(225, 29, 72, 0.45)',
          gradient: 'linear-gradient(135deg, #9f1239 0%, #e11d48 35%, #fecdd3 50%, #be123c 70%, #4c0519 100%)',
          filter: 'sepia(0.3) saturate(2.2) hue-rotate(310deg)'
        };
      case 'Silver':
        return {
          primary: '#E2E8F0',
          highlight: '#FFFFFF',
          glow: 'rgba(241, 245, 249, 0.6)',
          gradient: 'linear-gradient(135deg, #64748b 0%, #cbd5e1 35%, #ffffff 50%, #94a3b8 70%, #334155 100%)',
          filter: 'grayscale(0.9) contrast(1.4) brightness(1.2)'
        };
      case 'Champagne':
        return {
          primary: '#EAB308',
          highlight: '#FEF9C3',
          glow: 'rgba(234, 179, 8, 0.4)',
          gradient: 'linear-gradient(135deg, #854d0e 0%, #eab308 35%, #fef9c3 50%, #ca8a04 70%, #713f12 100%)',
          filter: 'sepia(0.25) saturate(1.4) hue-rotate(10deg)'
        };
      case 'Gold':
      default:
        return {
          primary: '#F59E0B',
          highlight: '#FEF08A',
          glow: 'rgba(245, 158, 11, 0.55)',
          gradient: 'linear-gradient(135deg, #b45309 0%, #f59e0b 35%, #fef08a 50%, #d97706 70%, #78350f 100%)',
          filter: 'sepia(0.4) saturate(2.4) hue-rotate(5deg)'
        };
    }
  };

  const zariPalette = getZariPalette();

  // 5. Active Jacquard Motif SVG
  const getActivePatternSvg = () => {
    if (designName.includes('meenakari') || designName.includes('floral')) {
      return getAssetUrl('/assets/patterns/meenakari.svg');
    }
    if (designName.includes('temple') || designName.includes('chevron')) {
      return getAssetUrl('/assets/patterns/temple.svg');
    }
    if (designName.includes('kamal') || designName.includes('lotus')) {
      return getAssetUrl('/assets/patterns/lotus.svg');
    }
    if (designName.includes('tree') || designName.includes('kalpavriksha')) {
      return getAssetUrl('/assets/patterns/kalpavriksha.svg');
    }
    return getAssetUrl('/assets/patterns/kalka.svg');
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => console.log(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`relative w-full aspect-[4/5] sm:aspect-[4/3] rounded-3xl overflow-hidden glass-card border border-white/15 shadow-2xl bg-zinc-950 flex flex-col justify-between ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none w-screen h-screen' : ''
      }`}
    >
      {/* ======================================================== */}
      {/* MAIN VIEWPORT: 4K PHOTOREALISTIC STAGE                   */}
      {/* ======================================================== */}
      <div className="relative w-full h-full overflow-hidden flex items-center justify-center bg-black">
        
        {/* VIEW 1: 4K INTERNATIONAL MODEL RUNWAY SHOWCASE */}
        {viewMode === 'model' && (
          <div 
            className="relative w-full h-full transition-transform duration-300 ease-out flex items-center justify-center overflow-hidden"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {/* BASE LAYER: Authentic 4K High-Fashion Model Runway Photograph */}
            <img
              src={getBaseModelImage()}
              alt="International Model Wearing Saree on Stage"
              className="w-full h-full object-cover select-none transition-all duration-500"
              style={getCustomSilkFilter()}
              draggable="false"
            />

            {/* DYNAMIC JACQUARD WEAVE MOTIF OVERLAY: Embossed directly onto saree drape */}
            <div 
              className="absolute inset-0 pointer-events-none transition-all duration-500 mix-blend-screen opacity-75"
              style={{
                backgroundImage: `url(${getActivePatternSvg()})`,
                backgroundSize: '80px 80px',
                backgroundRepeat: 'repeat',
                filter: zariPalette.filter,
                maskImage: 'radial-gradient(ellipse at 50% 68%, black 42%, transparent 78%)',
                WebkitMaskImage: 'radial-gradient(ellipse at 50% 68%, black 42%, transparent 78%)'
              }}
            />

            {/* DYNAMIC METALLIC ZARI SPECULAR LUSTER */}
            <div 
              className="absolute inset-0 pointer-events-none mix-blend-color-dodge transition-all duration-500 opacity-60"
              style={{
                background: `radial-gradient(ellipse at 50% 62%, ${zariPalette.glow} 0%, transparent 65%)`
              }}
            />

            {/* DYNAMIC FINISHING: Diang Calendering Silk Sheen */}
            {hasDiang && (
              <div 
                className="absolute inset-0 pointer-events-none mix-blend-overlay transition-opacity duration-500"
                style={{
                  background: 'linear-gradient(125deg, transparent 25%, rgba(255,255,255,0.3) 50%, transparent 75%)',
                  opacity: 0.8
                }}
              />
            )}

            {/* Customization Feature Badges */}
            {hasTassels && (
              <div className="absolute top-4 left-4 z-10 pointer-events-none">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-950/85 border border-amber-500/40 text-[11px] font-semibold text-amber-300 backdrop-blur-md shadow-lg">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Handcrafted Pallu Tassels (Latkan)
                </span>
              </div>
            )}

            {/* Stage Spotlight & Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/25 pointer-events-none" />
          </div>
        )}

        {/* VIEW 2: MOTION RUNWAY CATWALK VIDEO (CLEAN 4K PLAYBACK) */}
        {viewMode === 'video' && (
          <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden">
            <video
              ref={videoRef}
              src={getRunwayVideo()}
              loop
              muted
              playsInline
              autoPlay
              className="w-full h-full object-cover"
              onPlay={() => setIsPlayingVideo(true)}
              onPause={() => setIsPlayingVideo(false)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
          </div>
        )}

        {/* VIEW 3: JACQUARD WEAVE MOTIFS & ELECTRONIC LOOM CARD SIMULATION */}
        {viewMode === 'pattern' && (
          <div 
            className="relative w-full h-full transition-transform duration-300 ease-out flex items-center justify-center overflow-hidden p-6"
            style={{ 
              backgroundColor: baseColorHex,
              transform: `scale(${zoomLevel})`
            }}
          >
            {/* Fine Woven Silk Textile Weft Texture */}
            <div 
              className="absolute inset-0 opacity-25"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)`,
                backgroundSize: '4px 4px'
              }}
            />

            {/* Master Repeated Jacquard Brocade Pattern */}
            <div 
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${getActivePatternSvg()})`,
                backgroundSize: '110px 110px',
                backgroundRepeat: 'repeat',
                filter: zariPalette.filter
              }}
            />

            {/* Metallic Zari Specular Sheen Gradient */}
            <div 
              className="absolute inset-0 pointer-events-none mix-blend-color-dodge opacity-70"
              style={{
                background: `radial-gradient(circle at 50% 50%, ${zariPalette.glow} 0%, transparent 70%)`
              }}
            />

            {/* Bottom Zari Architectural Border Strip */}
            <div 
              className="absolute bottom-0 left-0 right-0 h-16 border-t-2 border-amber-400/60 shadow-2xl flex items-center justify-center"
              style={{
                background: zariPalette.gradient
              }}
            >
              <div className="text-zinc-950 font-bold text-xs tracking-widest uppercase flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>{zariTone} Tested Zari Border Finish</span>
                <Sparkles className="w-4 h-4" />
              </div>
            </div>

            {/* Electronic Card Spec Tag */}
            <div className="absolute top-4 left-4 p-3 rounded-2xl bg-black/85 backdrop-blur-md border border-amber-500/30 text-white shadow-xl max-w-xs">
              <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Electronic Jacquard Card Master</p>
              <p className="text-xs font-semibold text-zinc-100 mt-0.5">{customization?.design?.name || 'Heritage Weave'}</p>
              <p className="text-[10px] text-zinc-400 mt-1">Zari: {zariName} • Warp: Poly-Silk 120D</p>
            </div>
          </div>
        )}

        {/* VIEW 4: 4K AUTHENTIC SAREE FLATLAY (REAL FABRIC & MOTIFS) */}
        {viewMode === 'flatlay' && (
          <div 
            className="relative w-full h-full transition-transform duration-300 ease-out flex items-center justify-center"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            <img
              src={getFlatlayImage()}
              alt="Authentic 4K Saree Weaving & Zari Work"
              className="w-full h-full object-cover select-none"
              draggable="false"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
          </div>
        )}

        {/* VIEW 5: MACRO ZARI & WEFT ZOOM */}
        {viewMode === 'macro' && (
          <div 
            className="relative w-full h-full transition-transform duration-300 ease-out flex items-center justify-center overflow-hidden"
            style={{ transform: `scale(${Math.max(1.8, zoomLevel * 1.8)})` }}
          >
            <img
              src={getMacroImage()}
              alt="4K Macro Zari Weft Grain"
              className="w-full h-full object-cover select-none filter contrast-125 brightness-105"
              draggable="false"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
          </div>
        )}

      </div>

      {/* ======================================================== */}
      {/* TOP HEADER CONTROLS & VIEW SWITCHER PILLS                */}
      {/* ======================================================== */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
        
        {/* Real-World AI Synthesis Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-amber-500/40 shadow-xl pointer-events-auto">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span className="text-[11px] font-bold text-amber-300 tracking-wide">
            4K Fashion Model
          </span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-200 border border-amber-400/30">
            Live Couture
          </span>
        </div>

        {/* View Mode Switcher Pills */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-black/85 backdrop-blur-md border border-white/15 pointer-events-auto shadow-xl overflow-x-auto scrollbar-none">
          <button
            onClick={() => setViewMode('model')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              viewMode === 'model'
                ? 'gold-gradient-bg text-zinc-950 shadow-md font-bold'
                : 'text-zinc-300 hover:text-white hover:bg-white/10'
            }`}
          >
            Model View
          </button>

          <button
            onClick={() => setViewMode('video')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition ${
              viewMode === 'video'
                ? 'gold-gradient-bg text-zinc-950 shadow-md font-bold'
                : 'text-zinc-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Catwalk Video</span>
          </button>

          <button
            onClick={() => setViewMode('pattern')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1 transition ${
              viewMode === 'pattern'
                ? 'gold-gradient-bg text-zinc-950 shadow-md font-bold'
                : 'text-zinc-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Grid className="w-3 h-3" />
            <span>Jacquard Motifs</span>
          </button>

          <button
            onClick={() => setViewMode('flatlay')}
            className={`hidden md:inline-block px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              viewMode === 'flatlay'
                ? 'gold-gradient-bg text-zinc-950 shadow-md font-bold'
                : 'text-zinc-300 hover:text-white hover:bg-white/10'
            }`}
          >
            Real Saree
          </button>

          <button
            onClick={() => setViewMode('macro')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              viewMode === 'macro'
                ? 'gold-gradient-bg text-zinc-950 shadow-md font-bold'
                : 'text-zinc-300 hover:text-white hover:bg-white/10'
            }`}
          >
            4K Macro
          </button>
        </div>

      </div>

      {/* ======================================================== */}
      {/* BOTTOM FLOATING CUSTOMIZATION HUD (LIVE INDICATORS)      */}
      {/* ======================================================== */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
        
        {/* Dynamic Specifications Indicator Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pointer-events-auto">
          {/* Active Dye Color */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/85 backdrop-blur-md border border-white/20 text-[11px] text-white shadow-lg">
            <span 
              className="w-3 h-3 rounded-full border border-white/40 shadow-inner"
              style={{ backgroundColor: baseColorHex }}
            />
            <span className="font-medium truncate max-w-[110px]">{customization?.colour?.name || 'Base Silk'}</span>
          </div>

          {/* Active Jacquard Motif */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/85 backdrop-blur-md border border-white/20 text-[11px] text-zinc-200 shadow-lg">
            <Grid className="w-3 h-3 text-amber-400" />
            <span className="font-medium truncate max-w-[120px]">{customization?.design?.name || 'Kalka Jaal'}</span>
          </div>

          {/* Active Zari Tone */}
          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/85 backdrop-blur-md border border-white/20 text-[11px] text-amber-300 shadow-lg">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>{zariTone} Zari</span>
          </div>

          {/* Finishing Badges */}
          {hasDiang && (
            <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-[10px] text-emerald-300">
              Diang Luster
            </span>
          )}
          {hasTassels && (
            <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-[10px] text-amber-300">
              Pallu Tassels
            </span>
          )}
        </div>

        {/* Zoom & Fullscreen Controls */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-black/80 backdrop-blur-md border border-white/15 pointer-events-auto shadow-xl">
          <button
            onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 2.5))}
            title="Zoom In"
            className="p-1.5 rounded-xl text-zinc-300 hover:text-white hover:bg-white/10 transition"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 1))}
            title="Zoom Out"
            className="p-1.5 rounded-xl text-zinc-300 hover:text-white hover:bg-white/10 transition"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            title="Reset Zoom"
            className="p-1.5 rounded-xl text-zinc-300 hover:text-white hover:bg-white/10 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={toggleFullscreen}
            title="Fullscreen Studio"
            className="p-1.5 rounded-xl text-amber-400 hover:text-white hover:bg-white/10 transition"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
}
