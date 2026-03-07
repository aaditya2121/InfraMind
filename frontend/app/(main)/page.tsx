'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send, Loader2, CheckCircle, MapPin, Clock, AlertTriangle, XCircle,
  ShieldCheck, ScanLine, Cpu, Bell, Wrench, Building2,
  Zap, Star, ArrowRight, Sparkles, Camera, ChevronDown,
  Activity, Globe,
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import Link from 'next/link';
import { motion, useInView, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import dynamic from 'next/dynamic';
import GlowButton from '../components/ui/GlowButton';
import GlassCard from '../components/ui/GlassCard';
import Navbar from '../components/Navbar';
import AiImageScanner, { AiClassification } from '../components/AiImageScanner';
import ConfettiCelebration from '../components/ConfettiCelebration';
import HeroBackground from '../components/HeroBackground';
import { useToast } from '../components/ui/Toast';

const CampusPreview = dynamic(() => import('../components/CampusPreview'), { ssr: false });

const EASE = [0.21, 0.47, 0.32, 0.98] as const;

// ─── ANIMATED STAT ─────────────────────────────────────────────
function AnimatedStat({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const dur = 1600;
    const step = (ts: number, start: number) => {
      const p = Math.min((ts - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.floor(ease * to));
      if (p < 1) requestAnimationFrame(n => step(n, start));
    };
    requestAnimationFrame(ts => step(ts, ts));
  }, [inView, to]);
  return <span ref={ref}>{val}{suffix}</span>;
}

// ─── SCROLL REVEAL ─────────────────────────────────────────────
function Reveal({ children, className = '', delay = 0, direction = 'up', once = true }: {
  children: React.ReactNode; className?: string; delay?: number;
  direction?: 'up' | 'left' | 'right' | 'fade'; once?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, margin: '-80px' });
  const offsets = { up: { y: 50, x: 0 }, left: { y: 0, x: -50 }, right: { y: 0, x: 50 }, fade: { y: 0, x: 0 } };
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, ...offsets[direction], filter: 'blur(4px)' }}
      animate={inView ? { opacity: 1, x: 0, y: 0, filter: 'blur(0px)' } : {}}
      transition={{ duration: 0.7, ease: EASE, delay }}
    >{children}</motion.div>
  );
}

// ─── HERO WORD ANIMATION ────────────────────────────────────────
function HeroText() {
  const [revealed, setRevealed] = useState(false);
  useEffect(() => { const t = setTimeout(() => setRevealed(true), 300); return () => clearTimeout(t); }, []);

  type WordDef = { text: string; variant: 'normal' | 'gradient' | 'cyan-glow' | 'blue-gradient' };
  const words: WordDef[] = [
    { text: 'See', variant: 'normal' },
    { text: 'an', variant: 'normal' },
    { text: 'issue?', variant: 'normal' },
    { text: 'Snap.', variant: 'gradient' },
    { text: 'Send.', variant: 'blue-gradient' },
    { text: 'Solved.', variant: 'cyan-glow' },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mb-8">
      {words.map((w, i) => (
        <motion.span
          key={i}
          className={`text-6xl sm:text-8xl lg:text-[100px] font-black leading-none tracking-tight select-none ${w.variant === 'gradient' ? 'text-gradient-hero' :
            w.variant === 'blue-gradient' ? 'bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent' :
              w.variant === 'cyan-glow' ? 'text-neon-cyan underline-glow' :
                'text-white'
            }`}
          initial={{ opacity: 0, y: 60, filter: 'blur(12px)', rotateX: -15 }}
          animate={revealed ? { opacity: 1, y: 0, filter: 'blur(0px)', rotateX: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.08 + i * 0.13, ease: EASE }}
        >
          {w.text}
        </motion.span>
      ))}
    </div>
  );
}

