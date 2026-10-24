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
  Scissors,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { getAssetUrl } from '../../utils/assetHelper';

export default function FabricPreviewCanvas({
  selectedProduct,
  customization,
  onReset,
  brandName = ''
}) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [viewMode, setViewMode] = useState('model'); // 'model' | 'video' | 'pattern' | 'flatlay' | 'macro'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlayingVideo, setIsPlayingVideo] = useState(true);
  const containerRef = useRef(null);
  const videoRef = useRef(null);

  // Horizontal Scrolling Controls for View Mode Switcher
  const viewModesTrackRef = useRef(null);
  const [canScrollModeLeft, setCanScrollModeLeft] = useState(false);
  const [canScrollModeRight, setCanScrollModeRight] = useState(true);
  const [isModeDragging, setIsModeDragging] = useState(false);
  const [modeStartX, setModeStartX] = useState(0);
  const [modeScrollLeftPos, setModeScrollLeftPos] = useState(0);

  const updateModeScrollState = () => {
    if (viewModesTrackRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = viewModesTrackRef.current;
      setCanScrollModeLeft(scrollLeft > 4);
      setCanScrollModeRight(scrollWidth > clientWidth + 4 && scrollLeft + clientWidth < scrollWidth - 4);
    }
  };

  useEffect(() => {
    const el = viewModesTrackRef.current;
    if (!el) return;

    updateModeScrollState();

    // Native { passive: false } listener translates vertical mouse wheel into horizontal scroll
    const handleWheel = (e) => {
      if (e.deltaY !== 0 || e.deltaX !== 0) {
        e.preventDefault();
        const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
        el.scrollLeft += delta;
        updateModeScrollState();
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('resize', updateModeScrollState);

    let ro;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => updateModeScrollState());
      ro.observe(el);
    }

    return () => {
      el.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', updateModeScrollState);
      if (ro) ro.disconnect();
    };
  }, []);

  const scrollModes = (direction) => {
    if (viewModesTrackRef.current) {
      const amount = direction === 'left' ? -180 : 180;
      viewModesTrackRef.current.scrollBy({ left: amount, behavior: 'smooth' });
      setTimeout(updateModeScrollState, 260);
    }
  };

  const handleModeMouseDown = (e) => {
    if (!viewModesTrackRef.current) return;
    setIsModeDragging(true);
    setModeStartX(e.pageX - viewModesTrackRef.current.offsetLeft);
    setModeScrollLeftPos(viewModesTrackRef.current.scrollLeft);
  };

  const handleModeMouseLeaveOrUp = () => setIsModeDragging(false);

  const handleModeMouseMove = (e) => {
    if (!isModeDragging || !viewModesTrackRef.current) return;
    e.preventDefault();
    const x = e.pageX - viewModesTrackRef.current.offsetLeft;
    const walk = (x - modeStartX) * 1.5;
    viewModesTrackRef.current.scrollLeft = modeScrollLeftPos - walk;
    updateModeScrollState();
  };

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

  // 1. Base authentic 4K photograph of the runway model belongs to the selected saree product
  const getBaseModelImage = () => {
    return getAssetUrl(selectedProduct?.hero_image || '/assets/products/model-crimson-runway.jpg');
  };

  // 2. Matching 4K catwalk walking motion video belongs to the selected saree product
  const getRunwayVideo = () => {
    return getAssetUrl(selectedProduct?.demo_video_url || '/assets/videos/saree-crimson-runway-walk.mp4');
  };

  // Dynamic Silk Dye Color Filter: Photorealistically shifts the saree fabric color while preserving weave texture & lighting
  const getSilkColorFilter = () => {
    const targetHex = (customization?.colour?.hex_code || selectedProduct?.base_colour_hex || '#7B1113').toLowerCase();
    const baseHex = (selectedProduct?.base_colour_hex || '#7B1113').toLowerCase();
    const targetName = (customization?.colour?.name || '').toLowerCase();

    // If target matches product base, no filter needed
    if (targetHex === baseHex && !targetName.includes('ivory') && !targetName.includes('black')) {
      return { filter: 'none' };
    }

    // High-fidelity handcrafted presets for specialty non-chromatic finishes
    if (targetName.includes('ivory') || targetName.includes('pearl') || targetHex === '#f5f2e9') {
      return { filter: 'sepia(0.35) saturate(0.35) brightness(1.35) contrast(0.95)' };
    }
    if (targetName.includes('black') || targetHex === '#1a1a1a') {
      return { filter: 'saturate(0.12) brightness(0.42) contrast(1.35)' };
    }
    if (targetName.includes('wine') || targetName.includes('plum') || targetHex === '#4a0e2e') {
      return { filter: 'hue-rotate(325deg) saturate(1.15) brightness(0.85) contrast(1.1)' };
    }

    // Precise HSL delta conversion
    const hexToHsl = (hex) => {
      let c = hex.replace('#', '');
      if (c.length === 3) c = c.split('').map(x => x + x).join('');
      const r = parseInt(c.substring(0, 2), 16) / 255;
      const g = parseInt(c.substring(2, 4), 16) / 255;
      const b = parseInt(c.substring(4, 6), 16) / 255;
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      let h = 0, s = 0, l = (max + min) / 2;
      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h *= 60;
      }
      return { h: Math.round(h), s: s * 100, l: l * 100 };
    };

    const bHsl = hexToHsl(baseHex);
    const tHsl = hexToHsl(targetHex);

    const deltaHue = (tHsl.h - bHsl.h + 360) % 360;
    const satScale = Math.min(Math.max(tHsl.s / Math.max(bHsl.s, 1), 0.75), 1.35).toFixed(2);
    const briScale = Math.min(Math.max(tHsl.l / Math.max(bHsl.l, 1), 0.78), 1.35).toFixed(2);

    return {
      filter: `hue-rotate(${deltaHue}deg) saturate(${satScale}) brightness(${briScale})`
    };
  };

  const silkColorFilter = getSilkColorFilter();

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
    const id = customization?.design?.id;
    const code = (customization?.design?.design_code || '').toLowerCase();
    const name = (customization?.design?.name || designName || '').toLowerCase();

    if (id === 2 || name.includes('meenakari') || name.includes('floral') || code.includes('meena')) {
      return getAssetUrl('/assets/patterns/meenakari.svg');
    }
    if (id === 3 || name.includes('temple') || name.includes('chevron') || code.includes('temple')) {
      return getAssetUrl('/assets/patterns/temple.svg');
    }
    if (id === 4 || name.includes('kamal') || name.includes('lotus') || code.includes('kamal')) {
      return getAssetUrl('/assets/patterns/lotus.svg');
    }
    if (id === 5 || name.includes('tree') || name.includes('kalpavriksha') || code.includes('tree')) {
      return getAssetUrl('/assets/patterns/kalpavriksha.svg');
    }
    return getAssetUrl('/assets/patterns/kalka.svg');
  };

  // Precise geometric polygon isolating the saree drape on the runway model
  const sareeClipPath = 'polygon(' +
    '37% 36%, 42% 30%, 48% 25%, 54% 20.5%, 68% 21%, ' +
    '71% 28%, 73% 38%, 74.5% 50%, 75.5% 62%, 74% 74%, ' +
    '71% 83%, 64.5% 91%, 41.5% 91%, 40% 84%, 39% 72%, ' +
    '38% 60%, 36.5% 45%' +
  ')';

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
            {/* BASE LAYER: Authentic 4K High-Fashion Model Runway Photograph (Preserves Model Face, Hair & Stage) */}
            <img
              src={getBaseModelImage()}
              alt="International Model Wearing Saree on Stage"
              className="w-full h-full object-cover select-none transition-all duration-500"
              draggable="false"
            />

            {/* SVG Defs for Saree Drape Featheared Mask */}
            <svg className="absolute w-0 h-0 pointer-events-none" style={{ position: 'absolute' }} aria-hidden="true">
              <defs>
                <filter id="maskFeather" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="0.006" />
                </filter>
                <mask id="sareeDrapeMask" maskContentUnits="objectBoundingBox">
                  <rect x="0" y="0" width="1" height="1" fill="black" />
                  <path
                    d="M 0.37 0.36
                       C 0.40 0.31, 0.46 0.26, 0.54 0.205
                       C 0.59 0.20, 0.65 0.205, 0.68 0.21
                       C 0.70 0.26, 0.72 0.35, 0.735 0.45
                       C 0.75 0.55, 0.755 0.65, 0.74 0.75
                       C 0.72 0.82, 0.69 0.87, 0.645 0.91
                       L 0.415 0.91
                       C 0.405 0.84, 0.395 0.72, 0.39 0.62
                       C 0.38 0.52, 0.365 0.44, 0.37 0.36 Z"
                    fill="white"
                    filter="url(#maskFeather)"
                  />
                  {/* Exclude Bare Right Arm & Skin */}
                  <path
                    d="M 0.33 0.33 L 0.385 0.33 L 0.385 0.46 L 0.34 0.46 Z"
                    fill="black"
                    filter="url(#maskFeather)"
                  />
                  {/* Exclude Hand resting on waist */}
                  <ellipse cx="0.505" cy="0.38" rx="0.04" ry="0.025" fill="black" filter="url(#maskFeather)" />
                </mask>
              </defs>
            </svg>

            {/* DYNAMIC REACTIVE SILK DYE COLOR LAYER: Photorealistically shifts color on the SAME saree fabric */}
            {silkColorFilter.filter !== 'none' && (
              <img
                src={getBaseModelImage()}
                alt="Color Customized Saree"
                className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none transition-all duration-500 ease-in-out"
                style={{
                  ...silkColorFilter,
                  mask: 'url(#sareeDrapeMask)',
                  WebkitMask: 'url(#sareeDrapeMask)',
                  clipPath: sareeClipPath
                }}
                draggable="false"
              />
            )}

            {/* DYNAMIC JACQUARD WEAVE MOTIFS: Woven directly onto saree fabric with realistic metallic zari depth & fold shadows */}
            <div 
              className="absolute inset-0 pointer-events-none transition-all duration-500 overflow-hidden"
              style={{
                mask: 'url(#sareeDrapeMask)',
                WebkitMask: 'url(#sareeDrapeMask)',
                clipPath: sareeClipPath
              }}
            >
              {/* LAYER A: Luminous Gold Jacquard Weave Threads */}
              <div 
                className="absolute inset-0 transition-all duration-500"
                style={{
                  backgroundImage: `url(${getActivePatternSvg()})`,
                  backgroundSize: '115px 115px',
                  backgroundRepeat: 'repeat',
                  mixBlendMode: 'screen',
                  opacity: 0.95,
                  filter: zariPalette.filter
                }}
              />

              {/* LAYER B: Embossed Metallic Zari Sheen */}
              <div 
                className="absolute inset-0 transition-all duration-500"
                style={{
                  backgroundImage: `url(${getActivePatternSvg()})`,
                  backgroundSize: '115px 115px',
                  backgroundRepeat: 'repeat',
                  mixBlendMode: 'color-dodge',
                  opacity: 0.70,
                  filter: zariPalette.filter
                }}
              />

              {/* LAYER C: Fabric Creases, Folds & Shadow Modulator (multiplies photograph folds onto motifs) */}
              <img
                src={getBaseModelImage()}
                alt=""
                className="absolute inset-0 w-full h-full object-cover pointer-events-none mix-blend-multiply opacity-70 transition-all duration-500"
                draggable="false"
              />

              {/* LAYER D: Specular Metallic Zari Luster Spotlight Sheen */}
              <div 
                className="absolute inset-0 pointer-events-none mix-blend-color-dodge transition-all duration-500 opacity-60"
                style={{
                  background: `radial-gradient(ellipse at 52% 58%, ${zariPalette.glow} 0%, transparent 65%)`
                }}
              />
            </div>

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

            {/* REAL-TIME CLIENT COMPANY BRANDING SET ON RUNWAY STAGE SIGNBOARD (OVER COUTURE WEEK) */}
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
              className="w-full h-full object-cover transition-all duration-500"
              style={silkColorFilter}
              onPlay={() => setIsPlayingVideo(true)}
              onPause={() => setIsPlayingVideo(false)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

            {/* REAL-TIME CLIENT COMPANY BRANDING ON RUNWAY STAGE SIGNBOARD */}
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
              className="w-full h-full object-cover select-none transition-all duration-500"
              style={silkColorFilter}
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
              className="w-full h-full object-cover select-none filter contrast-125 brightness-105 transition-all duration-500"
              style={silkColorFilter}
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

        {/* View Mode Switcher with Clean Underline Scrollbar & Mouse Wheel Scrolling */}
        <div
          ref={viewModesTrackRef}
          onMouseDown={handleModeMouseDown}
          onMouseLeave={handleModeMouseLeaveOrUp}
          onMouseUp={handleModeMouseLeaveOrUp}
          onMouseMove={handleModeMouseMove}
          onScroll={updateModeScrollState}
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#f59e0b #18181b' }}
          className={`flex items-center gap-1 p-1 rounded-2xl bg-black/90 backdrop-blur-md border border-white/20 pointer-events-auto shadow-2xl overflow-x-auto scroll-smooth max-w-[280px] xs:max-w-[340px] sm:max-w-md ${
            isModeDragging ? 'cursor-grabbing select-none' : 'cursor-grab'
          } [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:bg-amber-500/70 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-amber-400 [&::-webkit-scrollbar-track]:bg-white/5`}
        >
          <button
            onClick={() => setViewMode('model')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition ${
              viewMode === 'model'
                ? 'gold-gradient-bg text-zinc-950 shadow-md font-bold'
                : 'text-zinc-300 hover:text-white hover:bg-white/10'
            }`}
          >
            Model View
          </button>

          <button
            onClick={() => setViewMode('video')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 shrink-0 transition ${
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
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1 shrink-0 transition ${
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
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition ${
              viewMode === 'flatlay'
                ? 'gold-gradient-bg text-zinc-950 shadow-md font-bold'
                : 'text-zinc-300 hover:text-white hover:bg-white/10'
            }`}
          >
            Real Saree
          </button>

          <button
            onClick={() => setViewMode('macro')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition ${
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
