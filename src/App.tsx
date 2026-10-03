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

// Helper to check if current route matches the secret /staff0 path exclusively
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

  useEffect(() => {
    const handleRouteChange = () => {
      setIsAdminView(checkIsAdminRoute());
    };

    // Secret custom event (e.g. from 5 logo clicks or secret footer click)
    const handleOpenAdmin = () => {
      setIsAdminView(true);
      window.location.hash = '#staff0';
    };

    // Secret keyboard shortcut: Ctrl + Shift + L (or Alt + L) for desktop
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
      <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans selection:bg-blue-200 selection:text-blue-900 scroll-smooth relative overflow-hidden">
        {/* Lightweight subtle background */}
        <div className="fixed inset-0 z-0 pointer-events-none bg-gradient-to-b from-blue-50/40 via-white to-slate-50/50" />
        
        <div className="relative z-10 flex flex-col min-h-screen pb-16 md:pb-0">
          <Header />
          <main className="flex-grow">
            <Hero />
            <Announcements />
            <Products />
            <Services />
          </main>
          <Footer />
          <Cart />
          <FloatingWhatsApp />
          <MobileBottomBar />
          <UpdateNotifier />
        </div>
      </div>
    </CartProvider>
  );
}