import React, { useState, useEffect } from 'react';
import { Menu, X, ShoppingCart, Droplets } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { siteConfig } from '../data/config';
import { StoreStatusBadge } from './StoreStatusBadge';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cartCount, setIsCartOpen } = useCart();
  
  const { scrollY } = useScroll();
  const headerY = useTransform(scrollY, [0, 100], [0, -5]);
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.95]);
  const headerBlur = useTransform(scrollY, [0, 100], ["blur(10px)", "blur(20px)"]);
  const headerBorder = useTransform(scrollY, [0, 100], ["rgba(255,255,255,0)", "rgba(226, 232, 240, 1)"]);
  
  // Force re-render to apply the framer-motion styles
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const unsubscribe = scrollY.on("change", (v) => setScrolled(v > 50));
    return () => unsubscribe();
  }, [scrollY]);

  return (
    <header className="fixed top-0 w-full z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo & Store Status */}
          <div className="flex items-center gap-2.5 sm:gap-4 shrink-1 min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 text-left shrink-1 min-w-0">
              <div 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 bg-gradient-to-br from-blue-600 via-teal-500 to-emerald-500 rounded-2xl flex items-center justify-center text-white font-black text-xl sm:text-2xl shadow-md shadow-emerald-500/20 hover:scale-105 transition-transform cursor-pointer border border-white/40 overflow-hidden"
                role="button"
                tabIndex={0}
                aria-label="Ir al inicio"
              >
                {siteConfig.marca.logoUrl ? (
                  <img 
                    src={siteConfig.marca.logoUrl} 
                    alt={siteConfig.marca.nombrePrincipal}
                    className="w-full h-full object-cover rounded-2xl"
                    onError={(e) => {
                      // Fallback if image fails to load or file doesn't exist yet
                      (e.target as HTMLElement).style.display = 'none';
                      const parent = (e.target as HTMLElement).parentElement;
                      if (parent && !parent.querySelector('.logo-fallback')) {
                        const span = document.createElement('span');
                        span.className = 'logo-fallback';
                        span.innerText = siteConfig.marca.letraIsotipo || 'L';
                        parent.appendChild(span);
                      }
                    }}
                  />
                ) : (
                  <span>{siteConfig.marca.letraIsotipo || 'L'}</span>
                )}
              </div>
              
              <div className="flex flex-col justify-center min-w-0">
                <span 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="text-lg sm:text-xl lg:text-2xl font-black tracking-tight text-slate-900 whitespace-nowrap leading-tight cursor-pointer hover:opacity-90 transition-opacity"
                  role="button"
                  tabIndex={0}
                >
                  <span className="text-blue-600 font-extrabold">{siteConfig.marca.nombrePrincipal}</span>
                  <span className="text-emerald-600 font-black">{siteConfig.marca.nombreResaltado}</span>
                </span>
                
                {/* Underneath title on mobile */}
                <div className="sm:hidden mt-1">
                  <StoreStatusBadge compact />
                </div>
              </div>
            </div>

            {/* Live Store Status Badge on Tablets and Desktops */}
            <div className="hidden sm:block">
              <StoreStatusBadge compact />
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-4 lg:space-x-8 items-center bg-slate-50/80 px-5 lg:px-6 py-2 rounded-full border border-slate-200/80 shadow-inner shrink-0">
            {siteConfig.navegacion.enlaces.map((item) => (
              <a 
                key={item.nombre}
                href={item.href} 
                className="text-[15px] lg:text-[17px] font-bold text-slate-700 hover:text-blue-600 transition-colors relative group py-1"
              >
                {item.nombre}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full"></span>
              </a>
            ))}
            
            <div className="h-6 w-[1px] bg-slate-300 mx-1 lg:mx-2"></div>
            
            <button 
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative p-1.5 lg:p-2 text-slate-700 hover:text-blue-600 transition-colors group active:scale-95"
              aria-label="Abrir carrito de compras"
            >
              <ShoppingCart className="w-6 h-6" />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0, y: 10 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 bg-gradient-to-r from-blue-600 to-emerald-600 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-lg"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </nav>

          {/* Mobile Menu Button & Cart */}
          <div className="md:hidden flex items-center gap-2 shrink-0">
            <button 
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 text-slate-700 hover:text-blue-600 active:scale-90 transition-all bg-slate-100/80 rounded-full shadow-sm"
              aria-label="Abrir carrito"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-md">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-slate-700 hover:text-blue-600 active:scale-90 transition-all bg-slate-100/80 p-2.5 rounded-full shadow-sm"
              aria-label="Menú de navegación"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/95 backdrop-blur-2xl border-t border-slate-100 absolute w-full shadow-2xl overflow-hidden"
          >
            <div className="px-4 pt-4 pb-6 space-y-1 sm:px-6 flex flex-col gap-2">
              <div className="pb-3 mb-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Estado del local:</span>
                <StoreStatusBadge />
              </div>
              {siteConfig.navegacion.enlaces.map((item) => (
                <a 
                  key={item.nombre}
                  href={item.href} 
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-3 text-lg font-bold text-slate-700 hover:text-blue-600 hover:bg-blue-50/50 rounded-2xl transition-all"
                >
                  {item.nombre}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
