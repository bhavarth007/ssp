import React, { useState, useRef, useEffect } from 'react';
import { 
  Palette, 
  Sparkles, 
  Grid, 
  Scissors, 
  Check, 
  Info,
  ChevronLeft,
  ChevronRight,
  Flame,
  Package
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
  pricingCalculation
}) {
  const [activeTab, setActiveTab] = useState('colour');

  const tabs = [
    { id: 'colour', label: '1. Base Silk & Reactive Dye', icon: Palette, badge: customization.colour?.name },
    { id: 'zari', label: '2. Metallic Zari Specification', icon: Sparkles, badge: customization.zari?.finish_tone },
    { id: 'design', label: '3. Jacquard Weave Motifs', icon: Grid, badge: customization.design?.name },
    { id: 'thread', label: '4. High-Tenacity Weft Thread', icon: Scissors, badge: customization.thread?.name },
    { id: 'process', label: '5. Diang & Finishing Ops', icon: Package, badge: `${customization.processes?.length || 0} active` },
  ];

  const formatInr = (num) => `+₹${(parseFloat(num) || 0).toFixed(0)}`;

  // Handle color selection: Changes color on the SAME saree without switching product or pattern
  const handleSelectColour = (c) => {
    setCustomization(prev => ({ ...prev, colour: c }));
  };

  const handleSelectZari = (z) => {
    setCustomization(prev => ({ ...prev, zari: z }));
  };

  const handleSelectDesign = (d) => {
    setCustomization(prev => ({ ...prev, design: d }));
  };

  const handleSelectThread = (t) => {
    setCustomization(prev => ({ ...prev, thread: t }));
  };

  // Process toggle handler: robust ID/code matching with live state update
  const handleToggleProcess = (proc) => {
    if (proc.is_mandatory) return; // Cannot toggle mandatory processes
    setCustomization(prev => {
      const current = prev.processes || [];
      const exists = current.some(p => String(p.id) === String(proc.id) || p.process_code === proc.process_code);
      const updated = exists 
        ? current.filter(p => String(p.id) !== String(proc.id) && p.process_code !== proc.process_code)
        : [...current, proc];
      return { ...prev, processes: updated };
    });
  };

  const tabsContainerRef = useRef(null);
  const tabButtonRefs = useRef({});
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftPos, setScrollLeftPos] = useState(0);

  const updateScrollState = () => {
    if (tabsContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsContainerRef.current;
      setCanScrollLeft(scrollLeft > 4);
      setCanScrollRight(scrollWidth > clientWidth + 4 && scrollLeft + clientWidth < scrollWidth - 4);
    }
  };

  useEffect(() => {
    const el = tabsContainerRef.current;
    if (!el) return;

    updateScrollState();

    // Native { passive: false } event listener translates vertical mouse wheel into horizontal scroll
    const onWheel = (e) => {
      if (e.deltaY !== 0 || e.deltaX !== 0) {
        e.preventDefault();
        const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
        el.scrollLeft += delta;
        updateScrollState();
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('resize', updateScrollState);

    let ro;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => updateScrollState());
      ro.observe(el);
    }

    return () => {
      el.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', updateScrollState);
      if (ro) ro.disconnect();
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
    setTimeout(updateScrollState, 150);
  }, [activeTab]);

  const scrollTabs = (direction) => {
    if (tabsContainerRef.current) {
      const amount = direction === 'left' ? -220 : 220;
      tabsContainerRef.current.scrollBy({ left: amount, behavior: 'smooth' });
      setTimeout(updateScrollState, 260);
    }
  };

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
    updateScrollState();
  };

  const tabOrder = ['colour', 'zari', 'design', 'thread', 'process'];
  const currentIndex = tabOrder.indexOf(activeTab);
  const prevTabId = currentIndex > 0 ? tabOrder[currentIndex - 1] : null;
  const nextTabId = currentIndex < tabOrder.length - 1 ? tabOrder[currentIndex + 1] : null;

  const nextTabLabels = {
    zari: '2. Metallic Zari Specification',
    design: '3. Jacquard Weave Motifs',
    thread: '4. High-Tenacity Weft Thread',
    process: '5. Diang & Finishing Ops',
  };

  return (
    <div className="flex flex-col h-full glass-card rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
      {/* Category Tabs Header with Permanent Navigation Arrows, Visible Gold Scrollbar & Smooth Mouse Wheel Scrolling */}
      <div className="relative border-b border-white/10 bg-zinc-950/90 px-2 py-2 flex items-center gap-1.5 shadow-md">
        {/* Scroll Left Button */}
        <button
          type="button"
          onClick={() => scrollTabs('left')}
          disabled={!canScrollLeft}
          className={`p-2 rounded-xl transition shrink-0 ${
            canScrollLeft
              ? 'bg-zinc-800/90 text-amber-300 hover:text-white hover:bg-amber-500/20 active:scale-95 cursor-pointer border border-amber-500/40 shadow-lg'
              : 'text-zinc-600 opacity-40 cursor-not-allowed border border-white/5 bg-zinc-900/40'
          }`}
          title="Scroll tabs left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Scrollable Tabs Track */}
        <div
          ref={tabsContainerRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeaveOrUp}
          onMouseUp={handleMouseLeaveOrUp}
          onMouseMove={handleMouseMove}
          onScroll={updateScrollState}
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#f59e0b #18181b' }}
          className={`flex-1 flex items-center overflow-x-auto p-1 gap-2 scroll-smooth ${
            isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'
          } [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:bg-amber-500/60 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-amber-400 [&::-webkit-scrollbar-track]:bg-white/5`}
        >
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                ref={(el) => (tabButtonRefs.current[t.id] = el)}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
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

        {/* Scroll Right Button */}
        <button
          type="button"
          onClick={() => scrollTabs('right')}
          disabled={!canScrollRight}
          className={`p-2 rounded-xl transition shrink-0 ${
            canScrollRight
              ? 'bg-zinc-800/90 text-amber-300 hover:text-white hover:bg-amber-500/20 active:scale-95 cursor-pointer border border-amber-500/40 shadow-lg'
              : 'text-zinc-600 opacity-40 cursor-not-allowed border border-white/5 bg-zinc-900/40'
          }`}
          title="Scroll tabs right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Tab Panels */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto max-h-[460px] space-y-4">
        
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
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('design')}
                className="px-4 py-2 rounded-xl gold-gradient-bg text-zinc-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition"
              >
                <span>Next: 3. Jacquard Weave Motifs</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: JACQUARD DESIGN SELECTION */}
        {activeTab === 'design' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Select Master Jacquard Pattern & Card</h3>
              <p className="text-xs text-zinc-400">Authentic woven motifs punched on electronic jacquard card systems.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {designs.map((d) => {
                const isSelected = customization.design && (String(customization.design.id) === String(d.id) || customization.design.design_code === d.design_code);
                return (
                  <button
                    key={d.id}
                    onClick={() => handleSelectDesign(d)}
                    className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'border-amber-400 bg-amber-500/10 shadow-lg'
                        : 'border-white/10 bg-zinc-900/50 hover:border-white/20'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-zinc-800/80 border border-white/10 flex items-center justify-center p-2 shrink-0">
                      <img src={getAssetUrl(d.thumbnail || '/assets/patterns/kalka.svg')} alt={d.name} className="w-full h-full object-contain filter invert opacity-80" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-white truncate">{d.name}</p>
                      <p className="text-[11px] text-zinc-400">{d.motif_type}</p>
                      <p className="text-[11px] text-amber-400 font-medium">
                        {d.design_charge > 0 ? formatInr(d.design_charge) : 'Included in Base'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Step Navigation Footer */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveTab('zari')}
                className="px-3.5 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-1 transition active:scale-95"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('thread')}
                className="px-4 py-2 rounded-xl gold-gradient-bg text-zinc-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition"
              >
                <span>Next: 4. High-Tenacity Weft Thread</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: THREAD SELECTION */}
        {activeTab === 'thread' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Select Weft & Accent Thread</h3>
              <p className="text-xs text-zinc-400">Specifies tensile strength, handfeel drape, and accent sheen.</p>
            </div>

            <div className="space-y-2.5">
              {threads.map((t) => {
                const isSelected = customization.thread && (String(customization.thread.id) === String(t.id) || customization.thread.name === t.name);
                return (
                  <button
                    key={t.id}
                    onClick={() => handleSelectThread(t)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'border-amber-400 bg-amber-500/10'
                        : 'border-white/10 bg-zinc-900/50 hover:border-white/20'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-semibold text-white">{t.name}</p>
                      <p className="text-[11px] text-zinc-400">Spec: {t.count_spec} • Consumption: {t.consumption_meters}m</p>
                    </div>
                    <span className="text-xs font-bold text-amber-400">
                      {t.additional_cost > 0 ? formatInr(t.additional_cost) : 'Standard (₹0)'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Step Navigation Footer */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveTab('design')}
                className="px-3.5 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-1 transition active:scale-95"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('process')}
                className="px-4 py-2 rounded-xl gold-gradient-bg text-zinc-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition"
              >
                <span>Next: 5. Diang & Finishing Ops</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 5: DIANG & MANUFACTURING PROCESSES */}
        {activeTab === 'process' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Manufacturing, Diang & Finishing Operations</h3>
                <p className="text-xs text-zinc-400">Toggle optional finishing processes. Mandatory processes cannot be deselected.</p>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-amber-400/90 font-medium px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                🔒 Mill Master Rates
              </span>
            </div>

            <div className="space-y-2.5">
              {processes.map((p) => {
                const isSelected = (customization.processes || []).some(x => String(x.id) === String(p.id) || x.process_code === p.process_code);
                return (
                  <div
                    key={p.id}
                    onClick={() => handleToggleProcess(p)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-emerald-500/60 bg-emerald-500/10 shadow-sm'
                        : 'border-white/10 bg-zinc-900/50 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 w-5 h-5 rounded-lg flex items-center justify-center border ${
                        isSelected ? 'bg-emerald-500 border-emerald-400 text-black' : 'border-zinc-600 bg-zinc-800'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5 font-bold" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-semibold text-white">{p.name}</p>
                          {p.is_mandatory ? (
                            <span className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              Mandatory
                            </span>
                          ) : (
                            <span className="text-[9px] uppercase tracking-wider font-medium px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                              Optional
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-0.5">{p.description}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <span className="text-xs font-bold text-emerald-400">
                        {formatInr(p.rate)}
                      </span>
                      <p className="text-[10px] text-zinc-500">per saree</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Step Navigation Footer */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveTab('thread')}
                className="px-3.5 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-1 transition active:scale-95"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back: 4. Weft Thread</span>
              </button>
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <Check className="w-4 h-4" /> All 5 Categories Customised
              </span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
