import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import PresentationApp from './components/presentation/PresentationApp';
import AdminDashboard from './components/admin/AdminDashboard';
import QrScannerModal from './components/presentation/QrScannerModal';
import FullScreenCatwalkTheater from './components/presentation/FullScreenCatwalkTheater';
import { 
  getProducts, 
  getProduct, 
  getColours, 
  getZari, 
  getDesigns, 
  getThreads, 
  getProcesses, 
  getSettings,
  getOrders 
} from './utils/api';

export default function App() {
  const [isAdminRoute, setIsAdminRoute] = useState(() => {
    const path = window.location.pathname.toLowerCase();
    const search = new URLSearchParams(window.location.search);
    const hash = window.location.hash.toLowerCase();
    return path.includes('/admin') || search.get('view') === 'admin' || hash.includes('admin');
  });

  const [currentView, setCurrentView] = useState(() => {
    const path = window.location.pathname.toLowerCase();
    const search = new URLSearchParams(window.location.search);
    const hash = window.location.hash.toLowerCase();
    if (path.includes('/admin') || search.get('view') === 'admin' || hash.includes('admin')) return 'admin';
    return 'presentation';
  });

  const [theme, setTheme] = useState('dark');
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [fullscreenVideoProduct, setFullscreenVideoProduct] = useState(null);
  const [brandName, setBrandName] = useState(() => {
    try {
      return localStorage.getItem('ssp_client_brand') || 'Royal Heritage Silks';
    } catch {
      return 'Royal Heritage Silks';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('ssp_client_brand', brandName);
    } catch {}
  }, [brandName]);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [colours, setColours] = useState([]);
  const [zariOptions, setZariOptions] = useState([]);
  const [designs, setDesigns] = useState([]);
  const [threads, setThreads] = useState([]);
  const [processes, setProcesses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sync theme class to html element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Handle URL change / back-forward navigation and hash change
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      const search = new URLSearchParams(window.location.search);
      const hash = window.location.hash.toLowerCase();
      const isAdm = path.includes('/admin') || search.get('view') === 'admin' || hash.includes('admin');
      setIsAdminRoute(isAdm);
      setCurrentView(isAdm ? 'admin' : 'presentation');
    };
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  useEffect(() => {
    setIsAdminRoute(currentView === 'admin');
  }, [currentView]);

  // Master initial data fetch on mount
  useEffect(() => {
    refreshAllData();
  }, []);

  const refreshAllData = async () => {
    try {
      const [
        prodsRes,
        coloursRes,
        zariRes,
        designsRes,
        threadsRes,
        procRes,
        settingsRes,
        ordersRes
      ] = await Promise.all([
        getProducts(),
        getColours(),
        getZari(),
        getDesigns(),
        getThreads(),
        getProcesses(),
        getSettings(),
        getOrders()
      ]);

      setProducts(prodsRes);
      setColours(coloursRes);
      setZariOptions(zariRes);
      setDesigns(designsRes);
      setThreads(threadsRes);
      setProcesses(procRes);
      setSettings(settingsRes);
      setOrders(ordersRes);

      // Enterprise URL routing: Check query parameters (?sku=, ?code=, ?qr=) and path (/product/:code, /sku/:code)
      const urlParams = new URLSearchParams(window.location.search);
      let requestedCode = urlParams.get('sku') || urlParams.get('code') || urlParams.get('qr');
      
      const pathname = window.location.pathname;
      if (!requestedCode) {
        const pathMatch = pathname.match(/\/(?:product|sku|qr)\/([^/?#]+)/i);
        if (pathMatch) requestedCode = pathMatch[1];
      }

      if (requestedCode && prodsRes.length > 0) {
        const cleanRequested = requestedCode.trim();
        const norm = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const targetClean = norm(cleanRequested);
        
        let matched = prodsRes.find(p => 
          norm(p.product_code) === targetClean || 
          norm(p.qr_identifier) === targetClean ||
          (p.product_code && p.product_code.toLowerCase() === cleanRequested.toLowerCase()) ||
          (p.qr_identifier && p.qr_identifier.toLowerCase() === cleanRequested.toLowerCase())
        );

        if (!matched) {
          // Substring match e.g. 'rani', 'indigo', 'meena', '03'
          matched = prodsRes.find(p =>
            norm(p.product_code).includes(targetClean) ||
            norm(p.name).includes(targetClean) ||
            targetClean.includes(norm(p.product_code))
          );
        }

        if (matched) {
          setSelectedProduct(matched);
          setCurrentView('presentation');
          // IMMEDIATELY LAUNCH FULLSCREEN 4K CATWALK VIDEO!
          setFullscreenVideoProduct(matched);
        } else {
          setSelectedProduct(prodsRes[0]);
        }
      } else if (!selectedProduct && prodsRes.length > 0) {
        setSelectedProduct(prodsRes[0]);
      } else if (selectedProduct) {
        const refreshed = prodsRes.find(p => p.id === selectedProduct.id);
        if (refreshed) setSelectedProduct(refreshed);
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Enterprise Dynamic Document Title & URL synchronization (Preserving repository base path)
  useEffect(() => {
    const url = new URL(window.location.href);
    let urlChanged = false;

    // Anchor pathname securely so refreshing always requests /ssp/ (or / locally)
    const isGhPages = window.location.pathname.startsWith('/ssp');
    const safeBase = isGhPages ? '/ssp/' : '/';

    if (currentView === 'admin') {
      document.title = 'Enterprise Management Portal | Sahjanand Polyweaves Pvt. Ltd.';
      if (url.searchParams.get('view') !== 'admin') {
        url.searchParams.set('view', 'admin');
        url.searchParams.delete('sku');
        urlChanged = true;
      }
    } else {
      if (url.searchParams.get('view') === 'admin') {
        url.searchParams.delete('view');
        urlChanged = true;
      }
      if (selectedProduct) {
        document.title = `${selectedProduct.product_code} — ${selectedProduct.name} | Sahjanand Polyweaves`;
        if (url.searchParams.get('sku') !== selectedProduct.product_code) {
          url.searchParams.set('sku', selectedProduct.product_code);
          urlChanged = true;
        }
      }
    }

    if (urlChanged || window.location.pathname !== safeBase) {
      window.history.replaceState(null, '', safeBase + url.search + url.hash);
    }
  }, [selectedProduct, currentView]);

  // Handle QR Product Scan (Intelligently resolves any numeric tag e.g. 23423, SKU, or URL)
  const handleProductFoundFromQr = async (code) => {
    if (!code) return;
    const raw = String(code).trim();
    
    // 1. If scanned code is a full URL, extract the SKU or code parameter
    let target = raw;
    try {
      if (raw.startsWith('http://') || raw.startsWith('https://')) {
        const u = new URL(raw);
        target = u.searchParams.get('sku') || u.searchParams.get('code') || u.searchParams.get('qr') || u.pathname.split('/').pop() || raw;
      }
    } catch (e) {}

    // 2. Direct match by SKU or QR identifier or numeric ID
    const norm = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const targetNorm = norm(target);

    let found = products.find(p => 
      p.product_code?.toLowerCase() === target.toLowerCase() ||
      p.qr_identifier?.toLowerCase() === target.toLowerCase() ||
      norm(p.product_code) === targetNorm ||
      norm(p.qr_identifier) === targetNorm ||
      String(p.id) === target
    );

    // 3. Substring/partial match (e.g. contains 'meena', '01', 'indigo', 'rani', etc.)
    if (!found) {
      found = products.find(p => 
        p.product_code?.toLowerCase().includes(target.toLowerCase()) ||
        p.name?.toLowerCase().includes(target.toLowerCase()) ||
        norm(p.product_code).includes(targetNorm) ||
        norm(p.name).includes(targetNorm) ||
        targetNorm.includes(norm(p.product_code))
      );
    }

    // 4. API lookup
    if (!found) {
      try {
        found = await getProduct(target);
      } catch (e) {}
    }

    // 5. Fallback for arbitrary external tags (like physical numbers 23423)
    if (!found && products.length > 0) {
      const digitsOnly = target.replace(/[^0-9]/g, '');
      const parsedNum = parseInt(digitsOnly, 10);
      const idx = !isNaN(parsedNum) ? (parsedNum % products.length) : 0;
      found = products[idx] || products[0];
    }

    if (found) {
      setSelectedProduct(found);
      setCurrentView('presentation');
      // IMMEDIATELY LAUNCH FULLSCREEN 4K CATWALK VIDEO!
      setFullscreenVideoProduct(found);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'bg-[#0c0c0e] text-[#ededed]' : 'bg-[#f7f6f2] text-[#1c1c20]'}`}>
      
      {/* Top Header Navigation */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenQrScanner={() => setIsQrScannerOpen(true)}
        theme={theme}
        setTheme={setTheme}
        isAdminRoute={isAdminRoute}
      />

      {/* Main App Container */}
      <main className="flex-1">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-12 h-12 rounded-full border-4 border-amber-500/20 border-t-amber-400 animate-spin" />
            <p className="font-serif text-sm tracking-widest text-amber-300">
              CONNECTING TO SAHJANAND TEXTILE DATABASE...
            </p>
          </div>
        ) : (
          <>
            {currentView === 'presentation' ? (
              <PresentationApp
                products={products}
                selectedProduct={selectedProduct}
                setSelectedProduct={setSelectedProduct}
                colours={colours}
                zariOptions={zariOptions}
                designs={designs}
                threads={threads}
                processes={processes}
                settings={settings}
                onOpenQrScanner={() => setIsQrScannerOpen(true)}
                onLaunchFullscreenVideo={(p) => setFullscreenVideoProduct(p || selectedProduct)}
                brandName={brandName}
                setBrandName={setBrandName}
              />
            ) : (
              <AdminDashboard
                products={products}
                orders={orders}
                colours={colours}
                zariOptions={zariOptions}
                designs={designs}
                threads={threads}
                processes={processes}
                settings={settings}
                onRefreshData={refreshAllData}
                onSelectProductForPresentation={(p) => {
                  setSelectedProduct(p);
                  setCurrentView('presentation');
                }}
              />
            )}
          </>
        )}
      </main>

      {/* Fullscreen Saree Catwalk Runway Theater (Launched upon QR Scan) */}
      {fullscreenVideoProduct && (
        <FullScreenCatwalkTheater
          product={fullscreenVideoProduct}
          onComplete={() => setFullscreenVideoProduct(null)}
          onSkipToCustomize={() => setFullscreenVideoProduct(null)}
          brandName={brandName}
        />
      )}

      {/* Camera QR Scanner Modal */}
      <QrScannerModal
        isOpen={isQrScannerOpen}
        onClose={() => setIsQrScannerOpen(false)}
        onProductFound={handleProductFoundFromQr}
        products={products}
      />

    </div>
  );
}
