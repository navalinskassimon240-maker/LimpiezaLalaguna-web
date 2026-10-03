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

// Fixed seed of natural-looking soap/freshness bubbles
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

export function FreshnessBubbles() {
  const [poppedIds, setPoppedIds] = useState<Set<number>>(new Set());

  const handlePop = (id: number) => {
    setPoppedIds((prev) => new Set(prev).add(id));
    // Respawn bubble after 4 seconds
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
                  scale: 0.8,
                }}
                animate={{
                  y: '-10vh',
                  x: [0, bubble.drift, -bubble.drift / 2, bubble.drift / 3, 0],
                  opacity: [0, bubble.opacity, bubble.opacity, bubble.opacity * 0.8, 0],
                  scale: [0.8, 1, 1.05, 0.98, 1],
                }}
                transition={{
                  duration: bubble.duration,
                  delay: bubble.delay,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                onClick={() => handlePop(bubble.id)}
                className="absolute pointer-events-auto cursor-pointer transition-transform hover:scale-125"
                style={{
                  left: `${bubble.left}%`,
                  width: bubble.size,
                  height: bubble.size,
                }}
                title="¡Hacé clic para explotar la burbuja!"
              >
                {/* Bubble Sphere */}
                <div
                  className="w-full h-full rounded-full relative backdrop-blur-[1px] transition-all duration-300"
                  style={{
                    background:
                      'radial-gradient(circle at 35% 30%, rgba(255, 255, 255, 0.85) 0%, rgba(220, 252, 231, 0.35) 30%, rgba(167, 243, 208, 0.15) 60%, rgba(56, 189, 248, 0.25) 100%)',
                    boxShadow:
                      'inset 0 0 10px rgba(255, 255, 255, 0.7), inset -2px -2px 6px rgba(16, 185, 129, 0.25), 0 4px 15px rgba(16, 185, 129, 0.12)',
                    border: '1px solid rgba(255, 255, 255, 0.65)',
                  }}
                >
                  {/* Gloss / Shine Highlight */}
                  <div
                    className="absolute rounded-full bg-white/90"
                    style={{
                      top: '18%',
                      left: '22%',
                      width: `${Math.max(4, bubble.size * 0.25)}px`,
                      height: `${Math.max(3, bubble.size * 0.16)}px`,
                      transform: 'rotate(-35deg)',
                      filter: 'blur(0.5px)',
                    }}
                  />
                  {/* Secondary Tiny Specular Glint */}
                  <div
                    className="absolute rounded-full bg-white/70"
                    style={{
                      bottom: '22%',
                      right: '25%',
                      width: `${Math.max(2, bubble.size * 0.12)}px`,
                      height: `${Math.max(2, bubble.size * 0.12)}px`,
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
