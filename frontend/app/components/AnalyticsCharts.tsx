'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, useSpring, useTransform } from 'framer-motion';

// ─── TYPES ─────────────────────────────────────────────────────
export interface TicketData {
  _id: string; category: string; department: string;
  priority: 'High' | 'Medium' | 'Low'; status: string; created_at: string;
}

// ─── PALETTE ───────────────────────────────────────────────────
const CAT_COLORS = [
  '#22d3ee', '#a78bfa', '#f59e0b', '#4ade80',
  '#f87171', '#60a5fa', '#fb923c', '#e879f9',
];

// ─── UTILS ─────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1200, active = true) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(ease * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration, active]);
  return val;
}

// ─── GLOWING SECTION WRAPPER ───────────────────────────────────
function ChartCard({ title, subtitle, children, accent = '#22d3ee' }: {
  title: string; subtitle?: string; children: React.ReactNode; accent?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="rounded-2xl border overflow-hidden relative"
      style={{ background: 'rgba(4,10,22,0.85)', borderColor: 'rgba(255,255,255,0.06)' }}
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}70, transparent)` }} />
      {/* Corner glow */}
      <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${accent}18 0%, transparent 70%)`, filter: 'blur(12px)', transform: 'translate(30%,-30%)' }} />
      <div className="px-6 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <h3 className="text-sm font-bold text-white">{title}</h3>
        {subtitle && <p className="text-[11px] text-slate-600 mt-0.5">{subtitle}</p>}
      </div>
      <div className="p-6">{children}</div>
    </motion.div>
  );
}

