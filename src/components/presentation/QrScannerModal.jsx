import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  X, 
  Camera, 
  Search, 
  AlertCircle, 
  Sparkles, 
  RefreshCw,
  QrCode
} from 'lucide-react';

export default function QrScannerModal({
  isOpen,
  onClose,
  onProductFound,
  products = []
}) {
  const [manualCode, setManualCode] = useState('');
  const [scannerError, setScannerError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    let html5QrCode = null;

    const startScanner = async () => {
      try {
        setScannerError(null);
        setIsScanning(true);
        html5QrCode = new Html5Qrcode('qr-reader-container');
        scannerRef.current = html5QrCode;

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        };

        // Prefer rear camera on mobile
        await html5QrCode.start(
          { facingMode: 'environment' },
          config,
          (decodedText) => {
            handleCodeScanned(decodedText);
          },
          (errorMessage) => {
            // normal frame scan failures can be ignored
          }
        );
      } catch (err) {
        console.warn('Camera permission or availability warning:', err);
        setScannerError('Camera access unavailable or permission denied. Use manual code search or quick test chips below.');
        setIsScanning(false);
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(() => {}).then(() => {
          scannerRef.current.clear();
        });
      }
    };
  }, [isOpen]);

  const handleCodeScanned = (code) => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop().catch(() => {});
    }
    const clean = code.trim();
    // Search in loaded products or pass to parent to fetch via API
    onProductFound(clean);
    onClose();
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleCodeScanned(manualCode.trim());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg glass-card rounded-3xl border border-white/15 p-6 shadow-2xl bg-zinc-950/90 text-white space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl gold-gradient-bg text-zinc-950">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-white">Scan Saree QR Tag</h3>
              <p className="text-xs text-zinc-400">Point device camera at the physical saree tag</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Scanner Viewport */}
        <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-black/90 border border-white/10 flex items-center justify-center">
          <div id="qr-reader-container" className="w-full h-full" />

          {scannerError && (
            <div className="absolute inset-0 p-6 flex flex-col items-center justify-center text-center bg-zinc-950/95 space-y-3">
              <AlertCircle className="w-10 h-10 text-amber-400" />
              <p className="text-xs text-zinc-300 max-w-xs">{scannerError}</p>
            </div>
          )}
        </div>

        {/* Manual Fallback Input */}
        <form onSubmit={handleManualSubmit} className="space-y-2">
          <label className="text-xs font-medium text-zinc-300 block">
            Or Enter Saree Product Code / QR Token:
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="e.g. SP-BAN-01 or QR-SPB01-SURAT"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl gold-gradient-bg text-zinc-950 font-bold text-xs hover:scale-105 active:scale-95 transition"
            >
              Load Saree
            </button>
          </div>
        </form>

        {/* Quick Demo Scan Tags */}
        <div className="pt-2 border-t border-white/10">
          <p className="text-[11px] text-zinc-400 mb-2">Instant Tag Simulation (Tap any product tag):</p>
          <div className="flex flex-wrap gap-1.5">
            {products.map((p) => (
              <button
                key={p.id}
                onClick={() => handleCodeScanned(p.qr_identifier || p.product_code)}
                className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-amber-500/10 border border-white/10 hover:border-amber-500/40 text-[11px] text-zinc-300 hover:text-amber-300 transition"
              >
                🏷️ {p.product_code}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
