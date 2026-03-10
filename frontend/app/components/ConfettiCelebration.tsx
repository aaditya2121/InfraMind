'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── CANVAS CONFETTI ──────────────────────────────────────
interface Piece {
  x: number; y: number; vx: number; vy: number;
  rot: number; vrot: number; size: number;
  color: string; alpha: number; shape: 'rect' | 'circle';
}

const COLORS = ['#22d3ee', '#a78bfa', '#f472b6', '#fbbf24', '#4ade80', '#60a5fa'];

function ConfettiCanvas({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const pieces: Piece[] = Array.from({ length: 80 }, () => ({
      x: canvas.width / 2 + (Math.random() - 0.5) * 60,
      y: canvas.height * 0.35,
      vx: (Math.random() - 0.5) * 10,
      vy: -(4 + Math.random() * 8),
      rot: Math.random() * 360,
      vrot: (Math.random() - 0.5) * 12,
      size: 5 + Math.random() * 7,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: 1,
      shape: Math.random() > 0.5 ? 'rect' : 'circle',
    }));

    let rafId: number;
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      for (const p of pieces) {
        p.x += p.vx; p.y += p.vy; p.vy += 0.25; // gravity
        p.rot += p.vrot; p.alpha -= 0.012;
        if (p.alpha <= 0) continue;
        alive = true;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        if (p.shape === 'circle') {
          ctx.beginPath(); ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2); ctx.fill();
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        }
        ctx.restore();
      }
      if (alive) rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [active]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

// ─── EMOJI BURST ─────────────────────────────────────────
const EMOJIS = ['🎉', '✨', '⚡', '🌟', '💫', '🎊'];

function EmojiBurst({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {EMOJIS.map((e, i) => (
        <motion.span key={i}
          className="absolute text-2xl"
          style={{ left: `${15 + i * 13}%`, top: '40%' }}
          initial={{ opacity: 0, y: 0, scale: 0.5 }}
          animate={{ opacity: [0, 1, 1, 0], y: [0, -60 - i * 15, -90 - i * 20], scale: [0.5, 1.2, 0.8] }}
          transition={{ duration: 1.4, delay: i * 0.08, ease: 'easeOut' }}
        >
          {e}
        </motion.span>
      ))}
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────
interface ConfettiCelebrationProps {
  show: boolean;
  onDone?: () => void;
  children?: React.ReactNode; // content to show below the celebration
}

export default function ConfettiCelebration({ show, onDone, children }: ConfettiCelebrationProps) {
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => onDone?.(), 3500);
    return () => clearTimeout(t);
  }, [show, onDone]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="relative flex flex-col items-center gap-5"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 320, damping: 24 }}
        >
          {/* Confetti canvas */}
          <ConfettiCanvas active={show} />
          <EmojiBurst active={show} />

          {/* Glowing checkmark */}
          <div className="relative">
            {/* Outer pulse ring */}
            <motion.div className="absolute inset-[-12px] rounded-full"
              style={{ border: '2px solid rgba(34,197,94,0.4)' }}
              animate={{ scale: [1, 1.35, 1], opacity: [0.8, 0, 0.8] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            />
            {/* Second ring */}
            <motion.div className="absolute inset-[-24px] rounded-full"
              style={{ border: '1px solid rgba(34,197,94,0.2)' }}
              animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 1.8, repeat: Infinity, delay: 0.3 }}
            />
            {/* Main circle */}
            <motion.div
              className="w-20 h-20 rounded-full flex items-center justify-center relative z-10"
              style={{
                background: 'rgba(34,197,94,0.15)',
                border: '2px solid rgba(34,197,94,0.5)',
                boxShadow: '0 0 40px rgba(34,197,94,0.4), 0 0 80px rgba(34,197,94,0.15)',
              }}
              animate={{ boxShadow: ['0 0 40px rgba(34,197,94,0.4)', '0 0 70px rgba(34,197,94,0.7)', '0 0 40px rgba(34,197,94,0.4)'] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {/* Animated checkmark path */}
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <motion.path
                  d="M6 18 L14 26 L30 10"
                  stroke="#4ade80"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
                  style={{ filter: 'drop-shadow(0 0 6px #4ade80)' }}
                />
              </svg>
            </motion.div>
          </div>

          {/* Happy message */}
          <motion.div className="text-center"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <motion.p className="text-xl font-black text-white mb-1"
              animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 2, repeat: Infinity }}>
              Issue Submitted! 🎊
            </motion.p>
            <p className="text-sm text-green-400">The AI successfully routed your report.</p>
          </motion.div>

          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