// ─── STORY SECTION ─────────────────────────────────────────────
function StorySection({ icon, number, title, sub, body, accent, imgSide = 'right', visual }: {
  icon: React.ReactNode; number: string; title: string; sub: string;
  body: string; accent: string; imgSide?: 'left' | 'right';
  visual: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <div ref={ref} className={`flex flex-col lg:flex-row items-center gap-12 xl:gap-20 ${imgSide === 'left' ? 'lg:flex-row-reverse' : ''}`}>
      {/* Text side */}
      <motion.div className="flex-1 space-y-6"
        initial={{ opacity: 0, x: imgSide === 'left' ? 40 : -40 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.7, ease: EASE }}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${accent}20`, border: `1px solid ${accent}40` }}>
            <span style={{ color: accent }}>{icon}</span>
          </div>
          <span className="text-[11px] font-black uppercase tracking-[0.3em]" style={{ color: accent }}>{number}</span>
        </div>
        <h3 className="text-4xl sm:text-5xl font-black text-white leading-tight">{title}</h3>
        <p className="text-lg font-semibold" style={{ color: accent }}>{sub}</p>
        <p className="text-slate-400 text-lg leading-relaxed">{body}</p>
      </motion.div>

      {/* Visual side */}
      <motion.div className="flex-1 w-full"
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
        transition={{ duration: 0.8, ease: EASE, delay: 0.15 }}
      >
        {visual}
      </motion.div>
    </div>
  );
}

// ─── FEATURE CARD ──────────────────────────────────────────────
function FeatureCard({ icon, title, description, grad, glow, delay }: {
  icon: React.ReactNode; title: string; description: string;
  grad: string; glow: string; delay: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: EASE, delay }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className="sweep-card group rounded-2xl border p-7 cursor-default"
      style={{
        background: 'rgba(4,10,22,0.85)',
        borderColor: 'rgba(255,255,255,0.06)',
        boxShadow: '0 0 0 rgba(0,0,0,0)',
        transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = `0 20px 60px ${glow}, 0 0 0 1px ${glow}`;
        (e.currentTarget as HTMLElement).style.borderColor = glow.replace('0.18', '0.3');
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 rgba(0,0,0,0)';
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)';
      }}
    >
      <motion.div
        className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${grad} mb-5`}
        style={{ boxShadow: `0 6px 24px ${glow}` }}
        whileHover={{ rotate: [0, -8, 8, 0], scale: 1.08 }}
        transition={{ duration: 0.4 }}
      >
        <span className="text-white">{icon}</span>
      </motion.div>
      <h3 className="text-base font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
    </motion.div>
  );
}

// ─── UPLOAD ZONE ──────────────────────────────────────────────────
function UploadZone({ onCapture, fileInputRef }: {
  onCapture: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}) {
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && fileInputRef.current) {
      const dt = new DataTransfer();
      dt.items.add(file);
      fileInputRef.current.files = dt.files;
      fileInputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
    }
  };

  return (
    <label
      htmlFor="img-upload"
      className="relative flex flex-col items-center justify-center w-full rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300 group overflow-hidden"
      style={{
        height: '220px',
        borderColor: dragOver ? 'rgba(34,211,238,0.6)' : 'rgba(34,211,238,0.15)',
        background: dragOver ? 'rgba(34,211,238,0.04)' : 'rgba(6,13,31,0.5)',
        boxShadow: dragOver ? '0 0 40px rgba(34,211,238,0.1), inset 0 0 30px rgba(34,211,238,0.03)' : 'none',
      }}
      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      {/* Animated corner brackets */}
      {['tl', 'tr', 'bl', 'br'].map(pos => (
        <motion.div
          key={pos}
          className="absolute w-5 h-5"
          style={{
            ...(pos.includes('t') ? { top: 8 } : { bottom: 8 }),
            ...(pos.includes('l') ? { left: 8 } : { right: 8 }),
            borderTop: pos.includes('t') ? '2px solid' : 'none',
            borderBottom: pos.includes('b') ? '2px solid' : 'none',
            borderLeft: pos.includes('l') ? '2px solid' : 'none',
            borderRight: pos.includes('r') ? '2px solid' : 'none',
            borderColor: 'rgba(34,211,238,0.4)',
          }}
          animate={{ opacity: [0.4, 1, 0.4], boxShadow: ['0 0 4px rgba(34,211,238,0.2)', '0 0 8px rgba(34,211,238,0.6)', '0 0 4px rgba(34,211,238,0.2)'] }}
          transition={{ duration: 2, repeat: Infinity, delay: pos === 'tr' || pos === 'bl' ? 1 : 0 }}
        />
      ))}

      {/* Scan line when dragging */}
      {dragOver && (
        <motion.div
          className="absolute left-0 right-0 h-px pointer-events-none"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.8), rgba(167,139,250,0.5), rgba(34,211,238,0.8), transparent)' }}
          animate={{ top: ['0%', '100%', '0%'] }}
          transition={{ duration: 1.5, ease: 'linear', repeat: Infinity }}
        />
      )}

      {/* Content */}
      <div className="flex flex-col items-center gap-3 text-slate-600 group-hover:text-slate-400 transition-colors duration-300">
        <div className="relative">
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.2)' }}
          >
            <Camera className="w-8 h-8 text-cyan-400" />
          </motion.div>
          {/* Orbit ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-[-8px] rounded-full border border-dashed"
            style={{ borderColor: 'rgba(34,211,238,0.18)' }}
          />
          {/* Pulse */}
          <motion.div
            className="absolute inset-[-4px] rounded-full"
            animate={{ scale: [1, 1.6, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ border: '1.5px solid rgba(34,211,238,0.3)' }}
          />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold group-hover:text-cyan-300 transition-colors">
            {dragOver ? 'Drop to analyze' : 'Click or drag a photo here'}
          </p>
          <p className="text-xs text-slate-700 mt-0.5">JPG · PNG · WEBP · up to 10 MB</p>
        </div>
        <div className="flex items-center gap-4 text-[10px] text-slate-700">
          <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-cyan-600" /> AI auto-classifies</span>
          <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-cyan-600" /> Anonymous</span>
        </div>
      </div>

      <input id="img-upload" type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={onCapture} suppressHydrationWarning />
    </label>
  );
}

