'use client';

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Ticket, Building2, Settings, LogOut,
  RefreshCw, Bell, TrendingUp, Users, X, Eye,
  ChevronDown, Shield, AlertTriangle, CheckCircle2, Zap, Activity,
  Clock, Download, Globe, BarChart2, MapPin,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { auth, db } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { StatCard, WorkloadBar, ActivityFeed } from './components';
import Badge from '@/app/components/ui/Badge';
import Tag from '@/app/components/ui/Tag';
import GlowButton from '@/app/components/ui/GlowButton';
import { useToast } from '@/app/components/ui/Toast';
import dynamic from 'next/dynamic';
const CampusMap3D = dynamic(() => import('@/app/components/CampusMap3D'), { ssr: false });
const AnalyticsCharts = dynamic(() => import('@/app/components/AnalyticsCharts'), { ssr: false });


// ─── TYPES ────────────────────────────────────────────────
type Status = 'Open' | 'In Progress' | 'Resolved' | 'Escalated' | 'Closed';
type Priority = 'High' | 'Medium' | 'Low';

interface TicketItem {
  _id: string; category: string; department: string; priority: Priority;
  description: string; created_at: string; status: Status;
  image_url: string; user_id: string; location?: string;
}

const DEPARTMENTS = ['Electrical', 'Civil', 'Housekeeping', 'IT', 'Grounds'];

const DEPT_COLORS: Record<string, { color: string; glow: string }> = {
  Electrical: { color: '#f59e0b', glow: 'rgba(245,158,11,0.35)' },
  Civil: { color: '#22d3ee', glow: 'rgba(34,211,238,0.35)' },
  Housekeeping: { color: '#4ade80', glow: 'rgba(74,222,128,0.35)' },
  IT: { color: '#a78bfa', glow: 'rgba(167,139,250,0.35)' },
  Grounds: { color: '#34d399', glow: 'rgba(52,211,153,0.35)' },
};

const priorityToTag = (p: Priority): 'red' | 'amber' | 'green' =>
  p === 'High' ? 'red' : p === 'Medium' ? 'amber' : 'green';

const statusToBadge = (s: Status): 'open' | 'in-progress' | 'resolved' | 'escalated' | 'closed' => {
  const m: Record<Status, ReturnType<typeof statusToBadge>> = {
    Open: 'open', 'In Progress': 'in-progress',
    Resolved: 'resolved', Escalated: 'escalated', Closed: 'closed',
  };
  return m[s] ?? 'open';
};

const relTime = (iso: string) => {
  if (!iso) return '—';
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
};

// ─── LIVE CLOCK ───────────────────────────────────────────
function LiveClock() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="font-mono text-sm font-bold text-cyan-400 tabular-nums"
      style={{ textShadow: '0 0 12px rgba(34,211,238,0.5)' }}
      suppressHydrationWarning>
      {time || '--:--:--'}
    </span>
  );
}

