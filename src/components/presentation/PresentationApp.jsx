import React, { useState, useEffect } from 'react';
import { 
  QrCode, 
  Sparkles, 
  Play,
  ChevronLeft, 
  SlidersHorizontal, 
  FileText, 
  Layers, 
  RotateCcw,
  Check,
  Eye,
  ShoppingBag
} from 'lucide-react';
import ProductOverview from './ProductOverview';
import CustomizationStudio from './CustomizationStudio';
import FabricPreviewCanvas from './FabricPreviewCanvas';
import PricingSummaryBar from './PricingSummaryBar';
import CustomerOrderModal from './CustomerOrderModal';
import CompareDrawer from './CompareDrawer';
import { calculatePricing } from '../../utils/api';

export default function PresentationApp({
  products = [],
  selectedProduct,
  setSelectedProduct,
  colours = [],
  zariOptions = [],
  designs = [],
  threads = [],
  processes = [],
  settings,
  onOpenQrScanner,
  onLaunchFullscreenVideo
}) {
  const [viewMode, setViewMode] = useState('overview'); // 'overview' | 'customize'
  const [quantity, setQuantity] = useState(1);
  
  // Customization state
  const [customization, setCustomization] = useState({
    colour: null,
    zari: null,
    design: null,
    thread: null,
    processes: []
  });

  // Alternative configuration for comparison
  const [altCustomization, setAltCustomization] = useState(null);
  const [altCalc, setAltCalc] = useState(null);

  // Live Server-Validated Price Calculation
  const [pricingCalculation, setPricingCalculation] = useState(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  // Initialize customization defaults when product changes, preserving active selections
  useEffect(() => {
    if (!selectedProduct) return;

    const defaultColour = colours.find(c => c.hex_code.toLowerCase() === (selectedProduct.base_colour_hex || '').toLowerCase()) || colours[0];

    setCustomization(prev => ({
      colour: prev.colour && prev.colour.id ? prev.colour : defaultColour,
      zari: prev.zari || zariOptions[0] || null,
      design: prev.design || designs[0] || null,
      thread: prev.thread || threads[0] || null,
      processes: prev.processes && prev.processes.length > 0 ? prev.processes : processes.filter(p => p.is_mandatory)
    }));
  }, [selectedProduct, colours, zariOptions, designs, threads, processes]);

  // Live Instant Pricing Calculation: recalculates immediately with every selection change (live auto count plus & minus)
  useEffect(() => {
    if (!selectedProduct) return;

    const basePrice = Number(selectedProduct.base_price || 950);
    const colourCost = Number(customization.colour?.surcharge_per_saree || 0);
    const zariCost = Number(customization.zari?.additional_cost || 0);
    const designCost = Number(customization.design?.design_charge || 0);
    const threadCost = Number(customization.thread?.additional_cost || 0);
    
    const appliedProcs = customization.processes || [];
    const manufacturingCost = appliedProcs.reduce((sum, p) => sum + Number(p.rate || 0), 0);

    const rawUnit = basePrice + colourCost + zariCost + designCost + threadCost + manufacturingCost;
    // Guaranteed safety ceiling: Unit rate never exceeds 1800
    const unitPrice = Math.min(1550, Number(rawUnit.toFixed(2)));
    const q = Math.max(1, parseInt(quantity, 10) || 1);

    let discountPct = 0;
    if (q >= 250) discountPct = 10.0;
    else if (q >= 100) discountPct = 6.0;
    else if (q >= 50) discountPct = 3.0;

    const discountAmount = Number(((unitPrice * q * discountPct) / 100).toFixed(2));
    const taxableAmount = Number(((unitPrice * q) - discountAmount).toFixed(2));
    const gstRate = 5.0;
    const gstAmount = Number(((taxableAmount * gstRate) / 100).toFixed(2));
    const grandTotal = Number((taxableAmount + gstAmount).toFixed(2));

    const liveCalc = {
      productId: selectedProduct.id,
      productCode: selectedProduct.product_code,
      productName: selectedProduct.name,
      quantity: q,
      moq: selectedProduct.moq || 10,
      leadTimeDays: selectedProduct.lead_time_days || 7,
      breakdown: {
        basePrice,
        colourCost,
        colourName: customization.colour?.name || 'Standard Original',
        colourHex: customization.colour?.hex_code || selectedProduct.base_colour_hex,
        zariCost,
        zariName: customization.zari?.name || 'Surat Tested Gold Zari (Standard)',
        designCost,
        designName: customization.design?.name || 'Jacquard Pattern',
        threadCost,
        threadName: customization.thread?.name || 'Standard Poly Filament Weft Thread',
        manufacturingCost,
        appliedProcesses: appliedProcs
      },
      unitPrice,
      subtotal: Number((unitPrice * q).toFixed(2)),
      discountPercentage: discountPct,
      discountAmount,
      taxableAmount,
      gstRate,
      gstAmount,
      grandTotal
    };

    // 1. Instant synchronous state update for live 0ms responsiveness
    setPricingCalculation(liveCalc);

    // 2. Dispatch to API engine to keep server calculations in sync
    let isMounted = true;
    const syncWithApi = async () => {
      try {
        const payload = {
          productId: selectedProduct.id,
          productCode: selectedProduct.product_code,
          base_price: selectedProduct.base_price,
          quantity: q,
          colourId: customization.colour?.id,
          colour_surcharge: colourCost,
          zariId: customization.zari?.id,
          zari_cost: zariCost,
          designId: customization.design?.id,
          design_charge: designCost,
          threadId: customization.thread?.id,
          thread_cost: threadCost,
          processIds: appliedProcs.map(p => p.id),
        };
        const res = await calculatePricing(payload);
        if (isMounted && res && res.unitPrice) {
          setPricingCalculation(res);
        }
      } catch (err) {
        // Live client calculation is authoritative and active
      }
    };

    syncWithApi();
    return () => { isMounted = false; };
  }, [selectedProduct, customization, quantity]);

  // Handler for duplicating to alternative
  const handleDuplicateToAlt = async () => {
    setAltCustomization({ ...customization });
    try {
      const res = await calculatePricing({
        productId: selectedProduct.id,
        quantity: quantity,
        colourId: customization.colour?.id,
        zariId: customization.zari?.id,
        designId: customization.design?.id,
        threadId: customization.thread?.id,
        processIds: (customization.processes || []).map(p => p.id),
      });
      setAltCalc(res);
    } catch {}
  };

  const handleApplyAlt = () => {
    if (altCustomization) {
      setCustomization({ ...altCustomization });
      setIsCompareOpen(false);
    }
  };

  if (!selectedProduct) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-serif font-bold text-white">No Saree Loaded</h2>
        <p className="text-xs text-zinc-400">Scan a physical saree tag or pick from our master catalog</p>
        <button
          onClick={onOpenQrScanner}
          className="px-6 py-3 rounded-2xl gold-gradient-bg text-zinc-950 font-bold text-xs"
        >
          Scan Saree QR
        </button>
      </div>
    );
  }

  return (
    <div className="pb-32 pt-4 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      
      {/* Top Breadcrumb & Quick Product Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          {viewMode === 'customize' && (
            <button
              onClick={() => setViewMode('overview')}
              className="p-2 rounded-xl glass-card text-zinc-400 hover:text-white border border-white/10 active:scale-95 transition"
              title="Back to Product Showcase"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-serif font-bold text-white tracking-wide">
                {selectedProduct.name}
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                {selectedProduct.product_code}
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              {selectedProduct.collection || 'Sahjanand Exclusive Series'} • Surat Weaving Facility
            </p>
          </div>
        </div>

        {/* Quick Product Switcher Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedProduct.id}
            onChange={(e) => {
              const p = products.find(x => x.id === parseInt(e.target.value, 10));
              if (p) setSelectedProduct(p);
            }}
            className="w-full sm:w-auto px-3 py-1.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400"
          >
            {products.map(p => (
              <option key={p.id} value={p.id}>
                {p.product_code} — {p.name}
              </option>
            ))}
          </select>

          {onLaunchFullscreenVideo && (
            <button
              onClick={() => onLaunchFullscreenVideo(selectedProduct)}
              className="px-3.5 py-2 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 text-xs font-bold flex items-center gap-1.5 shrink-0 transition active:scale-95 shadow-sm"
              title="Watch Fullscreen Model Catwalk"
            >
              <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="hidden sm:inline">Runway Walk</span>
              <span className="sm:hidden">Runway</span>
            </button>
          )}

          {viewMode === 'overview' ? (
            <button
              onClick={() => setViewMode('customize')}
              className="px-4 py-2 rounded-xl gold-gradient-bg text-zinc-950 font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-md active:scale-95 transition"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Customize</span>
            </button>
          ) : (
            <button
              onClick={() => setIsCompareOpen(true)}
              className="px-3 py-1.5 rounded-xl glass-pill text-zinc-300 hover:text-white border border-white/15 text-xs font-semibold flex items-center gap-1.5 shrink-0 transition"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Compare</span>
            </button>
          )}
        </div>
      </div>

      {/* VIEW 1: PRODUCT OVERVIEW & FACTORY VIDEO */}
      {viewMode === 'overview' && (
        <ProductOverview
          product={selectedProduct}
          onStartCustomize={() => setViewMode('customize')}
          onLaunchFullscreenVideo={onLaunchFullscreenVideo}
          onOpenCompare={() => {
            handleDuplicateToAlt();
            setIsCompareOpen(true);
          }}
        />
      )}

      {/* VIEW 2: INTERACTIVE LIVE CUSTOMIZATION STUDIO */}
      {viewMode === 'customize' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Canvas Preview (6 Cols) */}
          <div className="lg:col-span-6 space-y-3">
            <FabricPreviewCanvas
              selectedProduct={selectedProduct}
              customization={customization}
              onReset={() => {
                const orig = colours.find(c => c.hex_code.toLowerCase() === selectedProduct.base_colour_hex.toLowerCase()) || colours[0];
                setCustomization({
                  ...customization,
                  colour: orig,
                  zari: zariOptions[0],
                  design: designs[0],
                  thread: threads[0]
                });
              }}
            />
            <p className="text-[11px] text-center text-zinc-500">
              Pinch or use zoom controls to inspect micro textile warp & weft grain details.
            </p>
          </div>

          {/* Right Customization Controls Wizard (6 Cols) */}
          <div className="lg:col-span-6 space-y-4">
            <CustomizationStudio
              selectedProduct={selectedProduct}
              setSelectedProduct={setSelectedProduct}
              products={products}
              customization={customization}
              setCustomization={setCustomization}
              colours={colours}
              zariOptions={zariOptions}
              designs={designs}
              threads={threads}
              processes={processes}
              pricingCalculation={pricingCalculation}
            />
          </div>

        </div>
      )}

      {/* Persistent Live Pricing Bar */}
      <PricingSummaryBar
        product={selectedProduct}
        calculation={pricingCalculation}
        quantity={quantity}
        setQuantity={setQuantity}
        onProceedToOrder={() => setIsOrderModalOpen(true)}
      />

      {/* Customer Review & Multi-Page PDF / WhatsApp Modal */}
      <CustomerOrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        product={selectedProduct}
        customization={customization}
        calculation={pricingCalculation}
        settings={settings}
      />

      {/* Side-by-side Configuration Comparison Drawer */}
      <CompareDrawer
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        product={selectedProduct}
        currentCustomization={customization}
        currentCalc={pricingCalculation}
        altCustomization={altCustomization}
        altCalc={altCalc}
        onApplyAltConfig={handleApplyAlt}
        onDuplicateToAlt={handleDuplicateToAlt}
      />

    </div>
  );
}
