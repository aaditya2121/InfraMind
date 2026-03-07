'use client';

import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

type NotificationVariant = 'success' | 'warning' | 'error' | 'info';

interface NotificationProps {
  id?: string;
  variant: NotificationVariant;
  title: string;
  message?: string;
  duration?: number; // ms, 0 = sticky
  onClose?: () => void;
}

const config: Record<NotificationVariant, {
  Icon: React.ElementType;
  iconColor: string;
  bg: string;
  border: string;
  glow: string;
}> = {
  success: {
    Icon: CheckCircle,
    iconColor: 'text-green-400',
    bg: 'rgba(6,13,31,0.95)',
    border: 'rgba(34,197,94,0.3)',
    glow: '0 8px 32px rgba(34,197,94,0.15)',
  },
  warning: {
    Icon: AlertTriangle,
    iconColor: 'text-amber-400',
    bg: 'rgba(6,13,31,0.95)',
    border: 'rgba(245,158,11,0.3)',
    glow: '0 8px 32px rgba(245,158,11,0.15)',
  },
  error: {
    Icon: XCircle,
    iconColor: 'text-red-400',
    bg: 'rgba(6,13,31,0.95)',
    border: 'rgba(239,68,68,0.3)',
    glow: '0 8px 32px rgba(239,68,68,0.15)',
  },
  info: {
    Icon: Info,
    iconColor: 'text-cyan-400',
    bg: 'rgba(6,13,31,0.95)',
    border: 'rgba(34,211,238,0.3)',
    glow: '0 8px 32px rgba(34,211,238,0.15)',
  },
};

export function Notification({
  variant,
  title,
  message,
  duration = 4000,
  onClose,
}: NotificationProps) {
  const [visible, setVisible] = useState(true);
  const c = config[variant];
  const Icon = c.Icon as React.FC<{ className?: string }>;

  useEffect(() => {
    if (duration === 0) return;
    const t = setTimeout(() => { setVisible(false); onClose?.(); }, duration);
    return () => clearTimeout(t);
  }, [duration, onClose]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: 60, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 60, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          style={{ background: c.bg, borderColor: c.border, boxShadow: c.glow }}
          className="relative flex items-start gap-3 w-80 rounded-2xl border px-4 py-3.5 backdrop-blur-xl"
        >
          <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${c.iconColor}`} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-100">{title}</p>
            {message && <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{message}</p>}
          </div>
          <button
            onClick={() => { setVisible(false); onClose?.(); }}
            className="p-0.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Progress bar */}
          {duration > 0 && (
            <motion.div
              className="absolute bottom-0 left-0 h-0.5 rounded-full"
              style={{ background: c.border }}
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: duration / 1000, ease: 'linear' }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Simple hook to manage a stack of notifications ──
export interface NotificationData {
  id: string;
  variant: NotificationVariant;
  title: string;
  message?: string;
  duration?: number;
}

export function NotificationStack({ items, onRemove }: {
  items: NotificationData[];
  onRemove: (id: string) => void;
}) {
  return (
    <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2">
      <AnimatePresence>
        {items.map(n => (
          <Notification key={n.id} {...n} onClose={() => onRemove(n.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}
