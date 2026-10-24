import React, { useState } from 'react';
import { 
  X, 
  Search, 
  Sparkles, 
  SlidersHorizontal, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  Play,
  Eye,
  Filter
} from 'lucide-react';
import { getAssetUrl } from '../../utils/assetHelper';

export default function CatalogModal({
  isOpen,
  onClose,
  products = [],
  selectedProduct,
  onSelectProduct,
  onCustomizeProduct,
  brandName = ''
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  if (!isOpen) return null;

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];

  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.product_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.collection?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.base_fabric_type?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const formatInr = (val) => `₹${(parseFloat(val) || 0).toLocaleString('en-IN')}`;

  return (
    <div className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-6xl max-h-[92vh] bg-zinc-950 border border-white/15 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/60">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold tracking-wider uppercase">
                Master Surat Loom Catalog
              </span>
              {brandName && (
                <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-zinc-300 border border-white/15 text-[11px] font-medium flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Branded for: <strong className="text-white font-semibold">{brandName}</strong>
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-white mt-1">
              Sahjanand Saree Catalog & Weaving Portfolio
            </h2>
            <p className="text-xs text-zinc-400">
              Select any master saree to preview 4K runway walks, inspect weave specifications, or launch the live dye & zari customization studio.
            </p>
          </div>

          <button
            onClick={onClose}
            className="self-end sm:self-auto p-2.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-white/10 transition active:scale-95"
            title="Close Catalog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="px-4 sm:px-6 py-3 border-b border-white/10 bg-zinc-950/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by SKU, design or weave..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition"
            />
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'gold-gradient-bg text-zinc-950 font-bold shadow-md'
                    : 'text-zinc-400 hover:text-white bg-zinc-900 border border-white/10'
                }`}
              >
                {cat === 'all' ? 'All Sarees' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Catalog Grid View */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProducts.map((p) => {
              const isSelected = selectedProduct?.id === p.id;
              return (
                <div
                  key={p.id}
                  className={`group relative rounded-2xl border overflow-hidden flex flex-col transition-all duration-300 ${
                    isSelected
                      ? 'border-amber-400/90 bg-amber-500/5 shadow-xl shadow-amber-500/10'
                      : 'border-white/10 bg-zinc-900/60 hover:border-white/25 hover:bg-zinc-900'
                  }`}
                >
                  {/* Image Stage with Brand Watermark */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-black">
                    <img
                      src={getAssetUrl(p.hero_image || '/assets/products/model-crimson-runway.jpg')}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 select-none"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                    {/* Saree Code Badge */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between pointer-events-none">
                      <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {p.product_code}
                        </span>
                        <p className="text-[11px] text-zinc-300 font-medium mt-1 drop-shadow">
                          {p.collection || 'Sahjanand Exclusive Series'}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-400 block">Base Rate</span>
                        <span className="text-base font-bold gold-gradient-text font-serif">
                          {formatInr(p.base_price)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="text-sm font-serif font-bold text-white group-hover:text-amber-300 transition line-clamp-1">
                        {p.name}
                      </h3>
                      <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                        {p.pattern_description || p.notes}
                      </p>
                    </div>

                    {/* Quick Specs Chips */}
                    <div className="grid grid-cols-3 gap-1.5 text-[10px] text-zinc-300 pt-2 border-t border-white/5">
                      <div className="p-1.5 rounded-lg bg-zinc-950 border border-white/5 text-center">
                        <span className="text-zinc-500 block">MOQ</span>
                        <span className="font-semibold text-white">{p.moq || 10} pcs</span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-zinc-950 border border-white/5 text-center">
                        <span className="text-zinc-500 block">Lead Time</span>
                        <span className="font-semibold text-amber-300">{p.lead_time_days || 10} days</span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-zinc-950 border border-white/5 text-center">
                        <span className="text-zinc-500 block">Weight</span>
                        <span className="font-semibold text-white">{p.gsm || 185} GSM</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <button
                        onClick={() => {
                          onSelectProduct(p);
                          onClose();
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-white/10 text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-95"
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-400" />
                        <span>Present</span>
                      </button>

                      <button
                        onClick={() => {
                          onCustomizeProduct(p);
                          onClose();
                        }}
                        className="w-full py-2 px-3 rounded-xl gold-gradient-bg text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/10 hover:brightness-110 transition active:scale-95"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        <span>Customize</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-16 text-zinc-400 space-y-2">
              <Search className="w-8 h-8 mx-auto text-zinc-600" />
              <p className="text-sm font-medium">No matching sarees found</p>
              <p className="text-xs text-zinc-500">Try modifying your search term or clear the category filter.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-zinc-900/50 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-400 gap-2">
          <span>Showing {filteredProducts.length} of {products.length} master Surat loom designs</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium transition active:scale-95"
          >
            Close Catalog
          </button>
        </div>

      </div>
    </div>
  );
}
