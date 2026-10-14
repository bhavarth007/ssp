import {
  EMBEDDED_SETTINGS,
  EMBEDDED_COLOURS,
  EMBEDDED_ZARI,
  EMBEDDED_DESIGNS,
  EMBEDDED_THREADS,
  EMBEDDED_PROCESSES,
  EMBEDDED_PRODUCTS
} from '../data/embeddedData.js';

const API_BASE = '/api';

// Helper for localStorage persistence of custom data (for static GitHub Pages support)
function getLocalCustom(key, defaultData) {
  try {
    const val = localStorage.getItem(`ssp_${key}`);
    return val ? JSON.parse(val) : defaultData;
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

  // 1. Settings
  if (cleanEndpoint === '/settings') {
    if (method === 'PUT') {
      const updated = { ...EMBEDDED_SETTINGS, ...JSON.parse(options.body || '{}') };
      setLocalCustom('settings', updated);
      return updated;
    }
    return getLocalCustom('settings', EMBEDDED_SETTINGS);
  }

  // 2. Products
  if (cleanEndpoint === '/products') {
    const allProducts = getLocalCustom('products', EMBEDDED_PRODUCTS);
    if (method === 'POST') {
      const newProd = { id: Date.now(), ...JSON.parse(options.body || '{}') };
      const updatedList = [newProd, ...allProducts];
      setLocalCustom('products', updatedList);
      return newProd;
    }
    return allProducts;
  }

  if (cleanEndpoint.startsWith('/products/')) {
    const idOrCode = decodeURIComponent(cleanEndpoint.replace('/products/', ''));
    const allProducts = getLocalCustom('products', EMBEDDED_PRODUCTS);
    const prod = allProducts.find(p => String(p.id) === idOrCode || p.product_code === idOrCode || p.qr_identifier === idOrCode);
    if (prod) return prod;
    return allProducts[0];
  }

  // 3. Customization Libraries
  if (cleanEndpoint === '/colours') return getLocalCustom('colours', EMBEDDED_COLOURS);
  if (cleanEndpoint === '/zari') return getLocalCustom('zari', EMBEDDED_ZARI);
  if (cleanEndpoint === '/designs') return getLocalCustom('designs', EMBEDDED_DESIGNS);
  if (cleanEndpoint === '/threads') return getLocalCustom('threads', EMBEDDED_THREADS);
  if (cleanEndpoint === '/processes') return getLocalCustom('processes', EMBEDDED_PROCESSES);

  // 4. Real-time Pricing Calculation
  if (cleanEndpoint === '/pricing/calculate') {
    const body = JSON.parse(options.body || '{}');
    const base = Number(body.base_price || 2950);
    const colourCost = Number(body.colour_surcharge || 0);
    const zariCost = Number(body.zari_cost || 0);
    const designCost = Number(body.design_charge || 0);
    const processSum = (body.processes || []).reduce((sum, p) => sum + Number(p.rate || 0), 0);
    const subtotal = base + colourCost + zariCost + designCost + processSum;
    const qty = Number(body.quantity || 10);
    const discountPct = qty >= 100 ? 15 : qty >= 50 ? 10 : qty >= 20 ? 5 : 0;
    const discountAmt = (subtotal * discountPct) / 100;
    const taxable = subtotal - discountAmt;
    const gstRate = 5.0;
    const gstAmt = (taxable * gstRate) / 100;
    const finalUnit = taxable + gstAmt;

    return {
      base_price: base,
      colour_surcharge: colourCost,
      zari_cost: zariCost,
      design_charge: designCost,
      processes_cost: processSum,
      subtotal_per_saree: subtotal,
      quantity: qty,
      volume_discount_percent: discountPct,
      discount_amount_per_saree: discountAmt,
      taxable_amount_per_saree: taxable,
      gst_rate: gstRate,
      gst_amount_per_saree: gstAmt,
      final_price_per_saree: Math.round(finalUnit),
      total_order_value: Math.round(finalUnit * qty)
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
        ...JSON.parse(options.body || '{}')
      };
      setLocalCustom('orders', [newOrder, ...orders]);
      return newOrder;
    }
    return orders;
  }

  // 6. QR generation fallback (uses quickchart / static QR image)
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
export const getProducts = (status) => fetchApi(`/products${status ? `?status=${status}` : ''}`);
export const getProduct = (idOrCode) => fetchApi(`/products/${encodeURIComponent(idOrCode)}`);
export const createProduct = (data) => fetchApi('/products', { method: 'POST', body: JSON.stringify(data) });
export const updateProduct = (id, data) => fetchApi(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteProduct = (id) => fetchApi(`/products/${id}`, { method: 'DELETE' });

// 3. Customization Libraries
export const getColours = () => fetchApi('/colours');
export const createColour = (data) => fetchApi('/colours', { method: 'POST', body: JSON.stringify(data) });
export const updateColour = (id, data) => fetchApi(`/colours/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const getZari = () => fetchApi('/zari');
export const createZari = (data) => fetchApi('/zari', { method: 'POST', body: JSON.stringify(data) });
export const updateZari = (id, data) => fetchApi(`/zari/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const getDesigns = () => fetchApi('/designs');
export const createDesign = (data) => fetchApi('/designs', { method: 'POST', body: JSON.stringify(data) });
export const updateDesign = (id, data) => fetchApi(`/designs/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const getThreads = () => fetchApi('/threads');
export const createThread = (data) => fetchApi('/threads', { method: 'POST', body: JSON.stringify(data) });
export const updateThread = (id, data) => fetchApi(`/threads/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const getProcesses = () => fetchApi('/processes');
export const createProcess = (data) => fetchApi('/processes', { method: 'POST', body: JSON.stringify(data) });
export const updateProcess = (id, data) => fetchApi(`/processes/${id}`, { method: 'PUT', body: JSON.stringify(data) });

// 4. Real-time Pricing Calculation
export const calculatePricing = (payload) => fetchApi('/pricing/calculate', { method: 'POST', body: JSON.stringify(payload) });

// 5. Orders & Quotations CRM
export const getOrders = () => fetchApi('/orders');
export const getOrder = (id) => fetchApi(`/orders/${id}`);
export const createOrder = (data) => fetchApi('/orders', { method: 'POST', body: JSON.stringify(data) });
export const updateOrderStatus = (id, status) => fetchApi(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
export const deleteOrder = (id) => fetchApi(`/orders/${id}`, { method: 'DELETE' });

// 6. QR Code Generation
export const getQrDataUrl = (text, size = 300) => fetchApi(`/qr/generate?text=${encodeURIComponent(text)}&size=${size}`);

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
    // In static mode, convert to local ObjectURL or base64 data URL
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve({ file_url: e.target.result, filename: file.name });
      reader.readAsDataURL(file);
    });
  }
}

// 8. Gemini AI Runway Video Synthesis Bot
export const synthesizeCatwalkVideo = (payload) => fetchApi('/ai/synthesize-catwalk-video', {
  method: 'POST',
  body: JSON.stringify(payload)
});
