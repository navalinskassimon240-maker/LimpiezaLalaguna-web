/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Announcements } from './components/Announcements';
import { Services } from './components/Services';
import { Products } from './components/Products';
import { Footer } from './components/Footer';
import { CartProvider } from './context/CartContext';
import { Cart } from './components/Cart';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { UpdateNotifier } from './components/UpdateNotifier';
import { AdminPanel } from './components/AdminPanel';
import { MobileBottomBar } from './components/MobileBottomBar';
import { BenefitsTicker } from './components/BenefitsTicker';
import { FlyToCartContainer } from './components/FlyToCart';
import { RevealOnScroll } from './components/RevealOnScroll';
import { AnimationViewerModal } from './components/AnimationViewerModal';
import { Sparkles } from 'lucide-react';

// Helper para verificar ruta secreta /staff0
const checkIsAdminRoute = () => {
  if (typeof window === 'undefined') return false;
  const hash = window.location.hash.toLowerCase().replace('#/', '#');
  const pathname = window.location.pathname.toLowerCase().replace(/\/$/, '');

  const isStaff0Hash = hash === '#staff0';
  const isStaff0Path = pathname === '/staff0';

  return isStaff0Hash || isStaff0Path;
};

export default function App() {
  const [isAdminView, setIsAdminView] = useState<boolean>(checkIsAdminRoute);
  const [isAnimationsModalOpen, setIsAnimationsModalOpen] = useState(false);

  useEffect(() => {
    const handleRouteChange = () => {
      setIsAdminView(checkIsAdminRoute());
    };

    const handleOpenAdmin = () => {
      setIsAdminView(true);
      window.location.hash = '#staff0';
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.shiftKey && (e.key === 'L' || e.key === 'l')) ||
          (e.altKey && (e.key === 'L' || e.key === 'l'))) {
        e.preventDefault();
        setIsAdminView(true);
        window.location.hash = '#staff0';
      }
    };

    window.addEventListener('hashchange', handleRouteChange);
    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('open-admin-panel', handleOpenAdmin);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('hashchange', handleRouteChange);
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('open-admin-panel', handleOpenAdmin);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleBackToStore = () => {
    setIsAdminView(false);
    if (window.location.hash) {
      window.location.hash = '';
    }
    if (window.location.search) {
      window.history.pushState({}, '', window.location.pathname);
    }
    const pathname = window.location.pathname.toLowerCase();
    if (pathname === '/staff0') {
      window.history.pushState({}, '', '/');
    }
  };

  if (isAdminView) {
    return <AdminPanel onBackToStore={handleBackToStore} />;
  }

  return (
    <CartProvider>
      <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans selection:bg-blue-200 selection:text-blue-900 scroll-smooth relative">
        {/* Fondo sutil degradado */}
        <div className="fixed inset-0 z-0 pointer-events-none bg-gradient-to-b from-blue-50/40 via-white to-slate-50/50" />
        
        <div className="relative z-10 flex flex-col min-h-screen pb-24 md:pb-0">
          <Header />
          <main className="flex-grow">
            <Hero />
            {/* Cinta continua de beneficios */}
            <BenefitsTicker />
            
            {/* Novedades y promociones con revelado suave */}
            <RevealOnScroll direction="up" delay={0.1}>
              <Announcements />
            </RevealOnScroll>
            
            {/* Catálogo con tarjetas 3D */}
            <Products />
            
            {/* Servicios con revelado suave */}
            <RevealOnScroll direction="up" delay={0.1}>
              <Services />
            </RevealOnScroll>
          </main>
          
          <Footer />
          <Cart />
          
          {/* Contenedor de animación de productos volando al carrito */}
          <FlyToCartContainer />
          
          <FloatingWhatsApp />
          <MobileBottomBar />
          <UpdateNotifier />

          {/* Botón flotante para ver y probar las animaciones */}
          <button 
            type="button"
            onClick={() => setIsAnimationsModalOpen(true)}
            className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] md:bottom-7 left-4 z-40 bg-slate-900/90 hover:bg-slate-800 text-white backdrop-blur-md px-3.5 py-2.5 rounded-2xl shadow-xl border border-slate-700/80 flex items-center gap-2 text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Ver y probar todas las animaciones"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Ver Animaciones & Código</span>
            <span className="sm:hidden">Animaciones</span>
          </button>

          <AnimationViewerModal 
            isOpen={isAnimationsModalOpen} 
            onClose={() => setIsAnimationsModalOpen(false)} 
          />
        </div>
      </div>
    </CartProvider>
  );
}