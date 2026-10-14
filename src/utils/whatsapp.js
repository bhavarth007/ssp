/**
 * WhatsApp Sharing helper for Sahjanand Polyweaves
 */

export function cleanIndianPhoneNumber(phone) {
  if (!phone) return '';
  // Remove all non-digits except +
  let cleaned = phone.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  } else if (cleaned.length === 10) {
    cleaned = '91' + cleaned;
  }
  return cleaned;
}

export function buildWhatsAppMessage(order, settings) {
  const companyName = settings?.company_name || 'SAHJANAND POLYWEAVES PVT. LTD.';
  const isPo = order.doc_type === 'PURCHASE_ORDER';
  const docTypeLabel = isPo ? 'Purchase Order Confirmation' : 'Proforma Sales Quotation';
  const formatInr = (val) => `₹${(parseFloat(val) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  return `*${companyName}*
_Weaving Quality, Creating Excellence_
Surat Textile Park, Gujarat, India

Dear *${order.buyer_company_name}*,
Thank you for your business. Here are the details of your *${docTypeLabel}*:

📋 *Document Ref:* ${order.order_number}
🏷️ *Product:* ${order.product_name} (${order.product_code})
🎨 *Custom Colour:* ${order.selected_colour_name || 'Original'}
✨ *Zari Spec:* ${order.selected_zari_name || 'Tested Gold Zari'}
🧵 *Jacquard Design:* ${order.selected_design_name || 'Heritage Jaal'}
📦 *Order Quantity:* ${order.quantity} Sarees
💰 *Unit Price:* ${formatInr(order.unit_price)} per saree
📊 *Taxable Amount:* ${formatInr(order.taxable_amount)}
🏛️ *GST (5%):* ${formatInr(order.gst_amount)}
🌟 *Grand Total:* *${formatInr(order.grand_total)}*

🚚 *Expected Delivery:* ${order.delivery_date || '10-14 days'}
💳 *Payment Terms:* ${order.payment_terms || 'As agreed'}

The official stamped PDF copy has been generated. Please contact us for any assistance.
_Sales Team | Sahjanand Polyweaves Pvt. Ltd._`;
}

/**
 * Triggers native device share sheet (with PDF blob if supported) or opens WhatsApp URL
 */
export async function shareToWhatsApp({ order, settings, pdfBlob, pdfFileName }) {
  const message = buildWhatsAppMessage(order, settings);
  const cleanPhone = cleanIndianPhoneNumber(order.buyer_whatsapp || order.buyer_mobile);

  // Check Web Share API with files support (iOS Safari & Android Chrome)
  if (navigator.canShare && pdfBlob) {
    try {
      const file = new File([pdfBlob], pdfFileName || `${order.order_number}.pdf`, { type: 'application/pdf' });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `${order.order_number} - Sahjanand Polyweaves`,
          text: message,
          files: [file]
        });
        return { success: true, method: 'native_share' };
      }
    } catch {
      // User cancelled or unsupported, fallback to URL
    }
  }

  // Fallback: Direct WhatsApp Click-to-Chat URL
  let waUrl = `https://wa.me/`;
  if (cleanPhone) {
    waUrl += `${cleanPhone}?text=${encodeURIComponent(message)}`;
  } else {
    waUrl += `?text=${encodeURIComponent(message)}`;
  }

  window.open(waUrl, '_blank');
  return { success: true, method: 'whatsapp_url' };
}
