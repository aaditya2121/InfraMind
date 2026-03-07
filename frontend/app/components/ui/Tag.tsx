'use client';

import { motion } from 'framer-motion';
import React from 'react';

type TagVariant = 'cyan' | 'blue' | 'purple' | 'green' | 'red' | 'amber' | 'slate';

interface TagProps {
  children: React.ReactNode;
  variant?: TagVariant;
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md';
}

const tagStyles: Record<TagVariant, { bg: string; text: string; border: string; glow: string }> = {
  cyan:   { bg: 'rgba(34,211,238,0.1)',  text: 'text-cyan-300',   border: 'rgba(34,211,238,0.3)',   glow: 'rgba(34,211,238,0.2)' },
  blue:   { bg: 'rgba(59,130,246,0.12)', text: 'text-blue-300',   border: 'rgba(59,130,246,0.3)',   glow: 'rgba(59,130,246,0.2)' },
  purple: { bg: 'rgba(139,92,246,0.12)', text: 'text-purple-300', border: 'rgba(139,92,246,0.3)',   glow: 'rgba(139,92,246,0.2)' },
  green:  { bg: 'rgba(34,197,94,0.1)',   text: 'text-green-300',  border: 'rgba(34,197,94,0.3)',    glow: 'rgba(34,197,94,0.2)'  },
  red:    { bg: 'rgba(239,68,68,0.1)',   text: 'text-red-300',    border: 'rgba(239,68,68,0.3)',    glow: 'rgba(239,68,68,0.2)'  },
  amber:  { bg: 'rgba(245,158,11,0.1)',  text: 'text-amber-300',  border: 'rgba(245,158,11,0.3)',   glow: 'rgba(245,158,11,0.2)' },
  slate:  { bg: 'rgba(100,116,139,0.1)', text: 'text-slate-400',  border: 'rgba(100,116,139,0.25)', glow: 'rgba(100,116,139,0.15)' },
};

export default function Tag({
  children,
  variant = 'cyan',
  icon,
  onClick,
  className = '',
  size = 'md',
}: TagProps) {
  const s = tagStyles[variant];

  return (
    <motion.span
      onClick={onClick}
      whileHover={onClick ? { scale: 1.05, boxShadow: `0 0 12px ${s.glow}` } : {}}
      whileTap={onClick ? { scale: 0.96 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      style={{ background: s.bg, borderColor: s.border }}
      className={[
        'inline-flex items-center gap-1.5 rounded-full border font-semibold leading-none',
        s.text,
        size === 'sm' ? 'px-2.5 py-1 text-[10px]' : 'px-3 py-1.5 text-xs',
        onClick ? 'cursor-pointer' : '',
        className,
      ].join(' ')}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </motion.span>
  );
}
