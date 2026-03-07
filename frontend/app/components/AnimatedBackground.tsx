'use client';

import { motion } from 'framer-motion';
import React from 'react';
import dynamic from 'next/dynamic';
import GradientWaves from './GradientWaves';
import FloatingIcons from './FloatingIcons';

// Dynamically import canvas components (SSR-safe)
const ParticleCanvas = dynamic(() => import('./ParticleCanvas'), { ssr: false });
const LightTrails = dynamic(() => import('./LightTrails'), { ssr: false });

export default function AnimatedBackground({ children }: { children?: React.ReactNode }) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden" style={{ background: '#020817' }}>

      {/* ── Layer 0: base aurora gradient ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(34,211,238,0.07) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 100% 80%, rgba(139,92,246,0.07) 0%, transparent 60%), #020817',
        }}
      />

      {/* ── Layer 1: animated gradient waves ── */}
      <GradientWaves />

      {/* ── Layer 2: particle field + connections ── */}
      <ParticleCanvas />

      {/* ── Layer 3: glowing light trails ── */}
      <LightTrails />

      {/* ── Layer 4: floating icons ── */}
      <FloatingIcons />

      {/* ── Layer 5: grid overlay ── */}
      <div className="absolute inset-0 pointer-events-none grid-pattern opacity-100" />

      {/* ── Layer 6: top vignette ── */}
      <div className="absolute top-0 left-0 right-0 h-40 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, #020817 0%, transparent 100%)' }} />

      {/* ── Inner glow blobs (slow drift) ── */}
      <motion.div
        className="absolute top-[15%] left-[-5%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(34,211,238,0.05) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
        animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0], scale: [1, 1.1, 0.95, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-[10%] right-[-5%] w-[45vw] h-[45vw] max-w-[500px] max-h-[500px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)',
          filter: 'blur(70px)',
        }}
        animate={{ x: [0, -40, 20, 0], y: [0, 30, -20, 0], scale: [1, 1.12, 0.96, 1] }}
        transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* ── Content ── */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
