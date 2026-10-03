import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Bubble {
  id: number;
  size: number;
  left: number;
  duration: number;
  delay: number;
  drift: number;
  opacity: number;
}

const INITIAL_BUBBLES: Bubble[] = [
  { id: 1, size: 42, left: 8, duration: 12, delay: 0, drift: 24, opacity: 0.7 },
  { id: 2, size: 24, left: 16, duration: 9, delay: 2, drift: -18, opacity: 0.6 },
  { id: 3, size: 58, left: 24, duration: 15, delay: 1, drift: 30, opacity: 0.75 },
  { id: 4, size: 18, left: 32, duration: 8, delay: 4, drift: -15, opacity: 0.5 },
  { id: 5, size: 36, left: 40, duration: 11, delay: 0.5, drift: 20, opacity: 0.65 },
  { id: 6, size: 28, left: 52, duration: 10, delay: 3, drift: -25, opacity: 0.6 },
  { id: 7, size: 64, left: 62, duration: 16, delay: 1.5, drift: 35, opacity: 0.8 },
  { id: 8, size: 22, left: 70, duration: 9, delay: 5, drift: -20, opacity: 0.55 },
  { id: 9, size: 46, left: 78, duration: 13, delay: 2.5, drift: 28, opacity: 0.7 },
  { id: 10, size: 20, left: 86, duration: 8.5, delay: 4.5, drift: -12, opacity: 0.5 },
  { id: 11, size: 34, left: 92, duration: 11.5, delay: 1, drift: 22, opacity: 0.65 },
  { id: 12, size: 16, left: 4, duration: 7.5, delay: 3.5, drift: 10, opacity: 0.45 },
  { id: 13, size: 30, left: 45, duration: 10.5, delay: 6, drift: -22, opacity: 0.6 },
  { id: 14, size: 50, left: 82, duration: 14, delay: 3, drift: 18, opacity: 0.7 },
  { id: 15, size: 26, left: 96, duration: 9.5, delay: 5.5, drift: -15, opacity: 0.55 },
];

/**
 * Burbujas de frescura y jabón flotantes interactivas para hero / fondo.
 * Al hacer clic sobre una burbuja, explota con efecto pop y reaparece después de unos segundos.
 */
export function FreshnessBubbles() {
  const [poppedIds, setPoppedIds] = useState<Set<number>>(new Set());

  const handlePop = (id: number) => {
    setPoppedIds((prev) => new Set(prev).add(id));
    setTimeout(() => {
      setPoppedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 4000);
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {INITIAL_BUBBLES.map((bubble) => {
        const isPopped = poppedIds.has(bubble.id);

        return (
          <AnimatePresence key={bubble.id}>
            {!isPopped && (
              <motion.div
                initial={{
                  y: '105vh',
                  x: 0,
                  opacity: 0,
                  scale: 0.6,
                }}
                animate={{
                  y: '-15vh',
                  x: [0, bubble.drift, -bubble.drift / 2, bubble.drift * 0.8, 0],
                  opacity: [0, bubble.opacity, bubble.opacity * 0.9, bubble.opacity, 0],
                  scale: [0.6, 1, 1.05, 0.95, 1.1],
                }}
                exit={{
                  scale: [1, 1.4, 0],
                  opacity: [1, 0.8, 0],
                  filter: 'blur(4px)',
                  transition: { duration: 0.22, ease: 'easeOut' },
                }}
                transition={{
                  duration: bubble.duration,
                  delay: bubble.delay,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                onClick={() => handlePop(bubble.id)}
                style={{
                  left: `${bubble.left}%`,
                  width: `${bubble.size}px`,
                  height: `${bubble.size}px`,
                }}
                className="absolute rounded-full cursor-pointer pointer-events-auto select-none"
              >
                {/* Cuerpo de la burbuja con reflejo iridiscente */}
                <div
                  className="w-full h-full rounded-full transition-transform duration-200 hover:scale-115 active:scale-95"
                  style={{
                    background:
                      'radial-gradient(circle at 32% 28%, rgba(255, 255, 255, 0.9) 0%, rgba(219, 234, 254, 0.45) 30%, rgba(147, 197, 253, 0.25) 55%, rgba(59, 130, 246, 0.35) 85%, rgba(16, 185, 129, 0.3) 100%)',
                    boxShadow:
                      'inset -2px -2px 6px rgba(37, 99, 235, 0.3), inset 2px 2px 6px rgba(255, 255, 255, 0.8), 0 4px 12px rgba(59, 130, 246, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.65)',
                    backdropFilter: 'blur(1px)',
                  }}
                >
                  {/* Destello de luz superior */}
                  <div
                    className="absolute rounded-full bg-white opacity-85"
                    style={{
                      top: '18%',
                      left: '22%',
                      width: '28%',
                      height: '16%',
                      transform: 'rotate(-40deg)',
                      filter: 'blur(0.5px)',
                    }}
                  />
                  {/* Destello de luz inferior secundario */}
                  <div
                    className="absolute rounded-full bg-white/60"
                    style={{
                      bottom: '18%',
                      right: '24%',
                      width: '14%',
                      height: '9%',
                      transform: 'rotate(-30deg)',
                      filter: 'blur(0.5px)',
                    }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        );
      })}
    </div>
  );
}