// ─── STEP CARD ────────────────────────────────────────────────
function StepCard({ step, icon, title, description, color, delay }: {
  step: string; icon: React.ReactNode; title: string; description: string;
  color: string; delay: number;
}) {
  const colorMap: Record<string, { text: string; border: string; glow: string; bg: string }> = {
    cyan: { text: 'text-cyan-400', border: 'rgba(34,211,238,0.25)', glow: 'rgba(34,211,238,0.1)', bg: 'rgba(34,211,238,0.06)' },
    blue: { text: 'text-blue-400', border: 'rgba(59,130,246,0.25)', glow: 'rgba(59,130,246,0.1)', bg: 'rgba(59,130,246,0.06)' },
    purple: { text: 'text-purple-400', border: 'rgba(139,92,246,0.25)', glow: 'rgba(139,92,246,0.1)', bg: 'rgba(139,92,246,0.06)' },
  };
  const c = colorMap[color] || colorMap.cyan;

  return (
    <Reveal delay={delay}>
      <motion.div
        className="sweep-card relative rounded-2xl border p-7 h-full transition-shadow duration-300"
        style={{ background: 'rgba(4,10,22,0.85)', borderColor: 'rgba(255,255,255,0.06)' }}
        whileHover={{ y: -6, boxShadow: `0 24px 60px ${c.glow}`, borderColor: c.border, transition: { duration: 0.2 } }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-px rounded-t-2xl" style={{ background: `linear-gradient(90deg, transparent, ${c.border.replace('0.25', '0.8')}, transparent)` }} />

        <div className="relative mb-6">
          <motion.div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: c.bg, border: `1px solid ${c.border}`, boxShadow: `0 0 20px ${c.glow}` }}
            whileHover={{ rotate: [0, -12, 12, 0], scale: 1.1, transition: { duration: 0.4 } }}
          >
            <span className={c.text}>{icon}</span>
          </motion.div>
          <span className="absolute -top-2 -right-2 text-[9px] font-black text-slate-700 bg-[#060d1f] px-2 py-0.5 rounded-full border border-white/5">{step}</span>
        </div>
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
      </motion.div>
    </Reveal>
  );
}

// ─── DATA ─────────────────────────────────────────────────────
const features = [
  { icon: <ScanLine className="w-5 h-5" />, title: 'AI Classification', description: 'Gemini Vision auto-fills category, priority, and department from your photo.', grad: 'from-cyan-500 to-blue-500', glow: 'rgba(34,211,238,0.18)' },
  { icon: <ShieldCheck className="w-5 h-5" />, title: 'Anonymous Reports', description: 'No account needed. Your session ID keeps things private and trackable.', grad: 'from-purple-500 to-blue-500', glow: 'rgba(139,92,246,0.18)' },
  { icon: <Wrench className="w-5 h-5" />, title: 'Smart Routing', description: 'The correct team gets the ticket automatically — no manual sorting required.', grad: 'from-blue-500 to-cyan-500', glow: 'rgba(59,130,246,0.18)' },
  { icon: <Building2 className="w-5 h-5" />, title: 'Multi-Department', description: 'Plumbing, electrical, IT, grounds — all covered in one unified platform.', grad: 'from-green-500 to-cyan-500', glow: 'rgba(34,197,94,0.18)' },
  { icon: <Zap className="w-5 h-5" />, title: 'Real-time Updates', description: 'Get notified the moment your ticket is acknowledged or resolved.', grad: 'from-pink-500 to-purple-500', glow: 'rgba(236,72,153,0.18)' },
  { icon: <Star className="w-5 h-5" />, title: 'Admin Dashboard', description: 'Analytics, SLA tracking, priority queues, and CSV export in one place.', grad: 'from-amber-500 to-orange-500', glow: 'rgba(245,158,11,0.18)' },
];

