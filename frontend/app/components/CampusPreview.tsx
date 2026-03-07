'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wrench, Wifi, Droplets, Zap, Settings } from 'lucide-react';

// ─── CAMPUS ISSUE MARKERS ────────────────────────────────────────
const MARKERS = [
  { id: 1, x: '22%', y: '35%', dept: 'Electrical', issue: 'Flickering lights in lab corridor', priority: 'High',   Icon: Zap,      color: '#f87171' },
  { id: 2, x: '58%', y: '28%', dept: 'IT',          issue: 'WiFi dead zone near library',      priority: 'Medium', Icon: Wifi,     color: '#fbbf24' },
  { id: 3, x: '75%', y: '55%', dept: 'Civil',       issue: 'Cracked stairwell railing',        priority: 'High',   Icon: Wrench,   color: '#f87171' },
  { id: 4, x: '40%', y: '65%', dept: 'Plumbing',    issue: 'Water leaking near cafeteria',     priority: 'Medium', Icon: Droplets, color: '#fbbf24' },
  { id: 5, x: '15%', y: '70%', dept: 'Grounds',     issue: 'HVAC unit making loud noise',      priority: 'Low',    Icon: Settings, color: '#4ade80' },
  { id: 6, x: '85%', y: '25%', dept: 'Electrical',  issue: 'Power fluctuations in block C',    priority: 'High',   Icon: Zap,      color: '#f87171' },
];

const BUILDINGS = [
  { x: '8%',  y: '25%', w: '28%', h: '35%', label: 'Main Academic Block', floors: 4 },
  { x: '42%', y: '20%', w: '24%', h: '28%', label: 'Library',             floors: 3 },
  { x: '72%', y: '30%', w: '22%', h: '40%', label: 'Engineering Block',   floors: 5 },
  { x: '20%', y: '63%', w: '30%', h: '25%', label: 'Cafeteria & Grounds', floors: 2 },
  { x: '56%', y: '65%', w: '18%', h: '22%', label: 'Admin Block',         floors: 3 },
];

// ─── BUILDING ────────────────────────────────────────────────────
function Building({ x, y, w, h, label, floors, idx }: typeof BUILDINGS[0] & { idx: number }) {
  return (
    <motion.div
      className="absolute flex flex-col items-center"
      style={{ left: x, top: y, width: w }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.1 + 0.3, duration: 0.6 }}
    >
      {/* Building body */}
      <div
        className="w-full relative rounded-t-lg overflow-hidden"
        style={{
          height: h,
          background: 'linear-gradient(180deg, rgba(15,25,50,0.9) 0%, rgba(8,16,36,0.95) 100%)',
          border: '1px solid rgba(34,211,238,0.1)',
          boxShadow: '0 0 20px rgba(34,211,238,0.04), inset 0 0 30px rgba(34,211,238,0.02)',
        }}
      >
        {/* Window grid */}
        <div className="absolute inset-2 grid gap-1" style={{
          gridTemplateColumns: `repeat(4, 1fr)`,
          gridTemplateRows: `repeat(${floors}, 1fr)`,
        }}>
          {Array.from({ length: 4 * floors }).map((_, i) => (
            <motion.div
              key={i}
              className="rounded-sm"
              style={{ background: Math.random() > 0.35 ? 'rgba(34,211,238,0.15)' : 'rgba(167,139,250,0.08)' }}
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }}
            />
          ))}
        </div>
        {/* Top glow accent */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.4), transparent)' }} />
      </div>
      {/* Label */}
      <p className="text-[8px] text-slate-700 mt-1 text-center whitespace-nowrap font-medium">{label}</p>
    </motion.div>
  );
}

