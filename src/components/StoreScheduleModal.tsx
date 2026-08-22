import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, X, CheckCircle2, Phone, Sparkles } from 'lucide-react';
import { defaultStoreHours, getStoreStatus } from '../data/schedule';
import { siteConfig } from '../data/config';

interface StoreScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StoreScheduleModal({ isOpen, onClose }: StoreScheduleModalProps) {
  const [mounted, setMounted] = useState(false);
  const status = getStoreStatus(defaultStoreHours);
  const todayIndex = new Date().getDay();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden z-10 border border-slate-200 my-auto"
          >
            {/* Header with status */}
            <div className={`p-5 text-white ${status.isOpen ? 'bg-gradient-to-r from-emerald-600 to-teal-600' : 'bg-gradient-to-r from-rose-700 to-red-800'} relative overflow-hidden`}>
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2 rounded-2xl ${status.isOpen ? 'bg-white/20' : 'bg-white/15'} shrink-0`}>
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`inline-block w-2.5 h-2.5 rounded-full ${status.isOpen ? 'bg-emerald-300 animate-ping' : 'bg-rose-300 animate-pulse'}`} />
                      <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">{status.statusText}</h3>
                    </div>
                    <p className="text-xs text-white/90 font-medium truncate mt-0.5">{status.subText} • {status.nextEventText}</p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors shrink-0 ml-2"
                  aria-label="Cerrar modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-4 sm:p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h4 className="text-xs uppercase tracking-wider font-bold text-slate-500 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" /> {siteConfig.horarios.tituloModal}
                  </h4>
                  <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    {siteConfig.horarios.subtituloModal}
                  </span>
                </div>

                {/* Days list */}
                <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-2xl border border-slate-200/70">
                  {defaultStoreHours.schedule.map((day) => {
                    const isToday = day.dayIndex === todayIndex;
                    return (
                      <div
                        key={day.dayName}
                        className={`flex items-center justify-between py-2 px-2.5 rounded-xl transition-all text-xs sm:text-sm ${
                          isToday
                            ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20'
                            : 'text-slate-700 hover:bg-slate-100 font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className={isToday ? 'text-white' : 'text-slate-800'}>
                            {day.dayName}
                          </span>
                          {isToday && (
                            <span className="text-[9px] bg-white/20 text-white px-1.5 py-0.5 rounded-full font-extrabold uppercase">
                              Hoy
                            </span>
                          )}
                        </div>

                        <div className="text-right">
                          {day.isOpen && day.shifts.length > 0 ? (
                            <div className="flex flex-col sm:flex-row sm:gap-1.5 text-[11px] sm:text-xs">
                              {day.shifts.map((shift, idx) => (
                                <span key={idx} className={isToday ? 'text-white' : 'text-slate-600 font-semibold'}>
                                  {shift.open} - {shift.close} hs{idx < day.shifts.length - 1 ? '  • ' : ''}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className={`text-[11px] sm:text-xs font-semibold ${isToday ? 'text-white/80' : 'text-rose-500'}`}>
                              Cerrado
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Delivery / WhatsApp Info Note */}
              <div className="p-3 bg-blue-50/80 rounded-2xl border border-blue-100 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                  <span className="font-bold text-slate-800 block mb-0.5">{siteConfig.horarios.notaFueraDeHorarioTitulo}</span>
                  {siteConfig.horarios.notaFueraDeHorarioDesc}
                </div>
              </div>

              {/* Direct WhatsApp Call to Action */}
              <a
                href={`https://wa.me/${siteConfig.whatsapp.numero}?text=${encodeURIComponent('¡Hola! Quisiera consultar si están atendiendo en este momento.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-sm font-bold rounded-2xl shadow-md shadow-emerald-600/20 transition-all"
              >
                <Phone className="w-4 h-4" />
                <span>{siteConfig.horarios.textoBotonConsultaWhatsApp}</span>
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
