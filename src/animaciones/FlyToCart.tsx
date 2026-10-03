import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ShoppingBag, Check, ArrowRight } from 'lucide-react';
import { triggerHaptic } from './haptics';

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

export interface FlyToCartContainerProps {
  onOpenCart?: () => void;
  targetSelector?: string;
}

/**
 * Dispara la animación de vuelo parabólico suave del producto hacia el carrito.
 * 
 * @param source Evento de clic (React.MouseEvent o MouseEvent), HTMLElement o coordenadas { clientX, clientY }
 * @param imageUrl URL de la imagen del producto
 * @param productName Nombre opcional del producto
 * @param customTargetSelector Selector CSS opcional para el ícono de destino del carrito
 */
export function triggerFlyToCart(
  source: React.MouseEvent | MouseEvent | HTMLElement | { clientX: number; clientY: number },
  imageUrl: string,
  productName?: string,
  customTargetSelector?: string
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

  // Posición de destino predeterminada (esquina superior derecha en desktop)
  let targetX = window.innerWidth - 60;
  let targetY = 35;

  const headerCartBtn = customTargetSelector
    ? document.querySelector(customTargetSelector)
    : document.getElementById('header-cart-btn') || document.querySelector('.header-cart-btn');

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

/**
 * Contenedor visual que renderiza los productos flotantes en vuelo,
 * la notificación no invasiva para seguir comprando y el efecto +1 al aterrizar.
 * 
 * Colocar una sola vez en el componente raíz (App o layout):
 * <FlyToCartContainer onOpenCart={() => setCarritoAbierto(true)} />
 */
export function FlyToCartContainer({ onOpenCart }: FlyToCartContainerProps) {
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

      // Vibración ligera inicial al añadir
      triggerHaptic('light');

      // Notificación flotante no invasiva
      if (newItem.productName) {
        setToast({ id: newItem.id, name: newItem.productName });
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
          setToast(null);
        }, 3400);
      }

      // Animación de llegada (al aterrizar tras 1.05s)
      setTimeout(() => {
        setPlusOnes((prev) => [
          ...prev,
          { id: Date.now(), x: customEvent.detail.targetX, y: customEvent.detail.targetY },
        ]);

        triggerHaptic('success');

        // Efecto de rebote en los botones del carrito
        const headerBtn = document.getElementById('header-cart-btn');
        const mobileBtn = document.getElementById('mobile-cart-btn');
        [headerBtn, mobileBtn].forEach((btn) => {
          if (btn) {
            btn.classList.add('animate-bounce');
            setTimeout(() => btn.classList.remove('animate-bounce'), 800);
          }
        });
      }, 1050);

      // Limpiar el item tras completar el vuelo
      setTimeout(() => {
        setItems((prev) => prev.filter((it) => it.id !== newItem.id));
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
      {/* Elementos volando por la pantalla */}
      <div className="fixed inset-0 pointer-events-none z-[99999] overflow-hidden">
        {items.map((item) => {
          const midX = (item.startX + item.targetX) / 2 + (item.targetX > item.startX ? 40 : -40);
          const midY = Math.min(item.startY, item.targetY) - 100;

          return (
            <motion.div
              key={item.id}
              initial={{
                left: item.startX,
                top: item.startY,
                scale: 1,
                opacity: 1,
                rotate: 0,
              }}
              animate={{
                left: [item.startX, midX, item.targetX],
                top: [item.startY, midY, item.targetY],
                scale: [1, 1.25, 0.25],
                opacity: [1, 1, 0.85, 0],
                rotate: [0, -10, 15, 30],
              }}
              transition={{
                duration: 1.15,
                ease: [0.16, 1, 0.3, 1], // Desplazamiento fluido y suave
                times: [0, 0.55, 1],
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center will-change-transform"
            >
              {/* Contenedor del producto volador */}
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white p-1.5 shadow-2xl border-2 border-emerald-400 overflow-hidden ring-4 ring-emerald-500/25">
                <img
                  src={item.imageUrl}
                  alt={item.productName || 'Producto'}
                  className="w-full h-full object-cover rounded-xl"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-transparent pointer-events-none" />
                <Sparkles className="absolute top-1 right-1 w-4 h-4 text-emerald-500 animate-spin" />
              </div>
            </motion.div>
          );
        })}

        {/* Burbujita flotante +1 al aterrizar en el carrito */}
        <AnimatePresence>
          {plusOnes.map((p) => (
            <motion.div
              key={p.id}
              initial={{ left: p.x, top: p.y, scale: 0.5, opacity: 0 }}
              animate={{
                left: p.x,
                top: p.y - 45,
                scale: [0.5, 1.25, 1],
                opacity: [0, 1, 1, 0],
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-[100000] pointer-events-none"
            >
              <div className="px-2.5 py-1 rounded-full bg-emerald-600 text-white font-black text-xs shadow-lg flex items-center gap-1 border border-white/60">
                <Sparkles className="w-3 h-3 text-emerald-200" />
                <span>+1</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Barra de Notificación no invasiva: Podés seguir comprando */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.94 }}
            transition={{ type: 'spring', damping: 24, stiffness: 300 }}
            className="fixed bottom-24 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-[9999] pointer-events-auto"
          >
            <div className="bg-slate-900/95 backdrop-blur-md text-white p-3.5 sm:p-4 rounded-2xl shadow-2xl border border-slate-700/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-white truncate">
                    ¡{toast.name} agregado!
                  </p>
                  <p className="text-[11px] sm:text-xs text-slate-300">
                    Podés seguir comprando tranquilo
                  </p>
                </div>
              </div>

              {onOpenCart && (
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('medium');
                    onOpenCart();
                    setToast(null);
                  }}
                  className="shrink-0 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1 active:scale-95 cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Ver Carrito</span>
                  <ArrowRight className="w-3 h-3 ml-0.5" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