// ─── ISSUE MARKER ────────────────────────────────────────────────
function IssueMarker({ marker, isHovered, onHover, onLeave }: {
  marker: typeof MARKERS[0];
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
}) {
  const { Icon, color } = marker;

  return (
    <motion.div
      className="absolute z-20 cursor-pointer"
      style={{ left: marker.x, top: marker.y }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: marker.id * 0.15 + 0.6, type: 'spring', stiffness: 300, damping: 20 }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      {/* Outer pulse ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ background: `${color}20`, border: `1px solid ${color}40` }}
        animate={{ scale: [1, 2.2, 1], opacity: [0.6, 0, 0.6] }}
        transition={{ duration: 2, repeat: Infinity, delay: marker.id * 0.3 }}
      />
      {/* Second pulse */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ background: `${color}10` }}
        animate={{ scale: [1, 3.5, 1], opacity: [0.4, 0, 0.4] }}
        transition={{ duration: 2, repeat: Infinity, delay: marker.id * 0.3 + 0.5 }}
      />

      {/* Main dot */}
      <motion.div
        className="relative w-8 h-8 rounded-full flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, ${color}30, ${color}10)`,
          border: `1.5px solid ${color}`,
          boxShadow: `0 0 12px ${color}60, 0 0 30px ${color}20`,
        }}
        animate={{ boxShadow: [`0 0 12px ${color}60, 0 0 30px ${color}20`, `0 0 20px ${color}90, 0 0 50px ${color}40`, `0 0 12px ${color}60, 0 0 30px ${color}20`] }}
        transition={{ duration: 2, repeat: Infinity, delay: marker.id * 0.2 }}
        whileHover={{ scale: 1.3 }}
      >
        <Icon style={{ width: 13, height: 13, color }} />
      </motion.div>

      {/* Hover card */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            className="absolute z-30 rounded-xl border px-3 py-2.5 w-48"
            style={{
              bottom: 'calc(100% + 10px)',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(4,10,22,0.97)',
              borderColor: `${color}40`,
              boxShadow: `0 8px 32px rgba(0,0,0,0.6), 0 0 20px ${color}15`,
              backdropFilter: 'blur(16px)',
            }}
          >
            {/* Arrow */}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 rounded-sm"
              style={{ background: 'rgba(4,10,22,0.97)', border: `1px solid ${color}30`, borderTopColor: 'transparent', borderLeftColor: 'transparent' }} />
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: color }} />
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color }}>{marker.dept}</span>
              <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full font-semibold"
                style={{
                  background: marker.priority === 'High' ? 'rgba(248,113,113,0.15)' : marker.priority === 'Medium' ? 'rgba(251,191,36,0.15)' : 'rgba(74,222,128,0.15)',
                  color: marker.priority === 'High' ? '#f87171' : marker.priority === 'Medium' ? '#fbbf24' : '#4ade80',
                }}>
                {marker.priority}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">{marker.issue}</p>
            <div className="mt-2 pt-2 border-t border-white/5 text-[9px] text-slate-600">
              Tap to view full ticket ↗
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── MAIN CAMPUS PREVIEW ─────────────────────────────────────────
export default function CampusPreview() {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <div className="relative w-full" style={{ height: '480px' }}>
      {/* Ground plane */}
      <div className="absolute inset-0 rounded-3xl overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, rgba(4,10,22,0.9) 0%, rgba(6,14,30,0.95) 100%)',
          border: '1px solid rgba(34,211,238,0.08)',
          boxShadow: '0 0 80px rgba(34,211,238,0.04), inset 0 0 60px rgba(34,211,238,0.02)',
        }}>

        {/* Grid overlay for campus feel */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(34,211,238,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.04) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />

        {/* Road paths */}
        <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.2 }}>
          <path d="M 0 60% L 100% 60%" stroke="rgba(34,211,238,0.3)" strokeWidth="2" strokeDasharray="8 4" fill="none" />
          <path d="M 50% 0 L 50% 100%" stroke="rgba(34,211,238,0.2)" strokeWidth="1.5" strokeDasharray="6 4" fill="none" />
          <path d="M 0 40% Q 30% 40% 50% 30%" stroke="rgba(139,92,246,0.25)" strokeWidth="1.5" strokeDasharray="5 6" fill="none" />
        </svg>

        {/* Buildings */}
        {BUILDINGS.map((b, i) => <Building key={b.label} {...b} idx={i} />)}

        {/* Green areas */}
        {[
          { x: '35%', y: '72%', w: '14%', h: '18%' },
          { x: '78%', y: '72%', w: '18%', h: '18%' },
        ].map((g, i) => (
          <div key={i} className="absolute rounded-xl" style={{
            left: g.x, top: g.y, width: g.w, height: g.h,
            background: 'rgba(74,222,128,0.04)',
            border: '1px solid rgba(74,222,128,0.1)',
          }}>
            <div className="absolute inset-0 rounded-xl" style={{ background: 'radial-gradient(circle, rgba(74,222,128,0.08) 0%, transparent 70%)' }} />
          </div>
        ))}

        {/* Issue markers */}
        {MARKERS.map(m => (
          <IssueMarker
            key={m.id}
            marker={m}
            isHovered={hoveredId === m.id}
            onHover={() => setHoveredId(m.id)}
            onLeave={() => setHoveredId(null)}
          />
        ))}

        {/* Compass indicator */}
        <div className="absolute bottom-4 right-4 w-8 h-8 rounded-full flex items-center justify-center"
          style={{ border: '1px solid rgba(34,211,238,0.15)', background: 'rgba(4,10,22,0.8)' }}>
          <span className="text-[8px] font-bold text-cyan-400">N</span>
        </div>

        {/* Status pill */}
        <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(4,10,22,0.85)', border: '1px solid rgba(34,211,238,0.15)', backdropFilter: 'blur(8px)' }}>
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-green-400"
            animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
          <span className="text-[10px] font-semibold text-green-400">Live Property Map</span>
          <span className="text-[10px] text-slate-600">· {MARKERS.length} active issues</span>
        </div>
      </div>
    </div>
  );
}
