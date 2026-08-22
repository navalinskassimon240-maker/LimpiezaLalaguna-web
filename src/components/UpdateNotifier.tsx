import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Sparkles, X } from 'lucide-react';

export function UpdateNotifier() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Collect initially loaded JS/CSS asset paths
    const getLoadedAssets = (): Set<string> => {
      const assets = new Set<string>();
      document.querySelectorAll('script[src], link[rel="stylesheet"]').forEach((el) => {
        const src = el.getAttribute('src') || el.getAttribute('href');
        if (src) {
          assets.add(src.split('?')[0]);
        }
      });
      return assets;
    };

    const initialAssets = getLoadedAssets();

    const checkForUpdates = async () => {
      try {
        // Fetch index.html bypassing cache
        const res = await fetch(`/?_t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
          },
        });

        if (!res.ok) return;

        const html = await res.text();
        
        // Extract script and link hrefs from fetched HTML
        const assetRegex = /(?:src|href)=["']([^"']+\.(?:js|css))["']/g;
        let match: RegExpExecArray | null;
        let foundNewAsset = false;

        while ((match = assetRegex.exec(html)) !== null) {
          const assetUrl = match[1].split('?')[0];
          // If we find an asset in the fetched HTML that wasn't in our initial DOM assets
          if (assetUrl && !initialAssets.has(assetUrl)) {
            if (assetUrl.includes('/assets/') || assetUrl.includes('.js') || assetUrl.includes('.css')) {
              foundNewAsset = true;
              break;
            }
          }
        }

        if (foundNewAsset) {
          setUpdateAvailable(true);
        }
      } catch {
        // Ignore network failures quietly
      }
    };

    // Initial fast check after 3 seconds
    const initialTimer = setTimeout(() => {
      checkForUpdates();
    }, 3000);

    // Fast check every 5 seconds to catch new deploys instantly
    const interval = setInterval(() => {
      checkForUpdates();
    }, 5000);

    // Also check on user interaction and tab focus
    const handleActivity = () => {
      checkForUpdates();
    };
    window.addEventListener('focus', handleActivity);
    window.addEventListener('click', handleActivity, { once: false });

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
      window.removeEventListener('focus', handleActivity);
      window.removeEventListener('click', handleActivity);
    };
  }, []);

  const handleReload = () => {
    setIsRefreshing(true);
    window.location.reload();
  };

  if (!updateAvailable || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] left-[calc(1rem+env(safe-area-inset-left,0px))] md:bottom-6 md:left-6 z-50 max-w-sm w-[calc(100vw-2rem)] sm:w-auto sm:min-w-[340px] bg-slate-900/95 text-white p-3.5 sm:p-4 rounded-2xl shadow-2xl backdrop-blur-md border border-slate-700/60 touch-manipulation"
      >
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-blue-600/30 text-blue-400 rounded-xl border border-blue-500/30 flex-shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
          </div>

          <div className="flex-1 min-w-0 pr-0.5">
            <h4 className="font-semibold text-sm text-white flex items-center gap-1.5 flex-wrap">
              <span>¡Actualización disponible!</span>
              <span className="inline-flex bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-emerald-500/30">
                NUEVO
              </span>
            </h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Se detectaron cambios en la tienda. Presiona para refrescar.
            </p>

            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={handleReload}
                disabled={isRefreshing}
                className="flex-1 min-h-[42px] sm:min-h-[38px] bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 active:from-blue-700 active:to-emerald-700 text-white font-medium text-xs px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-md active:scale-95 disabled:opacity-70 cursor-pointer touch-manipulation"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="font-semibold">{isRefreshing ? 'Actualizando...' : 'Actualizar ahora'}</span>
              </button>

              <button
                onClick={() => setDismissed(true)}
                className="min-h-[42px] min-w-[42px] sm:min-h-[38px] sm:min-w-[38px] flex items-center justify-center p-2 text-slate-400 hover:text-white hover:bg-slate-800 active:bg-slate-700 rounded-xl transition-colors cursor-pointer touch-manipulation"
                title="Cerrar aviso"
                aria-label="Cerrar aviso de actualización"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
