'use client';

import { motion } from 'framer-motion';
import React from 'react';

type BadgeStatus = 'open' | 'in-progress' | 'resolved' | 'escalated' | 'closed' | 'high' | 'medium' | 'low';

interface BadgeProps {
  status: BadgeStatus;
  pulse?: boolean;
  className?: string;
}

const badgeConfig: Record<BadgeStatus, {
  label: string;
  bg: string;
  text: string;
  dot: string;
  border: string;
}> = {
  open: {
    label: 'Open',
    bg: 'rgba(59,130,246,0.12)',
    text: 'text-blue-300',
    dot: 'bg-blue-400',
    border: 'rgba(59,130,246,0.3)',
  },
  'in-progress': {
    label: 'In Progress',
    bg: 'rgba(245,158,11,0.12)',
    text: 'text-amber-300',
    dot: 'bg-amber-400',
    border: 'rgba(245,158,11,0.3)',
  },
  resolved: {
    label: 'Resolved',
    bg: 'rgba(34,197,94,0.12)',
    text: 'text-green-300',
    dot: 'bg-green-400',
    border: 'rgba(34,197,94,0.3)',
  },
  escalated: {
    label: 'Escalated',
    bg: 'rgba(239,68,68,0.12)',
    text: 'text-red-300',
    dot: 'bg-red-400',
    border: 'rgba(239,68,68,0.3)',
  },
  closed: {
    label: 'Closed',
    bg: 'rgba(100,116,139,0.12)',
    text: 'text-slate-400',
    dot: 'bg-slate-500',
    border: 'rgba(100,116,139,0.25)',
  },
  high: {
    label: 'High',
    bg: 'rgba(239,68,68,0.12)',
    text: 'text-red-300',
    dot: 'bg-red-400',
    border: 'rgba(239,68,68,0.3)',
  },
  medium: {
    label: 'Medium',
    bg: 'rgba(245,158,11,0.12)',
    text: 'text-amber-300',
    dot: 'bg-amber-400',
    border: 'rgba(245,158,11,0.3)',
  },
  low: {
    label: 'Low',
    bg: 'rgba(34,197,94,0.12)',
    text: 'text-green-300',
    dot: 'bg-green-400',
    border: 'rgba(34,197,94,0.3)',
  },
};

export default function Badge({ status, pulse = false, className = '' }: BadgeProps) {
  const c = badgeConfig[status];

  return (
    <span
      style={{ background: c.bg, borderColor: c.border }}
      className={[
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border',
        'text-[11px] font-semibold tracking-wide',
        c.text, className,
      ].join(' ')}
    >
      <span className="relative flex h-1.5 w-1.5 shrink-0">
        {pulse && (
          <motion.span
            className={`absolute inline-flex h-full w-full rounded-full ${c.dot} opacity-75`}
            animate={{ scale: [1, 2, 1], opacity: [0.75, 0, 0.75] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${c.dot}`} />
      </span>
      {c.label}
    </span>
  );
}
