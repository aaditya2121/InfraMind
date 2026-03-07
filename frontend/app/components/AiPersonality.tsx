'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MESSAGES = [
  { text: "AI detective analyzing the problem…",   emoji: "🔍" },
  { text: "Teaching the AI to fix this…",           emoji: "🤖" },
  { text: "Consulting the digital brain…",          emoji: "🧠" },
  { text: "Sending issue to the right human…",      emoji: "📡" },
  { text: "Running visual forensics…",              emoji: "🔬" },
  { text: "Cross-referencing 1,000 past issues…",   emoji: "📚" },
  { text: "AI is squinting at your photo…",         emoji: "👀" },
  { text: "Calibrating the issue-o-meter…",         emoji: "📊" },
];

// ─── ANIMATED ROBOT SVG ──────────────────────────────────
function RobotIcon() {
  return (
    <motion.svg
      width="56" height="56" viewBox="0 0 56 56" fill="none"
      xmlns="http://www.w3.org/2000/svg"
      animate={{ y: [0, -4, 0] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* Antenna */}
      <motion.line x1="28" y1="6" x2="28" y2="13" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" />
      <motion.circle cx="28" cy="4" r="3" fill="#22d3ee"
        animate={{ opacity: [1, 0.2, 1], r: [3, 4.5, 3] }}
        transition={{ duration: 1.2, repeat: Infinity }}
        style={{ filter: 'drop-shadow(0 0 6px #22d3ee)' }}
      />

      {/* Head */}
      <motion.rect x="12" y="13" width="32" height="22" rx="6" fill="rgba(34,211,238,0.12)"
        stroke="#22d3ee" strokeWidth="1.5"
        animate={{ stroke: ['#22d3ee', '#a78bfa', '#22d3ee'] }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      {/* Eyes */}
      <motion.circle cx="21" cy="24" r="4" fill="#22d3ee"
        animate={{ scaleY: [1, 0.15, 1], opacity: [1, 0.8, 1] }}
        transition={{ duration: 3, repeat: Infinity, times: [0, 0.5, 0.55] }}
        style={{ filter: 'drop-shadow(0 0 4px #22d3ee)' }}
      />
      <motion.circle cx="35" cy="24" r="4" fill="#22d3ee"
        animate={{ scaleY: [1, 0.15, 1], opacity: [1, 0.8, 1] }}
        transition={{ duration: 3, repeat: Infinity, times: [0, 0.5, 0.55], delay: 0.05 }}
        style={{ filter: 'drop-shadow(0 0 4px #22d3ee)' }}
      />

      {/* Mouth — scanning animation */}
      <motion.rect x="19" y="30" width="18" height="3" rx="1.5" fill="rgba(34,211,238,0.3)" />
      <motion.rect x="19" y="30" width="6" height="3" rx="1.5" fill="#22d3ee"
        animate={{ x: [19, 31, 19] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
        style={{ filter: 'drop-shadow(0 0 4px #22d3ee)' }}
      />

      {/* Body */}
      <rect x="16" y="37" width="24" height="14" rx="4" fill="rgba(34,211,238,0.06)" stroke="rgba(34,211,238,0.2)" strokeWidth="1.5" />

      {/* Chest LED */}
      <motion.circle cx="28" cy="44" r="3" fill="#22d3ee"
        animate={{ opacity: [1, 0.2, 1], r: [3, 4, 3] }}
        transition={{ duration: 0.9, repeat: Infinity }}
        style={{ filter: 'drop-shadow(0 0 6px #22d3ee)' }}
      />

      {/* Arms */}
      <motion.rect x="6" y="38" width="8" height="4" rx="2" fill="rgba(34,211,238,0.15)" stroke="rgba(34,211,238,0.3)" strokeWidth="1"
        animate={{ rotate: [-15, 15, -15], originX: '100%' }}
        transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.rect x="42" y="38" width="8" height="4" rx="2" fill="rgba(34,211,238,0.15)" stroke="rgba(34,211,238,0.3)" strokeWidth="1"
        animate={{ rotate: [15, -15, 15] }}
        transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.svg>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────
interface AiPersonalityProps {
  active?: boolean;          // show when AI is processing
  className?: string;
  compact?: boolean;         // smaller layout for inline use
}

export default function AiPersonality({ active = true, className = '', compact = false }: AiPersonalityProps) {
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setMsgIdx(i => (i + 1) % MESSAGES.length), 1800);
    return () => clearInterval(id);
  }, [active]);

  const { text, emoji } = MESSAGES[msgIdx];

  if (!active) return null;

  return (
    <div className={`flex ${compact ? 'flex-row items-center gap-3' : 'flex-col items-center gap-4'} ${className}`}>
      {!compact && <RobotIcon />}

      <div className={`flex items-center gap-2 ${compact ? '' : 'justify-center'}`}>
        {compact && (
          <motion.span animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
            {emoji}
          </motion.span>
        )}
        <AnimatePresence mode="wait">
          <motion.p
            key={text}
            initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -6, filter: 'blur(2px)' }}
            transition={{ duration: 0.3 }}
            className={`font-medium text-cyan-300 ${compact ? 'text-xs' : 'text-sm text-center'}`}
          >
            {!compact && <span className="mr-1.5">{emoji}</span>}
            {text}
          </motion.p>
        </AnimatePresence>
      </div>

      {!compact && (
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-cyan-400"
              animate={{ scale: [1, 1.6, 1], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.18 }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
