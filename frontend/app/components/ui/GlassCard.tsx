'use client';

import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import React, { useRef } from 'react';

type GlowAccent = 'cyan' | 'blue' | 'purple' | 'none';
type GlassVariant = 'default' | 'strong' | 'subtle';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: GlowAccent;
  variant?: GlassVariant;
  hover?: boolean;
  tilt?: boolean;
  onClick?: () => void;
  padding?: string;
}

const glowStyles: Record<GlowAccent, { shadow: string; hoverShadow: string; border: string; hoverBorder: string }> = {
  cyan: {
    shadow: '0 8px 32px rgba(34,211,238,0.06)',
    hoverShadow: '0 20px 60px rgba(34,211,238,0.16), 0 8px 24px rgba(0,0,0,0.4)',
    border: 'rgba(34,211,238,0.12)',
    hoverBorder: 'rgba(34,211,238,0.35)',
  },
  blue: {
    shadow: '0 8px 32px rgba(59,130,246,0.06)',
    hoverShadow: '0 20px 60px rgba(59,130,246,0.18), 0 8px 24px rgba(0,0,0,0.4)',
    border: 'rgba(59,130,246,0.15)',
    hoverBorder: 'rgba(59,130,246,0.4)',
  },
  purple: {
    shadow: '0 8px 32px rgba(139,92,246,0.06)',
    hoverShadow: '0 20px 60px rgba(139,92,246,0.18), 0 8px 24px rgba(0,0,0,0.4)',
    border: 'rgba(139,92,246,0.15)',
    hoverBorder: 'rgba(139,92,246,0.4)',
  },
  none: {
    shadow: '0 4px 16px rgba(0,0,0,0.3)',
    hoverShadow: '0 16px 40px rgba(0,0,0,0.5)',
    border: 'rgba(255,255,255,0.06)',
    hoverBorder: 'rgba(255,255,255,0.14)',
  },
};

const variantClasses: Record<GlassVariant, string> = {
  default: 'glass',
  strong: 'glass-strong',
  subtle: 'glass-subtle',
};

const TILT_RANGE = 10; // max degrees

export default function GlassCard({
  children,
  className = '',
  glow = 'cyan',
  variant = 'default',
  hover = true,
  tilt = true,
  onClick,
  padding = 'p-6',
}: GlassCardProps) {
  const { shadow, hoverShadow, border, hoverBorder } = glowStyles[glow];
  const glassClass = variantClasses[variant];
  const cardRef = useRef<HTMLDivElement>(null);

  // Raw motion values
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  // Smooth with spring
  const rotateX = useSpring(useTransform(rawY, [-1, 1], [TILT_RANGE, -TILT_RANGE]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(rawX, [-1, 1], [-TILT_RANGE, TILT_RANGE]), { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hover || !tilt) return;
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = (e.clientX - rect.left) / rect.width - 0.5;  // -0.5 to 0.5
    const cy = (e.clientY - rect.top) / rect.height - 0.5;
    rawX.set(cx * 2);  // normalize to -1..1
    rawY.set(cy * 2);
  };

  const handleMouseLeave = () => {
    rawX.set(0);
    rawY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        boxShadow: shadow,
        borderColor: border,
        rotateX: tilt && hover ? rotateX : 0,
        rotateY: tilt && hover ? rotateY : 0,
        transformPerspective: 800,
        transformStyle: 'preserve-3d',
      }}
      whileHover={hover ? {
        y: -6,
        boxShadow: hoverShadow,
        borderColor: hoverBorder,
      } : {}}
      transition={{ type: 'spring', stiffness: 280, damping: 26 }}
      className={[
        'rounded-2xl border overflow-hidden will-change-transform',
        glassClass,
        padding,
        onClick ? 'cursor-pointer' : '',
        className,
      ].join(' ')}
    >
      {/* Shine highlight that follows tilt */}
      {tilt && hover && (
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{
            background: useTransform(
              [rawX, rawY],
              ([x, y]) =>
                `radial-gradient(circle at ${(Number(x) + 1) * 50}% ${(Number(y) + 1) * 50}%, rgba(255,255,255,0.04) 0%, transparent 60%)`
            ),
          }}
        />
      )}
      {children}
    </motion.div>
  );
}
