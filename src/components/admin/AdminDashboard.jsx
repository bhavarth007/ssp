import React, { useState, useEffect } from 'react';
import { 
  Package, 
  DollarSign, 
  QrCode, 
  FileText, 
  Settings, 
  Plus, 
  Trash2, 
  Edit, 
  Upload, 
  Download, 
  CheckCircle, 
  Search,
  Building,
  Sparkles,
  ExternalLink,
  Printer,
  RefreshCw,
  Eye,
  Lock,
  Check,
  X,
  Share2,
  Calendar,
  Phone,
  MessageSquare,
  MapPin,
  Clock,
  Layers,
  ChevronRight,
  ShieldCheck,
  Copy,
  Globe
} from 'lucide-react';
import { 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  updateSettings,
  updateOrderStatus,
  deleteOrder,
  uploadMedia,
  createColour,
  updateColour,
  deleteColour,
  createZari,
  updateZari,
  deleteZari,
  createDesign,
  updateDesign,
  deleteDesign,
  createThread,
  updateThread,
  deleteThread,
  createProcess,
  updateProcess,
  deleteProcess,
  getQrDataUrl,
  getNetworkInfo,
  synthesizeCatwalkVideo
} from '../../utils/api';
import { generateOrderPdf } from '../../utils/pdfGenerator';
import { getAssetUrl } from '../../utils/assetHelper';
import { shareToWhatsApp } from '../../utils/whatsapp';

