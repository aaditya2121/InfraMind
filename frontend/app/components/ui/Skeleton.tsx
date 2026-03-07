'use client';

import React from 'react';
import { motion } from 'framer-motion';

// ─── SKELETON LINE ────────────────────────────────────────────
interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
}

export function SkeletonLine({ className = '', width = 'w-full', height = 'h-4' }: SkeletonProps) {
  return (
    <div className={`skeleton ${width} ${height} ${className}`} />
  );
}

// ─── SKELETON CARD ────────────────────────────────────────────
interface SkeletonCardProps {
  lines?: number;
  hasIcon?: boolean;
  className?: string;
}

export function SkeletonCard({ lines = 3, hasIcon = true, className = '' }: SkeletonCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`rounded-2xl border p-5 space-y-3 ${className}`}
      style={{ background: 'rgba(4,10,22,0.6)', borderColor: 'rgba(255,255,255,0.05)' }}
    >
      {hasIcon && (
        <div className="flex items-center gap-3 mb-4">
          <div className="skeleton w-10 h-10 rounded-xl" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-3 w-2/3" />
            <div className="skeleton h-2.5 w-1/3" />
          </div>
        </div>
      )}
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton h-3"
          style={{ width: `${80 - i * 12}%` }}
        />
      ))}
    </motion.div>
  );
}

// ─── SKELETON TABLE ROW ───────────────────────────────────────
export function SkeletonRow({ cols = 4, className = '' }: { cols?: number; className?: string }) {
  return (
    <div className={`flex items-center gap-4 px-4 py-3 rounded-xl ${className}`}
      style={{ background: 'rgba(255,255,255,0.01)' }}>
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} className="skeleton h-3 flex-1" style={{ maxWidth: i === 0 ? 200 : undefined }} />
      ))}
    </div>
  );
}

// ─── SKELETON STAT ────────────────────────────────────────────
export function SkeletonStat({ className = '' }: { className?: string }) {
  return (
    <div className={`rounded-2xl border p-5 space-y-4 ${className}`}
      style={{ background: 'rgba(4,10,22,0.6)', borderColor: 'rgba(255,255,255,0.05)' }}>
      <div className="flex items-start justify-between">
        <div className="skeleton w-10 h-10 rounded-xl" />
        <div className="skeleton w-12 h-5 rounded-full" />
      </div>
      <div className="skeleton h-8 w-20" style={{ borderRadius: 6 }} />
      <div className="skeleton h-3 w-24" />
    </div>
  );
}

// ─── LOADING GRID ─────────────────────────────────────────────
export function SkeletonGrid({ count = 4, cols = 4, className = '' }: { count?: number; cols?: number; className?: string }) {
  return (
    <div className={`grid gap-4 ${className}`} style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.4 }}
        >
          <SkeletonStat />
        </motion.div>
      ))}
    </div>
  );
}