// ─── DONUT CHART (Issues by Category) ──────────────────────────
function DonutChart({ tickets }: { tickets: TicketData[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  const counts = tickets.reduce<Record<string, number>>((acc, t) => {
    acc[t.category] = (acc[t.category] ?? 0) + 1;
    return acc;
  }, {});
  const total = tickets.length || 1;
  const slices = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([cat, count], i) => ({
      cat, count, pct: count / total, color: CAT_COLORS[i % CAT_COLORS.length],
    }));

  const R = 60, CX = 80, CY = 80, STROKE = 18;
  const circum = 2 * Math.PI * R;

  let offset = 0;
  const arcs = slices.map(s => {
    const dash = s.pct * circum;
    const gap = circum - dash;
    const startOffset = circum - offset;
    offset += dash + 2; // 2px gap between slices
    return { ...s, dash, gap, startOffset };
  });

  return (
    <ChartCard title="Issues by Category" subtitle="Distribution of ticket types" accent="#22d3ee">
      <div ref={ref} className="flex items-center gap-6 flex-wrap">
        {/* SVG Donut */}
        <div className="relative shrink-0">
          <svg width={160} height={160} viewBox="0 0 160 160">
            {/* BG ring */}
            <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={STROKE} />
            {arcs.map((arc, i) => (
              <motion.circle
                key={arc.cat}
                cx={CX} cy={CY} r={R}
                fill="none"
                stroke={arc.color}
                strokeWidth={STROKE}
                strokeLinecap="round"
                strokeDasharray={`${arc.dash - 2} ${arc.gap + 2}`}
                initial={{ strokeDashoffset: circum }}
                animate={inView ? { strokeDashoffset: arc.startOffset } : {}}
                transition={{ duration: 0.9, delay: i * 0.08, ease: [0.21, 0.47, 0.32, 0.98] }}
                transform={`rotate(-90 ${CX} ${CY})`}
                style={{ filter: `drop-shadow(0 0 5px ${arc.color}80)` }}
              />
            ))}
            {/* Center text */}
            <text x={CX} y={CY - 6} textAnchor="middle" fill="white" fontSize={22} fontWeight={800} fontFamily="system-ui">
              {tickets.length}
            </text>
            <text x={CX} y={CY + 12} textAnchor="middle" fill="#64748b" fontSize={9} fontWeight={600} fontFamily="system-ui">
              TOTAL
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2 min-w-0">
          {slices.map((s, i) => (
            <motion.div key={s.cat}
              initial={{ opacity: 0, x: -14 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.3 + i * 0.06, duration: 0.35 }}
              className="flex items-center gap-2.5 text-xs group"
            >
              <div className="w-2 h-2 rounded-full shrink-0 transition-all group-hover:scale-125"
                style={{ background: s.color, boxShadow: `0 0 5px ${s.color}` }} />
              <span className="text-slate-400 truncate flex-1 text-[11px]">{s.cat}</span>
              <span className="font-bold tabular-nums shrink-0" style={{ color: s.color }}>{s.count}</span>
              <span className="text-slate-700 text-[10px] shrink-0 w-8 text-right">{Math.round(s.pct * 100)}%</span>
            </motion.div>
          ))}
          {slices.length === 0 && <p className="text-slate-700 text-xs">No ticket data</p>}
        </div>
      </div>
    </ChartCard>
  );
}

// ─── LINE CHART (Tickets over time) ────────────────────────────
function LineChart({ tickets }: { tickets: TicketData[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  // Group by day for last 14 days
  const now = Date.now();
  const DAYS = 14;
  const dayCounts = Array.from({ length: DAYS }, (_, i) => {
    const day = new Date(now - (DAYS - 1 - i) * 86400000);
    const label = day.toLocaleDateString('en', { month: 'short', day: 'numeric' });
    const count = tickets.filter(t => {
      if (!t.created_at) return false;
      const d = new Date(t.created_at);
      return d.toDateString() === day.toDateString();
    }).length;
    return { label, count };
  });

  const W = 340, H = 120, padX = 8, padY = 12;
  const maxVal = Math.max(...dayCounts.map(d => d.count), 1);
  const pts = dayCounts.map((d, i) => ({
    x: padX + (i / (DAYS - 1)) * (W - padX * 2),
    y: padY + (1 - d.count / maxVal) * (H - padY * 2),
    ...d,
  }));

  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaD = `${pathD} L ${pts[pts.length - 1].x.toFixed(1)} ${H} L ${pts[0].x.toFixed(1)} ${H} Z`;

  const pathLen = 1200; // approximate
  const [len, setLen] = useState(pathLen);
  const pathRef = useRef<SVGPathElement>(null);
  useEffect(() => {
    if (pathRef.current) setLen(pathRef.current.getTotalLength());
  }, []);

  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <ChartCard title="Tickets Over Time" subtitle="Last 14 days" accent="#a78bfa">
      <div ref={ref}>
        <svg width="100%" viewBox={`0 0 ${W} ${H + 24}`} className="overflow-visible">
          {/* Y-axis grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map(f => {
            const y = padY + (1 - f) * (H - padY * 2);
            return (
              <line key={f} x1={padX} y1={y} x2={W - padX} y2={y}
                stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
            );
          })}

          {/* Area fill */}
          <motion.path
            d={areaD}
            fill="url(#lineGrad)"
            initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
          />
          <defs>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Line path */}
          <motion.path
            ref={pathRef}
            d={pathD}
            fill="none"
            stroke="#a78bfa"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={len}
            initial={{ strokeDashoffset: len }}
            animate={inView ? { strokeDashoffset: 0 } : {}}
            transition={{ duration: 1.0, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
            style={{ filter: 'drop-shadow(0 0 6px #a78bfa80)' }}
          />

          {/* Data points */}
          {pts.map((p, i) => (
            <g key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: 'pointer' }}>
              <circle cx={p.x} cy={p.y} r={14} fill="transparent" />
              <motion.circle
                cx={p.x} cy={p.y} r={hovered === i ? 5 : 3.5}
                fill={hovered === i ? '#a78bfa' : '#1e1040'}
                stroke="#a78bfa" strokeWidth={hovered === i ? 2 : 1.5}
                initial={{ opacity: 0, scale: 0 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.6 + i * 0.04, duration: 0.25 }}
                style={{ filter: hovered === i ? 'drop-shadow(0 0 6px #a78bfa)' : 'none' }}
              />
              {/* Tooltip */}
              {hovered === i && (
                <g>
                  <rect x={p.x - 28} y={p.y - 36} width={56} height={22} rx={4}
                    fill="rgba(2,8,23,0.95)" stroke="rgba(167,139,250,0.4)" strokeWidth={1} />
                  <text x={p.x} y={p.y - 21} textAnchor="middle" fill="#a78bfa" fontSize={10} fontWeight={700} fontFamily="system-ui">
                    {p.count} ticket{p.count !== 1 ? 's' : ''}
                  </text>
                </g>
              )}
            </g>
          ))}

          {/* X-axis labels — show every 4th */}
          {pts.filter((_, i) => i % 4 === 0 || i === pts.length - 1).map((p, i) => (
            <text key={i} x={p.x} y={H + 18} textAnchor="middle" fill="#475569" fontSize={8} fontFamily="system-ui">
              {p.label}
            </text>
          ))}
        </svg>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-3 mt-2">
          {[
            { label: 'Today', val: dayCounts[DAYS - 1].count, color: '#a78bfa' },
            { label: 'This Week', val: dayCounts.slice(-7).reduce((s, d) => s + d.count, 0), color: '#60a5fa' },
            { label: 'Total', val: tickets.length, color: '#22d3ee' },
          ].map(s => {
            const count = useCountUp(s.val, 900, inView);
            return (
              <div key={s.label} className="text-center rounded-xl py-2"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <p className="text-lg font-black tabular-nums" style={{ color: s.color }}>{count}</p>
                <p className="text-[9px] text-slate-600 uppercase tracking-widest">{s.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </ChartCard>
  );
}

// ─── HORIZONTAL BAR CHART (Department Workload) ─────────────────
const DEPT_PALETTE: Record<string, { bar: string; glow: string }> = {
  Electrical:   { bar: '#fbbf24', glow: 'rgba(251,191,36,0.3)'   },
  Civil:        { bar: '#60a5fa', glow: 'rgba(96,165,250,0.3)'   },
  IT:           { bar: '#22d3ee', glow: 'rgba(34,211,238,0.3)'   },
  Housekeeping: { bar: '#4ade80', glow: 'rgba(74,222,128,0.3)'   },
  Grounds:      { bar: '#a78bfa', glow: 'rgba(167,139,250,0.3)'  },
  Maintenance:  { bar: '#fb923c', glow: 'rgba(251,146,60,0.3)'   },
};

function DeptBar({ dept, open, total, color, glow, delay, inView }: {
  dept: string; open: number; total: number;
  color: string; glow: string; delay: number; inView: boolean;
}) {
  const pct = total ? (open / total) * 100 : 0;
  const count = useCountUp(open, 800, inView);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ delay, duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="group"
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-semibold text-slate-400 group-hover:text-white transition-colors">{dept}</span>
        <div className="flex items-center gap-3 text-xs">
          <span className="font-black tabular-nums" style={{ color }}>{count}</span>
          <span className="text-slate-700">/ {total}</span>
          <span className="text-slate-500 font-bold w-9 text-right">{Math.round(pct)}%</span>
        </div>
      </div>
      <div className="relative h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}cc, ${color})`, boxShadow: `0 0 10px ${glow}` }}
          initial={{ width: 0 }}
          animate={inView ? { width: `${pct}%` } : {}}
          transition={{ duration: 1.0, delay: delay + 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
        >
          {/* Shimmer sweep */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={inView ? { x: ['-100%', '200%'] } : {}}
            transition={{ duration: 1.4, delay: delay + 0.7, ease: 'easeInOut' }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}

function DeptWorkloadChart({ tickets }: { tickets: TicketData[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  const depts = Array.from(new Set(tickets.map(t => t.department))).filter(Boolean);
  const rows = depts
    .map(dep => ({
      dept: dep,
      open:  tickets.filter(t => t.department === dep && t.status !== 'Resolved' && t.status !== 'Closed').length,
      total: tickets.filter(t => t.department === dep).length,
      ...(DEPT_PALETTE[dep] ?? { bar: '#64748b', glow: 'rgba(100,116,139,0.3)' }),
    }))
    .sort((a, b) => b.open - a.open);

  return (
    <ChartCard title="Department Workload" subtitle="Open vs total tickets per department" accent="#f59e0b">
      <div ref={ref} className="space-y-4">
        {rows.length === 0 && <p className="text-slate-700 text-xs text-center py-4">No department data</p>}
        {rows.map((r, i) => (
          <DeptBar key={r.dept} {...r} color={r.bar} glow={r.glow} delay={i * 0.07} inView={inView} />
        ))}
      </div>
    </ChartCard>
  );
}

// ─── PRIORITY RING (mini stat ring) ────────────────────────────
function PriorityRings({ tickets }: { tickets: TicketData[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  const total = tickets.length || 1;
  const high   = tickets.filter(t => t.priority === 'High').length;
  const medium = tickets.filter(t => t.priority === 'Medium').length;
  const low    = tickets.filter(t => t.priority === 'Low').length;
  const resolved = tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length;

  const rings = [
    { label: 'Critical',  val: high,    pct: high / total,     color: '#f87171', r: 44 },
    { label: 'Medium',    val: medium,  pct: medium / total,   color: '#fbbf24', r: 34 },
    { label: 'Low',       val: low,     pct: low / total,      color: '#22d3ee', r: 24 },
  ];

  return (
    <ChartCard title="Priority Breakdown" subtitle="By severity level" accent="#f87171">
      <div ref={ref} className="flex items-center gap-8 flex-wrap">
        <div className="relative shrink-0">
          <svg width={120} height={120} viewBox="0 0 120 120">
            {rings.map(ring => {
              const circ = 2 * Math.PI * ring.r;
              const dash = ring.pct * circ;
              return (
                <g key={ring.label}>
                  <circle cx={60} cy={60} r={ring.r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={7} />
                  <motion.circle
                    cx={60} cy={60} r={ring.r}
                    fill="none" stroke={ring.color} strokeWidth={7}
                    strokeLinecap="round"
                    strokeDasharray={`${dash} ${circ}`}
                    initial={{ strokeDashoffset: circ }}
                    animate={inView ? { strokeDashoffset: circ - dash } : {}}
                    transition={{ duration: 0.9, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
                    transform="rotate(-90 60 60)"
                    style={{ filter: `drop-shadow(0 0 5px ${ring.color}80)` }}
                  />
                </g>
              );
            })}
            <text x={60} y={57} textAnchor="middle" fill="white" fontSize={18} fontWeight={800} fontFamily="system-ui">{tickets.length}</text>
            <text x={60} y={70} textAnchor="middle" fill="#475569" fontSize={8} fontFamily="system-ui">TICKETS</text>
          </svg>
        </div>

        <div className="flex-1 space-y-3">
          {rings.map((ring, i) => {
            const count = useCountUp(ring.val, 900, inView);
            return (
              <motion.div key={ring.label}
                initial={{ opacity: 0, x: 14 }} animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: ring.color, boxShadow: `0 0 6px ${ring.color}` }} />
                <span className="text-xs text-slate-500 flex-1">{ring.label}</span>
                <span className="text-sm font-black tabular-nums" style={{ color: ring.color }}>{count}</span>
              </motion.div>
            );
          })}
          <div className="pt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full shrink-0 bg-green-400" style={{ boxShadow: '0 0 6px #4ade80' }} />
              <span className="text-xs text-slate-500 flex-1">Resolved</span>
              <span className="text-sm font-black tabular-nums text-green-400">{useCountUp(resolved, 900, inView)}</span>
            </div>
          </div>
        </div>
      </div>
    </ChartCard>
  );
}

// ─── MAIN EXPORT ───────────────────────────────────────────────
export default function AnalyticsCharts({ tickets }: { tickets: TicketData[] }) {
  return (
    <div className="space-y-6">
      {/* Top row */}
      <div className="grid xl:grid-cols-2 gap-5">
        <DonutChart tickets={tickets} />
        <PriorityRings tickets={tickets} />
      </div>
      {/* Line chart — full width */}
      <LineChart tickets={tickets} />
      {/* Department bars — full width */}
      <DeptWorkloadChart tickets={tickets} />
    </div>
  );
}
