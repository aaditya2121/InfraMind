'use client';

import { motion } from 'framer-motion';
import React from 'react';

interface PanelProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  accent?: 'cyan' | 'blue' | 'purple' | 'none';
  noPadding?: boolean;
  padding?: string;
}

const accentTop: Record<string, string> = {
  cyan: 'from-cyan-500/60 via-blue-500/30 to-transparent',
  blue: 'from-blue-500/60 via-purple-500/30 to-transparent',
  purple: 'from-purple-500/60 via-blue-500/30 to-transparent',
  none: 'from-white/10 to-transparent',
};

export default function Panel({
  children,
  className = '',
  title,
  icon,
  action,
  accent = 'cyan',
  noPadding = false,
  padding = 'p-6',
}: PanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={[
        'relative rounded-2xl overflow-hidden',
        'bg-[#060d1f]/80 border border-white/[0.07]',
        'shadow-[0_8px_40px_rgba(0,0,0,0.5)]',
        className,
      ].join(' ')}
    >
      {/* Accent top border */}
      <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${accentTop[accent]}`} />

      {(title || icon || action) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            {icon && (
              <span className="text-cyan-400">{icon}</span>
            )}
            {title && (
              <h3 className="text-sm font-semibold text-slate-200 tracking-wide">{title}</h3>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}

      <div className={noPadding ? '' : padding}>
        {children}
      </div>

      {/* Inner glow */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{ boxShadow: 'inset 0 0 40px rgba(34,211,238,0.02)' }} />
    </motion.div>
  );
}
