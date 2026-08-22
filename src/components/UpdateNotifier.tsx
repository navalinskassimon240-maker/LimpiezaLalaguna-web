import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Sparkles, X } from 'lucide-react';

export function UpdateNotifier() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Extract filename (e.g. index-A123.js) from URL
    const getFilename = (url: string | null) => {
      if (!url) return '';
      const path = url.split('?')[0].split('#')[0];
      return path.split('/').pop() || '';
    };

    // Collect initial JS/CSS filenames loaded in current DOM
    const getInitialAssets = (): Set<string> => {
      const filenames = new Set<string>();
      document.querySelectorAll('script[src], link[rel="stylesheet"][href]').forEach((el) => {
        const src = el.getAttribute('src') || el.getAttribute('href');
        const fname = getFilename(src);
        if (fname && (fname.endsWith('.js') || fname.endsWith('.css'))) {
          filenames.add(fname);
        }
      });
      return filenames;
    };

    const initialAssets = getInitialAssets();

    // Check if server index.html has new bundle assets
    const checkForUpdates = async () => {
      if (initialAssets.size === 0) return;

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
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        let updateDetected = false;

        doc.querySelectorAll('script[src], link[rel="stylesheet"][href]').forEach((el) => {
          const src = el.getAttribute('src') || el.getAttribute('href');
          const fname = getFilename(src);
          if (fname && (fname.endsWith('.js') || fname.endsWith('.css')) && !initialAssets.has(fname)) {
            updateDetected = true;
          }
        });

        if (updateDetected) {
          setUpdateAvailable(true);
        }
      } catch {
        // Ignore network failures quietly
      }
    };

    // Wait 20 seconds before starting first check
    const initialTimer = setTimeout(() => {
      checkForUpdates();
    }, 20000);

    // Periodic check every 20 seconds
    const interval = setInterval(() => {
      checkForUpdates();
    }, 20000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
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
