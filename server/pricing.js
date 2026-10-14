import db from './db.js';

/**
 * Centralized, server-validated pricing engine.
 * Never trust raw client prices - always fetch authoritative unit rates from database records.
 */
export function calculateOrderPricing({
  productId,
  quantity = 1,
  colourId = null,
  zariId = null,
  designId = null,
  threadId = null,
  processIds = [],
  customDiscountPercent = null
}) {
  const qty = Math.max(1, parseInt(quantity, 10) || 1);

  // 1. Fetch Authoritative Product Base Price
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
  if (!product) {
    throw new Error(`Product ID ${productId} not found`);
  }

  const basePrice = parseFloat(product.base_price) || 0;

  // 2. Fetch Colour Surcharge
  let colourCost = 0;
  let colourRecord = null;
  if (colourId) {
    colourRecord = db.prepare('SELECT * FROM colours WHERE id = ?').get(colourId);
    if (colourRecord) {
      colourCost = parseFloat(colourRecord.surcharge_per_saree) || 0;
    }
  }

  // 3. Fetch Zari Cost
  let zariCost = 0;
  let zariRecord = null;
  if (zariId) {
    zariRecord = db.prepare('SELECT * FROM zari_options WHERE id = ?').get(zariId);
    if (zariRecord) {
      zariCost = parseFloat(zariRecord.additional_cost) || 0;
    }
  }

  // 4. Fetch Design Charge
  let designCost = 0;
  let designRecord = null;
  if (designId) {
    designRecord = db.prepare('SELECT * FROM designs WHERE id = ?').get(designId);
    if (designRecord) {
      designCost = parseFloat(designRecord.design_charge) || 0;
    }
  }

  // 5. Fetch Thread Cost
  let threadCost = 0;
  let threadRecord = null;
  if (threadId) {
    threadRecord = db.prepare('SELECT * FROM thread_options WHERE id = ?').get(threadId);
    if (threadRecord) {
      threadCost = parseFloat(threadRecord.additional_cost) || 0;
    }
  }

  // 6. Fetch Manufacturing & Finishing Processes
  // Mandatory processes are ALWAYS included
  const allProcs = db.prepare('SELECT * FROM manufacturing_processes WHERE is_active = 1').all();
  const selectedProcSet = new Set((processIds || []).map(id => parseInt(id, 10)));
  
  let manufacturingCost = 0;
  const appliedProcesses = [];

  for (const proc of allProcs) {
    // If mandatory, or explicitly selected by user
    if (proc.is_mandatory || selectedProcSet.has(proc.id)) {
      const rate = parseFloat(proc.rate) || 0;
      manufacturingCost += rate;
      appliedProcesses.push({
        id: proc.id,
        code: proc.process_code,
        name: proc.name,
        rate: rate,
        is_mandatory: !!proc.is_mandatory
      });
    }
  }

  // 7. Calculate Per-Saree Unit Price
  const unitPrice = parseFloat((basePrice + colourCost + zariCost + designCost + threadCost + manufacturingCost).toFixed(2));

  // 8. Calculate Subtotal
  const subtotal = parseFloat((unitPrice * qty).toFixed(2));

  // 9. Volume Discount Slab (or custom authorized discount)
  let discountPercentage = 0;
  if (customDiscountPercent !== null && !isNaN(customDiscountPercent) && customDiscountPercent >= 0) {
    discountPercentage = Math.min(25, parseFloat(customDiscountPercent)); // capped at 25% for safety
  } else {
    if (qty >= 250) {
      discountPercentage = 10.0;
    } else if (qty >= 100) {
      discountPercentage = 6.0;
    } else if (qty >= 50) {
      discountPercentage = 3.0;
    }
  }

  const discountAmount = parseFloat(((subtotal * discountPercentage) / 100).toFixed(2));
  const taxableAmount = parseFloat((subtotal - discountAmount).toFixed(2));

  // 10. GST Configuration (Default 5% for textile sarees / HSN 5407)
  const settings = db.prepare('SELECT default_gst_rate FROM company_settings WHERE id = 1').get();
  const gstRate = settings ? parseFloat(settings.default_gst_rate) || 5.0 : 5.0;
  const gstAmount = parseFloat(((taxableAmount * gstRate) / 100).toFixed(2));

  // 11. Grand Total
  const grandTotal = parseFloat((taxableAmount + gstAmount).toFixed(2));

  return {
    productId: product.id,
    productCode: product.product_code,
    productName: product.name,
    quantity: qty,
    moq: product.moq,
    leadTimeDays: product.lead_time_days,
    breakdown: {
      basePrice,
      colourCost,
      colourName: colourRecord ? colourRecord.name : 'Standard Original',
      colourHex: colourRecord ? colourRecord.hex_code : product.base_colour_hex,
      zariCost,
      zariName: zariRecord ? zariRecord.name : 'Surat Tested Gold Zari (Standard)',
      designCost,
      designName: designRecord ? designRecord.name : 'Traditional Royal Kalka Paisley Jaal',
      threadCost,
      threadName: threadRecord ? threadRecord.name : 'Standard Poly Filament Weft Thread',
      manufacturingCost,
      appliedProcesses
    },
    unitPrice,
    subtotal,
    discountPercentage,
    discountAmount,
    taxableAmount,
    gstRate,
    gstAmount,
    grandTotal
  };
}
