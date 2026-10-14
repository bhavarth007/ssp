import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  X, 
  FileText, 
  Download, 
  Share2, 
  CheckCircle2, 
  Building2, 
  User, 
  Phone, 
  MessageSquare, 
  MapPin, 
  Calendar, 
  CreditCard, 
  Truck, 
  Sparkles,
  Printer,
  ExternalLink
} from 'lucide-react';
import { generateOrderPdf } from '../../utils/pdfGenerator';
import { shareToWhatsApp, cleanIndianPhoneNumber } from '../../utils/whatsapp';
import { createOrder, getQrDataUrl } from '../../utils/api';

export default function CustomerOrderModal({
  isOpen,
  onClose,
  product,
  customization,
  calculation,
  settings,
  onOrderSaved
}) {
  const [docType, setDocType] = useState('PURCHASE_ORDER'); // 'PURCHASE_ORDER' or 'QUOTATION'
  const [buyerCompany, setBuyerCompany] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [buyerGstin, setBuyerGstin] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + (product?.lead_time_days || 12));
    return d.toISOString().split('T')[0];
  });
  const [paymentTerms, setPaymentTerms] = useState('30% Advance, Balance on L/R generation');
  const [shippingTerms, setShippingTerms] = useState('Ex-Mill Surat via Transport Cargo');
  const [specialNotes, setSpecialNotes] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [pdfBlob, setPdfBlob] = useState(null);
  const [pdfDoc, setPdfDoc] = useState(null);

  if (!isOpen) return null;

  const formatInr = (val) => `₹${(parseFloat(val) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!buyerCompany.trim()) {
      alert('Please enter the Buyer / Client Company Name');
      return;
    }

    try {
      setIsSubmitting(true);

      const orderPayload = {
        doc_type: docType,
        status: docType === 'PURCHASE_ORDER' ? 'Confirmed' : 'Quotation Sent',
        buyer_company_name: buyerCompany.trim(),
        buyer_contact_person: contactPerson.trim(),
        buyer_mobile: mobileNumber.trim(),
        buyer_whatsapp: whatsappNumber.trim() || mobileNumber.trim(),
        buyer_gstin: buyerGstin.trim(),
        buyer_billing_address: billingAddress.trim(),
        buyer_shipping_address: billingAddress.trim(),
        productId: product.id,
        quantity: calculation.quantity,
        colourId: customization.colour?.id,
        zariId: customization.zari?.id,
        designId: customization.design?.id,
        threadId: customization.thread?.id,
        processIds: (customization.processes || []).map(p => p.id),
        customDiscountPercent: calculation.discountPercentage,
        delivery_date: deliveryDate,
        payment_terms: paymentTerms,
        shipping_terms: shippingTerms,
        special_notes: specialNotes
      };

      const saved = await createOrder(orderPayload);
      setConfirmedOrder(saved);

      // Trigger Confetti Celebration!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Generate PDF & QR Code in background
      let qrDataUrl = null;
      try {
        const qrRes = await getQrDataUrl(product.qr_identifier || product.product_code);
        qrDataUrl = qrRes.qrDataUrl;
      } catch {}

      const doc = await generateOrderPdf({
        order: saved,
        settings,
        qrDataUrl
      });
      setPdfDoc(doc);
      const blob = doc.output('blob');
      setPdfBlob(blob);

      if (onOrderSaved) {
        onOrderSaved(saved);
      }
    } catch (err) {
      alert(`Error creating order: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadPdf = () => {
    if (pdfDoc && confirmedOrder) {
      pdfDoc.save(`${confirmedOrder.order_number}_Sahjanand.pdf`);
    }
  };

  const handleShareWhatsApp = async () => {
    if (!confirmedOrder) return;
    await shareToWhatsApp({
      order: confirmedOrder,
      settings,
      pdfBlob,
      pdfFileName: `${confirmedOrder.order_number}_Sahjanand.pdf`
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl my-auto glass-card rounded-3xl border border-white/20 p-5 sm:p-7 shadow-2xl bg-zinc-950/95 text-white space-y-6">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl gold-gradient-bg text-zinc-950 font-bold shadow-md">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-white">
                {confirmedOrder ? 'Commercial Purchase Order Confirmed' : 'Procurement Finalization & Purchase Order Review'}
              </h2>
              <p className="text-xs text-zinc-400">
                Mill Manufacturer: <strong className="text-amber-300">SAHJANAND POLYWEAVES PVT. LTD. (Surat)</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* IF ORDER IS CONFIRMED / CREATED */}
        {confirmedOrder ? (
          <div className="space-y-6 text-center py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-amber-400 block mb-1">
                Certified Commercial PO Generated
              </span>
              <h3 className="text-2xl font-serif font-bold text-white">
                {confirmedOrder.order_number}
              </h3>
              <p className="text-xs text-zinc-300 mt-1">
                Procuring Client: <strong className="text-white">{confirmedOrder.buyer_company_name}</strong>
              </p>
            </div>

            {/* Quick Financial Snapshot */}
            <div className="p-4 rounded-2xl bg-zinc-900 border border-white/10 max-w-md mx-auto grid grid-cols-2 gap-3 text-left">
              <div>
                <p className="text-[10px] text-zinc-400 uppercase">Textile SKU / Product</p>
                <p className="text-xs font-semibold text-white truncate">{confirmedOrder.product_name}</p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-400 uppercase">BOM Quantity</p>
                <p className="text-xs font-semibold text-white">{confirmedOrder.quantity} Units (Sarees)</p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-400 uppercase">Unit Ex-Mill Rate</p>
                <p className="text-xs font-semibold text-amber-300">{formatInr(confirmedOrder.unit_price)}</p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-400 uppercase">Grand Invoice Value (incl. GST)</p>
                <p className="text-xs font-bold gold-gradient-text">{formatInr(confirmedOrder.grand_total)}</p>
              </div>
            </div>

            {/* Prominent Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={handleDownloadPdf}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 border border-white/20 text-white font-bold text-sm shadow-lg active:scale-95 transition"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>DOWNLOAD CERTIFIED PDF PO</span>
              </button>

              <button
                onClick={handleShareWhatsApp}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 active:scale-95 transition"
              >
                <MessageSquare className="w-4 h-4" />
                <span>DISPATCH PO VIA WHATSAPP</span>
              </button>
            </div>

            <div className="pt-2">
              <button
                onClick={onClose}
                className="text-xs text-zinc-400 hover:text-white underline"
              >
                Return to Presentation Studio
              </button>
            </div>
          </div>
        ) : (
          /* FORM TO FILL BUYER DETAILS */
          <form onSubmit={handleSubmitOrder} className="space-y-4">
            
            {/* Document Type Selector */}
            <div className="flex items-center gap-2 p-1 rounded-xl bg-zinc-900 border border-white/10">
              <button
                type="button"
                onClick={() => setDocType('PURCHASE_ORDER')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
                  docType === 'PURCHASE_ORDER'
                    ? 'gold-gradient-bg text-zinc-950 shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Confirmed Purchase Order (PO)
              </button>
              <button
                type="button"
                onClick={() => setDocType('QUOTATION')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
                  docType === 'QUOTATION'
                    ? 'gold-gradient-bg text-zinc-950 shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Proforma Sales Quotation
              </button>
            </div>

            {/* Buyer Company & Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Procuring Entity / Buyer Corporate Name *
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={buyerCompany}
                    onChange={(e) => setBuyerCompany(e.target.value)}
                    placeholder="e.g. Mangal Silk Emporium Pvt. Ltd."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Authorized Procurement Officer / Merchant Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="e.g. Rajeshbhai Shah (Head Merchant)"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>

            {/* Phone & WhatsApp */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Direct Mobile / Procurement Contact
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="+91 98251 00000"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  WhatsApp Dispatch Number (for Direct PDF PO)
                </label>
                <div className="relative">
                  <MessageSquare className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="Same as mobile or +91..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Corporate GSTIN (15-digit GSTIN)
                </label>
                <input
                  type="text"
                  value={buyerGstin}
                  onChange={(e) => setBuyerGstin(e.target.value)}
                  placeholder="24AAAAA0000A1Z5"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 uppercase"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Consignee Billing & Mill Dispatch Address
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={billingAddress}
                  onChange={(e) => setBillingAddress(e.target.value)}
                  placeholder="Shop/Office No., Ring Road Textile Market, Surat / Ahmedabad, PIN"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Logistics & Payment */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Committed Mill Dispatch Date
                </label>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Commercial Settlement Terms
                </label>
                <input
                  type="text"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  placeholder="30% Advance, Balance against L/R"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Mill Logistics & Freight Terms
                </label>
                <input
                  type="text"
                  value={shippingTerms}
                  onChange={(e) => setShippingTerms(e.target.value)}
                  placeholder="Ex-Mill Surat via Transport Cargo"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Order Value Review Box */}
            <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-amber-500/30 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-zinc-400">Order Quantity & Mill Rate:</span>
                <p className="text-xs font-bold text-white">
                  {calculation.quantity} Sarees @ {formatInr(calculation.unitPrice)} each
                </p>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-zinc-400">Final PO Total (incl. 5% GST):</span>
                <p className="text-base font-bold gold-gradient-text">
                  {formatInr(calculation.grandTotal)}
                </p>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl gold-gradient-bg text-zinc-950 font-bold text-sm shadow-xl shadow-amber-500/20 hover:scale-[1.01] active:scale-[0.99] transition disabled:opacity-50"
              >
                {isSubmitting 
                  ? 'GENERATING CERTIFIED DOCUMENT...' 
                  : (docType === 'PURCHASE_ORDER' ? 'CONFIRM & ISSUE COMMERCIAL PURCHASE ORDER (PO)' : 'ISSUE PROFORMA SALES QUOTATION')
                }
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
