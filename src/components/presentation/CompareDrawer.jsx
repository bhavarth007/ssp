import React from 'react';
import { X, Sparkles, Copy, Check, ArrowRight, Layers } from 'lucide-react';

export default function CompareDrawer({
  isOpen,
  onClose,
  product,
  currentCustomization,
  currentCalc,
  altCustomization,
  altCalc,
  onApplyAltConfig,
  onDuplicateToAlt
}) {
  if (!isOpen) return null;

  const formatInr = (val) => `₹${(parseFloat(val) || 0).toLocaleString('en-IN')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl glass-card rounded-3xl border border-white/20 p-6 shadow-2xl bg-zinc-950/95 text-white space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl gold-gradient-bg text-zinc-950 font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-white">Compare Saree Configurations</h3>
              <p className="text-xs text-zinc-400">Present side-by-side design alternatives and price differentials to the client</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2-Column Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* CONFIGURATION A: Current Live Selection */}
          <div className="p-5 rounded-2xl glass-card border border-amber-500/40 bg-zinc-900/60 space-y-4 relative">
            <div className="flex justify-between items-center">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] uppercase font-bold tracking-wider">
                Option A (Current Live Selection)
              </span>
              <button
                onClick={onDuplicateToAlt}
                className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
                title="Copy Option A into Option B as baseline"
              >
                <Copy className="w-3 h-3" />
                Duplicate to B
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-zinc-400">Colour Variant</span>
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <span
                    className="w-3 h-3 rounded-full border border-white/40"
                    style={{ backgroundColor: currentCustomization.colour?.hex_code }}
                  />
                  {currentCustomization.colour?.name}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-zinc-400">Zari Specification</span>
                <span className="font-semibold text-white">{currentCustomization.zari?.name}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-zinc-400">Jacquard Motif</span>
                <span className="font-semibold text-white">{currentCustomization.design?.name}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-zinc-400">Weft Thread Spec</span>
                <span className="font-semibold text-white">{currentCustomization.thread?.name}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-zinc-400">Finishing Operations</span>
                <span className="font-semibold text-emerald-400">
                  {currentCustomization.processes?.length || 0} Processes Active
                </span>
              </div>
            </div>

            {/* Price Box A */}
            <div className="p-3.5 rounded-xl bg-zinc-950 border border-white/10 flex justify-between items-center">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase">Per Saree Rate</span>
                <p className="text-base font-bold text-amber-300">{formatInr(currentCalc?.unitPrice)}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-zinc-400 uppercase">Total ({currentCalc?.quantity} pcs)</span>
                <p className="text-base font-bold text-white">{formatInr(currentCalc?.grandTotal)}</p>
              </div>
            </div>
          </div>

          {/* CONFIGURATION B: Alternative Selection */}
          <div className="p-5 rounded-2xl glass-card border border-white/10 bg-zinc-900/40 space-y-4 relative">
            <div className="flex justify-between items-center">
              <span className="px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-white/10 text-[10px] uppercase font-bold tracking-wider">
                Option B (Alternative Spec)
              </span>
              {altCustomization && (
                <button
                  onClick={onApplyAltConfig}
                  className="px-2.5 py-1 rounded-lg gold-gradient-bg text-zinc-950 text-[10px] font-bold hover:scale-105 active:scale-95 transition"
                >
                  Apply Option B as Active
                </button>
              )}
            </div>

            {altCustomization ? (
              <>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-zinc-400">Colour Variant</span>
                    <span className="font-semibold text-white flex items-center gap-1.5">
                      <span
                        className="w-3 h-3 rounded-full border border-white/40"
                        style={{ backgroundColor: altCustomization.colour?.hex_code }}
                      />
                      {altCustomization.colour?.name}
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-zinc-400">Zari Specification</span>
                    <span className="font-semibold text-white">{altCustomization.zari?.name}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-zinc-400">Jacquard Motif</span>
                    <span className="font-semibold text-white">{altCustomization.design?.name}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-zinc-400">Weft Thread Spec</span>
                    <span className="font-semibold text-white">{altCustomization.thread?.name}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-zinc-400">Finishing Operations</span>
                    <span className="font-semibold text-emerald-400">
                      {altCustomization.processes?.length || 0} Processes Active
                    </span>
                  </div>
                </div>

                {/* Price Box B */}
                <div className="p-3.5 rounded-xl bg-zinc-950 border border-white/10 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-zinc-400 uppercase">Per Saree Rate</span>
                    <p className="text-base font-bold text-amber-300">{formatInr(altCalc?.unitPrice)}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-400 uppercase">Total ({altCalc?.quantity} pcs)</span>
                    <p className="text-base font-bold text-white">{formatInr(altCalc?.grandTotal)}</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-12 text-center space-y-2">
                <p className="text-xs text-zinc-400">No alternative option created yet.</p>
                <button
                  onClick={onDuplicateToAlt}
                  className="px-4 py-2 rounded-xl gold-gradient-bg text-zinc-950 text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition"
                >
                  Clone Option A to Create Option B
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Price Difference Indicator */}
        {altCalc && currentCalc && (
          <div className="p-3 rounded-2xl bg-zinc-900 border border-white/10 text-center text-xs">
            {currentCalc.unitPrice === altCalc.unitPrice ? (
              <span className="text-zinc-300">Both options have identical costing.</span>
            ) : currentCalc.unitPrice > altCalc.unitPrice ? (
              <span className="text-emerald-400">
                Option B is <strong>{formatInr(currentCalc.unitPrice - altCalc.unitPrice)} cheaper per saree</strong> than Option A!
              </span>
            ) : (
              <span className="text-amber-400">
                Option B has a premium surcharge of <strong>{formatInr(altCalc.unitPrice - currentCalc.unitPrice)} per saree</strong> for enhanced specs.
              </span>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