export default function AdminDashboard({
  products = [],
  orders = [],
  colours = [],
  zariOptions = [],
  designs = [],
  threads = [],
  processes = [],
  settings,
  onRefreshData,
  onSelectProductForPresentation
}) {
  const [activeTab, setActiveTab] = useState('products'); // 'products', 'costing', 'orders', 'qr', 'settings'
  const [orderFilter, setOrderFilter] = useState('ALL'); // 'ALL', 'PURCHASE_ORDER', 'QUOTATION', 'CONFIRMED', 'PRODUCTION'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Product Edit / Create Modal State
  const [editingProduct, setEditingProduct] = useState(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoGenStatus, setVideoGenStatus] = useState('');

  // Quick AI Catwalk Creator state
  const [quickName, setQuickName] = useState('');
  const [quickCode, setQuickCode] = useState('');
  const [quickPrice, setQuickPrice] = useState('2950');
  const [quickFabric, setQuickFabric] = useState('Pure Poly-Silk Filament x Zari');
  const [quickFile, setQuickFile] = useState(null);
  const [isQuickUploading, setIsQuickUploading] = useState(false);
  const [quickSuccessMsg, setQuickSuccessMsg] = useState('');

  // Costing Component Edit Modals
  const [costingModalType, setCostingModalType] = useState(null); // 'colour' | 'zari' | 'design' | 'thread' | 'process'
  const [editingCostItem, setEditingCostItem] = useState(null);

  // Settings Form State
  const [companyForm, setCompanyForm] = useState(settings || {});

  // Selected Order for Full Details Drawer
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

  // QR Print State
  const [selectedQrProduct, setSelectedQrProduct] = useState(null);
  const [qrPreviewUrl, setQrPreviewUrl] = useState(null);

  // Indian Rupees formatter
  const formatInr = (val) => `₹${(parseFloat(val) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatInrShort = (val) => `₹${(parseFloat(val) || 0).toLocaleString('en-IN')}`;

  // ==========================================
  // PRODUCT HANDLERS
  // ==========================================
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const sanitized = {
        ...editingProduct,
        base_price: parseFloat(editingProduct.base_price) || 0,
        moq: Math.max(1, parseInt(editingProduct.moq, 10) || 1),
        lead_time_days: Math.max(1, parseInt(editingProduct.lead_time_days, 10) || 1),
      };
      if (sanitized.id) {
        await updateProduct(sanitized.id, sanitized);
      } else {
        await createProduct(sanitized);
      }
      setIsProductModalOpen(false);
      setEditingProduct(null);
      onRefreshData();
    } catch (err) {
      alert(`Error saving product: ${err.message}`);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this saree product record?')) return;
    try {
      await deleteProduct(id);
      onRefreshData();
    } catch (err) {
      alert(`Error deleting: ${err.message}`);
    }
  };

  const handleFileUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const res = await uploadMedia(file);
      setEditingProduct({
        ...editingProduct,
        [field]: res.url || res.file_url
      });
    } catch (err) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // ==========================================
  // COSTING COMPONENT HANDLERS
  // ==========================================
  const handleSaveCostItem = async (e) => {
    e.preventDefault();
    try {
      const sanitized = { ...editingCostItem };
      if (costingModalType === 'colour') {
        sanitized.surcharge_per_saree = parseFloat(sanitized.surcharge_per_saree) || 0;
        if (sanitized.id) await updateColour(sanitized.id, sanitized);
        else await createColour(sanitized);
      } else if (costingModalType === 'zari') {
        sanitized.consumption_grams = parseFloat(sanitized.consumption_grams) || 180;
        sanitized.additional_cost = parseFloat(sanitized.additional_cost) || 0;
        if (sanitized.id) await updateZari(sanitized.id, sanitized);
        else await createZari(sanitized);
      } else if (costingModalType === 'design') {
        sanitized.design_charge = parseFloat(sanitized.design_charge) || 0;
        if (sanitized.id) await updateDesign(sanitized.id, sanitized);
        else await createDesign(sanitized);
      } else if (costingModalType === 'thread') {
        sanitized.consumption_meters = parseFloat(sanitized.consumption_meters) || 400;
        sanitized.additional_cost = parseFloat(sanitized.additional_cost) || 0;
        if (sanitized.id) await updateThread(sanitized.id, sanitized);
        else await createThread(sanitized);
      } else if (costingModalType === 'process') {
        sanitized.rate = parseFloat(sanitized.rate) || 0;
        sanitized.is_mandatory = sanitized.is_mandatory ? 1 : 0;
        if (sanitized.id) await updateProcess(sanitized.id, sanitized);
        else await createProcess(sanitized);
      }
      setCostingModalType(null);
      setEditingCostItem(null);
      onRefreshData();
    } catch (err) {
      alert(`Error saving cost parameter: ${err.message}`);
    }
  };

  const handleDeleteCostItem = async (type, id) => {
    if (!window.confirm(`Are you sure you want to remove this ${type} option?`)) return;
    try {
      if (type === 'colour') await deleteColour(id);
      else if (type === 'zari') await deleteZari(id);
      else if (type === 'design') await deleteDesign(id);
      else if (type === 'thread') await deleteThread(id);
      else if (type === 'process') await deleteProcess(id);
      onRefreshData();
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  // ==========================================
  // ORDER CRM HANDLERS
  // ==========================================
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      onRefreshData();
      if (selectedOrderDetails && selectedOrderDetails.id === orderId) {
        setSelectedOrderDetails({ ...selectedOrderDetails, status: newStatus });
      }
    } catch (err) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  const handleDownloadOrderPdf = async (order) => {
    try {
      let qrDataUrl = null;
      try {
        const orderQrUrl = `https://bhavarth007.github.io/ssp/?sku=${encodeURIComponent(order.product_code || '')}`;
        const qrRes = await getQrDataUrl(orderQrUrl);
        qrDataUrl = qrRes.qrDataUrl;
      } catch {}
      const doc = await generateOrderPdf({ order, settings, qrDataUrl });
      doc.save(`${order.order_number}_Sahjanand.pdf`);
    } catch (err) {
      alert(`PDF generation failed: ${err.message}`);
    }
  };

  const handleShareOrderWhatsApp = async (order) => {
    try {
      let qrDataUrl = null;
      try {
        const orderQrUrl = `https://bhavarth007.github.io/ssp/?sku=${encodeURIComponent(order.product_code || '')}`;
        const qrRes = await getQrDataUrl(orderQrUrl);
        qrDataUrl = qrRes.qrDataUrl;
      } catch {}
      const doc = await generateOrderPdf({ order, settings, qrDataUrl });
      const blob = doc.output('blob');
      await shareToWhatsApp({
        order,
        settings,
        pdfBlob: blob,
        pdfFileName: `${order.order_number}_Sahjanand.pdf`
      });
    } catch (err) {
      alert(`WhatsApp sharing failed: ${err.message}`);
    }
  };

  // ==========================================
  // AUTONOMOUS AI CATWALK VIDEO BOT HANDLERS
  // ==========================================
  const handleGenerateCatwalkVideoForProduct = async () => {
    if (!editingProduct) return;
    try {
      setIsGeneratingVideo(true);
      setVideoGenStatus('AI Bot analyzing weave & synthesizing 4K catwalk video...');
      
      const res = await synthesizeCatwalkVideo({
        productId: editingProduct.id,
        productCode: editingProduct.product_code,
        imagePath: editingProduct.hero_image
      });

      if (res && res.videoUrl) {
        setEditingProduct({
          ...editingProduct,
          demo_video_url: res.videoUrl
        });
        setVideoGenStatus('✓ 4K Catwalk Video Synthesized & Linked to Saree!');
      }
    } catch (err) {
      setVideoGenStatus(`Error: ${err.message}`);
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const handleQuickSynthesize = async (e) => {
    e.preventDefault();
    if (!quickName.trim()) {
      alert('Please enter the Saree Name');
      return;
    }
    try {
      setIsQuickUploading(true);
      setQuickSuccessMsg('1. Uploading Master Saree Artwork...');

      let uploadedUrl = '/assets/products/model-crimson-runway.jpg';
      if (quickFile) {
        const upRes = await uploadMedia(quickFile);
        uploadedUrl = upRes.url;
      }

      setQuickSuccessMsg('2. Creating Saree Product Master Record...');
      const code = quickCode.trim() || `SP-AUTO-${Date.now().toString().slice(-4)}`;
      const newProduct = {
        product_code: code,
        name: quickName.trim(),
        category: 'Bridal & Festive',
        collection: 'Haute Couture Series',
        fabric_composition: quickFabric,
        base_fabric_type: 'Jacquard Poly-Silk',
        gsm: 185,
        fabric_width: '44 inches',
        saree_length: '6.30 meters',
        base_colour: 'Festive Jewel Tone',
        base_colour_hex: '#7B1113',
        pattern_description: 'High-fashion runway showcase with rich zari motifs',
        border_type: 'Contrast Zari Border',
        pallu_design: 'Heavy Jacquard Pallu',
        weave_type: 'Electronic Jacquard Loom',
        base_price: parseFloat(quickPrice) || 2950,
        moq: 10,
        lead_time_days: 10,
        status: 'active',
        hero_image: uploadedUrl,
        demo_video_url: '/assets/videos/saree-crimson-runway-walk.mp4'
      };

      const saved = await createProduct(newProduct);

      setQuickSuccessMsg('3. AI Bot Synthesizing 4K Model Catwalk Walk Video...');
      const videoRes = await synthesizeCatwalkVideo({
        productId: saved.id,
        productCode: code,
        imagePath: uploadedUrl
      });

      setQuickSuccessMsg(`✓ Saree "${quickName}" created! 4K Catwalk Video Synthesized & Linked!`);
      if (onRefreshData) onRefreshData();

      setQuickName('');
      setQuickCode('');
      setQuickFile(null);
    } catch (err) {
      alert('AI Bot error: ' + err.message);
    } finally {
      setIsQuickUploading(false);
    }
  };

  // ==========================================
  // SETTINGS & QR HANDLERS
  // ==========================================
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      const sanitized = {
        ...companyForm,
        default_gst_rate: parseFloat(companyForm.default_gst_rate) || 5.0
      };
      await updateSettings(sanitized);
      alert('Company settings and tax configuration updated successfully!');
      onRefreshData();
    } catch (err) {
      alert(`Error updating settings: ${err.message}`);
    }
  };

  const handleViewQr = async (product) => {
    setSelectedQrProduct(product);
    try {
      const code = encodeURIComponent(product.product_code);
      const directUrl = `https://bhavarth007.github.io/ssp/?sku=${code}`;
      const res = await getQrDataUrl(directUrl, 400);
      setQrPreviewUrl(res.qrDataUrl);
    } catch (err) {
      alert('Failed to generate QR: ' + err.message);
    }
  };

  // Filter Orders for Confirmed PO Division
  const filteredOrders = orders.filter(o => {
    if (orderFilter === 'PURCHASE_ORDER') return o.doc_type === 'PURCHASE_ORDER';
    if (orderFilter === 'QUOTATION') return o.doc_type === 'QUOTATION';
    if (orderFilter === 'CONFIRMED') return o.status === 'Confirmed';
    if (orderFilter === 'PRODUCTION') return o.status === 'In Production' || o.status === 'Ready for Dispatch';
    return true;
  }).filter(o => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (o.order_number || '').toLowerCase().includes(q) ||
      (o.buyer_company_name || '').toLowerCase().includes(q) ||
      (o.buyer_contact_person || '').toLowerCase().includes(q) ||
      (o.product_name || '').toLowerCase().includes(q)
    );
  });

  const confirmedPosCount = orders.filter(o => o.doc_type === 'PURCHASE_ORDER').length;
  const totalRevenue = orders.reduce((sum, o) => sum + (parseFloat(o.grand_total) || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Header & Quick Security Badge */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-wide">
              Admin & Product Management Dashboard
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              Surat Master Authority
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1.5 flex items-center gap-2">
            <span>Authoritative pricing engine, technical textile libraries & confirmed purchase order records.</span>
            <span className="inline-flex items-center gap-1 text-amber-400 font-semibold text-[11px]">
              <Lock className="w-3 h-3" /> Presentation prices are locked & governed strictly here.
            </span>
          </p>
        </div>

        {/* Global Action */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditingProduct({
                product_code: `SP-NEW-${Math.floor(100 + Math.random() * 900)}`,
                name: '',
                category: 'Brocade Jacquard',
                collection: 'Surat Heritage 2026',
                fabric_composition: 'Pure Poly-Silk Filament Warp x Art Silk Weft (120D/75D)',
                base_fabric_type: 'Heavy Jacquard Satin Brocade Weave',
                gsm: 185,
                fabric_width: '44 inches (112 cm)',
                saree_length: '6.30 meters (includes 80cm blouse)',
                base_colour: 'Deep Crimson Maroon',
                base_colour_hex: '#7B1113',
                base_price: 2500,
                moq: 10,
                lead_time_days: 10,
                status: 'active',
                demo_video_url: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-woman-adjusting-her-indian-dress-41865-large.mp4',
                hero_image: '/assets/products/banarasi-maroon.jpg'
              });
              setIsProductModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl gold-gradient-bg text-zinc-950 font-bold text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Saree Product</span>
          </button>
        </div>
      </div>



      {/* iPhone Glassmorphic Metrics Widgets */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-3xl glass-card border border-white/10 shadow-lg">
          <p className="text-[11px] text-zinc-400 font-medium">Saree Catalog Master</p>
          <p className="text-2xl font-serif font-bold text-white mt-1">{products.length} Products</p>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1">
            <CheckCircle className="w-3 h-3" /> Live in Presentation
          </span>
        </div>

        <div className="p-4 rounded-3xl glass-card border border-white/10 shadow-lg">
          <p className="text-[11px] text-zinc-400 font-medium">Confirmed Client POs</p>
          <p className="text-2xl font-serif font-bold text-amber-300 mt-1">{confirmedPosCount} Confirmed</p>
          <span className="text-[10px] text-zinc-400 mt-1 block">Total Orders: {orders.length}</span>
        </div>

        <div className="p-4 rounded-3xl glass-card border border-white/10 shadow-lg">
          <p className="text-[11px] text-zinc-400 font-medium">Recorded Commercial Value</p>
          <p className="text-xl sm:text-2xl font-serif font-bold gold-gradient-text mt-1">{formatInrShort(totalRevenue)}</p>
          <span className="text-[10px] text-zinc-400 mt-1 block">Pure Indian Rupees (INR)</span>
        </div>

        <div className="p-4 rounded-3xl glass-card border border-white/10 shadow-lg">
          <p className="text-[11px] text-zinc-400 font-medium">Costing Libraries Master</p>
          <p className="text-2xl font-serif font-bold text-emerald-400 mt-1">
            {colours.length + zariOptions.length + designs.length + threads.length + processes.length}
          </p>
          <span className="text-[10px] text-zinc-400 mt-1 block">Central Rates Locked</span>
        </div>
      </div>

      {/* Apple Segmented Control Tab Switcher */}
      <div className="flex overflow-x-auto p-1.5 rounded-2xl bg-zinc-900/90 border border-white/10 shadow-inner scrollbar-none gap-1">
        {[
          { id: 'products', label: 'Products Master', icon: Package },
          { id: 'ai_studio', label: '⚡ Gemini AI Runway Bot', icon: Sparkles, badge: '5 Models 4K' },
          { id: 'costing', label: 'Costing & Libraries (Change Rates)', icon: DollarSign },
          { id: 'orders', label: 'Confirmed POs & Client Records', icon: FileText, badge: `${orders.length}` },
          { id: 'qr', label: 'QR Tag Studio', icon: QrCode },
          { id: 'settings', label: 'Company & Tax Settings', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'gold-gradient-bg text-zinc-950 font-bold shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isActive ? 'bg-zinc-950 text-amber-300' : 'bg-zinc-800 text-zinc-300'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* DIVISION 1: PRODUCTS MASTER */}
      {/* ======================================================== */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-serif font-bold text-white">Saree Product Catalog Master</h3>
              <p className="text-xs text-zinc-400">Manage real photos, loom videos, GSM, length, width, and starting base rates in Indian Rupees (₹).</p>
            </div>
            <span className="text-xs text-amber-400 font-mono">
              {products.length} Active SKUs
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map((p) => (
              <div key={p.id} className="glass-card rounded-3xl border border-white/10 overflow-hidden shadow-xl flex flex-col justify-between group hover:border-amber-500/30 transition-all">
                <div>
                  <div className="relative aspect-[16/10] bg-zinc-950 overflow-hidden">
                    <img src={p.hero_image || '/assets/products/banarasi-maroon.svg'} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-black/75 backdrop-blur-md text-[10px] font-bold text-amber-300 border border-amber-500/30">
                        {p.product_code}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-lg bg-black/75 backdrop-blur-md text-[10px] font-semibold text-white">
                        {p.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <h4 className="text-sm font-bold text-white line-clamp-1">{p.name}</h4>
                    <p className="text-xs text-zinc-400 line-clamp-2">{p.fabric_composition}</p>
                    
                    <div className="pt-2 flex justify-between items-center text-xs border-t border-white/5">
                      <div>
                        <span className="text-zinc-500 text-[10px] block">Base Rate</span>
                        <span className="font-bold text-amber-300">{formatInr(p.base_price)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-zinc-500 text-[10px] block">MOQ / Lead Time</span>
                        <span className="text-white font-medium">{p.moq} pcs • {p.lead_time_days} days</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-zinc-950/60 border-t border-white/10 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onSelectProductForPresentation(p)}
                    className="flex-1 py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold flex items-center justify-center gap-1.5 transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Launch Presentation View</span>
                  </button>

                  <button
                    onClick={() => {
                      setEditingProduct(p);
                      setIsProductModalOpen(true);
                    }}
                    className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                    title="Edit Specifications & Video"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteProduct(p.id)}
                    className="p-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition"
                    title="Delete Product"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DIVISION 2: COSTING & CUSTOMIZATION LIBRARIES */}
      {/* ======================================================== */}
      {activeTab === 'costing' && (
        <div className="space-y-8">
          
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                Central Pricing Authority & Security Guarantee
              </h4>
              <p className="text-xs text-zinc-300 mt-0.5">
                Sales reps or clients on the presentation side <strong>CANNOT modify these unit rates</strong>. Any change you save below updates the database instantly and recalculates presentation BOMs and order totals in real time in Indian Rupees (₹).
              </p>
            </div>
          </div>

          {/* 1. Colours Library */}
          <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  1. Saree Dye Lot Colours & Surcharges (₹)
                </h3>
                <p className="text-xs text-zinc-400">Configure factory dye lot surcharge per saree</p>
              </div>
              <button
                onClick={() => {
                  setCostingModalType('colour');
                  setEditingCostItem({ name: '', hex_code: '#8B0000', surcharge_per_saree: 0 });
                }}
                className="px-3 py-1.5 rounded-xl gold-gradient-bg text-zinc-950 text-xs font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Colour
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {colours.map(c => (
                <div key={c.id} className="p-3.5 rounded-2xl bg-zinc-900/60 border border-white/10 flex items-center justify-between group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-full border border-white/40 shadow shrink-0" style={{ backgroundColor: c.hex_code }} />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{c.name}</p>
                      <p className="text-[11px] text-amber-300 font-medium">+{formatInr(c.surcharge_per_saree)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setCostingModalType('colour');
                        setEditingCostItem(c);
                      }}
                      className="p-1 rounded-lg text-zinc-400 hover:text-white"
                      title="Edit Colour Rate"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCostItem('colour', c.id)}
                      className="p-1 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      title="Remove Colour"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Zari Options Master */}
          <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  2. Zari Yarn Specifications & Cost Differentials (₹)
                </h3>
                <p className="text-xs text-zinc-400">Surat tested vs pure antique zari rates, gram consumption, and thickness</p>
              </div>
              <button
                onClick={() => {
                  setCostingModalType('zari');
                  setEditingCostItem({ name: '', grade: 'Surat Grade A', finish_tone: 'Gold', thickness_count: '120D', consumption_grams: 180, additional_cost: 0 });
                }}
                className="px-3 py-1.5 rounded-xl gold-gradient-bg text-zinc-950 text-xs font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Zari Spec
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {zariOptions.map(z => (
                <div key={z.id} className="p-4 rounded-2xl bg-zinc-900/60 border border-white/10 space-y-2">
                  <div className="flex justify-between items-start">
                    <h4 className="text-xs font-bold text-white">{z.name}</h4>
                    <span className="text-xs font-bold text-amber-300">+{formatInr(z.additional_cost)}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Tone: {z.finish_tone} • Spec: {z.thickness_count} • {z.consumption_grams}g per saree
                  </p>
                  <div className="flex justify-end items-center gap-3 pt-1">
                    <button
                      onClick={() => {
                        setCostingModalType('zari');
                        setEditingCostItem(z);
                      }}
                      className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
                    >
                      <Edit className="w-3 h-3" /> Edit Cost
                    </button>
                    <button
                      onClick={() => handleDeleteCostItem('zari', z.id)}
                      className="text-[11px] text-red-400 hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Jacquard Designs */}
          <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  3. Jacquard Design Cards & Pattern Charges (₹)
                </h3>
                <p className="text-xs text-zinc-400">Electronic jacquard punch card pattern charges</p>
              </div>
              <button
                onClick={() => {
                  setCostingModalType('design');
                  setEditingCostItem({ design_code: `DSG-${Date.now().toString().slice(-4)}`, name: '', motif_type: 'Floral Jaal', design_charge: 0 });
                }}
                className="px-3 py-1.5 rounded-xl gold-gradient-bg text-zinc-950 text-xs font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Design Card
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {designs.map(d => (
                <div key={d.id} className="p-3.5 rounded-2xl bg-zinc-900/60 border border-white/10 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-white">{d.name}</h4>
                      <span className="text-[10px] font-mono text-amber-300">({d.design_code})</span>
                    </div>
                    <p className="text-[11px] text-zinc-400">{d.motif_type}</p>
                    <p className="text-xs font-bold text-amber-300 mt-0.5">+{formatInr(d.design_charge)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setCostingModalType('design');
                        setEditingCostItem(d);
                      }}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-white"
                      title="Edit Design Card"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCostItem('design', d.id)}
                      className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      title="Remove Design Card"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Manufacturing & Diang Finishing Processes */}
          <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  4. Manufacturing, Diang & Finishing Operations (₹)
                </h3>
                <p className="text-xs text-zinc-400">Configure rates for Diang calendering, clip-cutting, pallu tassels, and packaging.</p>
              </div>
              <button
                onClick={() => {
                  setCostingModalType('process');
                  setEditingCostItem({ process_code: `PROC-${Date.now().toString().slice(-4)}`, name: '', description: '', rate: 0, is_mandatory: 0 });
                }}
                className="px-3 py-1.5 rounded-xl gold-gradient-bg text-zinc-950 text-xs font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Operation
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {processes.map(p => (
                <div key={p.id} className="p-4 rounded-2xl bg-zinc-900/60 border border-white/10 flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-white">{p.name}</h4>
                      {p.is_mandatory ? (
                        <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          Mandatory
                        </span>
                      ) : (
                        <span className="text-[9px] uppercase font-semibold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                          Optional
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1">{p.description}</p>
                    <p className="text-xs font-bold text-emerald-400 mt-1">{formatInr(p.rate)} per saree</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setCostingModalType('process');
                        setEditingCostItem(p);
                      }}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-white"
                      title="Edit Operation"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    {!p.is_mandatory && (
                      <button
                        onClick={() => handleDeleteCostItem('process', p.id)}
                        className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        title="Remove Operation"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* DIVISION 3: CONFIRMED POs & CLIENT ORDER REPOSITORY */}
      {/* ======================================================== */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          
          {/* Division Header & Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                <span>Confirmed Purchase Orders & Client Repository</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-sans">
                  {confirmedPosCount} Confirmed
                </span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Permanent records with immutable snapshots, buyer details, itemized cost breakdowns, and stamped PDF copies.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="/api/export/backup"
                download
                className="px-3.5 py-2 rounded-xl glass-pill text-xs font-bold text-amber-300 border border-amber-500/30 hover:bg-amber-500/10 flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export All (JSON)</span>
              </a>
            </div>
          </div>

          {/* Filter Bar & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-2 rounded-2xl glass-card border border-white/10">
            {/* Filter Pills */}
            <div className="flex overflow-x-auto gap-1 w-full sm:w-auto">
              {[
                { id: 'ALL', label: `All (${orders.length})` },
                { id: 'PURCHASE_ORDER', label: `Confirmed POs (${confirmedPosCount})` },
                { id: 'QUOTATION', label: `Quotations (${orders.length - confirmedPosCount})` },
                { id: 'CONFIRMED', label: 'Confirmed Status' },
                { id: 'PRODUCTION', label: 'In Production / Ready' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setOrderFilter(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                    orderFilter === f.id
                      ? 'gold-gradient-bg text-zinc-950 font-bold shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search Buyer or PO #..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Orders Table / Cards */}
          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center glass-card rounded-3xl border border-white/10 text-zinc-400 space-y-2">
              <FileText className="w-10 h-10 mx-auto text-zinc-600" />
              <p className="text-sm font-semibold text-white">No Matching Orders Found</p>
              <p className="text-xs">Use the Live Client Presentation Studio to customize a saree and generate a new confirmed PO!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map(o => {
                const isPo = o.doc_type === 'PURCHASE_ORDER';
                return (
                  <div
                    key={o.id}
                    className={`glass-card rounded-2xl p-4 sm:p-5 border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                      isPo ? 'border-amber-500/30 hover:border-amber-500/50 bg-zinc-900/60' : 'border-white/10 bg-zinc-900/40'
                    }`}
                  >
                    {/* Left: Metadata & Client */}
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-amber-300">
                          {o.order_number}
                        </span>
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md ${
                          isPo ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}>
                          {isPo ? 'CONFIRMED PO' : 'SALES QUOTATION'}
                        </span>
                        <span className="text-[11px] text-zinc-400">
                          {new Date(o.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-white truncate">{o.buyer_company_name}</p>
                        {o.buyer_gstin && (
                          <span className="text-[10px] text-zinc-400 font-mono">
                            GSTIN: {o.buyer_gstin}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-zinc-300">
                        Product: <strong className="text-white">{o.product_name}</strong> • 
                        Quantity: <strong className="text-amber-300">{o.quantity} Sarees</strong> @ {formatInr(o.unit_price)}
                      </p>
                    </div>

                    {/* Financial Grand Total */}
                    <div className="text-left md:text-right shrink-0">
                      <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">
                        Grand Total (incl. 5% GST)
                      </span>
                      <span className="text-lg font-bold gold-gradient-text">
                        {formatInr(o.grand_total)}
                      </span>
                    </div>

                    {/* Status Changer & Quick Actions */}
                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                      {/* Lifecycle Status Dropdown */}
                      <select
                        value={o.status}
                        onChange={(e) => handleStatusChange(o.id, e.target.value)}
                        className="px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400 font-medium"
                      >
                        <option value="Draft">Draft</option>
                        <option value="Quotation Sent">Quotation Sent</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="In Production">In Production</option>
                        <option value="Ready for Dispatch">Ready for Dispatch</option>
                        <option value="Dispatched">Dispatched</option>
                        <option value="Completed">Completed</option>
                      </select>

                      {/* View Full Details Modal */}
                      <button
                        onClick={() => setSelectedOrderDetails(o)}
                        className="p-2 rounded-xl glass-pill text-zinc-300 hover:text-white border border-white/15"
                        title="View Full Order Specifications Snapshot"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Download PDF */}
                      <button
                        onClick={() => handleDownloadOrderPdf(o)}
                        className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-white/10"
                        title="Download Stamped PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      {/* Share WhatsApp */}
                      <button
                        onClick={() => handleShareOrderWhatsApp(o)}
                        className="p-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/30"
                        title="Share on WhatsApp"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* ======================================================== */}
      {/* DIVISION 4: QR TAG STUDIO */}
      {/* ======================================================== */}
      {activeTab === 'qr' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-base font-serif font-bold text-white">Saree Product QR Code Generator & Tag Studio</h3>
            <p className="text-xs text-zinc-400">Generate stable, durable product QR codes linked to the master database records for factory inventory & retail display tags.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {products.map(p => (
              <div key={p.id} className="p-5 rounded-3xl glass-card border border-white/10 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl gold-gradient-bg flex items-center justify-center text-zinc-950 font-bold mx-auto">
                  <QrCode className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-amber-300 block">{p.product_code}</span>
                  <h4 className="text-xs font-bold text-white line-clamp-1">{p.name}</h4>
                  <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{p.qr_identifier}</p>
                </div>
                <button
                  onClick={() => handleViewQr(p)}
                  className="w-full py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white border border-white/10 transition"
                >
                  Generate & Print Tag
                </button>
              </div>
            ))}
          </div>

          {/* QR Code Modal Preview (Clean: Only QR Code, Download PNG & Print Tag) */}
          {selectedQrProduct && qrPreviewUrl && (
            <div 
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
              onClick={() => setSelectedQrProduct(null)}
            >
              <div 
                className="relative w-full max-w-sm glass-card rounded-3xl border border-amber-500/40 p-6 shadow-2xl bg-zinc-950 text-white space-y-5"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl gold-gradient-bg text-zinc-950">
                      <QrCode className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wider text-amber-400">Product Saree QR Tag</h4>
                      <p className="text-[11px] text-zinc-400 line-clamp-1">{selectedQrProduct.product_code} — {selectedQrProduct.name}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedQrProduct(null)}
                    className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-zinc-300 transition"
                    title="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* White Tag Frame with QR Code */}
                <div className="p-5 bg-white rounded-2xl inline-block shadow-2xl mx-auto w-full text-center">
                  <img src={qrPreviewUrl} alt="QR Code" className="w-56 h-56 mx-auto object-contain" />
                  <p className="text-zinc-950 font-bold text-sm mt-3 tracking-wide">{selectedQrProduct.product_code}</p>
                  <p className="text-zinc-700 text-xs font-serif line-clamp-1 mt-0.5">{selectedQrProduct.name}</p>
                  <p className="text-amber-800 text-[10px] tracking-widest font-bold uppercase mt-1.5">SAHJANAND POLYWEAVES PVT. LTD.</p>
                </div>

                {/* Action Buttons: Only Download PNG and Print Tag */}
                <div className="flex gap-2.5 justify-center pt-1">
                  <a
                    href={qrPreviewUrl}
                    download={`${selectedQrProduct.product_code}_QR_Tag.png`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl gold-gradient-bg text-zinc-950 font-bold text-xs shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PNG</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      const printWin = window.open('', '_blank', 'width=500,height=600');
                      if (!printWin) return;
                      printWin.document.write(`
                        <html>
                          <head>
                            <title>${selectedQrProduct.product_code} - Saree QR Tag</title>
                            <style>
                              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; text-align: center; padding: 24px; }
                              .card { border: 2px dashed #b45309; padding: 24px; border-radius: 14px; max-width: 320px; margin: 0 auto; }
                              img { width: 220px; height: 220px; margin: 0 auto; display: block; }
                              h2 { margin: 12px 0 2px; font-size: 17px; color: #18181b; }
                              p { margin: 2px 0; font-size: 11px; color: #52525b; }
                              .badge { display: inline-block; background: #fef3c7; color: #92400e; font-size: 10px; font-weight: bold; padding: 4px 10px; border-radius: 999px; margin-top: 10px; }
                            </style>
                          </head>
                          <body>
                            <div class="card">
                              <p style="font-weight: bold; letter-spacing: 1px; color: #b45309;">SAHJANAND POLYWEAVES</p>
                              <img src="${qrPreviewUrl}" alt="QR" />
                              <h2>${selectedQrProduct.product_code}</h2>
                              <p>${selectedQrProduct.name}</p>
                              <span class="badge">SCAN FOR 4K RUNWAY CATWALK VIDEO</span>
                            </div>
                            <script>
                              window.onload = function() { window.print(); window.close(); }
                            </script>
                          </body>
                        </html>
                      `);
                      printWin.document.close();
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs border border-white/10 active:scale-95 transition"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Tag</span>
                  </button>
                </div>

              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* DIVISION 5: COMPANY SETTINGS */}
      {/* ======================================================== */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="glass-card rounded-3xl p-6 border border-white/10 space-y-6 max-w-3xl">
          <div>
            <h3 className="text-base font-serif font-bold text-white">Company Identity & Letterhead Configuration</h3>
            <p className="text-xs text-zinc-400">Populates all server-generated quotation and purchase order PDF headers</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">Company Name</label>
              <input
                type="text"
                value={companyForm.company_name || ''}
                onChange={(e) => setCompanyForm({ ...companyForm, company_name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">Brand Slogan</label>
              <input
                type="text"
                value={companyForm.slogan || ''}
                onChange={(e) => setCompanyForm({ ...companyForm, slogan: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-zinc-300 block mb-1">Surat Mill / Registered Address</label>
              <input
                type="text"
                value={companyForm.address || ''}
                onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">GSTIN</label>
              <input
                type="text"
                value={companyForm.gstin || ''}
                onChange={(e) => setCompanyForm({ ...companyForm, gstin: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">Default GST Rate (%)</label>
              <input
                type="number"
                step="any"
                value={companyForm.default_gst_rate !== undefined ? companyForm.default_gst_rate : ''}
                onChange={(e) => setCompanyForm({ ...companyForm, default_gst_rate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">Phone</label>
              <input
                type="text"
                value={companyForm.phone || ''}
                onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">Email</label>
              <input
                type="email"
                value={companyForm.email || ''}
                onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">Terms & Conditions</label>
            <textarea
              rows={4}
              value={companyForm.terms_and_conditions || ''}
              onChange={(e) => setCompanyForm({ ...companyForm, terms_and_conditions: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white font-mono"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-3 rounded-2xl gold-gradient-bg text-zinc-950 font-bold text-xs"
          >
            Save Company Settings
          </button>
        </form>
      )}

      {/* ======================================================== */}
      {/* DIVISION 6: GEMINI AI RUNWAY BOT & AUTOMATED 4K STUDIO */}
      {/* ======================================================== */}
      {activeTab === 'ai_studio' && (
        <div className="space-y-6">
          
          {/* Bot Status Card */}
          <div className="glass-card rounded-3xl p-6 border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-zinc-900 to-zinc-950 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  Background AI Synthesis Engine • ACTIVE & MONITORING
                </span>
              </div>
              <h3 className="text-xl font-serif font-bold text-white">
                Autonomous 4K International Model Runway Studio
              </h3>
              <p className="text-xs text-zinc-300 max-w-2xl leading-relaxed">
                When you upload new real saree product photos or modify designs in the catalog, this background AI bot automatically synthesizes photorealistic 4K runway model photoshoots on fashion stages with accurate fabric weave, color mapping, and metallic zari reflections without manual effort.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 shrink-0">
              <button
                onClick={() => {
                  alert('Background AI Runway Bot is actively synchronized with all 5 product records!');
                }}
                className="px-4 py-2.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 border border-white/10 text-xs font-semibold text-white flex items-center gap-2 transition"
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                <span>Check Bot Status</span>
              </button>
            </div>
          </div>

          {/* Quick AI Saree & Auto-Video Studio */}
          <div className="glass-card rounded-3xl p-6 border border-white/10 bg-zinc-900/60 shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <div>
                <h4 className="text-sm font-serif font-bold text-white">
                  Quick Saree Upload & Auto Catwalk Video Studio
                </h4>
                <p className="text-xs text-zinc-400">
                  Upload any saree image and enter price data; the AI bot automatically creates the product record and synthesizes the 4K model catwalk walk video.
                </p>
              </div>
            </div>

            <form onSubmit={handleQuickSynthesize} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[11px] text-zinc-300 block mb-1">Saree Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Surat Heritage Royal Brocade Saree"
                    value={quickName}
                    onChange={(e) => setQuickName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-300 block mb-1">Product SKU / Code</label>
                  <input
                    type="text"
                    placeholder="e.g. SP-LUXE-06"
                    value={quickCode}
                    onChange={(e) => setQuickCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-300 block mb-1">Price Range / Base Rate (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="2950"
                    value={quickPrice}
                    onChange={(e) => setQuickPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-300 block mb-1">Upload Saree Image *</label>
                  <input
                    type="file"
                    required
                    accept="image/*"
                    onChange={(e) => setQuickFile(e.target.files[0])}
                    className="w-full text-xs text-zinc-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:bg-zinc-800 file:text-white"
                  />
                </div>
              </div>

              {quickSuccessMsg && (
                <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-xs text-emerald-300 font-mono">
                  {quickSuccessMsg}
                </div>
              )}

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={isQuickUploading}
                  className="px-6 py-2.5 rounded-xl gold-gradient-bg text-zinc-950 font-bold text-xs flex items-center gap-2 shadow-lg disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isQuickUploading ? 'AI BOT SYNTHESIZING VIDEO & CATALOG...' : '⚡ AUTO-GENERATE 4K CATWALK VIDEO & PRODUCT'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* 5 Real-World International Model Runway Shoots Gallery */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-serif font-bold text-white">
                  Trained International Runway Model Shoots (4K Real-World)
                </h4>
                <p className="text-xs text-zinc-400">
                  Photorealistic catwalk presentations created by the AI engine from authentic Surat sarees.
                </p>
              </div>
              <span className="text-xs font-mono text-amber-400">5 Models Ready</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                {
                  title: 'Crimson Meenakari Saree',
                  code: 'SP-MEENA-01',
                  img: getAssetUrl('/assets/products/model-crimson-runway.jpg'),
                  fabric: 'Royal Georgette Silk',
                  zari: 'Gold & Pink Meenakari',
                  productIndex: 0
                },
                {
                  title: 'Indigo Elephant Brocade',
                  code: 'SP-INDIGO-02',
                  img: getAssetUrl('/assets/products/model-indigo-runway.jpg'),
                  fabric: 'Brocade Satin Poly-Silk',
                  zari: 'Tested Gold Elephant Medallions',
                  productIndex: 1
                },
                {
                  title: 'Rani Pink Scalloped Saree',
                  code: 'SP-RANI-03',
                  img: getAssetUrl('/assets/products/model-rani-pink-runway.jpg'),
                  fabric: 'Lustrous Poly-Silk',
                  zari: 'Dual-Tone Resham & Zari Boota',
                  productIndex: 2
                },
                {
                  title: 'Mustard Gold Peacock Saree',
                  code: 'SP-GOLD-04',
                  img: getAssetUrl('/assets/products/model-mustard-gold-runway.jpg'),
                  fabric: 'Heavy Jacquard Satin',
                  zari: 'Antique Gold Mayil Peacock',
                  productIndex: 3
                },
                {
                  title: 'Teal Green Antique Zari',
                  code: 'SP-TEAL-05',
                  img: getAssetUrl('/assets/products/model-teal-green-runway.jpg'),
                  fabric: 'High-Twist Poly-Silk',
                  zari: 'Antique Matte Gold & Silver',
                  productIndex: 4
                }
              ].map((m, idx) => (
                <div key={idx} className="glass-card rounded-2xl border border-white/10 overflow-hidden shadow-xl flex flex-col justify-between group hover:border-amber-400/50 transition">
                  <div className="relative aspect-[3/4] overflow-hidden bg-black">
                    <img 
                      src={m.img} 
                      alt={m.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-bold text-amber-300 border border-amber-500/30">
                      4K Runway
                    </span>
                    <div className="absolute bottom-2 left-2 right-2 text-left">
                      <span className="text-[10px] font-mono text-amber-300 block">{m.code}</span>
                      <p className="text-xs font-serif font-bold text-white drop-shadow">{m.title}</p>
                    </div>
                  </div>

                  <div className="p-3 space-y-2 bg-zinc-950/80">
                    <div className="text-[10px] text-zinc-400 space-y-0.5">
                      <p><strong className="text-zinc-300">Fabric:</strong> {m.fabric}</p>
                      <p><strong className="text-zinc-300">Zari:</strong> {m.zari}</p>
                    </div>

                    <button
                      onClick={() => {
                        const prod = products[m.productIndex] || products[0];
                        if (prod && onSelectProductForPresentation) {
                          onSelectProductForPresentation(prod);
                        } else {
                          const url = new URL(window.location.href);
                          url.searchParams.delete('view');
                          url.searchParams.set('sku', m.code);
                          window.history.pushState(null, '', url.pathname + url.search + url.hash);
                          window.location.reload();
                        }
                      }}
                      className="w-full py-1.5 rounded-xl gold-gradient-bg text-zinc-950 font-bold text-[11px] shadow hover:scale-102 active:scale-95 transition"
                    >
                      Show in Presentation
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Authentic Real-World Reference Products */}
          <div className="p-6 rounded-3xl glass-card border border-white/10 space-y-4">
            <div>
              <h4 className="text-base font-serif font-bold text-white">
                Authentic 4K Saree Source Photographs (Non-Vector Real World)
              </h4>
              <p className="text-xs text-zinc-400">
                These actual high-resolution textile photographs serve as the ground truth for our weaving specifications and AI runway generation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl overflow-hidden border border-white/10 relative group">
                <img 
                  src={getAssetUrl('/assets/products/saree-crimson-meenakari-real.jpg')} 
                  alt="4K Crimson Meenakari Saree" 
                  className="w-full h-56 object-cover" 
                />
                <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
                  <p className="text-xs font-serif font-bold text-white">Surat Royal Crimson Meenakari Saree (Full Flatlay)</p>
                  <p className="text-[10px] text-zinc-300">Ultra-high-definition meenakari circular medallions with scalloped border</p>
                </div>
              </div>

              <div className="rounded-2xl overflow-hidden border border-white/10 relative group">
                <img 
                  src={getAssetUrl('/assets/products/saree-stack-5colors.jpg')} 
                  alt="4K 5-Saree Silk Collection" 
                  className="w-full h-56 object-cover" 
                />
                <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
                  <p className="text-xs font-serif font-bold text-white">Surat Silk 5-Colour Master Collection Stack</p>
                  <p className="text-[10px] text-zinc-300">Mustard Gold, Rani Pink, Indigo Blue, Peacock Teal, and Crimson Silk</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* PRODUCT CREATE / EDIT MODAL */}
      {/* ======================================================== */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-3xl my-auto glass-card rounded-3xl border border-white/20 p-6 shadow-2xl bg-zinc-950/95 text-white space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-white/10">
              <h3 className="text-lg font-serif font-bold text-white">
                {editingProduct.id ? `Edit Saree Product: ${editingProduct.product_code}` : 'Add New Saree Product'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-zinc-300 block mb-1">Product Code *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.product_code || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, product_code: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-300 block mb-1">Category</label>
                  <input
                    type="text"
                    value={editingProduct.category || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-300 block mb-1">Collection</label>
                  <input
                    type="text"
                    value={editingProduct.collection || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, collection: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-300 block mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-300 block mb-1">Fabric Composition</label>
                  <input
                    type="text"
                    value={editingProduct.fabric_composition || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, fabric_composition: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-300 block mb-1">Weave Type</label>
                  <input
                    type="text"
                    value={editingProduct.weave_type || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, weave_type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-zinc-300 block mb-1">Base Price (INR ₹) *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={editingProduct.base_price !== undefined ? editingProduct.base_price : ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, base_price: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-300 block mb-1">MOQ (Sarees)</label>
                  <input
                    type="number"
                    min="1"
                    value={editingProduct.moq !== undefined ? editingProduct.moq : ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, moq: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-300 block mb-1">Lead Time (Days)</label>
                  <input
                    type="number"
                    min="1"
                    value={editingProduct.lead_time_days !== undefined ? editingProduct.lead_time_days : ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, lead_time_days: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white"
                  />
                </div>
              </div>

              {/* Media Upload / Video URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/10">
                <div>
                  <label className="text-xs text-zinc-300 block mb-1">Demo Video URL or Loom Footage</label>
                  <input
                    type="text"
                    placeholder="https://... or /uploads/video.mp4"
                    value={editingProduct.demo_video_url || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, demo_video_url: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-300 block mb-1">Upload Real Loom Video / Photo</label>
                  <input
                    type="file"
                    onChange={(e) => handleFileUpload(e, 'hero_image')}
                    className="w-full text-xs text-zinc-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-zinc-800 file:text-white"
                  />
                </div>

                <div className="sm:col-span-2 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-zinc-900 to-zinc-950 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Gemini AI Runway Catwalk Video Bot
                    </span>
                    <p className="text-[11px] text-zinc-300">
                      Auto-generate a 4K catwalk walking motion video with model strut, hip sway & fabric wave from the saree image.
                    </p>
                    {videoGenStatus && (
                      <p className="text-[11px] font-mono text-emerald-400 mt-1">{videoGenStatus}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    disabled={isGeneratingVideo}
                    onClick={handleGenerateCatwalkVideoForProduct}
                    className="px-4 py-2 rounded-xl gold-gradient-bg text-zinc-950 font-bold text-xs flex items-center gap-2 shrink-0 disabled:opacity-50 hover:scale-105 transition"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isGeneratingVideo ? 'Synthesizing Catwalk Video...' : 'Synthesize 4K Catwalk Video'}</span>
                  </button>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl gold-gradient-bg text-zinc-950 font-bold text-xs"
                >
                  Save Saree Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* COSTING COMPONENT EDIT MODAL (COLOUR, ZARI, DESIGN, PROCESS) */}
      {/* ======================================================== */}
      {costingModalType && editingCostItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md glass-card rounded-3xl border border-white/20 p-6 shadow-2xl bg-zinc-950/95 text-white space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white capitalize">
                {editingCostItem.id ? `Edit ${costingModalType} Rate` : `Add New ${costingModalType}`}
              </h3>
              <button onClick={() => setCostingModalType(null)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveCostItem} className="space-y-4">
              {/* Form fields based on component type */}
              {costingModalType === 'colour' && (
                <>
                  <div>
                    <label className="text-xs text-zinc-300 block mb-1">Colour Name</label>
                    <input
                      type="text"
                      required
                      value={editingCostItem.name || ''}
                      onChange={(e) => setEditingCostItem({ ...editingCostItem, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-300 block mb-1">Hex Code (e.g. #7B1113)</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={editingCostItem.hex_code || '#7B1113'}
                        onChange={(e) => setEditingCostItem({ ...editingCostItem, hex_code: e.target.value })}
                        className="w-10 h-9 rounded-lg bg-zinc-900 border border-white/10 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={editingCostItem.hex_code || ''}
                        onChange={(e) => setEditingCostItem({ ...editingCostItem, hex_code: e.target.value })}
                        className="flex-1 px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-300 block mb-1">Dye Surcharge Per Saree (INR ₹)</label>
                    <input
                      type="number"
                      step="any"
                      value={editingCostItem.surcharge_per_saree !== undefined ? editingCostItem.surcharge_per_saree : ''}
                      onChange={(e) => setEditingCostItem({ ...editingCostItem, surcharge_per_saree: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white"
                    />
                  </div>
                </>
              )}

              {costingModalType === 'zari' && (
                <>
                  <div>
                    <label className="text-xs text-zinc-300 block mb-1">Zari Specification Name</label>
                    <input
                      type="text"
                      required
                      value={editingCostItem.name || ''}
                      onChange={(e) => setEditingCostItem({ ...editingCostItem, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-zinc-300 block mb-1">Finish Tone</label>
                      <select
                        value={editingCostItem.finish_tone || 'Gold'}
                        onChange={(e) => setEditingCostItem({ ...editingCostItem, finish_tone: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white"
                      >
                        <option value="Gold">Gold</option>
                        <option value="Antique Gold">Antique Gold</option>
                        <option value="Rose Gold">Rose Gold</option>
                        <option value="Silver">Silver</option>
                        <option value="Champagne">Champagne</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-zinc-300 block mb-1">Gram Consumption</label>
                      <input
                        type="number"
                        step="any"
                        value={editingCostItem.consumption_grams !== undefined ? editingCostItem.consumption_grams : ''}
                        onChange={(e) => setEditingCostItem({ ...editingCostItem, consumption_grams: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-300 block mb-1">Additional Cost Surcharge (INR ₹)</label>
                    <input
                      type="number"
                      step="any"
                      value={editingCostItem.additional_cost !== undefined ? editingCostItem.additional_cost : ''}
                      onChange={(e) => setEditingCostItem({ ...editingCostItem, additional_cost: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white"
                    />
                  </div>
                </>
              )}

              {costingModalType === 'design' && (
                <>
                  <div>
                    <label className="text-xs text-zinc-300 block mb-1">Design Code</label>
                    <input
                      type="text"
                      required
                      value={editingCostItem.design_code || ''}
                      onChange={(e) => setEditingCostItem({ ...editingCostItem, design_code: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-300 block mb-1">Design / Motif Name</label>
                    <input
                      type="text"
                      required
                      value={editingCostItem.name || ''}
                      onChange={(e) => setEditingCostItem({ ...editingCostItem, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-300 block mb-1">Pattern Charge Per Saree (INR ₹)</label>
                    <input
                      type="number"
                      step="any"
                      value={editingCostItem.design_charge !== undefined ? editingCostItem.design_charge : ''}
                      onChange={(e) => setEditingCostItem({ ...editingCostItem, design_charge: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white"
                    />
                  </div>
                </>
              )}

              {costingModalType === 'process' && (
                <>
                  <div>
                    <label className="text-xs text-zinc-300 block mb-1">Process Name (e.g. Diang Calendering)</label>
                    <input
                      type="text"
                      required
                      value={editingCostItem.name || ''}
                      onChange={(e) => setEditingCostItem({ ...editingCostItem, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-300 block mb-1">Description</label>
                    <input
                      type="text"
                      value={editingCostItem.description || ''}
                      onChange={(e) => setEditingCostItem({ ...editingCostItem, description: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-zinc-300 block mb-1">Rate (INR ₹ / saree)</label>
                      <input
                        type="number"
                        step="any"
                        value={editingCostItem.rate !== undefined ? editingCostItem.rate : ''}
                        onChange={(e) => setEditingCostItem({ ...editingCostItem, rate: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-300 block mb-1">Mandatory Status</label>
                      <select
                        value={editingCostItem.is_mandatory ? 1 : 0}
                        onChange={(e) => setEditingCostItem({ ...editingCostItem, is_mandatory: parseInt(e.target.value, 10) })}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white"
                      >
                        <option value={0}>Optional</option>
                        <option value={1}>Mandatory</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCostingModalType(null)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl gold-gradient-bg text-zinc-950 font-bold text-xs"
                >
                  Save Parameter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ORDER DETAILS INSPECTOR MODAL */}
      {/* ======================================================== */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl my-auto glass-card rounded-3xl border border-white/20 p-6 shadow-2xl bg-zinc-950/95 text-white space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-white/10">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">
                  Confirmed Order Record Snapshot
                </span>
                <h3 className="text-lg font-serif font-bold text-white">
                  {selectedOrderDetails.order_number}
                </h3>
              </div>
              <button onClick={() => setSelectedOrderDetails(null)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Buyer & Seller */}
              <div className="grid grid-cols-2 gap-4 p-3.5 rounded-2xl bg-zinc-900/60 border border-white/5">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase block">Buyer Company Name</span>
                  <p className="font-bold text-white text-sm">{selectedOrderDetails.buyer_company_name}</p>
                  <p className="text-zinc-400 mt-0.5">Contact: {selectedOrderDetails.buyer_contact_person || 'N/A'}</p>
                  <p className="text-zinc-400">Mobile: {selectedOrderDetails.buyer_mobile || 'N/A'}</p>
                  <p className="text-zinc-400 font-mono">GSTIN: {selectedOrderDetails.buyer_gstin || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase block">Seller Mill</span>
                  <p className="font-bold text-amber-300 text-sm">SAHJANAND POLYWEAVES PVT. LTD.</p>
                  <p className="text-zinc-400 mt-0.5">Surat Textile Park, Sachin GIDC</p>
                  <p className="text-zinc-400">Delivery Target: {selectedOrderDetails.delivery_date || '10-14 days'}</p>
                  <p className="text-zinc-400">Payment: {selectedOrderDetails.payment_terms}</p>
                </div>
              </div>

              {/* Saree Config Snapshot */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-zinc-900/40 border border-white/5">
                <span className="text-[10px] font-bold uppercase text-amber-400 block">Saree Configuration</span>
                <div className="grid grid-cols-2 gap-2 text-zinc-300">
                  <p>Product: <strong className="text-white">{selectedOrderDetails.product_name}</strong></p>
                  <p>Colour: <strong className="text-white">{selectedOrderDetails.selected_colour_name}</strong></p>
                  <p>Zari Spec: <strong className="text-white">{selectedOrderDetails.selected_zari_name}</strong></p>
                  <p>Jacquard Pattern: <strong className="text-white">{selectedOrderDetails.selected_design_name}</strong></p>
                  <p>Quantity: <strong className="text-amber-300">{selectedOrderDetails.quantity} Sarees</strong></p>
                  <p>Unit Rate: <strong className="text-amber-300">{formatInr(selectedOrderDetails.unit_price)}</strong></p>
                </div>
              </div>

              {/* Financial Snapshot */}
              <div className="p-3.5 rounded-2xl bg-zinc-900 border border-amber-500/20 flex justify-between items-center">
                <div>
                  <p className="text-zinc-400">Taxable Value: {formatInr(selectedOrderDetails.taxable_amount)}</p>
                  <p className="text-zinc-400">GST (5% HSN 5407): {formatInr(selectedOrderDetails.gst_amount)}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase text-zinc-400 block">Order Grand Total</span>
                  <p className="text-xl font-bold gold-gradient-text">{formatInr(selectedOrderDetails.grand_total)}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 justify-end pt-2">
                <button
                  onClick={() => handleDownloadOrderPdf(selectedOrderDetails)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 text-white font-bold flex items-center gap-2 hover:bg-zinc-700"
                >
                  <Download className="w-4 h-4 text-amber-400" /> Download PDF
                </button>
                <button
                  onClick={() => handleShareOrderWhatsApp(selectedOrderDetails)}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold flex items-center gap-2 hover:bg-emerald-500"
                >
                  <MessageSquare className="w-4 h-4" /> Share on WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
