import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Sparkles, X } from 'lucide-react';

export function UpdateNotifier() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Collect initially loaded JS/CSS asset paths & script signatures
    const getInitialFingerprint = () => {
      const assets = new Set<string>();
      let scriptSignature = '';

      document.querySelectorAll('script, link[rel="stylesheet"]').forEach((el) => {
        const src = el.getAttribute('src') || el.getAttribute('href');
        if (src) {
          assets.add(src.split('?')[0]);
          scriptSignature += src;
        }
      });

      return { assets, scriptSignature };
    };

    const initialData = getInitialFingerprint();

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
        
        let updateDetected = false;

        // 1. Check for new asset paths in scripts/links
        const assetRegex = /(?:src|href)=["']?([^"'\s>]+?\.(?:js|css))/gi;
        let match: RegExpExecArray | null;

        while ((match = assetRegex.exec(html)) !== null) {
          const assetUrl = match[1].split('?')[0];
          if (assetUrl && !initialData.assets.has(assetUrl)) {
            if (assetUrl.includes('/assets/') || assetUrl.includes('.js') || assetUrl.includes('.css')) {
              updateDetected = true;
              break;
            }
          }
        }

        // 2. Fallback: check if script tag contents or main index fingerprints changed
        if (!updateDetected && initialData.scriptSignature) {
          const fetchedScripts = (html.match(/<script[^>]*src=["']?([^"'\s>]+)/gi) || []).join('');
          if (fetchedScripts && fetchedScripts !== initialData.scriptSignature) {
            updateDetected = true;
          }
        }

        if (updateDetected) {
          setUpdateAvailable(true);
        }
      } catch {
        // Ignore network failures quietly
      }
    };

    // Check every 15 seconds to give Cloudflare time to deploy changes
    const initialTimer = setTimeout(() => {
      checkForUpdates();
    }, 15000);

    // Periodic check every 15 seconds
    const interval = setInterval(() => {
      checkForUpdates();
    }, 15000);

    // Also check on tab focus
    const handleActivity = () => {
      checkForUpdates();
    };
    window.addEventListener('focus', handleActivity);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
      window.removeEventListener('focus', handleActivity);
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
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed top-20 left-4 right-4 sm:top-auto sm:bottom-6 sm:left-6 sm:right-auto z-[60] sm:max-w-xs bg-slate-900/95 text-white py-2 px-3.5 rounded-full shadow-2xl backdrop-blur-xl border border-slate-700/80 touch-manipulation flex items-center justify-between gap-2.5 mx-auto sm:mx-0"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1 bg-blue-500/20 text-blue-400 rounded-full flex-shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
          </div>
          <span className="text-[12px] font-medium text-slate-200 truncate">
            Nueva versión disponible
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={handleReload}
            disabled={isRefreshing}
            className="bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-[11px] font-semibold py-1 px-3 rounded-full transition-all duration-150 flex items-center gap-1 cursor-pointer disabled:opacity-70 active:scale-95 shadow-sm"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Cargando...' : 'Actualizar'}</span>
          </button>

          <button
            onClick={() => setDismissed(true)}
            className="p-1 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
            title="Cerrar"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
