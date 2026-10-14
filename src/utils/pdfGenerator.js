import { jsPDF } from 'jspdf';

/**
 * Generates an executive, print-ready, multi-page PDF document
 * for SAHJANAND POLYWEAVES PVT. LTD.
 */
export async function generateOrderPdf({ order, settings, qrDataUrl }) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // Colors
  const brandDark = [64, 12, 12];     // #400C0C Deep Maroon
  const brandGold = [197, 160, 68];   // #C5A044 Zari Gold
  const textDark = [33, 33, 33];
  const textMuted = [110, 110, 110];
  const bgLight = [250, 248, 245];

  // Helper for text formatting
  const formatInr = (val) => `INR ${(parseFloat(val) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // ==========================================
  // PAGE 1: HEADER & COMPANY LETTERHEAD
  // ==========================================
  // Header background bar
  doc.setFillColor(...brandDark);
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Gold accent line
  doc.setFillColor(...brandGold);
  doc.rect(0, 28, pageWidth, 1.5, 'F');

  // Company Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text((settings?.company_name || 'SAHJANAND POLYWEAVES PVT. LTD.').toUpperCase(), margin, 12);

  // Slogan
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...brandGold);
  doc.text(settings?.slogan || 'Weaving Quality, Creating Excellence', margin, 17);

  // Contact Info on right
  doc.setFontSize(7.5);
  doc.setTextColor(220, 220, 220);
  doc.text(`Surat Textile Park, Sachin GIDC, Surat - 394230`, pageWidth - margin, 10, { align: 'right' });
  doc.text(`GSTIN: ${settings?.gstin || '24AAACS3829P1Z5'} | PAN: ${settings?.pan || 'AAACS3829P'}`, pageWidth - margin, 15, { align: 'right' });
  doc.text(`Phone: ${settings?.phone || '+91 98251 44550'}`, pageWidth - margin, 20, { align: 'right' });

  // Document Title Banner
  let y = 36;
  const isPo = order.doc_type === 'PURCHASE_ORDER';
  const docTitle = isPo ? 'PURCHASE ORDER CONFIRMATION' : 'PROFORMA SALES QUOTATION';

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...brandDark);
  doc.text(docTitle, margin, y);

  doc.setFontSize(9);
  doc.setTextColor(...brandGold);
  doc.text(`Status: ${(order.status || 'Draft').toUpperCase()}`, pageWidth - margin, y, { align: 'right' });

  y += 5;
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);

  // Document Metadata Table (2-column box)
  y += 6;
  const colW = contentWidth / 2;

  // Box 1: Document Details
  doc.setFillColor(...bgLight);
  doc.roundedRect(margin, y, colW - 3, 30, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...brandDark);
  doc.text('DOCUMENT DETAILS', margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...textDark);
  doc.text(`Doc Ref No:`, margin + 4, y + 12);
  doc.setFont('helvetica', 'bold');
  doc.text(`${order.order_number || 'DRAFT'}`, margin + 28, y + 12);

  doc.setFont('helvetica', 'normal');
  doc.text(`Date of Issue:`, margin + 4, y + 17);
  doc.text(`${new Date(order.created_at || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, margin + 28, y + 17);

  doc.text(`Delivery Date:`, margin + 4, y + 22);
  doc.text(`${order.delivery_date || 'Within 10-14 days'}`, margin + 28, y + 22);

  doc.text(`Payment Terms:`, margin + 4, y + 27);
  doc.text(`${order.payment_terms || '30% Advance, Balance on Dispatch'}`, margin + 28, y + 27);

  // Box 2: Buyer / Client Details
  doc.setFillColor(...bgLight);
  doc.roundedRect(margin + colW + 3, y, colW - 3, 30, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...brandDark);
  doc.text('BUYER / PARTY DETAILS', margin + colW + 7, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text(`${order.buyer_company_name || 'Client Name'}`, margin + colW + 7, y + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...textDark);
  doc.text(`Contact: ${order.buyer_contact_person || 'N/A'} | Mob: ${order.buyer_mobile || 'N/A'}`, margin + colW + 7, y + 17);
  doc.text(`GSTIN: ${order.buyer_gstin || 'Unregistered / Inter-state'}`, margin + colW + 7, y + 22);
  const addr = (order.buyer_billing_address || 'As specified').substring(0, 50);
  doc.text(`Address: ${addr}`, margin + colW + 7, y + 27);

  // ==========================================
  // PRODUCT & CUSTOMIZATION SPECIFICATIONS
  // ==========================================
  y += 37;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...brandDark);
  doc.text('PRODUCT & CUSTOMIZATION SPECIFICATIONS', margin, y);

  y += 4;
  doc.setFillColor(240, 240, 245);
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setFontSize(7.5);
  doc.setTextColor(...brandDark);
  doc.text('SPECIFICATION ITEM', margin + 4, y + 5);
  doc.text('CONFIGURED OPTION & SELECTION', margin + 70, y + 5);

  const specRows = [
    ['Product Name & Code', `${order.product_name} (${order.product_code})`],
    ['Customized Saree Colour', `${order.selected_colour_name || 'Original'} (Code: ${order.selected_colour_hex || 'Standard'})`],
    ['Zari Yarn Specification', `${order.selected_zari_name || 'Standard Tested Gold Zari'}`],
    ['Jacquard Design / Pattern', `${order.selected_design_name || 'Traditional Royal Kalka Paisley Jaal'}`],
    ['Weft / Accent Thread Spec', `${order.selected_thread_name || 'Standard Poly Filament Weft Thread'}`],
    ['Manufacturing & Finishing', getAppliedProcessesString(order.selected_processes_json)],
  ];

  y += 7;
  specRows.forEach(([label, value], i) => {
    if (i % 2 === 1) {
      doc.setFillColor(248, 248, 250);
      doc.rect(margin, y, contentWidth, 6, 'F');
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...textDark);
    doc.text(label, margin + 4, y + 4.2);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(40, 40, 40);
    doc.text(value.substring(0, 75), margin + 70, y + 4.2);
    y += 6;
  });

  // ==========================================
  // COMMERCIAL COST BREAKDOWN TABLE
  // ==========================================
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...brandDark);
  doc.text('COMMERCIAL COST BREAKDOWN & PRICING', margin, y);

  y += 4;
  // Table Header
  doc.setFillColor(...brandDark);
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text('SR', margin + 2, y + 4.8);
  doc.text('COMPONENT DESCRIPTION', margin + 12, y + 4.8);
  doc.text('RATE BASIS', margin + 95, y + 4.8);
  doc.text('UNIT SURCHARGE', margin + 130, y + 4.8);
  doc.text('AMOUNT (INR)', pageWidth - margin - 2, y + 4.8, { align: 'right' });

  y += 7;
  const costItems = [
    ['1', 'Base Fabric Manufacturing Cost', 'Per Saree (6.30m)', formatInr(order.base_price), formatInr(order.base_price)],
    ['2', `Colour Selection Surcharge (${order.selected_colour_name || 'Std'})`, 'Per Saree', formatInr(order.colour_cost || 0), formatInr(order.colour_cost || 0)],
    ['3', `Zari Yarn Cost (${order.selected_zari_name || 'Std'})`, 'Consumption Basis', formatInr(order.zari_cost || 0), formatInr(order.zari_cost || 0)],
    ['4', `Jacquard Design Card Charge (${order.selected_design_name || 'Std'})`, 'Pattern Surcharge', formatInr(order.design_cost || 0), formatInr(order.design_cost || 0)],
    ['5', `Thread Specification (${order.selected_thread_name || 'Std'})`, 'Weft Ply Basis', formatInr(order.thread_cost || 0), formatInr(order.thread_cost || 0)],
    ['6', 'Manufacturing, Diang & Finishing Processes', 'Accumulated Ops', formatInr(order.manufacturing_cost || 0), formatInr(order.manufacturing_cost || 0)],
  ];

  costItems.forEach(([sr, desc, basis, unit, amt], idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(250, 250, 252);
      doc.rect(margin, y, contentWidth, 5.5, 'F');
    }
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(...textDark);
    doc.text(sr, margin + 2, y + 3.8);
    doc.text(desc, margin + 12, y + 3.8);
    doc.text(basis, margin + 95, y + 3.8);
    doc.text(unit, margin + 130, y + 3.8);
    doc.text(amt, pageWidth - margin - 2, y + 3.8, { align: 'right' });
    y += 5.5;
  });

  // Table Subtotal Summary
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageWidth - margin, y);
  y += 2;

  // Right-aligned Financial Summary Block
  const summaryX = pageWidth - margin - 80;
  const valX = pageWidth - margin - 2;

  const printSummaryRow = (lbl, val, isBold = false, isGold = false) => {
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setFontSize(isBold ? 8 : 7.2);
    if (isGold) doc.setTextColor(...brandDark);
    else doc.setTextColor(...textDark);
    doc.text(lbl, summaryX, y + 3.5);
    doc.text(val, valX, y + 3.5, { align: 'right' });
    y += 4.5;
  };

  printSummaryRow('Net Unit Rate Per Saree:', formatInr(order.unit_price), true);
  printSummaryRow(`Total Order Quantity:`, `${order.quantity} Sarees (Pieces)`, true);
  printSummaryRow('Subtotal (Gross Value):', formatInr(order.subtotal));
  if (order.discount_amount > 0) {
    printSummaryRow(`Volume Discount (${order.discount_percentage}%):`, `- ${formatInr(order.discount_amount)}`);
  }
  printSummaryRow('Taxable Commercial Value:', formatInr(order.taxable_amount), true);
  printSummaryRow(`Applicable GST (${order.gst_rate}% - HSN 5407):`, formatInr(order.gst_amount));

  // Grand Total Box
  doc.setFillColor(...brandDark);
  doc.rect(summaryX - 4, y, 84 + 4, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('FINAL ORDER TOTAL:', summaryX, y + 5.5);
  doc.setTextColor(...brandGold);
  doc.text(formatInr(order.grand_total), valX, y + 5.5, { align: 'right' });

  // QR Code Tag Stamp (if available)
  if (qrDataUrl) {
    try {
      doc.addImage(qrDataUrl, 'PNG', margin, y - 25, 26, 26);
      doc.setFontSize(5.5);
      doc.setTextColor(...textMuted);
      doc.text('Scan to Verify Product Record', margin, y + 3);
    } catch {
      // Ignore if image addition fails
    }
  }

  // Terms and Signatures
  y += 14;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...brandDark);
  doc.text('TERMS & CONDITIONS:', margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(...textMuted);
  const termsText = [
    '1. 100% inspected at Surat weaving facility before packing.',
    '2. Price is ex-mill Surat; transportation and transit insurance on buyer account unless specified.',
    '3. Custom dye lot variations within standard textile tolerance (+/- 3%) accepted.',
    '4. Subject to Surat, Gujarat jurisdiction only.'
  ];
  termsText.forEach(t => {
    y += 3;
    doc.text(t, margin, y);
  });

  // Signature Blocks
  y += 12;
  const sigW = 60;
  // Buyer Signature
  doc.setDrawColor(180, 180, 180);
  doc.line(margin, y, margin + sigW, y);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textDark);
  doc.text('Buyer Authorized Signatory & Seal', margin, y + 4);

  // Seller Signature
  doc.line(pageWidth - margin - sigW, y, pageWidth - margin, y);
  doc.text('For SAHJANAND POLYWEAVES PVT. LTD.', pageWidth - margin - sigW, y + 4);
  doc.setFontSize(6);
  doc.setTextColor(...textMuted);
  doc.text('(Authorized Weaving Mill Signatory)', pageWidth - margin - sigW, y + 8);

  // Bottom Footer
  doc.setFontSize(6);
  doc.setTextColor(150, 150, 150);
  doc.text(`Generated securely by Sahjanand Enterprise System | Ref: ${order.order_number}`, pageWidth / 2, pageHeight - 5, { align: 'center' });

  return doc;
}

function getAppliedProcessesString(procJson) {
  if (!procJson) return 'Standard Edge Slitting & Steam Press';
  try {
    const list = typeof procJson === 'string' ? JSON.parse(procJson) : procJson;
    if (Array.isArray(list) && list.length > 0) {
      return list.map(p => p.name).join(', ');
    }
  } catch {
    // Ignore JSON parse error
  }
  return 'Standard Slitting & Iron Packaging';
}
