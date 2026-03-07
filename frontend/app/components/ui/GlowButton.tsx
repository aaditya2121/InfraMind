'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import React, { useRef, useState, useCallback } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'purple';
type Size = 'sm' | 'md' | 'lg';

interface GlowButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const variantStyles: Record<Variant, { base: string; glow: string; ripple: string }> = {
  primary: {
    base: 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-transparent',
    glow: '0 0 28px rgba(34,211,238,0.6), 0 0 70px rgba(34,211,238,0.18)',
    ripple: 'rgba(255,255,255,0.3)',
  },
  secondary: {
    base: 'bg-transparent text-cyan-400 border border-cyan-400/40',
    glow: '0 0 22px rgba(34,211,238,0.35), 0 0 50px rgba(34,211,238,0.1)',
    ripple: 'rgba(34,211,238,0.2)',
  },
  ghost: {
    base: 'bg-white/5 text-slate-300 border border-white/10',
    glow: '0 0 16px rgba(255,255,255,0.1)',
    ripple: 'rgba(255,255,255,0.12)',
  },
  danger: {
    base: 'bg-gradient-to-r from-red-600 to-rose-500 text-white border-transparent',
    glow: '0 0 24px rgba(239,68,68,0.5), 0 0 60px rgba(239,68,68,0.12)',
    ripple: 'rgba(255,255,255,0.25)',
  },
  purple: {
    base: 'bg-gradient-to-r from-purple-600 to-blue-500 text-white border-transparent',
    glow: '0 0 28px rgba(139,92,246,0.6), 0 0 70px rgba(139,92,246,0.18)',
    ripple: 'rgba(255,255,255,0.28)',
  },
};

const sizeStyles: Record<Size, string> = {
  sm: 'px-4 py-2 text-xs gap-1.5',
  md: 'px-5 py-2.5 text-sm gap-2',
  lg: 'px-7 py-3.5 text-base gap-2.5',
};

interface Ripple { id: number; x: number; y: number; size: number }

export default function GlowButton({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  className = '',
  disabled,
  onClick,
  ...props
}: GlowButtonProps) {
  const { base, glow, ripple: rippleColor } = variantStyles[variant];
  const sz = sizeStyles[size];
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const size = Math.max(rect.width, rect.height) * 2;
    const id = Date.now();
    setRipples(r => [...r, { id, x, y, size }]);
    setTimeout(() => setRipples(r => r.filter(rip => rip.id !== id)), 700);
    onClick?.(e);
  }, [disabled, loading, onClick]);

  return (
    <motion.button
      ref={buttonRef as React.RefObject<HTMLButtonElement>}
      whileHover={disabled || loading ? {} : {
        scale: 1.02,
        boxShadow: glow,
      }}
      whileTap={disabled || loading ? {} : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 500, damping: 28 }}
      disabled={disabled || loading}
      onClick={handleClick}
      className={[
        'relative inline-flex items-center justify-center font-semibold rounded-xl',
        'overflow-hidden cursor-pointer select-none transition-colors duration-200',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        base, sz, className,
      ].join(' ')}
      {...props}
    >
      {/* Shimmer sweep on hover */}
      <motion.span
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"
        style={{ translateX: '-100%' }}
        whileHover={{ translateX: '220%' }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />

      {/* Top edge highlight */}
      <span className="absolute top-0 left-[15%] right-[15%] h-px bg-white/20 rounded-full pointer-events-none" />

      {/* Ripple effects */}
      {ripples.map(r => (
        <motion.span
          key={r.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: r.x - r.size / 2,
            top: r.y - r.size / 2,
            width: r.size,
            height: r.size,
            background: rippleColor,
          }}
          initial={{ scale: 0, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 0 }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
        />
      ))}

      {/* Content */}
      {loading ? (
        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      ) : (
        <span className="relative z-10 flex items-center gap-[inherit]">
          {icon && <span className="shrink-0 leading-none">{icon}</span>}
          {children}
        </span>
      )}
    </motion.button>
  );
}
