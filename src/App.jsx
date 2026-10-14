import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import PresentationApp from './components/presentation/PresentationApp';
import AdminDashboard from './components/admin/AdminDashboard';
import QrScannerModal from './components/presentation/QrScannerModal';
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
    return window.location.pathname.toLowerCase().includes('/admin');
  });

  const [currentView, setCurrentView] = useState(() => {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('/admin')) return 'admin';
    return 'presentation';
  });

  const [theme, setTheme] = useState('dark');
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  
  // Core Entities State
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

  // Handle URL change / back-forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      if (path.includes('/admin')) {
        setIsAdminRoute(true);
        setCurrentView('admin');
      } else {
        setIsAdminRoute(false);
        setCurrentView('presentation');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

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
        const matched = prodsRes.find(p => 
          p.product_code?.toLowerCase() === requestedCode.toLowerCase() || 
          p.qr_identifier?.toLowerCase() === requestedCode.toLowerCase()
        );
        if (matched) {
          setSelectedProduct(matched);
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

  // Enterprise Dynamic Document Title & URL synchronization
  useEffect(() => {
    if (currentView === 'admin') {
      document.title = 'Enterprise Management Portal | Sahjanand Polyweaves Pvt. Ltd.';
    } else if (selectedProduct) {
      document.title = `${selectedProduct.product_code} — ${selectedProduct.name} | Sahjanand Polyweaves`;
      // Cleanly sync URL state without page reload
      const currentUrlParams = new URLSearchParams(window.location.search);
      if (currentUrlParams.get('sku') !== selectedProduct.product_code) {
        const newUrl = `/presentation?sku=${encodeURIComponent(selectedProduct.product_code)}`;
        window.history.replaceState(null, '', newUrl);
      }
    }
  }, [selectedProduct, currentView]);

  // Handle QR Product Scan
  const handleProductFoundFromQr = async (code) => {
    try {
      const found = await getProduct(code);
      if (found) {
        setSelectedProduct(found);
        setCurrentView('presentation');
      }
    } catch (err) {
      const matched = products.find(p => 
        p.product_code?.toLowerCase() === code.toLowerCase() || 
        p.qr_identifier?.toLowerCase() === code.toLowerCase()
      );
      if (matched) {
        setSelectedProduct(matched);
        setCurrentView('presentation');
      } else {
        alert(`Saree product with QR code "${code}" not found in factory database.`);
      }
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