// ─── MAIN PAGE ────────────────────────────────────────────────────
export default function Home() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<AiClassification | null>(null);
  const [scanDone, setScanDone] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [rejectionData, setRejectionData] = useState<{ message: string, note: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, role, loading } = useAuth();
  const toast = useToast();

  useEffect(() => {
    let id = localStorage.getItem('infraMindSessionId');
    if (!id) { id = uuidv4(); localStorage.setItem('infraMindSessionId', id); }
    setSessionId(id);
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSuccess) {
      setCountdown(5);
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsSuccess(false);
            setImagePreview(null);
            setDescription('');
            setLocation('');
            setAiResult(null);
            setScanDone(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isSuccess]);

  const handleImageCapture = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await getBase64(file);
        setImagePreview(base64);
        setAiResult(null);
        setScanDone(false);
        setRejectionData(null);
      } catch (err) {
        toast.error("Format not supported", "Please upload a valid image file.");
      }
    }
  }, [toast]);

  const handleReset = useCallback(() => {
    setImagePreview(null);
    setAiResult(null);
    setScanDone(false);
    setRejectionData(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const getBase64 = (file: File): Promise<string> =>
    new Promise((res, rej) => { const r = new FileReader(); r.readAsDataURL(file); r.onload = () => res(r.result as string); r.onerror = rej; });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePreview) return;
    setIsSubmitting(true);
    try {
      const base64Image = imagePreview;
      const token = (user && typeof user.getIdToken === 'function') ? await user.getIdToken() : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiUrl}/api/complaints`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          user_id: user?.uid || sessionId,
          image_url: base64Image,
          description,
          location: location || 'General Property'
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        if (result.error === 'Irrelevant Content Detected') {
          setRejectionData({ message: result.message || 'Submission Rejected', note: result.note || 'Our AI determined this image is not related to infrastructure issues.' });
        } else {
          throw new Error(result.error || 'Failed');
        }
        return;
      }
      toast.success('Report submitted!', 'Your issue has been routed to the right team.');
      setIsSuccess(true);
    } catch (err: any) {
      toast.error('Submission failed', err.message || 'Could not reach the server. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Success State ──
  if (isSuccess) {
    return (
      <HeroBackground>
        <div className="min-h-screen flex items-center justify-center px-4">
          <ConfettiCelebration show={isSuccess}>
            <div className="mt-6 space-y-4 text-center">
              <div className="rounded-2xl p-4 text-left border mb-6" style={{ background: 'rgba(6,13,31,0.8)', borderColor: 'rgba(34,211,238,0.15)' }}>
                <p className="text-xs text-slate-500 mb-1">Tracking ID</p>
                <p className="text-xs font-mono text-cyan-400 truncate">{sessionId}</p>
              </div>
              <GlowButton onClick={() => { setIsSuccess(false); setImagePreview(null); setDescription(''); setLocation(''); setAiResult(null); setScanDone(false); }} className="w-full">
                Submit Another Report ({countdown}s)
              </GlowButton>
            </div>
          </ConfettiCelebration>
        </div>
      </HeroBackground>
    );
  }

  // ── Rejection Modal ──
  if (rejectionData) {
    return (
      <HeroBackground>
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="relative rounded-3xl border p-8 max-w-md w-full text-center overflow-hidden" style={{ background: 'rgba(6,13,31,0.9)', borderColor: 'rgba(239,68,68,0.2)', backdropFilter: 'blur(24px)' }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'rgba(239,68,68,0.1)' }}>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">{rejectionData.message}</h2>
            <div className="p-4 rounded-2xl mb-6" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.1)' }}>
              <p className="text-sm text-red-400 font-medium leading-relaxed">{rejectionData.note}</p>
            </div>
            <div className="text-left p-4 mb-8 rounded-2xl border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }}>
              <p className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> AI Policy Note</p>
              <p className="text-xs text-slate-500 italic leading-relaxed">"Our AI gatekeeper ensures focus on real campus infrastructure problems. Irrelevant submissions are automatically blocked."</p>
            </div>
            <div className="space-y-3">
              <GlowButton variant="primary" className="w-full" onClick={() => { setRejectionData(null); setImagePreview(null); }} style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)' }}>
                Retake Photo
              </GlowButton>
              <button onClick={() => setRejectionData(null)} className="w-full py-3 text-sm font-semibold text-slate-400 hover:text-white transition-colors">
                Return to Form
              </button>
            </div>
          </div>
        </div>
      </HeroBackground>
    );
  }

  return (
    <HeroBackground>
      <Navbar />

      <main className="relative">

        {/* ════════════════════════════════════════
            HERO
        ════════════════════════════════════════ */}
        <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 sm:px-6 pt-28 pb-20">

          {/* Badge chip */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
            className="mb-10"
          >
            <motion.span
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full text-xs font-bold border"
              style={{ background: 'rgba(34,211,238,0.06)', borderColor: 'rgba(34,211,238,0.25)', color: '#22d3ee' }}
              animate={{ boxShadow: ['0 0 0px rgba(34,211,238,0)', '0 0 24px rgba(34,211,238,0.3)', '0 0 0px rgba(34,211,238,0)'] }}
              transition={{ duration: 3.5, repeat: Infinity }}
            >
              <motion.span animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}>
                <Sparkles className="w-3.5 h-3.5" />
              </motion.span>
              Powered by Gemini 2.5 Flash
              <span className="opacity-50">·</span>
              AI Facility Intelligence
            </motion.span>
          </motion.div>

          {/* Staggered hero headline */}
          <HeroText />

          {/* Sub-headline */}
          <motion.p
            initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, delay: 1.1, ease: EASE }}
            className="text-slate-400 text-xl sm:text-2xl max-w-2xl mx-auto mt-4 mb-12 leading-relaxed"
          >
            InfraMind uses AI to instantly classify, prioritize, and route property and campus
            infrastructure complaints to the right team —{' '}
            <span className="text-cyan-400 font-semibold">in seconds.</span>
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.3, ease: EASE }}
            className="flex flex-wrap items-center justify-center gap-4 mb-20"
            suppressHydrationWarning
          >
            {loading ? (
              <div className="flex gap-4">
                <div className="w-48 h-12 rounded-2xl bg-white/5 animate-pulse" />
                <div className="w-36 h-12 rounded-2xl bg-white/5 animate-pulse" />
              </div>
            ) : user ? (
              role === 'admin' ? (
                <Link href="/admin/dashboard">
                  <GlowButton size="lg" variant="purple">
                    <span className="flex items-center gap-2.5">
                      Go to Admin Dashboard
                      <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                        <ArrowRight className="w-5 h-5" />
                      </motion.span>
                    </span>
                  </GlowButton>
                </Link>
              ) : (
                <>
                  <GlowButton size="lg" onClick={() => document.getElementById('report-form')?.scrollIntoView({ behavior: 'smooth' })}>
                    <span className="flex items-center gap-2.5">
                      <Camera className="w-5 h-5 shrink-0" />
                      Report an Issue
                    </span>
                  </GlowButton>
                  <Link href="/profile">
                    <motion.button
                      className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl border text-sm font-semibold text-cyan-400 hover:text-cyan-300 hover:border-cyan-500/30 transition-all duration-300"
                      style={{ borderColor: 'rgba(34,211,238,0.2)', background: 'rgba(34,211,238,0.05)' }}
                      whileHover={{ scale: 1.02, background: 'rgba(34,211,238,0.1)' } as Parameters<typeof motion.button>[0]['whileHover']}
                      whileTap={{ scale: 0.98 }}
                    >
                      User Dashboard
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </Link>
                </>
              )
            ) : (
              <>
                <GlowButton size="lg" onClick={() => document.getElementById('report-form')?.scrollIntoView({ behavior: 'smooth' })}>
                  <span className="flex items-center gap-2.5">
                    <Camera className="w-5 h-5 shrink-0" />
                    Report an Issue
                    <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                      <ArrowRight className="w-5 h-5" />
                    </motion.span>
                  </span>
                </GlowButton>
                <motion.button
                  onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                  className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl border text-sm font-semibold text-slate-300 hover:text-white hover:border-white/20 transition-all duration-300"
                  style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)' }}
                  whileHover={{ scale: 1.02, background: 'rgba(255,255,255,0.06)' } as Parameters<typeof motion.button>[0]['whileHover']}
                  whileTap={{ scale: 0.98 }}
                >
                  How it works
                  <ChevronDown className="w-4 h-4" />
                </motion.button>
              </>
            )}
          </motion.div>

          {/* Live stats strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6, duration: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-8 text-sm"
          >
            {[
              { icon: <CheckCircle className="w-4 h-4 text-green-400" />, val: 1200, suf: '+', label: 'Issues Resolved' },
              { icon: <Clock className="w-4 h-4 text-cyan-400" />, val: 2, suf: 'h', label: 'Avg Response Time' },
              { icon: <MapPin className="w-4 h-4 text-purple-400" />, val: 5, suf: '', label: 'Departments Covered' },
              { icon: <Activity className="w-4 h-4 text-amber-400" />, val: 98, suf: '%', label: 'Accuracy Rate' },
            ].map(({ icon, val, suf, label }) => (
              <div key={label} className="flex items-center gap-2 text-slate-500">
                {icon}
                <span className="text-slate-100 font-bold"><AnimatedStat to={val} suffix={suf} /></span>
                <span>{label}</span>
              </div>
            ))}
          </motion.div>

          {/* Scroll cue */}
          <motion.div
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-slate-700"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2.2, repeat: Infinity }}
          >
            <div className="w-5 h-8 rounded-full border border-slate-800 flex items-start justify-center pt-1.5">
              <motion.div className="w-1 h-2 rounded-full bg-cyan-400"
                animate={{ y: [0, 12, 0], opacity: [1, 0, 1] }} transition={{ duration: 2.2, repeat: Infinity }} />
            </div>
            <span className="text-[9px] tracking-[0.25em] uppercase">Scroll</span>
          </motion.div>
        </section>

        {/* ════════════════════════════════════════
            REPORT FORM
        ════════════════════════════════════════ */}
        <section id="report-form" className="px-4 sm:px-6 pb-36 max-w-2xl mx-auto">
          <Reveal delay={0}>
            <div className="relative group">
              {/* Outer glow ring */}
              <motion.div
                className="absolute -inset-px rounded-3xl pointer-events-none"
                style={{ background: 'linear-gradient(135deg, rgba(34,211,238,0.15), rgba(139,92,246,0.1), rgba(59,130,246,0.15))', filter: 'blur(1px)' }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <GlassCard glow="cyan" padding="p-8" hover={false} tilt={false}>
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  <motion.div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center"
                    style={{ background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.25)' }}
                    animate={{ boxShadow: ['0 0 0px rgba(34,211,238,0)', '0 0 20px rgba(34,211,238,0.4)', '0 0 0px rgba(34,211,238,0)'] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Cpu className="w-5 h-5 text-cyan-400" />
                  </motion.div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Report Infrastructure Issue</h2>
                    <p className="text-xs text-slate-500">No account required · AI classifies in real time</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Upload / AI Scanner */}
                  <AnimatePresence mode="wait">
                    {!imagePreview ? (
                      <motion.div key="upload-zone" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.98 }}>
                        <p className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-2">Photo</p>
                        <UploadZone onCapture={handleImageCapture} fileInputRef={fileInputRef} />
                      </motion.div>
                    ) : (
                      <motion.div key="ai-scanner" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        <p className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-2">AI Vision Analysis</p>
                        <AiImageScanner
                          imageUrl={imagePreview}
                          onScanComplete={result => {
                            setAiResult(result);
                            setScanDone(true);
                            if (result.is_relevant === false) {
                              setRejectionData({
                                message: 'Irrelevant Content Detected by Scanner',
                                note: result.rejection_reason || 'Our AI determined this image is not related to campus infrastructure.'
                              });
                            }
                          }}
                          onReset={handleReset}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Location & Notes */}
                  <AnimatePresence>
                    {imagePreview && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4 mt-4"
                      >
                        <div>
                          <p className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-2">Location</p>
                          <input
                            type="text"
                            value={location}
                            onChange={e => setLocation(e.target.value)}
                            placeholder="e.g. Room 302, Block A"
                            className="w-full rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-700 outline-none border transition-all duration-200 focus:border-cyan-400/50 focus:shadow-[0_0_0_3px_rgba(34,211,238,0.1)]"
                            style={{ background: 'rgba(6,13,31,0.7)', borderColor: 'rgba(255,255,255,0.08)' }}
                          />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-2">Additional Notes</p>
                          <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Add any extra context for the maintenance team…"
                            rows={2}
                            className="w-full rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-700 outline-none resize-none border transition-all duration-200 focus:border-cyan-400/50 focus:shadow-[0_0_0_3px_rgba(34,211,238,0.1)]"
                            style={{ background: 'rgba(6,13,31,0.7)', borderColor: 'rgba(255,255,255,0.08)' }}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit */}
                  <GlowButton
                    type="submit" className="w-full" size="lg" loading={isSubmitting}
                    disabled={!imagePreview || !scanDone || isSubmitting}
                    icon={isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  >
                    {!imagePreview ? 'Upload a Photo First' : !scanDone ? 'AI Scanning…' : isSubmitting ? 'Submitting…' : 'Submit Report'}
                  </GlowButton>

                  {user && (
                    <p className="text-center text-xs text-slate-600">
                      Signed in as <span className="text-cyan-400">{user.email}</span>
                    </p>
                  )}
                </form>
              </GlassCard>
            </div>
          </Reveal>
        </section>

        {/* ════════════════════════════════════════
            HOW IT WORKS
        ════════════════════════════════════════ */}
        <section id="how-it-works" className="px-4 sm:px-6 pb-36 max-w-6xl mx-auto">
          <Reveal className="text-center mb-20">
            <p className="text-xs font-black text-cyan-400 uppercase tracking-[0.35em] mb-4">Process</p>
            <h2 className="text-5xl sm:text-6xl font-black text-white">Three Steps to Fixed</h2>
            <p className="text-slate-500 mt-5 max-w-lg mx-auto text-lg">No friction. No forms. No waiting.</p>
          </Reveal>

          <div className="relative grid sm:grid-cols-3 gap-6">
            {/* Connecting line */}
            <div className="absolute top-14 left-[20%] right-[20%] h-px hidden sm:block"
              style={{ background: 'linear-gradient(90deg, rgba(34,211,238,0.3), rgba(139,92,246,0.3))' }} />
            <motion.div
              className="absolute top-14 left-[20%] h-px hidden sm:block"
              style={{ background: 'linear-gradient(90deg, rgba(34,211,238,0.8), rgba(59,130,246,0.8))' }}
              initial={{ width: 0 }}
              whileInView={{ width: '60%' }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              viewport={{ once: true }}
            />

            {[
              { step: '01', icon: <Camera className="w-5 h-5" />, title: 'Snap a Photo', description: 'Point your camera at the damaged facility and take a quick photo.', color: 'cyan' },
              { step: '02', icon: <Cpu className="w-5 h-5" />, title: 'AI Classifies It', description: 'Our AI instantly identifies the issue category, priority, and the correct department.', color: 'blue' },
              { step: '03', icon: <Bell className="w-5 h-5" />, title: 'Team Gets Notified', description: 'The right maintenance team receives the ticket and begins work immediately.', color: 'purple' },
            ].map((s, i) => (
              <StepCard key={s.step} {...s} delay={i * 0.12} />
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════
            SCROLL STORY
        ════════════════════════════════════════ */}
        <section className="px-4 sm:px-6 pb-36 max-w-6xl mx-auto space-y-36">
          <Reveal className="text-center mb-24">
            <p className="text-xs font-black text-purple-400 uppercase tracking-[0.35em] mb-4">Intelligence</p>
            <h2 className="text-5xl sm:text-6xl font-black text-white">How InfraMind Thinks</h2>
          </Reveal>

          {/* Story 1 — AI Issue Detection */}
          <StorySection
            number="01 — AI DETECTION"
            icon={<ScanLine className="w-4 h-4" />}
            title="AI sees what you see"
            sub="Instant visual classification"
            body="The moment you upload a photo, Gemini Vision scans it in real time — detecting the defect type, severity, and which team should handle it. No forms. No guessing. Just point and send."
            accent="#22d3ee"
            visual={
              <div className="rounded-2xl border overflow-hidden relative"
                style={{ background: 'rgba(4,10,22,0.85)', borderColor: 'rgba(34,211,238,0.12)', minHeight: 260 }}>
                <div className="absolute inset-0 grid-pattern opacity-30" />
                <div className="relative p-8 flex flex-col gap-4">
                  {/* Fake AI scan UI */}
                  <div className="flex items-center gap-3 mb-2">
                    <motion.div className="w-2 h-2 rounded-full bg-cyan-400" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Gemini Vision Active</span>
                  </div>
                  {[
                    { label: 'Issue type', value: 'Electrical fault', color: '#22d3ee', w: '80%' },
                    { label: 'Priority', value: 'High', color: '#f87171', w: '45%' },
                    { label: 'Department', value: 'Maintenance', color: '#a78bfa', w: '65%' },
                    { label: 'Confidence', value: '94%', color: '#4ade80', w: '94%' },
                  ].map((row, i) => (
                    <motion.div key={row.label}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.12, duration: 0.5 }}
                      viewport={{ once: true }}
                      className="space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 uppercase tracking-wider">{row.label}</span>
                        <span className="font-bold" style={{ color: row.color }}>{row.value}</span>
                      </div>
                      <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }}>
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: `linear-gradient(90deg, ${row.color}aa, ${row.color})`, boxShadow: `0 0 6px ${row.color}60` }}
                          initial={{ width: 0 }}
                          whileInView={{ width: row.w }}
                          transition={{ duration: 1.1, delay: 0.4 + i * 0.1, ease: 'easeOut' }}
                          viewport={{ once: true }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            }
          />

          {/* Story 2 — Smart Routing */}
          <StorySection
            number="02 — SMART ROUTING"
            icon={<Activity className="w-4 h-4" />}
            title="Right team, right now"
            sub="Zero manual sorting"
            body="InfraMind's routing engine maps every issue type to the correct department — Electrical, Civil, IT, Housekeeping, Grounds. Tickets land where they need to go, instantly."
            accent="#a78bfa"
            imgSide="left"
            visual={
              <div className="rounded-2xl border p-6 space-y-3"
                style={{ background: 'rgba(4,10,22,0.85)', borderColor: 'rgba(139,92,246,0.12)' }}>
                {[
                  { dept: 'Electrical', icon: <Zap className="w-3.5 h-3.5" />, color: '#f59e0b', tickets: 12 },
                  { dept: 'Civil', icon: <Building2 className="w-3.5 h-3.5" />, color: '#22d3ee', tickets: 8 },
                  { dept: 'IT', icon: <Globe className="w-3.5 h-3.5" />, color: '#a78bfa', tickets: 5 },
                  { dept: 'Plumbing', icon: <Activity className="w-3.5 h-3.5" />, color: '#4ade80', tickets: 3 },
                ].map((d, i) => (
                  <motion.div
                    key={d.dept}
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.02, borderColor: `${d.color}40` }}
                  >
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${d.color}15`, border: `1px solid ${d.color}30` }}>
                      <span style={{ color: d.color }}>{d.icon}</span>
                    </div>
                    <span className="text-sm font-semibold text-white flex-1">{d.dept}</span>
                    <div className="flex-1 mx-3 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: d.color, boxShadow: `0 0 6px ${d.color}60` }}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(d.tickets / 12) * 100}%` }}
                        transition={{ duration: 1, delay: 0.5 + i * 0.1, ease: 'easeOut' }}
                        viewport={{ once: true }}
                      />
                    </div>
                    <span className="text-xs font-bold tabular-nums" style={{ color: d.color }}>{d.tickets}</span>
                  </motion.div>
                ))}
                <div className="pt-2 text-center">
                  <span className="text-[10px] text-slate-700 font-semibold uppercase tracking-wider">Auto-routed to correct department · 0 manual steps</span>
                </div>
              </div>
            }
          />

          {/* Story 3 — Property Intelligence */}
          <StorySection
            number="03 — PROPERTY INTELLIGENCE"
            icon={<Globe className="w-4 h-4" />}
            title="See your property in real time"
            sub="Live infrastructure overlay"
            body="Every reported issue is mapped geographically across your property or campus. Admins see a live pulse of what's broken, where — in one glance."
            accent="#4ade80"
            visual={
              <div className="rounded-2xl border overflow-hidden"
                style={{ background: 'rgba(4,10,22,0.85)', borderColor: 'rgba(74,222,128,0.12)' }}>
                <CampusPreview />
              </div>
            }
          />
        </section>

        {/* ════════════════════════════════════════
            FEATURES GRID
        ════════════════════════════════════════ */}
        <section id="features" className="px-4 sm:px-6 pb-36 max-w-6xl mx-auto">
          <Reveal className="text-center mb-20">
            <p className="text-xs font-black text-purple-400 uppercase tracking-[0.35em] mb-4">Capabilities</p>
            <h2 className="text-5xl sm:text-6xl font-black text-white">Built for Real Campuses</h2>
            <p className="text-slate-500 mt-5 max-w-xl mx-auto text-lg">
              Every feature was designed around how students and administrators actually work.
            </p>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => <FeatureCard key={f.title} {...f} delay={i * 0.07} />)}
          </div>
        </section>

        {/* ════════════════════════════════════════
            CTA BANNER
        ════════════════════════════════════════ */}
        <section className="px-4 sm:px-6 pb-40 max-w-5xl mx-auto">
          <Reveal>
            <div className="relative">
              {/* Animated gradient border */}
              <motion.div
                className="absolute -inset-px rounded-3xl pointer-events-none"
                style={{ background: 'linear-gradient(135deg, rgba(34,211,238,0.25), rgba(139,92,246,0.2), rgba(59,130,246,0.25))', filter: 'blur(1px)' }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 5, repeat: Infinity }}
              />

              <div className="relative rounded-3xl border px-8 py-16 text-center overflow-hidden"
                style={{ background: 'rgba(4,10,22,0.92)', borderColor: 'rgba(255,255,255,0.05)' }}>

                {/* Background dots */}
                <div className="absolute inset-0 dot-pattern opacity-20" />

                {/* Corner glows */}
                <div className="absolute top-0 left-0 w-64 h-64 rounded-full pointer-events-none"
                  style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 70%)', filter: 'blur(20px)' }} />
                <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full pointer-events-none"
                  style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)', filter: 'blur(20px)' }} />

                <div className="relative">
                  <motion.div
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border mb-8"
                    style={{ background: 'rgba(139,92,246,0.1)', borderColor: 'rgba(139,92,246,0.3)', color: '#a78bfa' }}
                    animate={{ boxShadow: ['0 0 0px rgba(139,92,246,0)', '0 0 24px rgba(139,92,246,0.35)', '0 0 0px rgba(139,92,246,0)'] }}
                    transition={{ duration: 3.5, repeat: Infinity }}
                  >
                    <Sparkles className="w-3 h-3" /> For Administrators
                  </motion.div>

                  <h2 className="text-5xl sm:text-6xl font-black text-white mb-5 leading-tight">
                    Manage Every Ticket,<br />
                    <span className="text-gradient-animated">Intelligently</span>
                  </h2>
                  <p className="text-slate-400 mb-12 max-w-xl mx-auto text-lg leading-relaxed">
                    Real-time dashboards, AI-powered analytics, SLA tracking, auto-escalation,
                    and CSV export — everything your facilities team needs.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-4">
                    {loading ? (
                      <div className="w-48 h-12 rounded-2xl bg-white/5 animate-pulse" />
                    ) : user ? (
                      role === 'admin' ? (
                        <Link href="/admin/dashboard">
                          <GlowButton variant="purple" size="lg">
                            <span className="flex items-center gap-2.5">
                              Admin Dashboard
                              <ArrowRight className="w-5 h-5 shrink-0" />
                            </span>
                          </GlowButton>
                        </Link>
                      ) : (
                        <Link href="/profile">
                          <GlowButton size="lg">
                            User Dashboard <ArrowRight className="w-5 h-5" />
                          </GlowButton>
                        </Link>
                      )
                    ) : (
                      <>
                        <Link href="/login">
                          <GlowButton variant="purple" size="lg">
                            <span className="flex items-center gap-2.5">
                              Open Admin Portal
                              <ArrowRight className="w-5 h-5 shrink-0" />
                            </span>
                          </GlowButton>
                        </Link>
                        <Link href="/signup">
                          <GlowButton variant="ghost" size="lg">Create Account</GlowButton>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ════════════════════════════════════════
            FOOTER
        ════════════════════════════════════════ */}
        <footer className="border-t py-12 px-6" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="InfraMind" className="h-12 w-auto object-contain"
                style={{ filter: 'drop-shadow(0 0 10px rgba(34,211,238,0.25))' }} />
              <div>
                <p className="text-sm font-bold text-slate-300">InfraMind</p>
                <p className="text-xs text-slate-700">Property & Facility Intelligence</p>
              </div>
            </div>
            <p className="text-xs text-slate-700">© 2026 InfraMind · Built at HACKMINed Hackathon</p>
            {!loading && (
              <Link href={user ? (role === 'admin' ? '/admin/dashboard' : '/profile') : '/login'}
                className="text-xs text-slate-600 hover:text-cyan-400 transition-colors flex items-center gap-1">
                {user ? (role === 'admin' ? 'Admin Dashboard' : 'User Dashboard') : 'Admin Portal'} <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        </footer>
      </main>
    </HeroBackground>
  );
}
