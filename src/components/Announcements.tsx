import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { siteConfig } from '../data/config';

interface Novedad {
  id: string;
  tag: string;
  tagColor: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  fallbackUrl?: string;
  whatsappMessage: string;
  ctaText: string;
}

export function Announcements() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedNovedad, setSelectedNovedad] = useState<Novedad | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const novedades: Novedad[] = siteConfig.novedades.lista;

  // Auto-slide to the right every 4.5 seconds
  useEffect(() => {
    if (isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % novedades.length);
    }, 4500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, novedades.length]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % novedades.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + novedades.length) % novedades.length);
  };

  const current = novedades[currentIndex];

  return (
    <section id="novedades" className="py-14 sm:py-18 bg-gradient-to-b from-transparent via-blue-50/30 to-transparent relative scroll-mt-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Encabezado Principal Centrado y Prolijo */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100/80 text-blue-700 text-xs sm:text-sm font-bold uppercase tracking-wider mb-3 shadow-sm">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>{siteConfig.novedades.etiquetaSuperior}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {siteConfig.novedades.tituloSeccion}
          </h2>
          <p className="mt-2 text-slate-600 text-sm sm:text-base">
            {siteConfig.novedades.subtituloSeccion}
          </p>
        </div>

        {/* Gran Showcase Slider Centrado */}
        <div className="relative mx-auto max-w-4xl">
          
          {/* Card Principal con Alto Cómodo */}
          <div 
            className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200/90 bg-slate-950 min-h-[380px] sm:min-h-[460px] md:min-h-[500px] flex items-end group select-none"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
          >
            {/* Imagen Principal con Transición Suave hacia la derecha */}
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, x: 70 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -70 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="absolute inset-0 cursor-pointer flex items-center justify-center bg-slate-950"
                onClick={() => setSelectedNovedad(current)}
              >
                <img
                  src={current.imageUrl}
                  alt={current.title}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    if (current.fallbackUrl && (e.currentTarget.src !== current.fallbackUrl)) {
                      e.currentTarget.src = current.fallbackUrl;
                    }
                  }}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 brightness-[0.82]"
                />
                {/* Degradado cinematográfico para máxima legibilidad del texto */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/10 pointer-events-none" />
              </motion.div>
            </AnimatePresence>

            {/* Badge de Categoría y Botón de Ampliar (Superior) */}
            <div className="absolute top-5 left-5 right-5 z-20 flex justify-between items-center pointer-events-none">
              <span className={`px-4 py-1.5 rounded-full text-xs font-black tracking-wider uppercase shadow-lg pointer-events-auto ${current.tagColor}`}>
                {current.tag}
              </span>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedNovedad(current);
                }}
                className="pointer-events-auto bg-black/50 hover:bg-black/80 text-white px-3.5 py-1.5 rounded-full backdrop-blur-md transition-all shadow-md flex items-center gap-1.5 text-xs font-bold active:scale-95 border border-white/10"
                title="Ampliar foto"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ver foto completa</span>
              </button>
            </div>

            {/* Contenido Inferior Centrado / Elegante */}
            <div className="relative z-20 w-full p-6 sm:p-8 md:p-10 text-white">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id + '-content'}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35 }}
                  className="max-w-2xl"
                >
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight drop-shadow-md mb-2">
                    {current.title}
                  </h3>
                  <p className="text-sm sm:text-base text-slate-200 font-medium leading-relaxed drop-shadow line-clamp-2">
                    {current.subtitle}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Indicadores de Páginas y Progreso */}
              <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-white/10">
                {novedades.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    aria-label={`Ir a foto ${idx + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      currentIndex === idx ? 'w-8 bg-blue-400 shadow-sm' : 'w-2 bg-white/40 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Flechas Laterales de Navegación */}
            <button
              onClick={handlePrev}
              aria-label="Foto anterior"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/40 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md border border-white/10 shadow-lg transition-all transform hover:scale-105 active:scale-95"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Foto siguiente"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/40 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md border border-white/10 shadow-lg transition-all transform hover:scale-105 active:scale-95"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

          </div>

          {/* Fila de Miniaturas Centrada y Prolija */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            {novedades.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => setCurrentIndex(idx)}
                className={`relative rounded-2xl overflow-hidden p-2 text-left border-2 transition-all flex items-center gap-3 ${
                  currentIndex === idx
                    ? 'bg-white border-blue-600 shadow-md ring-2 ring-blue-600/20'
                    : 'bg-white/70 border-slate-200/80 hover:bg-white hover:border-slate-300 opacity-70 hover:opacity-100'
                }`}
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    if (item.fallbackUrl && (e.currentTarget.src !== item.fallbackUrl)) {
                      e.currentTarget.src = item.fallbackUrl;
                    }
                  }}
                  className="w-12 h-12 rounded-xl object-cover shrink-0 shadow-sm"
                />
                <div className="min-w-0">
                  <p className="text-xs font-black text-slate-900 truncate leading-tight">{item.title}</p>
                  <p className="text-[11px] font-semibold text-slate-500 truncate mt-0.5">{item.tag}</p>
                </div>
              </button>
            ))}
          </div>

        </div>

      </div>

      {/* Modal / Lightbox para ver la imagen con su descripción */}
      <AnimatePresence>
        {selectedNovedad && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedNovedad(null)}
            className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 pt-24 pb-8 sm:p-6 sm:pt-24 sm:pb-8 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.93, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.93, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-lg sm:max-w-xl w-full max-h-[calc(100vh-7rem)] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-700/80 flex flex-col my-auto"
            >
              <button
                onClick={() => setSelectedNovedad(null)}
                aria-label="Cerrar imagen"
                className="absolute top-3.5 right-3.5 z-20 w-9 h-9 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition-all shadow-md border border-white/20 active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="w-full bg-slate-950 flex items-center justify-center overflow-hidden shrink min-h-0">
                <img 
                  src={selectedNovedad.imageUrl} 
                  alt={selectedNovedad.title}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    if (selectedNovedad.fallbackUrl && (e.currentTarget.src !== selectedNovedad.fallbackUrl)) {
                      e.currentTarget.src = selectedNovedad.fallbackUrl;
                    }
                  }}
                  className="w-full h-auto max-h-[48vh] sm:max-h-[52vh] object-contain mx-auto"
                />
              </div>

              {/* Pie con Título y Descripción (sin botón de WhatsApp) */}
              <div className="p-4 sm:p-5 bg-slate-900 border-t border-slate-800 shrink-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${selectedNovedad.tagColor}`}>
                    {selectedNovedad.tag}
                  </span>
                </div>
                <h4 className="text-base sm:text-lg font-bold text-white leading-snug">
                  {selectedNovedad.title}
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed mt-1">
                  {selectedNovedad.subtitle}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
}
