import React from 'react';
import { Home, ShoppingBag, Flame, ShoppingCart, MessageCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { siteConfig } from '../data/config';

// Vibración táctil integrada (sin depender de ningún archivo externo)
function triggerHaptic(type: 'light' | 'medium' | 'success' | 'warning' = 'light') {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      if (type === 'medium') navigator.vibrate(18);
      else navigator.vibrate(10);
    } catch {
      // Ignorar si no está soportado
    }
  }
}

function createWhatsAppUrl(phone: string, text?: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const encodedText = text ? encodeURIComponent(text) : '';
  return `https://wa.me/${cleanPhone}${encodedText ? `?text=${encodedText}` : ''}`;
}

export function MobileBottomBar() {
  const { cartCount, setIsCartOpen } = useCart();

  const scrollTo = (id: string) => {
    triggerHaptic('light');
    const el = document.getElementById(id);
    if (el) {
      const offsetTop = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOpenWhatsApp = () => {
    triggerHaptic('medium');
    const url = createWhatsAppUrl(
      siteConfig.whatsapp.numero,
      '¡Hola Limpieza Lalaguna! Estoy viendo la página desde el celular y quisiera hacer una consulta.'
    );
    window.location.href = url;
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 shadow-[0_-8px_20px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-5 items-center justify-around px-2 py-1.5 max-w-lg mx-auto">
        
        {/* 1. Inicio */}
        <button
          onClick={() => {
            triggerHaptic('light');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex flex-col items-center justify-center py-1 px-1 text-slate-600 hover:text-blue-600 active:scale-90 transition-all"
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-0.5">Inicio</span>
        </button>

        {/* 2. Catálogo */}
        <button
          onClick={() => scrollTo('productos')}
          className="flex flex-col items-center justify-center py-1 px-1 text-slate-600 hover:text-blue-600 active:scale-90 transition-all"
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-0.5">Catálogo</span>
        </button>

        {/* 3. Novedades / Ofertas */}
        <button
          onClick={() => scrollTo('novedades')}
          className="flex flex-col items-center justify-center py-1 px-1 text-slate-600 hover:text-emerald-600 active:scale-90 transition-all"
        >
          <Flame className="w-5 h-5 text-emerald-600 animate-pulse" />
          <span className="text-[10px] font-bold mt-0.5">Ofertas</span>
        </button>

        {/* 4. Carrito con Badge */}
        <button
          id="mobile-cart-btn"
          onClick={() => {
            triggerHaptic('medium');
            setIsCartOpen(true);
          }}
          className="mobile-cart-btn flex flex-col items-center justify-center py-1 px-1 text-slate-700 hover:text-blue-600 active:scale-90 transition-all relative"
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5 text-blue-600" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-gradient-to-r from-blue-600 to-emerald-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white shadow-xs animate-bounce">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold mt-0.5">Carrito</span>
        </button>

        {/* 5. WhatsApp */}
        <button
          onClick={handleOpenWhatsApp}
          className="flex flex-col items-center justify-center py-1 px-1 text-emerald-600 hover:text-emerald-700 active:scale-90 transition-all"
        >
          <MessageCircle className="w-5 h-5 fill-emerald-500 text-emerald-600" />
          <span className="text-[10px] font-bold mt-0.5">WhatsApp</span>
        </button>

      </div>
    </div>
  );
}
