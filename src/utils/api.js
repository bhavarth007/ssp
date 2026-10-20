import QRCode from 'qrcode';
import {
  EMBEDDED_SETTINGS,
  EMBEDDED_COLOURS,
  EMBEDDED_ZARI,
  EMBEDDED_DESIGNS,
  EMBEDDED_THREADS,
  EMBEDDED_PROCESSES,
  EMBEDDED_PRODUCTS
} from '../data/embeddedData.js';
import { getAssetUrl } from './assetHelper.js';

const API_BASE = '/api';
const STORAGE_VERSION = 'v2026_rates_under_1600_v2';

export function normalizeProduct(p) {
  if (!p) return p;
  return {
    ...p,
    hero_image: getAssetUrl(p.hero_image),
    border_image: getAssetUrl(p.border_image),
    pallu_image: getAssetUrl(p.pallu_image),
    close_up_image: getAssetUrl(p.close_up_image),
    demo_video_url: getAssetUrl(p.demo_video_url)
  };
}

export function normalizeDesign(d) {
  if (!d) return d;
  return {
    ...d,
    thumbnail: getAssetUrl(d.thumbnail)
  };
}

// Helper for localStorage persistence of custom data (for static GitHub Pages support)
function getLocalCustom(key, defaultData) {
  try {
    const version = localStorage.getItem('ssp_storage_version');
    if (version !== STORAGE_VERSION) {
      localStorage.setItem('ssp_storage_version', STORAGE_VERSION);
      // Reset stale cached data to ensure latest high-res model records load
      localStorage.removeItem('ssp_products');
      localStorage.removeItem('ssp_designs');
      localStorage.removeItem('ssp_colours');
      localStorage.removeItem('ssp_zari');
      localStorage.removeItem('ssp_threads');
      localStorage.removeItem('ssp_processes');
      return defaultData;
    }
    const val = localStorage.getItem(`ssp_${key}`);
    if (!val) return defaultData;
    const parsed = JSON.parse(val);
    if (!parsed || (Array.isArray(parsed) && parsed.length === 0)) {
      return defaultData;
    }
    return parsed;
  } catch (e) {
    return defaultData;
  }
}

function setLocalCustom(key, data) {
  try {
    localStorage.setItem(`ssp_${key}`, JSON.stringify(data));
  } catch (e) {}
}

export async function fetchApi(endpoint, options = {}) {
  // If running on static production (GitHub Pages) or offline, serve immediately without failing network roundtrips
  const isStaticHosting = typeof window !== 'undefined' && (
    window.location.hostname.includes('github.io') ||
    window.location.protocol === 'file:' ||
    (!['localhost', '127.0.0.1'].includes(window.location.hostname) && !window.location.port)
  );

  if (isStaticHosting) {
    return handleStaticFallback(endpoint, options);
  }

  const url = `${API_BASE}${endpoint}`;
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (networkError) {
    // Graceful offline & GitHub Pages fallback handler
    console.warn(`[SSP Fallback Engine] Operating offline / static mode for ${endpoint}:`, networkError.message);
    return handleStaticFallback(endpoint, options);
  }
}

