import React from 'react';
import { motion } from 'motion/react';

export interface RevealOnScrollProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number;
  duration?: number;
  once?: boolean;
}

/**
 * Componente para animar elementos suavemente al hacer scroll hacia abajo (Fade In Reveal).
 * 
 * Uso:
 * <RevealOnScroll direction="up" delay={0.1}>
 *    <TuComponente />
 * </RevealOnScroll>
 */
export function RevealOnScroll({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  distance = 24,
  duration = 0.6,
  once = true,
}: RevealOnScrollProps) {
  const getOffset = () => {
    switch (direction) {
      case 'up':
        return { y: distance };
      case 'down':
        return { y: -distance };
      case 'left':
        return { x: distance };
      case 'right':
        return { x: -distance };
      case 'none':
      default:
        return {};
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...getOffset() }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, margin: '-40px' }}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1], // Curva cúbica suave estilo Apple / iOS
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
