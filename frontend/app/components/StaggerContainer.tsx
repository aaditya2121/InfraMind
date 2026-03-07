'use client';

import React from 'react';
import { motion } from 'framer-motion';

// ─── STAGGER CONTAINER ───────────────────────────────
// Wrap any list of children — each direct child motion.div
// gets a cascaded entrance with delay offset.

interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;          // initial delay before first child appears
  stagger?: number;        // seconds between each child
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;       // px of slide distance
  once?: boolean;          // animate only when scrolled into view
}

const directionOffset = {
  up:    (d: number) => ({ y:  d, x: 0 }),
  down:  (d: number) => ({ y: -d, x: 0 }),
  left:  (d: number) => ({ x:  d, y: 0 }),
  right: (d: number) => ({ x: -d, y: 0 }),
};

const container = (delay: number, stagger: number) => ({
  hidden: {},
  show: {
    transition: {
      delayChildren: delay,
      staggerChildren: stagger,
    },
  },
});

const EASE = [0.21, 0.47, 0.32, 0.98] as [number, number, number, number];

const itemVariant = (dir: StaggerContainerProps['direction'], dist: number) => {
  const offset = directionOffset[dir ?? 'up'](dist);
  return {
    hidden: { opacity: 0, ...offset, filter: 'blur(4px)' },
    show:   {
      opacity: 1, x: 0, y: 0, filter: 'blur(0px)',
      transition: { duration: 0.45, ease: EASE },
    },
  };
};

export function StaggerContainer({
  children,
  className = '',
  delay = 0,
  stagger = 0.08,
  direction = 'up',
  distance = 22,
}: StaggerContainerProps) {
  const variant = itemVariant(direction, distance);

  return (
    <motion.div
      className={className}
      variants={container(delay, stagger)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
    >
      {React.Children.map(children, (child, i) => (
        <motion.div key={i} variants={variant}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

// ─── STAGGER ITEM ────────────────────────────────────
// Use inside a StaggerContainer with your own layout wrapper.
export function StaggerItem({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 20, filter: 'blur(4px)' },
        show:   { opacity: 1, y: 0,  filter: 'blur(0px)', transition: { duration: 0.42, ease: EASE } },
      }}
    >
      {children}
    </motion.div>
  );
}

// ─── FADE IN ─────────────────────────────────────────
// Simple single-element fade+slide that triggers on scroll.
export function FadeIn({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  distance = 24,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
}) {
  const offset = directionOffset[direction](distance);
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...offset, filter: 'blur(3px)' }}
      whileInView={{ opacity: 1, x: 0, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.48, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