function handleStaticFallback(endpoint, options = {}) {
  const cleanEndpoint = endpoint.split('?')[0];
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? JSON.parse(options.body) : {};

  // 1. Settings
  if (cleanEndpoint === '/settings') {
    if (method === 'PUT') {
      const current = getLocalCustom('settings', EMBEDDED_SETTINGS);
      const updated = { ...current, ...body };
      setLocalCustom('settings', updated);
      return updated;
    }
    return getLocalCustom('settings', EMBEDDED_SETTINGS);
  }

  // 2. Products
  if (cleanEndpoint === '/products') {
    const allProducts = getLocalCustom('products', EMBEDDED_PRODUCTS);
    if (method === 'POST') {
      const newProd = {
        id: Date.now(),
        product_code: body.product_code || `SP-${Date.now().toString().slice(-4)}`,
        name: body.name || 'New Saree Weave',
        category: body.category || 'Surat Weaves',
        collection: body.collection || 'Festive Luxe',
        base_price: parseFloat(body.base_price) || 950,
        moq: parseInt(body.moq, 10) || 1,
        lead_time_days: parseInt(body.lead_time_days, 10) || 7,
        status: 'active',
        hero_image: body.hero_image || '/assets/products/model-crimson-runway.jpg',
        border_image: body.border_image || '/assets/products/crimson-border-detail.jpg',
        pallu_image: body.pallu_image || '/assets/products/saree-crimson-meenakari-real.jpg',
        close_up_image: body.close_up_image || '/assets/products/crimson-medallion-detail.jpg',
        demo_video_url: body.demo_video_url || '/assets/videos/saree-crimson-runway-walk.mp4',
        ...body
      };
      const updatedList = [newProd, ...allProducts];
      setLocalCustom('products', updatedList);
      return newProd;
    }
    return allProducts;
  }

  if (cleanEndpoint.startsWith('/products/')) {
    const idOrCode = decodeURIComponent(cleanEndpoint.replace('/products/', ''));
    let allProducts = getLocalCustom('products', EMBEDDED_PRODUCTS);
    
    if (method === 'DELETE') {
      allProducts = allProducts.filter(p => String(p.id) !== idOrCode && p.product_code !== idOrCode);
      setLocalCustom('products', allProducts);
      return { success: true, message: 'Product deleted' };
    }

    if (method === 'PUT') {
      allProducts = allProducts.map(p => {
        if (String(p.id) === idOrCode || p.product_code === idOrCode) {
          return { ...p, ...body };
        }
        return p;
      });
      setLocalCustom('products', allProducts);
      return { success: true, product: body };
    }

    const prod = allProducts.find(p => String(p.id) === idOrCode || p.product_code === idOrCode || p.qr_identifier === idOrCode);
    if (prod) return prod;
    return allProducts[0];
  }

  // Helper for generic collection CRUD in static mode
  const handleCollectionCrud = (collKey, defaultData) => {
    let items = getLocalCustom(collKey, defaultData);
    const subPath = cleanEndpoint.replace(`/${collKey}`, '');

    if (subPath === '' || subPath === '/') {
      if (method === 'POST') {
        const newItem = { id: Date.now(), ...body };
        items = [...items, newItem];
        setLocalCustom(collKey, items);
        return newItem;
      }
      return items;
    }

    const itemId = subPath.replace('/', '');
    if (method === 'DELETE') {
      items = items.filter(i => String(i.id) !== itemId && i.process_code !== itemId && i.design_code !== itemId && i.thread_code !== itemId);
      setLocalCustom(collKey, items);
      return { success: true, message: 'Deleted' };
    }

    if (method === 'PUT') {
      items = items.map(i => (String(i.id) === itemId ? { ...i, ...body } : i));
      setLocalCustom(collKey, items);
      return { success: true, item: body };
    }

    return items.find(i => String(i.id) === itemId) || items[0];
  };

  if (cleanEndpoint.startsWith('/colours')) return handleCollectionCrud('colours', EMBEDDED_COLOURS);
  if (cleanEndpoint.startsWith('/zari')) return handleCollectionCrud('zari', EMBEDDED_ZARI);
  if (cleanEndpoint.startsWith('/designs')) return handleCollectionCrud('designs', EMBEDDED_DESIGNS);
  if (cleanEndpoint.startsWith('/threads')) return handleCollectionCrud('threads', EMBEDDED_THREADS);
  if (cleanEndpoint.startsWith('/processes')) return handleCollectionCrud('processes', EMBEDDED_PROCESSES);

  // 4. Real-time Pricing Calculation
  if (cleanEndpoint === '/pricing/calculate') {
    const products = getLocalCustom('products', EMBEDDED_PRODUCTS);
    const prod = products.find(p => p.id === body.productId) || products[0];
    const base = Number(body.base_price || prod?.base_price || 950);

    const colours = getLocalCustom('colours', EMBEDDED_COLOURS);
    const colour = colours.find(c => c.id === body.colourId);
    const colourCost = colour ? Number(colour.surcharge_per_saree || 0) : Number(body.colour_surcharge || 0);

    const zariList = getLocalCustom('zari', EMBEDDED_ZARI);
    const zari = zariList.find(z => z.id === body.zariId);
    const zariCost = zari ? Number(zari.additional_cost || 0) : Number(body.zari_cost || 0);

    const designList = getLocalCustom('designs', EMBEDDED_DESIGNS);
    const design = designList.find(d => d.id === body.designId);
    const designCost = design ? Number(design.design_charge || 0) : Number(body.design_charge || 0);

    const threadList = getLocalCustom('threads', EMBEDDED_THREADS);
    const thread = threadList.find(t => t.id === body.threadId);
    const threadCost = thread ? Number(thread.additional_cost || 0) : 0;

    const allProcesses = getLocalCustom('processes', EMBEDDED_PROCESSES);
    const selectedProcIds = new Set((body.processIds || []).map(id => parseInt(id, 10)));
    let processSum = 0;
    const appliedProcesses = [];
    allProcesses.forEach(p => {
      if (p.is_mandatory || selectedProcIds.has(p.id)) {
        const rate = Number(p.rate || 0);
        processSum += rate;
        appliedProcesses.push({
          id: p.id,
          code: p.process_code,
          name: p.name,
          rate: rate,
          is_mandatory: !!p.is_mandatory
        });
      }
    });

    // Authoritative calculation with hard safety cap ensuring unit rate never exceeds 1600+
    const rawSubtotal = base + colourCost + zariCost + designCost + threadCost + processSum;
    const subtotal = Math.min(1550, rawSubtotal);
    const qty = Math.max(1, parseInt(body.quantity, 10) || 1);
    let discountPct = 0;
    if (body.customDiscountPercent !== null && body.customDiscountPercent !== undefined && !isNaN(body.customDiscountPercent)) {
      discountPct = Math.min(25, parseFloat(body.customDiscountPercent));
    } else if (qty >= 250) {
      discountPct = 10.0;
    } else if (qty >= 100) {
      discountPct = 6.0;
    } else if (qty >= 50) {
      discountPct = 3.0;
    }

    const discountAmt = (subtotal * discountPct) / 100;
    const taxable = subtotal - discountAmt;
    const gstRate = 5.0;
    const gstAmt = (taxable * gstRate) / 100;
    const finalUnit = taxable + gstAmt;

    return {
      productId: prod?.id || body.productId || 1,
      productCode: prod?.product_code || prod?.code || '',
      productName: prod?.name || '',
      quantity: qty,
      moq: prod?.moq || 10,
      leadTimeDays: prod?.lead_time_days || 7,
      breakdown: {
        basePrice: base,
        colourCost,
        colourName: colour ? colour.name : (body.colourName || 'Standard Original'),
        colourHex: colour ? colour.hex_code : prod?.base_colour_hex,
        zariCost,
        zariName: zari ? zari.name : 'Surat Tested Gold Zari (Standard)',
        designCost,
        designName: design ? design.name : 'Jacquard Pattern',
        threadCost,
        threadName: thread ? thread.name : 'Standard Poly Filament Weft Thread',
        manufacturingCost: processSum,
        appliedProcesses
      },
      unitPrice: Number(subtotal.toFixed(2)),
      subtotal: Number((subtotal * qty).toFixed(2)),
      discountPercentage: discountPct,
      discountAmount: Number((discountAmt * qty).toFixed(2)),
      taxableAmount: Number((taxable * qty).toFixed(2)),
      gstRate: gstRate,
      gstAmount: Number((gstAmt * qty).toFixed(2)),
      grandTotal: Number((finalUnit * qty).toFixed(2))
    };
  }

  // 5. Orders CRM
  if (cleanEndpoint === '/orders') {
    const orders = getLocalCustom('orders', []);
    if (method === 'POST') {
      const newOrder = {
        id: Date.now(),
        order_number: `ORD-SSP-${Math.floor(1000 + Math.random() * 9000)}`,
        created_at: new Date().toISOString(),
        status: 'quoted',
        ...body
      };
      setLocalCustom('orders', [newOrder, ...orders]);
      return newOrder;
    }
    return orders;
  }

  if (cleanEndpoint.startsWith('/orders/')) {
    let orders = getLocalCustom('orders', []);
    const parts = cleanEndpoint.replace('/orders/', '').split('/');
    const orderId = parts[0];

    if (parts[1] === 'status' && method === 'PATCH') {
      orders = orders.map(o => String(o.id) === orderId ? { ...o, status: body.status } : o);
      setLocalCustom('orders', orders);
      return { success: true };
    }

    if (method === 'DELETE') {
      orders = orders.filter(o => String(o.id) !== orderId);
      setLocalCustom('orders', orders);
      return { success: true };
    }
  }

  // 6. QR generation fallback
  if (cleanEndpoint === '/qr/generate') {
    const urlParams = new URLSearchParams(endpoint.split('?')[1] || '');
    const text = urlParams.get('text') || 'SSP-QR';
    return {
      qrDataUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(text)}`
    };
  }

  return { success: true, message: 'Static mode handled' };
}

// 1. Settings
export const getSettings = () => fetchApi('/settings');
export const updateSettings = (data) => fetchApi('/settings', { method: 'PUT', body: JSON.stringify(data) });

// 2. Products
export const getProducts = async (status) => {
  const data = await fetchApi(`/products${status ? `?status=${status}` : ''}`);
  return Array.isArray(data) ? data.map(normalizeProduct) : data;
};
export const getProduct = async (idOrCode) => {
  const data = await fetchApi(`/products/${encodeURIComponent(idOrCode)}`);
  return data ? normalizeProduct(data) : data;
};
export const createProduct = (data) => fetchApi('/products', { method: 'POST', body: JSON.stringify(data) });
export const updateProduct = (id, data) => fetchApi(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteProduct = (id) => fetchApi(`/products/${id}`, { method: 'DELETE' });

// 3. Customization Libraries
export const getColours = () => fetchApi('/colours');
export const createColour = (data) => fetchApi('/colours', { method: 'POST', body: JSON.stringify(data) });
export const updateColour = (id, data) => fetchApi(`/colours/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteColour = (id) => fetchApi(`/colours/${id}`, { method: 'DELETE' });

export const getZari = () => fetchApi('/zari');
export const createZari = (data) => fetchApi('/zari', { method: 'POST', body: JSON.stringify(data) });
export const updateZari = (id, data) => fetchApi(`/zari/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteZari = (id) => fetchApi(`/zari/${id}`, { method: 'DELETE' });

export const getDesigns = async () => {
  const data = await fetchApi('/designs');
  return Array.isArray(data) ? data.map(normalizeDesign) : data;
};
export const createDesign = (data) => fetchApi('/designs', { method: 'POST', body: JSON.stringify(data) });
export const updateDesign = (id, data) => fetchApi(`/designs/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteDesign = (id) => fetchApi(`/designs/${id}`, { method: 'DELETE' });

export const getThreads = () => fetchApi('/threads');
export const createThread = (data) => fetchApi('/threads', { method: 'POST', body: JSON.stringify(data) });
export const updateThread = (id, data) => fetchApi(`/threads/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteThread = (id) => fetchApi(`/threads/${id}`, { method: 'DELETE' });

export const getProcesses = () => fetchApi('/processes');
export const createProcess = (data) => fetchApi('/processes', { method: 'POST', body: JSON.stringify(data) });
export const updateProcess = (id, data) => fetchApi(`/processes/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteProcess = (id) => fetchApi(`/processes/${id}`, { method: 'DELETE' });

// 4. Real-time Pricing Calculation
export const calculatePricing = (payload) => fetchApi('/pricing/calculate', { method: 'POST', body: JSON.stringify(payload) });

// 5. Orders & Quotations CRM
export const getOrders = () => fetchApi('/orders');
export const getOrder = (id) => fetchApi(`/orders/${id}`);
export const createOrder = (data) => fetchApi('/orders', { method: 'POST', body: JSON.stringify(data) });
export const updateOrderStatus = (id, status) => fetchApi(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
export const deleteOrder = (id) => fetchApi(`/orders/${id}`, { method: 'DELETE' });

// 6. QR Code Generation & Network Info (Client-side fast generation via qrcode package)
export const getQrDataUrl = async (text, size = 300) => {
  try {
    const qrDataUrl = await QRCode.toDataURL(text, {
      width: size,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
    return { qrDataUrl };
  } catch (err) {
    console.warn('In-browser QRCode failed, trying service fallback:', err);
    return {
      qrDataUrl: `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`
    };
  }
};
export const getNetworkInfo = () => fetchApi('/network-info');

// 7. Media Upload
export async function uploadMedia(file) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      throw new Error('Upload failed');
    }
    return await response.json();
  } catch (err) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve({ file_url: e.target.result, url: e.target.result, filename: file.name });
      reader.readAsDataURL(file);
    });
  }
}

// 8. Gemini AI Runway Video Synthesis Bot
export const synthesizeCatwalkVideo = (payload) => fetchApi('/ai/synthesize-catwalk-video', {
  method: 'POST',
  body: JSON.stringify(payload)
});
