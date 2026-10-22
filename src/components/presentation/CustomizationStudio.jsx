import React, { useState, useRef, useEffect } from 'react';
import { 
  Palette, 
  Sparkles, 
  Check, 
  ChevronLeft, 
  ChevronRight,
  BookOpen,
  Building2,
  SlidersHorizontal
} from 'lucide-react';
import { getAssetUrl } from '../../utils/assetHelper';

export default function CustomizationStudio({
  selectedProduct,
  setSelectedProduct,
  products = [],
  customization,
  setCustomization,
  colours = [],
  zariOptions = [],
  designs = [],
  threads = [],
  processes = [],
  pricingCalculation,
  brandName = '',
  setBrandName,
  onOpenCatalog
}) {
  const [activeTab, setActiveTab] = useState('colour');

  // ONLY 2 ACTIVE TABS: Option 3 (Design), Option 4 (Thread), Option 5 (Process) removed per user requirement
  const tabs = [
    { id: 'colour', label: '1. Base Silk & Reactive Dye', icon: Palette, badge: customization.colour?.name },
    { id: 'zari', label: '2. Metallic Zari Specification', icon: Sparkles, badge: customization.zari?.finish_tone },
  ];

  const formatInr = (num) => `+₹${(parseFloat(num) || 0).toFixed(0)}`;

  // Handle color selection: Changes color on the SAME saree without switching product or pattern
  const handleSelectColour = (c) => {
    setCustomization(prev => ({ ...prev, colour: c }));
  };

  const handleSelectZari = (z) => {
    setCustomization(prev => ({ ...prev, zari: z }));
  };

  const tabsContainerRef = useRef(null);
  const tabButtonRefs = useRef({});
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftPos, setScrollLeftPos] = useState(0);

  useEffect(() => {
    const el = tabsContainerRef.current;
    if (!el) return;

    const onWheel = (e) => {
      if (e.deltaY !== 0 || e.deltaX !== 0) {
        e.preventDefault();
        const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
        el.scrollLeft += delta;
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
    };
  }, []);

  useEffect(() => {
    if (tabButtonRefs.current[activeTab]) {
      tabButtonRefs.current[activeTab].scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      });
    }
  }, [activeTab]);

  const handleMouseDown = (e) => {
    if (!tabsContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - tabsContainerRef.current.offsetLeft);
    setScrollLeftPos(tabsContainerRef.current.scrollLeft);
  };

  const handleMouseLeaveOrUp = () => setIsDragging(false);

  const handleMouseMove = (e) => {
    if (!isDragging || !tabsContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - tabsContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    tabsContainerRef.current.scrollLeft = scrollLeftPos - walk;
  };

  return (
    <div className="flex flex-col h-full glass-card rounded-3xl border border-white/10 overflow-hidden shadow-2xl space-y-3 p-3 sm:p-4">
      
      {/* 1. REAL-TIME CLIENT BRANDING SECTION: Add your brand name */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-zinc-950/90 border border-amber-500/40 shadow-xl space-y-2.5">
        <div className="flex items-center justify-between">
          <label htmlFor="brandNameField" className="text-xs font-bold text-white flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-amber-400" />
            <span className="gold-gradient-text tracking-wide uppercase">Add your brand name</span>
          </label>
          {brandName ? (
            <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30 animate-pulse">
              <Check className="w-3 h-3" /> Live on Model & Video Background
            </span>
          ) : (
            <span className="text-[10px] text-zinc-500">
              Live instant preview
            </span>
          )}
        </div>

        <div className="relative">
          <input
            id="brandNameField"
            type="text"
            value={brandName}
            onChange={(e) => setBrandName && setBrandName(e.target.value)}
            placeholder="Type client company name (e.g. Manyavar, Fabindia, Nalli Silks...)"
            className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-amber-500/40 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition font-medium"
          />
          {brandName && (
            <button
              type="button"
              onClick={() => setBrandName && setBrandName('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white text-xs px-2 py-0.5 rounded bg-zinc-800 transition"
              title="Clear brand name"
            >
              Clear
            </button>
          )}
        </div>

        {/* Quick Presets & Live Notice */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 text-[10px] text-zinc-400 pt-0.5">
          <div className="flex items-center gap-1 overflow-x-auto py-0.5">
            <span className="text-zinc-500 shrink-0">Presets:</span>
            {['Manyavar', 'Fabindia', 'Nalli Silks', 'Kalyan Sarees'].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setBrandName && setBrandName(preset)}
                className="px-2 py-0.5 rounded-md bg-zinc-800/90 hover:bg-amber-500/20 hover:text-amber-300 text-zinc-300 border border-white/5 transition shrink-0"
              >
                +{preset}
              </button>
            ))}
          </div>

          {onOpenCatalog && (
            <button
              type="button"
              onClick={onOpenCatalog}
              className="text-amber-400 hover:underline flex items-center gap-1 font-semibold shrink-0"
            >
              <BookOpen className="w-3 h-3" />
              <span>Browse Catalog</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. CUSTOMIZATION STEP TABS: Only Tab 1 (Colour) and Tab 2 (Zari) */}
      <div className="relative border-b border-white/10 bg-zinc-950/80 px-2 py-1.5 rounded-2xl shadow-md">
        <div
          ref={tabsContainerRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeaveOrUp}
          onMouseUp={handleMouseLeaveOrUp}
          onMouseMove={handleMouseMove}
          className="w-full flex items-center gap-2 overflow-x-auto p-1"
        >
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                ref={(el) => (tabButtonRefs.current[t.id] = el)}
                onClick={() => setActiveTab(t.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'gold-gradient-bg text-zinc-950 font-bold shadow-md ring-1 ring-amber-400'
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-800/80 bg-zinc-900/70 border border-white/10'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. TAB PANELS */}
      <div className="flex-1 p-3 sm:p-4 overflow-y-auto max-h-[460px] space-y-4">
        
        {/* TAB 1: COLOUR SELECTION */}
        {activeTab === 'colour' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Select Saree Body & Drape Colour</h3>
                <p className="text-xs text-zinc-400">Choose from approved mill dye lots. Recalculates in real time.</p>
              </div>
              <button
                onClick={() => {
                  const orig = colours.find(c => c.hex_code.toLowerCase() === (selectedProduct.base_colour_hex || '').toLowerCase()) || colours[0];
                  handleSelectColour(orig);
                }}
                className="text-[11px] text-amber-400 hover:underline"
              >
                Reset to Original
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {colours.map((c) => {
                const isSelected = customization.colour?.id === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => handleSelectColour(c)}
                    className={`group relative p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'border-amber-400/80 bg-amber-500/10 shadow-lg shadow-amber-500/10'
                        : 'border-white/10 bg-zinc-900/50 hover:border-white/25 hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full border border-white/40 shadow-inner flex items-center justify-center shrink-0"
                        style={{ backgroundColor: c.hex_code }}
                      >
                        {isSelected && <Check className="w-4 h-4 text-white drop-shadow" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-white truncate">{c.name}</p>
                        <p className="text-[11px] text-zinc-400">
                          {c.surcharge_per_saree > 0 ? formatInr(c.surcharge_per_saree) : 'Included'}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Step Navigation Footer */}
            <div className="pt-3 border-t border-white/10 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveTab('zari')}
                className="px-4 py-2 rounded-xl gold-gradient-bg text-zinc-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition"
              >
                <span>Next: 2. Metallic Zari Specification</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: ZARI YARN SELECTION */}
        {activeTab === 'zari' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Select Metallic Zari Specification</h3>
              <p className="text-xs text-zinc-400">Controls metallic sheen, density, gram consumption & tarnish resistance.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {zariOptions.map((z) => {
                const isSelected = customization.zari && (String(customization.zari.id) === String(z.id) || customization.zari.name === z.name);
                return (
                  <button
                    key={z.id}
                    onClick={() => handleSelectZari(z)}
                    className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                      isSelected
                        ? 'border-amber-400 bg-amber-500/10 shadow-lg shadow-amber-500/10'
                        : 'border-white/10 bg-zinc-900/50 hover:border-white/20 hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1.5">
                      <span className="text-xs font-semibold text-white">{z.name}</span>
                      <span className="text-[11px] font-bold text-amber-400">
                        {z.additional_cost > 0 ? formatInr(z.additional_cost) : 'Base Standard'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-[10px] text-zinc-400">
                      <span className="px-2 py-0.5 rounded bg-zinc-800 border border-white/5">Tone: {z.finish_tone}</span>
                      <span className="px-2 py-0.5 rounded bg-zinc-800 border border-white/5">Grade: {z.grade}</span>
                      <span className="px-2 py-0.5 rounded bg-zinc-800 border border-white/5">{z.consumption_grams}g per saree</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Step Navigation Footer */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveTab('colour')}
                className="px-3.5 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-1 transition active:scale-95"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back: 1. Base Silk Colour</span>
              </button>

              {onOpenCatalog && (
                <button
                  type="button"
                  onClick={onOpenCatalog}
                  className="px-4 py-2 rounded-xl bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 border border-amber-500/40 font-bold text-xs flex items-center gap-1.5 transition active:scale-95"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Browse Master Catalog</span>
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
