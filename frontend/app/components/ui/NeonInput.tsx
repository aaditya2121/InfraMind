'use client';

import { motion, AnimatePresence } from 'framer-motion';
import React, { forwardRef, useState } from 'react';

interface NeonInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
  accent?: 'cyan' | 'blue' | 'purple';
}

const accentStyles = {
  cyan: {
    ring: 'rgba(34,211,238,0.5)',
    glow: '0 0 0 3px rgba(34,211,238,0.12), 0 0 24px rgba(34,211,238,0.12)',
    label: 'text-cyan-400',
    border: 'rgba(34,211,238,0.35)',
    iconFocus: 'text-cyan-400',
    labelAnim: '#22d3ee',
  },
  blue: {
    ring: 'rgba(59,130,246,0.5)',
    glow: '0 0 0 3px rgba(59,130,246,0.12), 0 0 24px rgba(59,130,246,0.12)',
    label: 'text-blue-400',
    border: 'rgba(59,130,246,0.35)',
    iconFocus: 'text-blue-400',
    labelAnim: '#60a5fa',
  },
  purple: {
    ring: 'rgba(139,92,246,0.5)',
    glow: '0 0 0 3px rgba(139,92,246,0.12), 0 0 24px rgba(139,92,246,0.12)',
    label: 'text-purple-400',
    border: 'rgba(139,92,246,0.35)',
    iconFocus: 'text-purple-400',
    labelAnim: '#a78bfa',
  },
};

const NeonInput = forwardRef<HTMLInputElement, NeonInputProps>(({
  label,
  error,
  hint,
  icon,
  rightElement,
  accent = 'cyan',
  className = '',
  onFocus,
  onBlur,
  ...props
}, ref) => {
  const ac = accentStyles[accent];
  const [focused, setFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(false);
    setHasValue(!!e.target.value);
    onBlur?.(e);
  };

  return (
    <div className="flex flex-col gap-1.5">
      {/* Animated label */}
      {label && (
        <motion.label
          animate={{
            color: focused ? ac.labelAnim : '#64748b',
            x: focused || hasValue ? 0 : 0,
          }}
          transition={{ duration: 0.18 }}
          className="text-xs font-semibold uppercase tracking-widest"
        >
          {label}
        </motion.label>
      )}

      {/* Input wrapper */}
      <motion.div
        animate={{
          boxShadow: focused ? ac.glow : 'none',
          borderColor: focused ? ac.ring : error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)',
        }}
        transition={{ duration: 0.2 }}
        className="relative flex items-center rounded-xl border overflow-hidden"
        style={{ background: 'rgba(6, 13, 31, 0.7)' }}
      >
        {/* Animated left accent bar */}
        <motion.div
          className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-xl"
          animate={{
            opacity: focused ? 1 : 0,
            scaleY: focused ? 1 : 0.4,
            background: focused
              ? `linear-gradient(to bottom, transparent, ${ac.labelAnim}, transparent)`
              : 'transparent',
          }}
          transition={{ duration: 0.25 }}
        />

        {/* Icon with focus color transition */}
        {icon && (
          <motion.span
            className="absolute left-3.5 pointer-events-none"
            animate={{ color: focused ? ac.labelAnim : '#475569' }}
            transition={{ duration: 0.2 }}
          >
            {icon}
          </motion.span>
        )}

        <input
          ref={ref}
          className={[
            'w-full bg-transparent px-4 py-3 text-sm text-slate-100',
            'placeholder:text-slate-600 outline-none focus:outline-none',
            'transition-colors duration-200',
            icon ? 'pl-10' : '',
            rightElement ? 'pr-10' : '',
            className,
          ].join(' ')}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={e => setHasValue(!!e.target.value)}
          {...props}
        />

        {rightElement && (
          <span className="absolute right-3.5">{rightElement}</span>
        )}

        {/* Bottom focus sweep line */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-px"
          animate={{
            scaleX: focused ? 1 : 0,
            background: `linear-gradient(90deg, transparent, ${ac.labelAnim}, transparent)`,
            opacity: focused ? 1 : 0,
          }}
          initial={{ scaleX: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </motion.div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: 0.2 }}
            className="text-xs text-red-400 font-medium"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {hint && !error && (
        <p className="text-xs text-slate-600">{hint}</p>
      )}
    </div>
  );
});

NeonInput.displayName = 'NeonInput';
export default NeonInput;
