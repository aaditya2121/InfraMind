'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface FloatingIcon {
  id: number;
  icon: React.ReactNode;
  x: string; // initial left %
  y: string; // initial top %
  floatX: number[];
  floatY: number[];
  dur: number;
  delay: number;
  size: number;     // px
  opacity: number;
  rotate: number[];
  color: string;
}

// Inline SVG icons for maximum control (no lucide dependency on bg layer)
const WrenchIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

const LightningIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const WifiIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12.55a11 11 0 0 1 14.08 0" />
    <path d="M1.42 9a16 16 0 0 1 21.16 0" />
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
    <line x1="12" y1="20" x2="12.01" y2="20" strokeWidth={3} />
  </svg>
);

const DropletIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
  </svg>
);

const GearIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const ShieldSmIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const CpuSmIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="6" height="6" />
    <rect x="2" y="2" width="20" height="20" rx="2" />
    <path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 14h2M20 9h2M20 14h2" />
  </svg>
);

const ICONS: FloatingIcon[] = [
  {
    id: 1, icon: <WrenchIcon size={22} />,
    x: '8%', y: '20%',
    floatX: [0, 14, -8, 0], floatY: [0, -20, 10, 0],
    dur: 18, delay: 0, size: 22, opacity: 0.15,
    rotate: [0, 15, -10, 0], color: '#22d3ee',
  },
  {
    id: 2, icon: <LightningIcon size={20} />,
    x: '88%', y: '15%',
    floatX: [0, -12, 8, 0], floatY: [0, 18, -14, 0],
    dur: 14, delay: 2, size: 20, opacity: 0.18,
    rotate: [0, -12, 20, 0], color: '#a78bfa',
  },
  {
    id: 3, icon: <WifiIcon size={24} />,
    x: '75%', y: '55%',
    floatX: [0, 10, -18, 0], floatY: [0, -16, 8, 0],
    dur: 20, delay: 4, size: 24, opacity: 0.12,
    rotate: [0, 8, -5, 0], color: '#60a5fa',
  },
  {
    id: 4, icon: <DropletIcon size={20} />,
    x: '14%', y: '65%',
    floatX: [0, 18, -10, 0], floatY: [0, 12, -22, 0],
    dur: 22, delay: 6, size: 20, opacity: 0.14,
    rotate: [0, -20, 15, 0], color: '#22d3ee',
  },
  {
    id: 5, icon: <GearIcon size={28} />,
    x: '50%', y: '80%',
    floatX: [0, -14, 10, 0], floatY: [0, -18, 6, 0],
    dur: 30, delay: 1, size: 28, opacity: 0.1,
    rotate: [0, 60, 120, 180, 240, 300, 360], color: '#a78bfa',
  },
  {
    id: 6, icon: <ShieldSmIcon size={22} />,
    x: '92%', y: '72%',
    floatX: [0, 8, -12, 0], floatY: [0, -12, 20, 0],
    dur: 19, delay: 8, size: 22, opacity: 0.12,
    rotate: [0, 5, -3, 0], color: '#60a5fa',
  },
  {
    id: 7, icon: <CpuSmIcon size={20} />,
    x: '30%', y: '10%',
    floatX: [0, -10, 16, 0], floatY: [0, 20, -10, 0],
    dur: 16, delay: 3, size: 20, opacity: 0.13,
    rotate: [0, -8, 12, 0], color: '#22d3ee',
  },
];

export default function FloatingIcons() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {ICONS.map(icon => (
        <motion.div
          key={icon.id}
          className="absolute"
          style={{
            left: icon.x,
            top: icon.y,
            color: icon.color,
            opacity: icon.opacity,
            filter: `drop-shadow(0 0 8px ${icon.color})`,
          }}
          animate={{
            x: icon.floatX,
            y: icon.floatY,
            rotate: icon.rotate,
          }}
          transition={{
            duration: icon.dur,
            delay: icon.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {icon.icon}
        </motion.div>
      ))}
    </div>
  );
}