// ─── GLOWING RING CHART ───────────────────────────────────
function PriorityRing({ tickets }: { tickets: TicketItem[] }) {
  const high = tickets.filter(t => t.priority === 'High').length;
  const med = tickets.filter(t => t.priority === 'Medium').length;
  const low = tickets.filter(t => t.priority === 'Low').length;
  const total = tickets.length || 1;

  const r = 44, cx = 56, cy = 56;
  const circ = 2 * Math.PI * r;

  const segments = [
    { val: high, color: '#f87171', glow: 'rgba(248,113,113,0.6)', label: 'High' },
    { val: med, color: '#fbbf24', glow: 'rgba(251,191,36,0.6)', label: 'Medium' },
    { val: low, color: '#4ade80', glow: 'rgba(74,222,128,0.6)', label: 'Low' },
  ];

  let offset = 0;
  return (
    <div className="flex items-center gap-6">
      <div className="relative shrink-0">
        <svg width="112" height="112" viewBox="0 0 112 112">
          {/* Track */}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
          {segments.map((seg, i) => {
            const dash = (seg.val / total) * circ;
            const gap = circ - dash;
            const segOffset = offset;
            offset += dash;
            return (
              <motion.circle
                key={i}
                cx={cx} cy={cy} r={r}
                fill="none"
                stroke={seg.color}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${dash} ${gap}`}
                strokeDashoffset={-segOffset + circ * 0.25}
                style={{ filter: `drop-shadow(0 0 6px ${seg.color})` }}
                initial={{ strokeDasharray: `0 ${circ}` }}
                animate={{ strokeDasharray: `${dash} ${gap}` }}
                transition={{ duration: 1.2, delay: 0.3 + i * 0.15, ease: 'easeOut' }}
              />
            );
          })}
          {/* Center text */}
          <text x={cx} y={cy - 6} textAnchor="middle" className="fill-white" style={{ fontSize: 18, fontWeight: 900 }}>{total}</text>
          <text x={cx} y={cy + 10} textAnchor="middle" className="fill-slate-500" style={{ fontSize: 9 }}>TICKETS</text>
        </svg>
      </div>
      <div className="space-y-2 flex-1">
        {segments.map(seg => (
          <div key={seg.label} className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: seg.color, boxShadow: `0 0 6px ${seg.glow}` }} />
            <span className="text-slate-400 flex-1">{seg.label}</span>
            <span className="font-bold tabular-nums" style={{ color: seg.color }}>{seg.val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── TICKET MODAL ─────────────────────────────────────────
function TicketModal({ ticket, onClose, onUpdate }: {
  ticket: TicketItem; onClose: () => void;
  onUpdate: (id: string, status: Status) => void;
}) {
  const [status, setStatus] = useState<Status>(ticket.status);
  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(2,8,23,0.85)', backdropFilter: 'blur(8px)' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div onClick={e => e.stopPropagation()} className="w-full max-w-lg rounded-2xl border overflow-hidden"
        style={{ background: 'rgba(4,10,22,0.98)', borderColor: 'rgba(34,211,238,0.2)', boxShadow: '0 24px 80px rgba(0,0,0,0.8), 0 0 60px rgba(34,211,238,0.05)' }}
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(34,211,238,0.04)' }}>
          <div>
            <h2 className="text-base font-bold text-white">Ticket <span className="font-mono text-cyan-400">#{ticket._id.slice(-6)}</span></h2>
            <p className="text-xs text-slate-500 mt-0.5">{ticket.category} · {ticket.department}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 space-y-4">
          {ticket.image_url && (
            <div className="w-full aspect-video rounded-xl overflow-hidden bg-black border" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ticket.image_url} alt="Issue" className="w-full h-full object-contain" />
            </div>
          )}
          <div className="rounded-xl p-4 border" style={{ background: 'rgba(34,211,238,0.04)', borderColor: 'rgba(34,211,238,0.12)' }}>
            <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><Zap className="w-3 h-3" /> AI Classification</p>
            <div className="grid grid-cols-4 gap-3 text-sm">
              <div><p className="text-xs text-slate-600 mb-1">Category</p><p className="font-semibold text-white">{ticket.category}</p></div>
              <div><p className="text-xs text-slate-600 mb-1">Department</p><p className="font-semibold text-white">{ticket.department}</p></div>
              <div><p className="text-xs text-slate-600 mb-1">Location</p><p className="font-semibold text-white truncate" title={ticket.location || 'Property'}>{ticket.location || 'Property'}</p></div>
              <div><p className="text-xs text-slate-600 mb-1">Priority</p><Tag variant={priorityToTag(ticket.priority)} size="sm">{ticket.priority}</Tag></div>
            </div>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">{ticket.description}</p>
          <div>
            <label className="text-xs font-bold text-cyan-400 uppercase tracking-widest block mb-2">Update Status</label>
            <div className="relative">
              <select value={status} onChange={e => setStatus(e.target.value as Status)}
                className="w-full rounded-xl px-4 py-2.5 text-sm text-slate-100 outline-none appearance-none border cursor-pointer"
                style={{ background: 'rgba(6,13,31,0.8)', borderColor: 'rgba(34,211,238,0.2)' }}>
                {(['Open', 'In Progress', 'Resolved', 'Escalated', 'Closed'] as Status[]).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>
          </div>
          <div className="flex gap-3">
            <GlowButton className="flex-1" onClick={() => { onUpdate(ticket._id, status); onClose(); }}>Update Ticket</GlowButton>
            <button onClick={onClose} className="px-5 py-2.5 rounded-xl border text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>Cancel</button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── NAV ITEMS ────────────────────────────────────────────
const NAV = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: 'tickets', label: 'All Tickets', icon: <Ticket className="w-4 h-4" /> },
  { id: 'analytics', label: 'Analytics', icon: <BarChart2 className="w-4 h-4" /> },
  { id: 'map', label: 'Property Map', icon: <Globe className="w-4 h-4" /> },
  { id: 'departments', label: 'Departments', icon: <Building2 className="w-4 h-4" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
] as const;
type Page = typeof NAV[number]['id'];


// ─── OVERVIEW ────────────────────────────────────────────
function Overview({ tickets }: { tickets: TicketItem[] }) {
  const open = tickets.filter(t => t.status === 'Open').length;
  const inProg = tickets.filter(t => t.status === 'In Progress').length;
  const resolved = tickets.filter(t => t.status === 'Resolved').length;
  const escalated = tickets.filter(t => t.status === 'Escalated').length;

  const stats = [
    { label: 'Total Tickets', value: tickets.length, icon: <Ticket className="w-5 h-5" />, grad: 'from-cyan-500 to-blue-500', glow: 'rgba(34,211,238,0.25)', delta: '+3 today' },
    { label: 'Open', value: open, icon: <Bell className="w-5 h-5" />, grad: 'from-blue-500 to-indigo-500', glow: 'rgba(59,130,246,0.25)' },
    { label: 'In Progress', value: inProg, icon: <Activity className="w-5 h-5" />, grad: 'from-amber-500 to-orange-500', glow: 'rgba(245,158,11,0.25)' },
    { label: 'Resolved', value: resolved, icon: <CheckCircle2 className="w-5 h-5" />, grad: 'from-green-500 to-emerald-500', glow: 'rgba(34,197,94,0.25)', delta: '↑ 12%' },
  ];

  const deptData = DEPARTMENTS.map(d => ({
    dept: d,
    open: tickets.filter(t => t.department === d && t.status !== 'Resolved').length,
    total: tickets.filter(t => t.department === d).length,
    ...DEPT_COLORS[d],
  })).sort((a, b) => b.open - a.open);

  return (
    <div className="space-y-6">

      {/* Escalated alert */}
      <AnimatePresence>
        {escalated > 0 && (
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-3 p-4 rounded-xl border"
            style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.3)' }}>
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </motion.div>
            <span className="text-sm text-red-300 font-semibold">{escalated} ticket{escalated > 1 ? 's' : ''} escalated past SLA deadline</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s, i) => <StatCard key={s.label} {...s} delay={i * 0.08} />)}
      </div>

      <div className="grid xl:grid-cols-3 gap-5">

        {/* Department workload */}
        <div className="xl:col-span-2 rounded-2xl border p-6"
          style={{ background: 'rgba(4,10,22,0.85)', borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest">Department Workload</h3>
          </div>
          <div className="space-y-5">
            {deptData.map((d, i) => (
              <WorkloadBar key={d.dept} {...d} delay={i * 0.1} />
            ))}
          </div>
        </div>

        {/* Priority ring */}
        <div className="rounded-2xl border p-6" style={{ background: 'rgba(4,10,22,0.85)', borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest">Priority Split</h3>
          </div>
          <PriorityRing tickets={tickets} />
        </div>
      </div>
    </div>
  );
}

// ─── TICKET TABLE ─────────────────────────────────────────
function TicketsPage({ tickets, onView }: { tickets: TicketItem[]; onView: (t: TicketItem) => void }) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');

  const filtered = tickets.filter(t => {
    const q = search.toLowerCase();
    return (!q || t.category.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t._id.includes(q))
      && (filterStatus === 'All' || t.status === filterStatus)
      && (filterPriority === 'All' || t.priority === filterPriority);
  });

  const inputStyle = { background: 'rgba(4,10,22,0.8)', borderColor: 'rgba(255,255,255,0.1)', color: '#cbd5e1' };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl border"
        style={{ background: 'rgba(4,10,22,0.85)', borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="relative flex-1 min-w-48">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tickets…"
            className="w-full rounded-xl pl-4 pr-4 py-2 text-sm outline-none border"
            style={inputStyle} />
        </div>
        {[
          { label: 'Status', val: filterStatus, set: setFilterStatus, opts: ['Open', 'In Progress', 'Resolved', 'Escalated', 'Closed'] },
          { label: 'Priority', val: filterPriority, set: setFilterPriority, opts: ['High', 'Medium', 'Low'] },
        ].map(f => (
          <div key={f.label} className="relative">
            <select value={f.val} onChange={e => f.set(e.target.value)}
              className="appearance-none rounded-xl pl-3 pr-8 py-2 text-sm outline-none border cursor-pointer"
              style={inputStyle}>
              <option value="All">{f.label}: All</option>
              {f.opts.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600 pointer-events-none" />
          </div>
        ))}
        <Tag variant="cyan" size="sm">{filtered.length} results</Tag>
      </div>

      {/* Table */}
      <div className="rounded-2xl border overflow-hidden"
        style={{ background: 'rgba(4,10,22,0.85)', borderColor: 'rgba(255,255,255,0.06)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              {['ID', 'Category / Dept', 'Priority', 'Status', 'Loc / Desc', 'Time', ''].map(h => (
                <th key={h} className="px-5 py-3.5 text-left text-[10px] font-bold text-slate-600 uppercase tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="text-center py-16 text-slate-700 text-sm">No tickets found</td></tr>
            )}
            {filtered.map((t, i) => (
              <motion.tr key={t._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.035, duration: 0.3 }}
                className="border-b hover:bg-white/[0.02] transition-colors"
                style={{ borderColor: 'rgba(255,255,255,0.03)' }}
              >
                <td className="px-5 py-4"><span className="font-mono text-xs font-bold text-cyan-400">#{t._id.slice(-6)}</span></td>
                <td className="px-5 py-4"><p className="font-semibold text-white text-sm">{t.category}</p><p className="text-xs text-slate-600">{t.department}</p></td>
                <td className="px-5 py-4"><Tag variant={priorityToTag(t.priority)} size="sm">{t.priority}</Tag></td>
                <td className="px-5 py-4"><Badge status={statusToBadge(t.status)} pulse={t.status === 'Open'} /></td>
                <td className="px-5 py-4 max-w-40"><p className="text-xs text-cyan-400 font-semibold truncate mb-0.5 flex items-center gap-1"><MapPin className="w-3 h-3" />{t.location || 'Property'}</p><p className="text-[11px] text-slate-500 line-clamp-1">{t.description}</p></td>
                <td className="px-5 py-4 text-xs text-slate-600 whitespace-nowrap" suppressHydrationWarning>{relTime(t.created_at)}</td>
                <td className="px-5 py-4">
                  <button onClick={() => onView(t)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold text-cyan-400 hover:text-white hover:bg-cyan-500/20 transition-colors cursor-pointer"
                    style={{ borderColor: 'rgba(34,211,238,0.2)' }}>
                    <Eye className="w-3.5 h-3.5" /> View
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── DEPARTMENTS ──────────────────────────────────────────
function DepartmentsPage({ tickets, onNavigate }: { tickets: TicketItem[]; onNavigate: () => void }) {
  return (
    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
      {DEPARTMENTS.map((dept, i) => {
        const dt = tickets.filter(t => t.department === dept);
        const open = dt.filter(t => t.status === 'Open').length;
        const inP = dt.filter(t => t.status === 'In Progress').length;
        const done = dt.filter(t => t.status === 'Resolved').length;
        const { color, glow } = DEPT_COLORS[dept];
        return (
          <motion.div key={dept}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            whileHover={{ y: -5, boxShadow: `0 16px 40px ${glow}` }}
            onClick={onNavigate}
            className="rounded-2xl border p-6 cursor-pointer overflow-hidden relative"
            style={{ background: 'rgba(4,10,22,0.85)', borderColor: 'rgba(255,255,255,0.06)' }}
          >
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
            <div className="w-10 h-10 rounded-xl mb-5 flex items-center justify-center border"
              style={{ background: `${glow.replace('0.35', '0.12')}`, borderColor: glow.replace('0.35', '0.3'), boxShadow: `0 4px 14px ${glow}` }}>
              <Building2 className="w-5 h-5" style={{ color }} />
            </div>
            <h3 className="text-base font-bold text-white mb-4">{dept}</h3>
            <div className="grid grid-cols-3 gap-2 text-center mb-4">
              {[['Open', open, color], ['Active', inP, '#f59e0b'], ['Done', done, '#4ade80']].map(([l, v, c]) => (
                <div key={l as string} className="rounded-xl py-2 border" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)' }}>
                  <p className="text-lg font-black tabular-nums" style={{ color: c as string }}>{v as number}</p>
                  <p className="text-[10px] text-slate-600">{l as string}</p>
                </div>
              ))}
            </div>
            <WorkloadBar dept={dept} open={open} total={dt.length} color={color} glow={glow} delay={i * 0.06} />
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── SETTINGS ─────────────────────────────────────────────
function SettingsPage() {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMsg, setInviteMsg] = useState('');
  const [inviting, setInviting] = useState(false);

  const promote = async () => {
    if (!inviteEmail) return;
    setInviting(true); setInviteMsg('Looking up user…');
    try {
      const snap = await getDocs(query(collection(db!, 'users'), where('email', '==', inviteEmail)));
      if (snap.empty) { setInviteMsg('User not found — they must register first.'); }
      else { snap.forEach(async d => await updateDoc(doc(db!, 'users', d.id), { role: 'admin' })); setInviteMsg('User promoted to Admin!'); setInviteEmail(''); }
    } catch { setInviteMsg('Error promoting user.'); }
    setInviting(false); setTimeout(() => setInviteMsg(''), 4000);
  };

  const panelStyle = { background: 'rgba(4,10,22,0.85)', borderColor: 'rgba(255,255,255,0.06)' };
  const inputInner = { background: 'rgba(2,8,23,0.9)', borderColor: 'rgba(34,211,238,0.25)', color: '#e2e8f0' };

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="rounded-2xl border p-6" style={panelStyle}>
        <p className="text-xs text-cyan-400 font-bold uppercase tracking-widest mb-4 flex items-center gap-2"><Shield className="w-3.5 h-3.5" /> Admin Profile</p>
        <div className="flex items-center gap-3 p-3 rounded-xl border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold">{user?.email?.charAt(0).toUpperCase()}</div>
          <div><p className="text-sm font-semibold text-white">Administrator</p><p className="text-xs text-slate-500">{user?.email}</p></div>
        </div>
      </div>
      <div className="rounded-2xl border p-6" style={panelStyle}>
        <p className="text-xs text-blue-400 font-bold uppercase tracking-widest mb-4 flex items-center gap-2"><Users className="w-3.5 h-3.5" /> Promote to Admin</p>
        <div className="flex gap-2 mb-2">
          <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} type="email" placeholder="user@organization.com"
            className="flex-1 rounded-xl px-4 py-2 text-sm border outline-none" style={inputInner} />
          <GlowButton size="sm" onClick={promote} loading={inviting} disabled={!inviteEmail}>Promote</GlowButton>
        </div>
        {inviteMsg && <p className={`text-xs font-medium ${inviteMsg.includes('not found') || inviteMsg.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>{inviteMsg}</p>}
      </div>
      <div className="rounded-2xl border p-6" style={panelStyle}>
        <p className="text-xs text-purple-400 font-bold uppercase tracking-widest mb-4 flex items-center gap-2"><Download className="w-3.5 h-3.5" /> Data Export</p>
        <button onClick={() => alert('Connect to /api/admin/export/csv')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>
      <GlowButton onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}
        variant={saved ? 'ghost' : 'primary'} icon={saved ? <CheckCircle2 className="w-4 h-4" /> : undefined}>
        {saved ? 'Saved!' : 'Save Settings'}
      </GlowButton>
    </div>
  );
}

// ─── MAIN DASHBOARD ───────────────────────────────────────
export default function AdminDashboard() {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [page, setPage] = useState<Page>('overview');
  const [selectedTicket, setSelectedTicket] = useState<TicketItem | null>(null);

  useEffect(() => {
    if (!loading) {
      if (!user) router.push('/login');
      else if (role !== 'admin') router.push('/');
    }
  }, [user, role, loading, router]);

  useEffect(() => {
    const fetchAdminData = async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const token = (user && typeof user.getIdToken === 'function') ? await user.getIdToken() : null;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      fetch(`${apiUrl}/api/complaints`, { headers })
        .then(r => r.json())
        .then(d => { if (d?.data) setTickets(d.data); })
        .catch(() => { });
    };
    if (user && typeof user.getIdToken === 'function') fetchAdminData();
  }, [user]);

  const handleUpdate = async (id: string, status: Status) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const token = (user && typeof user.getIdToken === 'function') ? await user.getIdToken() : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch(`${apiUrl}/api/admin/complaints/${id}/status`, {
        method: 'PUT', headers: headers,
        body: JSON.stringify({ status }),
      });
      setTickets(prev => prev.map(t => t._id === id ? { ...t, status } : t));
      toast.success('Ticket updated', `Status set to "${status}" successfully.`);
    } catch {
      toast.error('Update failed', 'Could not update ticket status. Try again.');
    }
  };

  if (loading || !user || role !== 'admin') {
    return (
      <div className="flex flex-col h-screen items-center justify-center gap-6" style={{ background: '#020817' }}>
        <motion.img
          src="/logo.png"
          alt="InfraMind loading"
          className="h-16 w-auto object-contain"
          animate={{ opacity: [0.5, 1, 0.5], filter: ['drop-shadow(0 0 10px rgba(34,211,238,0.2))', 'drop-shadow(0 0 20px rgba(34,211,238,0.6))', 'drop-shadow(0 0 10px rgba(34,211,238,0.2))'] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <RefreshCw className="w-6 h-6 text-cyan-400" />
        </motion.div>
      </div>
    );
  }

  const openCount = tickets.filter(t => t.status === 'Open').length;
  const pageTitle: Record<Page, string> = {
    overview: 'Operations Center', tickets: 'Ticket Queue',
    analytics: 'Analytics', map: 'Property Map', departments: 'Departments', settings: 'Settings',
  };
  const isMap = page === 'map';

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#020817' }} suppressHydrationWarning>

      {/* ── SIDEBAR ── */}
      <motion.aside
        initial={{ x: -240 }} animate={{ x: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-60 shrink-0 flex flex-col border-r relative overflow-hidden"
        style={{ background: 'rgba(2,6,18,0.98)', borderColor: 'rgba(34,211,238,0.07)' }}
      >
        {/* Animated sidebar scan line */}
        <motion.div className="absolute left-0 right-0 h-[1px] pointer-events-none"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.3), transparent)' }}
          animate={{ top: ['0%', '100%'] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
        />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />

        {/* Logo */}
        <div className="flex items-center px-5 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="InfraMind" className="h-14 w-auto object-contain"
            style={{ filter: 'drop-shadow(0 0 14px rgba(34,211,238,0.4))' }} />
        </div>

        {/* System status row */}
        <div className="mx-3 mt-3 px-3 py-2.5 rounded-xl border flex items-center gap-2"
          style={{ background: 'rgba(34,211,238,0.04)', borderColor: 'rgba(34,211,238,0.12)' }}>
          <motion.div className="w-2 h-2 rounded-full bg-green-400"
            animate={{ opacity: [1, 0.3, 1], boxShadow: ['0 0 4px #4ade80', '0 0 0px #4ade80', '0 0 4px #4ade80'] }}
            transition={{ duration: 2, repeat: Infinity }} />
          <span className="text-[10px] text-green-400 font-bold uppercase tracking-widest">Systems Online</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(item => {
            const isActive = page === item.id;
            return (
              <motion.button key={item.id}
                onClick={() => setPage(item.id)}
                whileHover={!isActive ? { x: 4 } : {}}
                whileTap={{ scale: 0.97 }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${isActive ? 'text-cyan-300' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                  }`}
                style={isActive ? { background: 'rgba(34,211,238,0.07)', border: '1px solid rgba(34,211,238,0.15)' } : {}}
              >
                <span className={isActive ? 'text-cyan-400' : ''}>{item.icon}</span>
                <span className="flex-1 text-left">{item.label}</span>
                {item.id === 'tickets' && openCount > 0 && (
                  <motion.span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(34,211,238,0.15)', color: '#22d3ee' }}
                    animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                    {openCount}
                  </motion.span>
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* User */}
        <div className="px-3 pb-4 border-t pt-4 space-y-1" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user?.displayName?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-300 truncate">{user?.displayName || 'Admin'}</p>
              <p className="text-[10px] text-slate-600 truncate">{user?.email}</p>
            </div>
          </div>
          <motion.button whileHover={{ x: 4 }} onClick={async () => { await signOut(auth!); router.push('/'); }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-500/60 hover:text-red-400 hover:bg-red-500/8 transition-colors cursor-pointer">
            <LogOut className="w-4 h-4" /> Logout
          </motion.button>
        </div>
      </motion.aside>

      {/* ── MAIN ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top bar */}
        <header className="flex items-center justify-between px-8 py-4 border-b shrink-0"
          style={{ background: 'rgba(2,6,18,0.95)', borderColor: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)' }}>
          <div>
            <h1 className="text-lg font-black text-white tracking-wide">{pageTitle[page]}</h1>
            <p className="text-xs text-slate-600 mt-0.5">Facility Infrastructure · {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border"
              style={{ background: 'rgba(34,211,238,0.04)', borderColor: 'rgba(34,211,238,0.15)' }}>
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <LiveClock />
            </div>
            <motion.button whileHover={{ scale: 1.06, rotate: 180 }} whileTap={{ scale: 0.94 }}
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium text-slate-500 hover:text-cyan-400 hover:border-cyan-400/30 transition-all cursor-pointer"
              style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              <RefreshCw className="w-4 h-4" />
            </motion.button>
          </div>
        </header>

        {/* Page content */}
        <main className={`flex-1 overflow-hidden ${isMap ? 'p-4' : 'overflow-y-auto p-6 sm:p-8'}`}>
          <AnimatePresence mode="wait">
            <motion.div key={page}
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}
              className={isMap ? 'h-full' : ''}>
              {page === 'overview' && <Overview tickets={tickets} />}
              {page === 'tickets' && <TicketsPage tickets={tickets} onView={setSelectedTicket} />}
              {page === 'analytics' && <div className="pb-6"><AnalyticsCharts tickets={tickets} /></div>}
              {page === 'map' && (
                <div className="h-full min-h-[calc(100vh-100px)] relative">
                  <CampusMap3D tickets={tickets} />
                </div>
              )}
              {page === 'departments' && <DepartmentsPage tickets={tickets} onNavigate={() => setPage('tickets')} />}
              {page === 'settings' && <SettingsPage />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedTicket && (
          <TicketModal ticket={selectedTicket} onClose={() => setSelectedTicket(null)} onUpdate={handleUpdate} />
        )}
      </AnimatePresence>
    </div>
  );
}
