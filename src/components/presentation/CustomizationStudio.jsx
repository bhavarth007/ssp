import React, { useState } from 'react';
import { 
  Palette, 
  Sparkles, 
  Grid, 
  Scissors, 
  Check, 
  Info,
  ChevronRight,
  Flame,
  Package
} from 'lucide-react';

export default function CustomizationStudio({
  selectedProduct,
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

  // Process toggle handler
  const handleToggleProcess = (proc) => {
    if (proc.is_mandatory) return; // Cannot toggle mandatory processes
    const current = customization.processes || [];
    const exists = current.some(p => p.id === proc.id);
    if (exists) {
      setCustomization({
        ...customization,
        processes: current.filter(p => p.id !== proc.id)
      });
    } else {
      setCustomization({
        ...customization,
        processes: [...current, proc]
      });
    }
  };

  return (
    <div className="flex flex-col h-full glass-card rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
      {/* Category Tabs */}
      <div className="flex overflow-x-auto p-2 gap-1.5 border-b border-white/10 bg-zinc-950/70 scrollbar-none">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'gold-gradient-bg text-zinc-950 font-semibold shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
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
                  const orig = colours.find(c => c.hex_code.toLowerCase() === selectedProduct.base_colour_hex.toLowerCase()) || colours[0];
                  setCustomization({ ...customization, colour: orig });
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
                    onClick={() => setCustomization({ ...customization, colour: c })}
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
                const isSelected = customization.zari?.id === z.id;
                return (
                  <button
                    key={z.id}
                    onClick={() => setCustomization({ ...customization, zari: z })}
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
                const isSelected = customization.design?.id === d.id;
                return (
                  <button
                    key={d.id}
                    onClick={() => setCustomization({ ...customization, design: d })}
                    className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'border-amber-400 bg-amber-500/10 shadow-lg'
                        : 'border-white/10 bg-zinc-900/50 hover:border-white/20'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-zinc-800/80 border border-white/10 flex items-center justify-center p-2 shrink-0">
                      <img src={d.thumbnail || '/assets/patterns/kalka.svg'} alt={d.name} className="w-full h-full object-contain filter invert opacity-80" />
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
                const isSelected = customization.thread?.id === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setCustomization({ ...customization, thread: t })}
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
                const isSelected = (customization.processes || []).some(x => x.id === p.id);
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
          </div>
        )}

      </div>
    </div>
  );
}
