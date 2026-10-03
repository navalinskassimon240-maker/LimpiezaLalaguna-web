import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ShoppingBag, Check, ArrowRight } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';
import { useCart } from '../context/CartContext';

export interface FlyItem {
  id: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  imageUrl: string;
  productName?: string;
}

interface ToastNotice {
  id: number;
  name: string;
}

/**
 * Triggers the Fly To Cart animation from a click event or DOM element.
 */
export function triggerFlyToCart(
  source: React.MouseEvent | HTMLElement | { clientX: number; clientY: number },
  imageUrl: string,
  productName?: string
) {
  let startX = window.innerWidth / 2;
  let startY = window.innerHeight / 2;

  if ('currentTarget' in source && source.currentTarget instanceof HTMLElement) {
    const rect = source.currentTarget.getBoundingClientRect();
    startX = rect.left + rect.width / 2;
    startY = rect.top + rect.height / 2;
  } else if ('clientX' in source && 'clientY' in source) {
    startX = source.clientX;
    startY = source.clientY;
  } else if (source instanceof HTMLElement) {
    const rect = source.getBoundingClientRect();
    startX = rect.left + rect.width / 2;
    startY = rect.top + rect.height / 2;
  }

  // Find destination: desktop header cart button or mobile bottom cart button
  let targetX = window.innerWidth - 60;
  let targetY = 35; // Default header position

  // Check for desktop header cart button
  const headerCartBtn = document.getElementById('header-cart-btn') || document.querySelector('.header-cart-btn');
  // Check for mobile cart button
  const mobileCartBtn = document.getElementById('mobile-cart-btn') || document.querySelector('.mobile-cart-btn');

  if (window.innerWidth < 768 && mobileCartBtn) {
    const rect = mobileCartBtn.getBoundingClientRect();
    targetX = rect.left + rect.width / 2;
    targetY = rect.top + rect.height / 2;
  } else if (headerCartBtn) {
    const rect = headerCartBtn.getBoundingClientRect();
    targetX = rect.left + rect.width / 2;
    targetY = rect.top + rect.height / 2;
  }

  window.dispatchEvent(
    new CustomEvent('fly-to-cart-trigger', {
      detail: {
        startX,
        startY,
        targetX,
        targetY,
        imageUrl,
        productName,
      },
    })
  );
}

