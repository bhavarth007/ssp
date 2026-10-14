import React, { useState, useEffect } from 'react';
import { 
  QrCode, 
  Sparkles, 
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
  onOpenQrScanner
}) {
  const [viewMode, setViewMode] = useState('overview'); // 'overview' | 'customize'
  const [quantity, setQuantity] = useState(15);
  
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

  // Initialize customization defaults when product changes
  useEffect(() => {
    if (!selectedProduct) return;

    const defaultColour = colours.find(c => c.hex_code.toLowerCase() === (selectedProduct.base_colour_hex || '').toLowerCase()) || colours[0];
    const defaultZari = zariOptions[0] || null;
    const defaultDesign = designs[0] || null;
    const defaultThread = threads[0] || null;
    const mandatoryProcesses = processes.filter(p => p.is_mandatory);

    setCustomization({
      colour: defaultColour,
      zari: defaultZari,
      design: defaultDesign,
      thread: defaultThread,
      processes: mandatoryProcesses
    });

    setQuantity(selectedProduct.moq || 10);
  }, [selectedProduct, colours, zariOptions, designs, threads, processes]);

  // Recalculate price with backend server whenever customization or quantity changes
  useEffect(() => {
    if (!selectedProduct?.id) return;

    let isMounted = true;
    const fetchCalc = async () => {
      try {
        const payload = {
          productId: selectedProduct.id,
          quantity: quantity,
          colourId: customization.colour?.id,
          zariId: customization.zari?.id,
          designId: customization.design?.id,
          threadId: customization.thread?.id,
          processIds: (customization.processes || []).map(p => p.id),
        };
        const res = await calculatePricing(payload);
        if (isMounted) {
          setPricingCalculation(res);
        }
      } catch (err) {
        console.warn('Calculation error:', err);
      }
    };

    fetchCalc();
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
