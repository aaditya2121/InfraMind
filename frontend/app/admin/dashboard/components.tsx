'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

// ─── COUNT-UP HOOK ─────────────────────────────────────────
export function useCountUp(target: number, duration = 1600) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let start = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(ease * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target, duration]);
  return { value, ref };
}

// ─── STAT CARD ─────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: number;
  suffix?: string;
  icon: React.ReactNode;
  grad: string;
  glow: string;
  delta?: string;
  delay?: number;
}

export function StatCard({ label, value, suffix = '', icon, grad, glow, delta, delay = 0 }: StatCardProps) {
  const { value: count, ref } = useCountUp(value, 1400);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
      whileHover={{ y: -4, boxShadow: `0 16px 40px ${glow}` }}
      className="relative rounded-2xl border p-5 overflow-hidden"
      style={{ background: 'rgba(4,10,22,0.85)', borderColor: 'rgba(255,255,255,0.06)' }}
    >
      {/* Corner glow */}
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${glow} 0%, transparent 70%)`, filter: 'blur(16px)', transform: 'translate(30%,-30%)' }} />
      {/* Top accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${grad}`} />

      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${grad}`} style={{ boxShadow: `0 4px 14px ${glow}` }}>
          <span className="text-white">{icon}</span>
        </div>
        {delta && (
          <span className="text-[10px] font-bold px-2 py-1 rounded-full"
            style={{ background: 'rgba(34,197,94,0.12)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.2)' }}>
            {delta}
          </span>
        )}
      </div>

      <div className="text-3xl font-black text-white tabular-nums">{count.toLocaleString()}{suffix}</div>
      <div className="text-xs text-slate-500 mt-1 font-medium">{label}</div>

      {/* Scan line flash on mount */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ background: `linear-gradient(transparent, ${glow}, transparent)`, opacity: 0.6 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 1.2, delay }}
      />
    </motion.div>
  );
}

// ─── WORKLOAD BAR ──────────────────────────────────────────
interface WorkloadBarProps {
  dept: string;
  open: number;
  total: number;
  color: string;
  glow: string;
  delay?: number;
}

export function WorkloadBar({ dept, open, total, color, glow, delay = 0 }: WorkloadBarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const pct = total ? Math.round((open / total) * 100) : 0;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ delay, duration: 0.45, ease: 'easeOut' }}
      className="group"
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-semibold text-slate-300 group-hover:text-white transition-colors">{dept}</span>
        <div className="flex items-center gap-3 text-xs text-slate-600">
          <span className="font-mono font-bold" style={{ color }}>{open}</span>
          <span>/ {total} total</span>
          <span className="font-bold text-slate-400">{pct}%</span>
        </div>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <motion.div
          className="h-full rounded-full relative"
          style={{ background: `linear-gradient(90deg, ${color}, ${color}cc)`, boxShadow: `0 0 12px ${glow}` }}
          initial={{ width: 0 }}
          animate={inView ? { width: `${pct}%` } : {}}
          transition={{ duration: 1, delay: delay + 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
        >
          {/* Moving shimmer */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 1.8, delay: delay + 0.6, ease: 'easeInOut' }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── ACTIVITY FEED ─────────────────────────────────────────
import { AnimatePresence } from 'framer-motion';
import {
  Bell, Bot, Users, CheckCircle2, AlertTriangle,
  Zap, MapPin, Clock,
} from 'lucide-react';

type EventType = 'reported' | 'ai-classified' | 'assigned' | 'resolved' | 'escalated' | 'updated';

interface FeedEvent {
  id: string;
  type: EventType;
  title: string;
  subtitle: string;
  time: Date;
  priority?: string;
}

const EVENT_CFG: Record<EventType, {
  icon: React.ReactNode; color: string; bg: string; border: string; label: string;
}> = {
  'reported':      { icon: <Bell className="w-3.5 h-3.5" />,         color: '#22d3ee', bg: 'rgba(34,211,238,0.07)',  border: 'rgba(34,211,238,0.18)',  label: 'NEW'      },
  'ai-classified': { icon: <Bot className="w-3.5 h-3.5" />,          color: '#a78bfa', bg: 'rgba(167,139,250,0.07)', border: 'rgba(167,139,250,0.18)', label: 'AI'       },
  'assigned':      { icon: <Users className="w-3.5 h-3.5" />,        color: '#60a5fa', bg: 'rgba(96,165,250,0.07)',  border: 'rgba(96,165,250,0.18)',  label: 'ASSIGNED' },
  'resolved':      { icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: '#4ade80', bg: 'rgba(74,222,128,0.07)', border: 'rgba(74,222,128,0.18)',  label: 'RESOLVED' },
  'escalated':     { icon: <AlertTriangle className="w-3.5 h-3.5" />,color: '#f87171', bg: 'rgba(248,113,113,0.07)',border: 'rgba(248,113,113,0.18)', label: 'URGENT'   },
  'updated':       { icon: <Zap className="w-3.5 h-3.5" />,          color: '#fbbf24', bg: 'rgba(251,191,36,0.07)', border: 'rgba(251,191,36,0.18)',  label: 'UPDATE'   },
};

const LOCATIONS = ['Hostel A', 'Hostel B', 'Academic Block', 'Library', 'Computer Lab', 'Cafeteria', 'Grounds'];
const SIM_EVENTS: Omit<FeedEvent, 'id' | 'time'>[] = [
  { type: 'reported',      title: 'New issue reported in Hostel A',  subtitle: 'Plumbing · High priority' },
  { type: 'ai-classified', title: 'AI classified plumbing issue',    subtitle: 'Civil Dept → Maintenance' },
  { type: 'assigned',      title: 'Maintenance team assigned',        subtitle: 'Est. resolution: 2h' },
  { type: 'reported',      title: 'Power outage in Lab B',           subtitle: 'Electrical · Medium priority' },
  { type: 'ai-classified', title: 'AI detected recurring pattern',   subtitle: 'Electrical — seen 3× this week' },
  { type: 'resolved',      title: 'Cafeteria ticket resolved',        subtitle: 'Housekeeping · 47 min response' },
  { type: 'escalated',     title: 'Hostel B SLA breached',           subtitle: 'Civil · 6h overdue — escalated' },
  { type: 'assigned',      title: 'IT team assigned to Lab A',        subtitle: 'Network issue · Low priority' },
  { type: 'updated',       title: 'Library HVAC status updated',     subtitle: 'In Progress → Parts ordered' },
];

function ticketsToEvents(
  tickets: { _id: string; category: string; department: string; status: string; priority: string; created_at: string }[]
): FeedEvent[] {
  const events: FeedEvent[] = [];
  const now = Date.now();

  tickets.slice(0, 20).forEach((t, i) => {
    const base = new Date(t.created_at || now - i * 900_000);
    const loc = LOCATIONS[i % LOCATIONS.length];

    // Every ticket generates a "reported" event
    events.push({
      id: `${t._id}-rep`,
      type: 'reported',
      title: `New issue reported in ${loc}`,
      subtitle: `${t.category} · ${t.priority} priority`,
      time: base,
      priority: t.priority,
    });
    // AI classified — 2 min after
    events.push({
      id: `${t._id}-ai`,
      type: 'ai-classified',
      title: `AI classified ${t.category.toLowerCase()} issue`,
      subtitle: `Routed to ${t.department} dept`,
      time: new Date(base.getTime() + 2 * 60_000),
    });
    // If in progress or resolved — add assigned event
    if (['In Progress', 'Resolved', 'Closed'].includes(t.status)) {
      events.push({
        id: `${t._id}-asgn`,
        type: 'assigned',
        title: `${t.department} team assigned`,
        subtitle: `Ticket #${t._id.slice(-5)}`,
        time: new Date(base.getTime() + 8 * 60_000),
      });
    }
    // Escalated
    if (t.status === 'Escalated') {
      events.push({
        id: `${t._id}-esc`,
        type: 'escalated',
        title: 'Ticket escalated past SLA',
        subtitle: `${t.category} · ${loc}`,
        time: new Date(base.getTime() + 360 * 60_000),
        priority: 'High',
      });
    }
    // Resolved
    if (['Resolved', 'Closed'].includes(t.status)) {
      events.push({
        id: `${t._id}-res`,
        type: 'resolved',
        title: `Ticket resolved`,
        subtitle: `${t.category} in ${loc}`,
        time: new Date(base.getTime() + 90 * 60_000),
      });
    }
  });

  return events.sort((a, b) => b.time.getTime() - a.time.getTime());
}

