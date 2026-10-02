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

export default function App() {
  const [isAdminView, setIsAdminView] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const hash = window.location.hash.toLowerCase();
    const pathname = window.location.pathname.toLowerCase();
    const search = new URLSearchParams(window.location.search);
    return (
      hash === '#admin' ||
      hash === '#/admin' ||
      hash === '#admin-laguna' ||
      pathname === '/admin' ||
      pathname === '/admin-laguna' ||
      search.has('admin')
    );
  });

  useEffect(() => {
    const handleRouteChange = () => {
      const hash = window.location.hash.toLowerCase();
      const pathname = window.location.pathname.toLowerCase();
      const search = new URLSearchParams(window.location.search);
      setIsAdminView(
        hash === '#admin' ||
        hash === '#/admin' ||
        hash === '#admin-laguna' ||
        pathname === '/admin' ||
        pathname === '/admin-laguna' ||
        search.has('admin')
      );
    };

    window.addEventListener('hashchange', handleRouteChange);
    window.addEventListener('popstate', handleRouteChange);
    return () => {
      window.removeEventListener('hashchange', handleRouteChange);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  const handleBackToStore = () => {
    setIsAdminView(false);
    if (window.location.hash) {
      window.location.hash = '';
    }
    if (window.location.search.includes('admin')) {
      window.history.pushState({}, '', window.location.pathname);
    }
    if (window.location.pathname === '/admin' || window.location.pathname === '/admin-laguna') {
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
        
        <div className="relative z-10 flex flex-col min-h-screen">
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
          <UpdateNotifier />
        </div>
      </div>
    </CartProvider>
  );
}
