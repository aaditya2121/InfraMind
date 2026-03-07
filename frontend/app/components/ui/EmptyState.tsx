'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export default function EmptyState({ icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={`flex flex-col items-center justify-center py-20 px-8 text-center ${className}`}
    >
      {/* Icon container with pulse */}
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-slate-700"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          {icon}
        </div>
        <motion.div
          className="absolute inset-0 rounded-2xl"
          animate={{ opacity: [0, 0.3, 0] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.12) 0%, transparent 70%)' }}
        />
      </div>

      {/* Text */}
      <h3 className="text-base font-semibold text-slate-400 mb-1.5">{title}</h3>
      {description && (
        <p className="text-sm text-slate-600 max-w-xs leading-relaxed">{description}</p>
      )}

      {/* Action */}
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  );
}