function useRelTime(time: Date) {
  const [label, setLabel] = useState('');
  useEffect(() => {
    const update = () => {
      const s = (Date.now() - time.getTime()) / 1000;
      if (s < 5)   setLabel('just now');
      else if (s < 60)   setLabel(`${Math.floor(s)}s ago`);
      else if (s < 3600) setLabel(`${Math.floor(s / 60)}m ago`);
      else               setLabel(`${Math.floor(s / 3600)}h ago`);
    };
    update();
    const id = setInterval(update, 15_000);
    return () => clearInterval(id);
  }, [time]);
  return label;
}

function FeedRow({ event, isNew }: { event: FeedEvent; isNew?: boolean }) {
  const cfg = EVENT_CFG[event.type];
  const timeLabel = useRelTime(event.time);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -24, height: 0 }}
      animate={{ opacity: 1, x: 0, height: 'auto' }}
      exit={{ opacity: 0, x: 16, height: 0 }}
      transition={{ duration: 0.32, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="flex items-start gap-3 px-3 py-2.5 rounded-xl border relative overflow-hidden"
      style={{ background: cfg.bg, borderColor: cfg.border }}
    >
      {/* NEW flash overlay */}
      {isNew && (
        <motion.div className="absolute inset-0 rounded-xl pointer-events-none"
          initial={{ opacity: 0.35 }} animate={{ opacity: 0 }} transition={{ duration: 1.2 }}
          style={{ background: cfg.color }} />
      )}

      {/* Icon */}
      <div className="mt-0.5 p-1.5 rounded-lg shrink-0"
        style={{ background: `${cfg.color}18`, color: cfg.color, boxShadow: `0 0 8px ${cfg.color}30` }}>
        {cfg.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[9px] font-black tracking-widest px-1.5 py-0.5 rounded"
            style={{ background: `${cfg.color}22`, color: cfg.color }}>
            {cfg.label}
          </span>
          {isNew && (
            <motion.span className="text-[9px] font-bold text-white px-1.5 py-0.5 rounded"
              style={{ background: '#22d3ee' }}
              animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.2, repeat: 2 }}>
              LIVE
            </motion.span>
          )}
        </div>
        <p className="text-xs font-semibold text-slate-200 truncate">{event.title}</p>
        <p className="text-[10px] text-slate-600 mt-0.5 truncate">{event.subtitle}</p>
      </div>

      {/* Time */}
      <div className="shrink-0 flex flex-col items-end gap-1 pt-0.5">
        <div className="flex items-center gap-1 text-[9px] text-slate-600">
          <Clock className="w-2.5 h-2.5" />
          <span>{timeLabel}</span>
        </div>
        {/* Pulsing dot */}
        <motion.div className="w-1.5 h-1.5 rounded-full"
          style={{ background: cfg.color, boxShadow: `0 0 4px ${cfg.color}` }}
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 2.5, repeat: Infinity }} />
      </div>
    </motion.div>
  );
}

export function ActivityFeed({
  tickets,
}: {
  tickets: { _id: string; category: string; department: string; status: string; priority: string; created_at: string }[];
}) {
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const simIdx = useRef(0);

  // Build initial events from tickets
  useEffect(() => {
    setEvents(ticketsToEvents(tickets).slice(0, 24));
  }, [tickets]);

  // Simulate a live new event every 5 seconds
  useEffect(() => {
    const id = setInterval(() => {
      const template = SIM_EVENTS[simIdx.current % SIM_EVENTS.length];
      simIdx.current += 1;
      const newEvent: FeedEvent = {
        ...template,
        id: `sim-${Date.now()}`,
        time: new Date(),
      };
      setEvents(prev => [newEvent, ...prev].slice(0, 30));
      setNewIds(s => { const n = new Set(s); n.add(newEvent.id); return n; });
      setTimeout(() => setNewIds(s => { const n = new Set(s); n.delete(newEvent.id); return n; }), 3500);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>
          <MapPin className="w-6 h-6 text-slate-700" />
        </motion.div>
        <p className="text-slate-700 text-xs">Waiting for activity…</p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
      <AnimatePresence initial={false}>
        {events.map(event => (
          <FeedRow key={event.id} event={event} isNew={newIds.has(event.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}
