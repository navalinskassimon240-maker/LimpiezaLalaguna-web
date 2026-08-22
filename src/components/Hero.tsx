import React from 'react';
import { motion } from 'motion/react';
import { ArrowDown, Sparkles } from 'lucide-react';
import { siteConfig } from '../data/config';

export function Hero() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      // Custom smooth scroll animation
      const offsetTop = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section id="inicio" className="relative bg-transparent overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-10">
        <svg className="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M0 40V0H40" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" className="text-blue-900" />
        </svg>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <div className="pt-28 pb-16 md:pt-36 md:pb-24 flex flex-col items-center">
          
          {/* Text Content */}
          <div className="w-full">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50/90 backdrop-blur-md text-emerald-800 font-bold mb-4 sm:mb-6 border border-emerald-200 shadow-sm text-sm sm:text-base"
            >
              <Sparkles className="h-4 w-4 text-emerald-600" />
              <span>{siteConfig.inicio.etiquetaArriba}</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl sm:text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4 sm:mb-6"
            >
              {siteConfig.inicio.tituloLinea1} <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-teal-600 to-emerald-600 drop-shadow-sm">
                {siteConfig.inicio.tituloLinea2}
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-4 text-lg sm:text-xl text-slate-600 mb-10 max-w-2xl mx-auto"
            >
              {siteConfig.inicio.descripcion}
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.button 
                whileHover={{ scale: 1.03, y: -3 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => scrollToSection(siteConfig.inicio.destinoBotonPrimario || 'productos')} 
                className="group inline-flex justify-center items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white font-bold rounded-2xl transition-all shadow-lg hover:shadow-emerald-500/25"
              >
                {siteConfig.inicio.textoBotonPrimario}
                <ArrowDown className="h-5 w-5 group-hover:animate-bounce" />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.03, y: -3 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => scrollToSection(siteConfig.inicio.destinoBotonSecundario || 'servicios')} 
                className="group inline-flex justify-center items-center gap-2 px-8 py-4 bg-white/90 backdrop-blur-md border-2 border-slate-200 hover:border-emerald-500 hover:text-emerald-700 text-slate-700 font-bold rounded-2xl transition-all shadow-sm"
              >
                {siteConfig.inicio.textoBotonSecundario}
                <ArrowDown className="h-5 w-5 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 group-hover:animate-bounce transition-all text-emerald-600" />
              </motion.button>
            </motion.div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
