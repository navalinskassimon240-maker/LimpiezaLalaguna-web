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

    // First check after 20 seconds
    const initialTimer = setTimeout(() => {
      checkForUpdates();
    }, 20000);

    // Periodic check every 25 seconds
    const interval = setInterval(() => {
      checkForUpdates();
    }, 25000);

    // Also check when browser tab gains focus
    const handleFocus = () => {
      checkForUpdates();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
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
        className="fixed bottom-5 left-4 md:left-6 z-50 max-w-sm w-[calc(100vw-2rem)] bg-slate-900/95 text-white p-4 rounded-2xl shadow-2xl backdrop-blur-md border border-slate-700/60"
      >
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-blue-600/30 text-blue-400 rounded-xl border border-blue-500/30 flex-shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
          </div>

          <div className="flex-1 min-w-0 pr-1">
            <h4 className="font-semibold text-sm text-white flex items-center gap-1.5">
              <span>¡Actualización disponible!</span>
              <span className="inline-flex bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-emerald-500/30">
                NUEVO
              </span>
            </h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Se detectaron cambios en el sitio web. Presiona para refrescar.
            </p>

            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={handleReload}
                disabled={isRefreshing}
                className="flex-1 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-medium text-xs py-2 px-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 shadow-md active:scale-95 disabled:opacity-70 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Actualizando...' : 'Actualizar ahora'}</span>
              </button>

              <button
                onClick={() => setDismissed(true)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                title="Cerrar aviso"
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
