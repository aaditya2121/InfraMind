'use client';

import React from 'react';
import { motion } from 'framer-motion';

const waves = [
  { delay: 0,    dur: 18, color: 'rgba(34,211,238,0.04)',  yOff: '55%', skew: '-4deg'  },
  { delay: 3,    dur: 22, color: 'rgba(59,130,246,0.035)', yOff: '65%', skew: '5deg'   },
  { delay: 6,    dur: 26, color: 'rgba(139,92,246,0.03)',  yOff: '72%', skew: '-3deg'  },
  { delay: 9,    dur: 20, color: 'rgba(34,211,238,0.025)', yOff: '80%', skew: '6deg'   },
];

export default function GradientWaves() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {waves.map((w, i) => (
        <motion.div
          key={i}
          className="absolute left-[-20%] right-[-20%] h-[320px] rounded-[50%]"
          style={{
            top: w.yOff,
            background: `radial-gradient(ellipse 120% 60% at 50% 50%, ${w.color}, transparent 70%)`,
            filter: 'blur(32px)',
            transform: `skewY(${w.skew})`,
          }}
          animate={{
            x: ['0%', '6%', '-4%', '0%'],
            y: ['0px', '-18px', '12px', '0px'],
            scaleX: [1, 1.06, 0.97, 1],
          }}
          transition={{
            duration: w.dur,
            delay: w.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Wide horizontal beam at mid-screen */}
      <motion.div
        className="absolute top-[45%] left-0 right-0 h-px pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent 5%, rgba(34,211,238,0.15) 30%, rgba(139,92,246,0.15) 70%, transparent 95%)' }}
        animate={{ opacity: [0.4, 1, 0.4], scaleX: [0.9, 1.05, 0.9] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Bottom glow pool */}
      <motion.div
        className="absolute bottom-[-10%] left-[10%] right-[10%] h-48 rounded-full"
        style={{ background: 'radial-gradient(ellipse, rgba(34,211,238,0.06) 0%, transparent 70%)', filter: 'blur(40px)' }}
        animate={{ scaleX: [1, 1.15, 0.95, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}
