import React from 'react';
import { motion } from 'motion/react';

export interface BenefitTickerItem {
  icon?: React.ReactNode;
  title: string;
  badge?: string;
  badgeColor?: string;
}

export interface BenefitsTickerProps {
  items?: BenefitTickerItem[];
  duration?: number;
  className?: string;
}

const DEFAULT_BENEFITS: BenefitTickerItem[] = [
  {
    title: 'Envíos a Domicilio en el Día',
    badge: 'Rápido',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  {
    title: '10% de Descuento Efectivo o Transferencia',
    badge: 'Ahorro',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  {
    title: 'Combos Ahorro de Limpieza x 10 y 25 Lts',
    badge: 'Más Vendidos',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  {
    title: 'Venta Minorista y Mayorista para Empresas y Comercios',
    badge: 'Directo Fábrica',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
  },
  {
    title: 'Productos Concentrados de Máximo Rendimiento',
    badge: 'Calidad Premium',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
];

/**
 * Marquesina infinita fluida con pausa al pasar el cursor y degradados laterales.
 */
export function BenefitsTicker({
  items = DEFAULT_BENEFITS,
  duration = 35,
  className = '',
}: BenefitsTickerProps) {
  const duplicatedBenefits = [...items, ...items];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`relative w-full overflow-hidden bg-gradient-to-r from-blue-900 via-slate-900 to-teal-950 py-3.5 border-y border-emerald-500/20 shadow-md select-none group ${className}`}
    >
      {/* Máscaras de degradado lateral */}
      <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none" />

      <motion.div
        className="flex gap-4 sm:gap-8 whitespace-nowrap w-max"
        animate={{
          x: ['0%', '-50%'],
        }}
        transition={{
          repeat: Infinity,
          ease: 'linear',
          duration,
        }}
        whileHover={{ animationPlayState: 'paused' }}
      >
        {duplicatedBenefits.map((item, idx) => (
          <div
            key={idx}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-white shadow-sm hover:border-emerald-400/50 hover:bg-slate-800 transition-colors"
          >
            {item.icon && (
              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                {item.icon}
              </div>
            )}
            <span className="text-xs sm:text-sm font-semibold tracking-tight text-slate-100">
              {item.title}
            </span>
            {item.badge && (
              <span
                className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border shadow-2xs ${
                  item.badgeColor || 'bg-blue-100 text-blue-800 border-blue-300'
                }`}
              >
                {item.badge}
              </span>
            )}
            <span className="text-emerald-400/60 ml-2 font-black">•</span>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}
