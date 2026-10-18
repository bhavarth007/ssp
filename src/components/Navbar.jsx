import React from 'react';
import { 
  Sparkles, 
  QrCode, 
  LayoutDashboard, 
  Layers, 
  Sun, 
  Moon, 
  ShieldCheck,
  Building2,
  Lock
} from 'lucide-react';
import { getAssetUrl } from '../utils/assetHelper';

export default function Navbar({ 
  currentView, 
  setCurrentView, 
  onOpenQrScanner, 
  theme, 
  setTheme,
  isAdminRoute = false
}) {
  const handleNav = (targetView) => {
    setCurrentView(targetView);
    const url = new URL(window.location.href);
    if (targetView === 'admin') {
      url.searchParams.set('view', 'admin');
      url.searchParams.delete('sku');
    } else {
      url.searchParams.delete('view');
    }
    window.history.pushState(null, '', url.pathname + url.search + url.hash);
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0e0e12]/85 border-b border-white/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand identity */}
        <div 
          className="flex items-center space-x-3 cursor-pointer" 
          onClick={() => handleNav(isAdminRoute ? 'admin' : 'presentation')}
        >
          <img 
            src={getAssetUrl('/assets/ssp-logo.svg')} 
            alt="SSP Sahjanand Polyweaves Logo" 
            className="w-10 h-10 object-contain rounded-xl shadow-lg shadow-amber-500/20 border border-amber-500/30 shrink-0" 
          />
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-serif font-bold text-sm sm:text-base tracking-wider text-white">
                SAHJANAND POLYWEAVES
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                PVT. LTD.
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 tracking-wider font-light hidden sm:block">
              Weaving Quality, Creating Excellence • Surat Weaving Facility
            </p>
          </div>
        </div>

        {/* View Switcher: ALWAYS ACCESSIBLE FOR EASY NAVIGATION */}
        <div className="flex items-center p-1 rounded-xl bg-zinc-900/90 border border-white/10 shadow-inner">
          <button
            onClick={() => handleNav('presentation')}
            className={`flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentView === 'presentation'
                ? 'gold-gradient-bg text-zinc-950 shadow-md font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Live Client Presentation</span>
            <span className="sm:hidden">Showroom</span>
          </button>

          <button
            onClick={() => handleNav('admin')}
            className={`flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentView === 'admin'
                ? 'bg-zinc-800 text-white shadow-md border border-white/20 font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Admin & Mill Portal</span>
            <span className="sm:hidden">Admin</span>
          </button>
        </div>

        {/* Right action controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Quick Direct Link: Admin Side Link / Client Showroom Link */}
          {currentView === 'presentation' ? (
            <a
              href="./?view=admin"
              onClick={(e) => {
                e.preventDefault();
                handleNav('admin');
              }}
              title="Go to Admin & Product Management Portal"
              className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 border border-amber-500/30 text-xs font-semibold transition active:scale-95 shadow-sm"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Admin Side</span>
            </a>
          ) : (
            <a
              href="./"
              onClick={(e) => {
                e.preventDefault();
                handleNav('presentation');
              }}
              title="Return to Live Client Presentation Showroom"
              className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold transition active:scale-95 shadow-sm"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Client Showroom</span>
            </a>
          )}

          {/* QR Scanner trigger */}
          <button
            onClick={onOpenQrScanner}
            title="Scan Saree Tag QR Code"
            className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-white/10 text-xs font-semibold transition active:scale-95 shadow-sm"
          >
            <QrCode className="w-4 h-4 text-amber-400" />
            <span className="hidden lg:inline">Scan QR Tag</span>
          </button>

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title="Toggle Ambient Theme"
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/60 border border-transparent hover:border-white/10 transition"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-300" />}
          </button>

          {/* Admin Mode Status Badge (Only shown in /admin) */}
          {currentView === 'admin' && (
            <div className="hidden xl:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-[11px] text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Admin Authority</span>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
