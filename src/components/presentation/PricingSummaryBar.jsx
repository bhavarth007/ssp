import React, { useState } from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  FileText, 
  Sparkles, 
  Minus, 
  Plus, 
  Percent, 
  ShieldCheck,
  ArrowRight,
  Lock
} from 'lucide-react';

export default function PricingSummaryBar({
  calculation,
  quantity,
  setQuantity,
  onProceedToOrder
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!calculation) return null;

  const formatInr = (val) => `₹${(parseFloat(val) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-2 sm:p-4 pointer-events-none">
      <div className="max-w-5xl mx-auto glass-card rounded-3xl border border-white/20 shadow-2xl backdrop-blur-2xl pointer-events-auto overflow-hidden bg-zinc-950/95 text-white">
        
        {/* Expandable Bill of Materials (BOM) Breakdown */}
        {isExpanded && (
          <div className="p-4 sm:p-6 border-b border-white/10 space-y-3 bg-zinc-900/80 max-h-72 overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Itemized Bill of Materials per Saree (BOM)
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold">
                  <Lock className="w-2.5 h-2.5" /> Authoritative Rates
                </span>
              </div>
              <span className="text-[11px] text-zinc-400">
                Surat Mill Cost Calculation
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-zinc-400">Base Fabric Loom Weaving</span>
                <span className="font-semibold text-white">{formatInr(calculation.breakdown.basePrice)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-zinc-400">Colour Surcharge ({calculation.breakdown.colourName})</span>
                <span className="font-semibold text-amber-300">+{formatInr(calculation.breakdown.colourCost)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-zinc-400">Zari Specification ({calculation.breakdown.zariName})</span>
                <span className="font-semibold text-amber-300">+{formatInr(calculation.breakdown.zariCost)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-zinc-400">Jacquard Design Card ({calculation.breakdown.designName})</span>
                <span className="font-semibold text-amber-300">+{formatInr(calculation.breakdown.designCost)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-zinc-400">Accent Weft Thread ({calculation.breakdown.threadName})</span>
                <span className="font-semibold text-amber-300">+{formatInr(calculation.breakdown.threadCost)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-zinc-400">Manufacturing & Finishing Processes</span>
                <span className="font-semibold text-emerald-400">+{formatInr(calculation.breakdown.manufacturingCost)}</span>
              </div>
            </div>

            {/* Commercial calculations */}
            <div className="pt-2 border-t border-white/10 flex flex-wrap justify-between items-center gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-zinc-400">Subtotal ({calculation.quantity} Sarees):</span>
                <span className="font-bold text-white">{formatInr(calculation.subtotal)}</span>
              </div>
              {calculation.discountAmount > 0 && (
                <div className="flex items-center gap-2 text-emerald-400">
                  <span>Volume Discount ({calculation.discountPercentage}%):</span>
                  <span className="font-bold">- {formatInr(calculation.discountAmount)}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-zinc-400">GST ({calculation.gstRate}% - HSN 5407):</span>
                <span className="font-bold text-amber-300">+{formatInr(calculation.gstAmount)}</span>
              </div>
            </div>

            <div className="pt-1 text-[10px] text-zinc-500 italic">
              Note: Component prices are read-only and governed centrally by Admin Dashboard. Recalculates dynamically with every selection change.
            </div>
          </div>
        )}

        {/* Main Floating Bar */}
        <div className="p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          
          {/* Left: Product & Expand toggle */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 transition active:scale-95"
              title="Toggle Detailed Cost Breakdown"
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white truncate max-w-[160px] sm:max-w-[200px]">
                  {calculation.productName}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-amber-300 border border-amber-500/30 font-mono">
                  {calculation.productCode}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 flex items-center gap-1.5 mt-0.5">
                <span>Unit Rate:</span>
                <strong className="text-amber-300">{formatInr(calculation.unitPrice)}</strong>
                <span className="text-[10px] text-zinc-500">/ saree</span>
              </p>
            </div>
          </div>

          {/* Center: Order Quantity Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-xs text-zinc-400 hidden md:inline">Order Quantity:</span>
            <div className="flex items-center p-1 rounded-xl bg-zinc-900 border border-white/15">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - (quantity > 20 ? 5 : 1)))}
                className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-300 hover:text-white transition"
                title="Decrease Quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-12 text-center text-xs font-bold bg-transparent text-white focus:outline-none"
              />
              <button
                onClick={() => setQuantity(quantity + (quantity >= 20 ? 5 : 1))}
                className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-300 hover:text-white transition"
                title="Increase Quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <span className="text-[11px] text-zinc-400">Sarees</span>
          </div>

          {/* Right: Grand Total & Final Action Button */}
          <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
            <div className="text-right">
              <span className="text-[10px] uppercase tracking-wider text-zinc-400 block">
                Estimated Order Total (incl. GST)
              </span>
              <span className="text-base sm:text-xl font-bold gold-gradient-text tracking-tight font-serif">
                {formatInr(calculation.grandTotal)}
              </span>
            </div>

            <button
              onClick={onProceedToOrder}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl gold-gradient-bg text-zinc-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition"
            >
              <span>GENERATE PURCHASE ORDER (PO)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
