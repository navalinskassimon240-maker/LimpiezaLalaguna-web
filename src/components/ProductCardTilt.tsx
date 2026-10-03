import React, { useState, useRef, useEffect } from 'react';
import { motion, useSpring } from 'motion/react';

interface ProductCardTiltProps {
  key?: React.Key;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  isCombo?: boolean;
}

export function ProductCardTilt({
  children,
  className = '',
  onClick,
  isCombo = false,
}: ProductCardTiltProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50, opacity: 0 });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 768);
    }
  }, []);

  // Spring physics for buttery smooth 3D tilt (desktop only)
  const springConfig = { damping: 20, stiffness: 260, mass: 0.5 };
  const rotateX = useSpring(0, springConfig);
  const rotateY = useSpring(0, springConfig);
  const scale = useSpring(1, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouchDevice || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const maxTilt = 7;
    const rotX = -((y - centerY) / centerY) * maxTilt;
    const rotY = ((x - centerX) / centerX) * maxTilt;

    rotateX.set(rotX);
    rotateY.set(rotY);

    setGlarePosition({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.35,
    });
  };

  const handleMouseEnter = () => {
    if (isTouchDevice) return;
    setIsHovered(true);
    scale.set(1.02);
  };

  const handleMouseLeave = () => {
    if (isTouchDevice) return;
    setIsHovered(false);
    rotateX.set(0);
    rotateY.set(0);
    scale.set(1);
    setGlarePosition((prev) => ({ ...prev, opacity: 0 }));
  };

  if (isTouchDevice) {
    // Pure, performant mobile version with zero 3D overhead and gentle scroll reveal
    return (
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-30px" }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        onClick={onClick}
        whileTap={{ scale: 0.98 }}
        className={`relative overflow-hidden active:shadow-md transition-shadow select-none ${className}`}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      style={{ perspective: 1000 }} 
      className="h-full"
    >
      <motion.div
        ref={cardRef}
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          scale,
          transformStyle: 'preserve-3d',
        }}
        className={`relative overflow-hidden cursor-pointer select-none transition-shadow duration-300 ${className}`}
      >
        {/* Dynamic Holographic Glare Reflection (desktop only) */}
        <div
          className="absolute inset-0 pointer-events-none z-30 transition-opacity duration-300 rounded-3xl"
          style={{
            opacity: glarePosition.opacity,
            background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, ${
              isCombo ? 'rgba(52, 211, 153, 0.45)' : 'rgba(255, 255, 255, 0.55)'
            } 0%, rgba(255, 255, 255, 0) 65%)`,
            mixBlendMode: 'overlay',
          }}
        />

        {/* Content with 3D Depth */}
        <div style={{ transform: 'translateZ(18px)', transformStyle: 'preserve-3d' }}>
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}
