import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X } from 'lucide-react';
import { siteConfig } from '../data/config';
import { createWhatsAppUrl } from '../utils/whatsapp';

export function FloatingWhatsApp() {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  const defaultMessage = siteConfig.whatsappFlotante.mensajePredeterminado;
  const whatsappUrl = createWhatsAppUrl(siteConfig.whatsapp.numero, defaultMessage);

  return (
    <div className="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom,0px))] right-[calc(1rem+env(safe-area-inset-right,0px))] sm:bottom-7 sm:right-7 z-40 flex flex-col items-end pointer-events-auto select-none">
      {/* Floating Mini Bubble / Tooltip */}
      <AnimatePresence>
        {isTooltipOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-2.5 sm:mb-3 bg-white rounded-2xl p-3 sm:p-3.5 shadow-xl border border-slate-200/90 text-slate-800 max-w-[230px] sm:max-w-[260px] relative"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsTooltipOpen(false);
              }}
              aria-label="Cerrar mensaje"
              className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <p className="text-xs font-bold text-slate-900 mb-0.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
              {siteConfig.whatsappFlotante.tituloBurbuja}
            </p>
            <p className="text-[11px] text-slate-600 leading-tight">
              {siteConfig.whatsappFlotante.textoBurbuja}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Floating Button with subtle levitation animation & mobile optimization */}
      <motion.a
        id="btn-whatsapp-flotante"
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar por WhatsApp ante cualquier duda"
        initial={{ scale: 0, opacity: 0, y: 0 }}
        animate={{
          scale: 1,
          opacity: 1,
          y: [0, -6, 0]
        }}
        transition={{
          y: {
            duration: 2.8,
            repeat: Infinity,
            ease: 'easeInOut'
          },
          scale: { duration: 0.3 },
          opacity: { duration: 0.3 }
        }}
        whileHover={{ scale: 1.08, y: -3 }}
        whileTap={{ scale: 0.92 }}
        onMouseEnter={() => setIsTooltipOpen(true)}
        className="group relative flex items-center justify-center p-3 sm:p-3.5 md:p-4 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-xl sm:shadow-2xl shadow-[#25D366]/40 transition-colors duration-300 ring-4 ring-white/90"
      >
        {/* Radar Pulse Effect */}
        <span className="absolute -inset-1 rounded-full bg-[#25D366] opacity-30 animate-ping pointer-events-none group-hover:hidden" />

        {/* WhatsApp Icon */}
        <svg
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="0"
          fill="currentColor"
          className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white relative z-10 transition-transform duration-300 group-hover:rotate-6"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.888 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>

        {/* Text Pill expand on desktop hover */}
        <span className="hidden md:inline-block max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap text-xs font-black text-white pl-0 group-hover:pl-2">
          {siteConfig.whatsappFlotante.textoPillHover}
        </span>
      </motion.a>
    </div>
  );
}
