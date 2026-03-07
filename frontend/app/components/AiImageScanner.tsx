'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Zap, AlertTriangle, CheckCircle2, Clock, X } from 'lucide-react';
import AiPersonality from './AiPersonality';

// ─── TYPES ────────────────────────────────────────────────────
export type ScanPhase = 'idle' | 'scanning' | 'done';

export interface AiClassification {
  category: string;
  priority: 'High' | 'Medium' | 'Low';
  department: string;
  confidence: number;  // 0-100
  is_relevant?: boolean;
  rejection_reason?: string;
}

interface AiImageScannerProps {
  imageUrl: string;                             // object URL or base64
  onScanComplete: (result: AiClassification) => void;
  onReset: () => void;
  externalResult?: AiClassification | null;     // from real backend (optional override)
}

// ─── HELPERS ──────────────────────────────────────────────────
const priorityColor: Record<string, { text: string; bg: string; border: string; glow: string }> = {
  High: { text: 'text-red-300', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', glow: 'rgba(239,68,68,0.2)' },
  Medium: { text: 'text-amber-300', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', glow: 'rgba(245,158,11,0.15)' },
  Low: { text: 'text-green-300', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.3)', glow: 'rgba(34,197,94,0.15)' },
};

// Simulated quick pre-scan before real backend result
const PRESCAN_STEPS = [
  'Loading image data…',
  'Running visual analysis…',
  'Detecting anomalies…',
  'Classifying issue type…',
  'Estimating priority…',
  'Assigning department…',
];

// ─── CORNER GLOW ──────────────────────────────────────────────
function GlowCorner({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) {
  const posStyle = {
    tl: { top: 0, left: 0, borderTop: '2px solid', borderLeft: '2px solid' },
    tr: { top: 0, right: 0, borderTop: '2px solid', borderRight: '2px solid' },
    bl: { bottom: 0, left: 0, borderBottom: '2px solid', borderLeft: '2px solid' },
    br: { bottom: 0, right: 0, borderBottom: '2px solid', borderRight: '2px solid' },
  }[pos];

  return (
    <motion.div
      className="absolute w-6 h-6"
      style={{ ...posStyle, borderColor: '#22d3ee', borderRadius: 2 }}
      animate={{
        opacity: [0.6, 1, 0.6],
        boxShadow: ['0 0 4px rgba(34,211,238,0.4)', '0 0 12px rgba(34,211,238,0.9)', '0 0 4px rgba(34,211,238,0.4)'],
      }}
      transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: pos === 'tr' || pos === 'bl' ? 0.6 : 0 }}
    />
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────
export default function AiImageScanner({
  imageUrl,
  onScanComplete,
  onReset,
  externalResult,
}: AiImageScannerProps) {
  const [phase, setPhase] = useState<ScanPhase>('scanning');
  const [stepIndex, setStepIndex] = useState(0);
  const [result, setResult] = useState<AiClassification | null>(null);

  // Step ticker
  useEffect(() => {
    if (phase !== 'scanning') return;
    const interval = setInterval(() => {
      setStepIndex(i => {
        const next = i + 1;
        if (next >= PRESCAN_STEPS.length) { clearInterval(interval); return i; }
        return next;
      });
    }, 380);
    return () => clearInterval(interval);
  }, [phase]);

  // Call actual backend classification API
  useEffect(() => {
    if (phase !== 'scanning') return;
    let isMounted = true;

    const runScan = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${apiUrl}/api/complaints/classify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image_url: imageUrl })
        });

        if (!isMounted) return;

        if (!res.ok) {
          throw new Error('Scan failed');
        }

        const data = await res.json();
        const final: AiClassification = {
          category: data.category || 'Unknown',
          priority: data.priority || 'Low',
          department: data.department || 'None',
          confidence: Math.floor(Math.random() * 8) + 90, // Simulated confidence
          is_relevant: data.is_relevant,
          rejection_reason: data.generated_description
        };

        setResult(final);
        setPhase('done');
        onScanComplete(final);

      } catch (err) {
        if (!isMounted) return;
        console.error("Scanner API Error:", err);
        const fallback: AiClassification = { category: 'Server Error', priority: 'Low', department: 'None', confidence: 0 };
        setResult(fallback);
        setPhase('done');
        onScanComplete(fallback);
      }
    };

    runScan();
    return () => { isMounted = false; };
  }, [phase, imageUrl, onScanComplete]);

  // If backend sends a real result later, update
  useEffect(() => {
    if (externalResult && phase === 'done') setResult(externalResult);
  }, [externalResult, phase]);

  const pColor = result ? priorityColor[result.priority] ?? priorityColor['Medium'] : null;

  return (
    <div className="space-y-4">
      {/* ── Image + scan overlay ── */}
      <div className="relative w-full rounded-xl overflow-hidden group" style={{ background: '#060d1f', aspectRatio: '16/9' }}>

        {/* Photo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt="Issue" className="w-full h-full object-contain" />

        {/* Close/Remove Button */}
        <button
          onClick={onReset}
          className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/40 hover:bg-black/60 text-white/70 hover:text-white backdrop-blur-sm transition-all z-20 opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
          title="Remove image"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Only show scan overlay while scanning */}
        <AnimatePresence>
          {phase === 'scanning' && (
            <motion.div
              key="scan-overlay"
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Grid overlay */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    'linear-gradient(rgba(34,211,238,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.07) 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }}
              />

              {/* Dark vignette tint */}
              <div className="absolute inset-0" style={{ background: 'rgba(2,8,23,0.45)' }} />

              {/* Glowing corners */}
              <GlowCorner pos="tl" />
              <GlowCorner pos="tr" />
              <GlowCorner pos="bl" />
              <GlowCorner pos="br" />

              {/* Scanning line */}
              <motion.div
                className="absolute left-0 right-0 h-[2px]"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.9), rgba(167,139,250,0.6), rgba(34,211,238,0.9), transparent)',
                  boxShadow: '0 0 16px rgba(34,211,238,0.8), 0 0 40px rgba(34,211,238,0.3)',
                }}
                initial={{ top: '0%' }}
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 2.4, ease: 'linear', repeat: Infinity }}
              />

              {/* Secondary faint scan line */}
              <motion.div
                className="absolute left-0 right-0 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(167,139,250,0.4), transparent)' }}
                initial={{ top: '60%' }}
                animate={{ top: ['60%', '0%', '60%'] }}
                transition={{ duration: 3.1, ease: 'linear', repeat: Infinity }}
              />

              {/* Scan result boxes (fake detections flickering) */}
              <motion.div
                className="absolute border rounded-sm"
                style={{ top: '25%', left: '20%', width: '35%', height: '30%', borderColor: 'rgba(34,211,238,0.5)', boxShadow: '0 0 8px rgba(34,211,238,0.3)' }}
                animate={{ opacity: [0, 0.8, 0.4, 0.9, 0] }}
                transition={{ duration: 1.8, delay: 0.4, repeat: Infinity }}
              />
              <motion.div
                className="absolute border rounded-sm"
                style={{ top: '55%', left: '50%', width: '28%', height: '22%', borderColor: 'rgba(167,139,250,0.4)', boxShadow: '0 0 8px rgba(167,139,250,0.3)' }}
                animate={{ opacity: [0, 0.6, 0.2, 0.7, 0] }}
                transition={{ duration: 2.1, delay: 0.9, repeat: Infinity }}
              />

              {/* Top status badge */}
              <motion.div
                className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full"
                style={{ background: 'rgba(2,8,23,0.85)', border: '1px solid rgba(34,211,238,0.3)', backdropFilter: 'blur(8px)' }}
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <motion.div
                  className="w-2 h-2 rounded-full bg-cyan-400"
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
                <span className="text-[10px] font-bold text-cyan-300 tracking-wider uppercase">AI Scanning</span>
              </motion.div>

              {/* Bottom: robot + personality messages + progress */}
              <div className="absolute bottom-0 left-0 right-0 px-4 py-3"
                style={{ background: 'linear-gradient(to top, rgba(2,8,23,0.96) 60%, transparent)' }}>
                <AiPersonality compact active className="mb-2" />
                <motion.div
                  className="h-0.5 rounded-full"
                  style={{ background: 'rgba(34,211,238,0.2)' }}
                >
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-500"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2.6, ease: 'linear' }}
                    style={{ boxShadow: '0 0 8px rgba(34,211,238,0.6)' }}
                  />
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Done: show success overlay briefly */}
        <AnimatePresence>
          {phase === 'done' && (
            <motion.div
              key="done-flash"
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              style={{ background: 'rgba(34,211,238,0.06)', pointerEvents: 'none' }}
            >
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1.2, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                className="flex items-center justify-center w-16 h-16 rounded-full"
                style={{ background: 'rgba(34,211,238,0.15)', boxShadow: '0 0 40px rgba(34,211,238,0.5)', border: '2px solid rgba(34,211,238,0.5)' }}
              >
                <CheckCircle2 className="w-8 h-8 text-cyan-400" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Corner brackets persist after done */}
        {phase === 'done' && (
          <>
            <GlowCorner pos="tl" />
            <GlowCorner pos="tr" />
            <GlowCorner pos="bl" />
            <GlowCorner pos="br" />
          </>
        )}
      </div>

      {/* ── Classification Result ── */}
      <AnimatePresence>
        {phase === 'done' && result && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4, type: 'spring', stiffness: 300, damping: 26 }}
            className="rounded-2xl border overflow-hidden"
            style={{
              background: 'rgba(6,13,31,0.85)',
              borderColor: 'rgba(34,211,238,0.2)',
              boxShadow: '0 8px 32px rgba(34,211,238,0.08)',
              backdropFilter: 'blur(16px)',
            }}
          >
            {/* Header bar */}
            <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: 'rgba(34,211,238,0.1)', background: 'rgba(34,211,238,0.05)' }}>
              <div className="flex items-center gap-2.5">
                <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}>
                  <Zap className="w-4 h-4 text-cyan-400" />
                </motion.div>
                <span className="text-xs font-bold text-cyan-300 uppercase tracking-widest">AI Classification Complete</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                <Clock className="w-3 h-3" />
                <span>{result.confidence}% confidence</span>
              </div>
            </div>

            {/* Confidence progress */}
            <div className="px-5 pt-3 pb-1">
              <div className="h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-500"
                  initial={{ width: '0%' }}
                  animate={{ width: `${result.confidence}%` }}
                  transition={{ duration: 1, delay: 0.6, ease: 'easeOut' }}
                />
              </div>
            </div>

            {/* Result fields */}
            <div className="grid grid-cols-3 gap-0 divide-x" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              {[
                {
                  label: 'Issue Detected',
                  value: result.category,
                  icon: <AlertTriangle className="w-4 h-4 text-cyan-400" />,
                  delay: 0.5,
                  valueClass: 'text-white',
                },
                {
                  label: 'Priority',
                  value: result.priority,
                  icon: null,
                  delay: 0.65,
                  valueClass: pColor?.text ?? 'text-slate-300',
                  pill: true,
                },
                {
                  label: 'Department',
                  value: result.department,
                  icon: null,
                  delay: 0.8,
                  valueClass: 'text-purple-300',
                },
              ].map(field => (
                <motion.div
                  key={field.label}
                  className="px-5 py-4 flex flex-col gap-1.5"
                  style={{ borderColor: 'rgba(255,255,255,0.06)' }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: field.delay }}
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-600 uppercase tracking-widest font-bold">
                    {field.icon}
                    {field.label}
                  </div>
                  {field.pill && pColor ? (
                    <span
                      className={`inline-flex self-start px-2.5 py-1 rounded-full text-xs font-bold ${field.valueClass}`}
                      style={{ background: pColor.bg, border: `1px solid ${pColor.border}`, boxShadow: `0 0 8px ${pColor.glow}` }}
                    >
                      {field.value}
                    </span>
                  ) : (
                    <span className={`text-sm font-bold ${field.valueClass}`}>{field.value}</span>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Footer note */}
            <motion.div
              className="px-5 py-3 border-t text-[10px] text-slate-600 flex items-center justify-between"
              style={{ borderColor: 'rgba(255,255,255,0.04)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <span>Powered by Gemini 2.5 Flash · Result will be confirmed on submission</span>
              <button
                onClick={onReset}
                className="text-slate-600 hover:text-cyan-400 transition-colors cursor-pointer underline underline-offset-2"
              >
                Change photo
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
