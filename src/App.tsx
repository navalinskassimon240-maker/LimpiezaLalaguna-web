/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Announcements } from './components/Announcements';
import { Services } from './components/Services';
import { Products } from './components/Products';
import { Footer } from './components/Footer';
import { CartProvider } from './context/CartContext';
import { Cart } from './components/Cart';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';

export default function App() {
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
        </div>
      </div>
    </CartProvider>
  );
}