export function FlyToCartContainer() {
  const { setIsCartOpen } = useCart();
  const [items, setItems] = useState<FlyItem[]>([]);
  const [plusOnes, setPlusOnes] = useState<{ id: number; x: number; y: number }[]>([]);
  const [toast, setToast] = useState<ToastNotice | null>(null);

  useEffect(() => {
    let toastTimeout: NodeJS.Timeout;

    const handleTrigger = (e: Event) => {
      const customEvent = e as CustomEvent<{
        startX: number;
        startY: number;
        targetX: number;
        targetY: number;
        imageUrl: string;
        productName?: string;
      }>;

      if (!customEvent.detail) return;

      const newItem: FlyItem = {
        id: Date.now() + Math.random(),
        startX: customEvent.detail.startX,
        startY: customEvent.detail.startY,
        targetX: customEvent.detail.targetX,
        targetY: customEvent.detail.targetY,
        imageUrl: customEvent.detail.imageUrl,
        productName: customEvent.detail.productName,
      };

      setItems((prev) => [...prev, newItem]);

      // When the item lands in the cart (after 1050ms)
      setTimeout(() => {
        triggerHaptic('success');

        // Target cart button bounce
        const headerCart = document.getElementById('header-cart-btn');
        const mobileCart = document.getElementById('mobile-cart-btn');
        if (headerCart) {
          headerCart.classList.add('animate-bounce');
          setTimeout(() => headerCart.classList.remove('animate-bounce'), 800);
        }
        if (mobileCart) {
          mobileCart.classList.add('animate-bounce');
          setTimeout(() => mobileCart.classList.remove('animate-bounce'), 800);
        }

        // Show floating +1 badge at destination
        const plusId = Date.now();
        setPlusOnes((prev) => [
          ...prev,
          { id: plusId, x: newItem.targetX, y: newItem.targetY },
        ]);
        setTimeout(() => {
          setPlusOnes((prev) => prev.filter((p) => p.id !== plusId));
        }, 1100);

        // Show gentle, non-blocking toast at the bottom to continue shopping
        if (newItem.productName) {
          setToast({ id: Date.now(), name: newItem.productName });
          clearTimeout(toastTimeout);
          toastTimeout = setTimeout(() => {
            setToast(null);
          }, 3500);
        }
      }, 1050);

      // Clean up item from flying state
      setTimeout(() => {
        setItems((prev) => prev.filter((i) => i.id !== newItem.id));
      }, 1300);
    };

    window.addEventListener('fly-to-cart-trigger', handleTrigger);
    return () => {
      window.removeEventListener('fly-to-cart-trigger', handleTrigger);
      clearTimeout(toastTimeout);
    };
  }, []);

  return (
    <>
      {/* Flying Products Layer */}
      <div className="fixed inset-0 pointer-events-none z-[99999] overflow-hidden">
        <AnimatePresence>
          {items.map((item) => {
            // Mid-arc control point for an organic, majestic parabolic curve upward
            const midY = Math.min(item.startY, item.targetY) - 100;
            const midX = (item.startX + item.targetX) / 2;

            return (
              <motion.div
                key={item.id}
                initial={{
                  x: item.startX - 32,
                  y: item.startY - 32,
                  scale: 0.6,
                  opacity: 1,
                  rotate: 0,
                }}
                animate={{
                  x: [item.startX - 32, midX, item.targetX - 24],
                  y: [item.startY - 32, midY, item.targetY - 24],
                  scale: [0.6, 1.25, 0.4],
                  opacity: [1, 1, 0.6],
                  rotate: [0, -12, 20],
                }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{
                  duration: 1.1,
                  ease: [0.25, 0.1, 0.25, 1], // Smooth, cinematic glide
                }}
                className="absolute w-16 h-16 rounded-2xl bg-white p-1.5 shadow-2xl border-2 border-emerald-400 flex flex-col items-center justify-center overflow-hidden"
                style={{
                  boxShadow: '0 12px 30px -5px rgba(16, 185, 129, 0.5), 0 0 20px rgba(52, 211, 153, 0.7)',
                }}
              >
                <img
                  src={item.imageUrl}
                  alt=""
                  className="w-full h-full object-cover rounded-xl"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="absolute -top-1 -right-1 bg-emerald-500 rounded-full p-1 text-white shadow-md">
                  <Sparkles className="w-3 h-3 animate-spin" />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Floating +1 Impact Badges at cart */}
        <AnimatePresence>
          {plusOnes.map((p) => (
            <motion.div
              key={p.id}
              initial={{ x: p.x - 16, y: p.y, opacity: 1, scale: 0.5 }}
              animate={{ y: p.y - 35, opacity: 0, scale: 1.3 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              className="absolute font-black text-xs text-white bg-emerald-600 px-2 py-0.5 rounded-full shadow-lg border border-white flex items-center gap-0.5"
            >
              <span>+1</span>
              <Sparkles className="w-2.5 h-2.5" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Non-intrusive Shopping Toast: Allows continuous shopping */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-20 md:bottom-6 left-4 right-4 sm:left-auto sm:right-6 z-[9990] sm:max-w-md bg-slate-900/95 text-white backdrop-blur-md px-4 py-3 rounded-2xl shadow-2xl border border-slate-700/80 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-100 truncate">
                  {toast.name}
                </p>
                <p className="text-[11px] text-emerald-400 font-medium">
                  Agregado al carrito · Podés seguir comprando
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setToast(null);
                setIsCartOpen(true);
              }}
              className="shrink-0 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 active:scale-95 shadow-sm"
            >
              <span>Ver Carrito</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
