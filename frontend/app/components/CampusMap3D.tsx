'use client';

import React, { useRef, useState, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, OrbitControls, Line } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';

// ─── TYPES ─────────────────────────────────────────────
export interface MapTicket {
  _id: string; category: string; department: string;
  priority: 'High' | 'Medium' | 'Low'; description: string; status: string;
}

interface Building {
  id: string; label: string; pos: [number, number, number];
  size: [number, number, number]; color: string; emissive: string;
  dept: string[];
}

// ─── CAMPUS LAYOUT ────────────────────────────────────
const BUILDINGS: Building[] = [
  { id: 'academic-a', label: 'Academic Block A', pos: [-4, 0.75, -3], size: [3.5, 1.5, 2.5], color: '#0f2040', emissive: '#1e40af', dept: ['Electrical','Civil'] },
  { id: 'academic-b', label: 'Academic Block B', pos: [1,  0.875, -3], size: [3,   1.75, 2.5], color: '#0f2040', emissive: '#1e40af', dept: ['Electrical','Civil'] },
  { id: 'library',    label: 'Library',          pos: [-4, 0.6,   1],  size: [2.5, 1.2, 2],   color: '#1a0f40', emissive: '#7c3aed', dept: ['IT'] },
  { id: 'lab-a',     label: 'Computer Lab',      pos: [1,  0.5,   1],  size: [2,   1.0, 1.8], color: '#001f2b', emissive: '#0891b2', dept: ['IT'] },
  { id: 'lab-b',     label: 'Physics Lab',       pos: [3.5,0.45,  1],  size: [1.8, 0.9, 1.8], color: '#001f2b', emissive: '#0891b2', dept: ['Electrical'] },
  { id: 'cafeteria', label: 'Cafeteria',         pos: [-1, 0.3,   3.5],size: [3.5, 0.6, 2],   color: '#1a1000', emissive: '#d97706', dept: ['Housekeeping'] },
  { id: 'hostel-a',  label: 'Hostel Block A',    pos: [4,  1.25, -1],  size: [2,   2.5, 2],   color: '#0f2012', emissive: '#16a34a', dept: ['Civil','Housekeeping'] },
  { id: 'hostel-b',  label: 'Hostel Block B',    pos: [4,  1.1,  2.5], size: [2,   2.2, 2],   color: '#0f2012', emissive: '#16a34a', dept: ['Civil','Housekeeping'] },
  { id: 'grounds',   label: 'Grounds',           pos: [-5, 0.1,  3.5], size: [2,   0.2, 2.5], color: '#091a09', emissive: '#4ade80', dept: ['Grounds'] },
];

const PRIORITY_COLORS: Record<string, { hex: string; glow: string }> = {
  High:   { hex: '#f87171', glow: '#ef4444' },
  Medium: { hex: '#fbbf24', glow: '#f59e0b' },
  Low:    { hex: '#60a5fa', glow: '#3b82f6' },
};

// ─── BOX EDGES HELPER ─────────────────────────────────
function BoxEdges({ size, color }: { size: [number, number, number]; color: string }) {
  const [w, h, d] = size;
  const hw = w / 2, hh = h / 2, hd = d / 2;
  const pts: [number, number, number][] = [
    [-hw,-hh,-hd],[hw,-hh,-hd],[hw,hh,-hd],[-hw,hh,-hd],[-hw,-hh,-hd],
    [-hw,-hh,hd],[hw,-hh,hd],[hw,hh,hd],[-hw,hh,hd],[-hw,-hh,hd],
  ];
  const cross: Array<[[number,number,number],[number,number,number]]> = [
    [[ hw,-hh,-hd],[ hw,-hh,hd]],[[ hw,hh,-hd],[ hw,hh,hd]],
    [[-hw,hh,-hd],[-hw,hh,hd]], [[-hw,-hh,-hd],[-hw,-hh,hd]],
  ];
  return (
    <>
      <Line points={pts} color={color} lineWidth={1.4} />
      {cross.map(([a, b], i) => <Line key={i} points={[a, b]} color={color} lineWidth={1.4} />)}
    </>
  );
}

// ─── BUILDING MESH ────────────────────────────────────
function BuildingMesh({ b }: { b: Building }) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = hovered ? 0.45 : 0.18 + Math.sin(clock.getElapsedTime() * 0.8 + b.pos[0]) * 0.06;
  });
  return (
    <group position={b.pos}>
      <mesh ref={meshRef} castShadow receiveShadow
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}>
        <boxGeometry args={b.size} />
        <meshStandardMaterial color={b.color} emissive={b.emissive} emissiveIntensity={0.22} roughness={0.6} metalness={0.3} />
      </mesh>
      <BoxEdges size={b.size} color={hovered ? '#22d3ee' : b.emissive} />
      {/* Label */}
      <Html center position={[0, b.size[1] / 2 + 0.3, 0]} distanceFactor={10}>
        <div className="pointer-events-none px-1.5 py-0.5 rounded text-[8px] font-bold whitespace-nowrap"
          style={{ background: 'rgba(2,8,23,0.75)', color: b.emissive, border: `1px solid ${b.emissive}40`, backdropFilter: 'blur(4px)', textShadow: `0 0 6px ${b.emissive}` }}>
          {b.label}
        </div>
      </Html>
    </group>
  );
}

// ─── ISSUE MARKER ─────────────────────────────────────
function IssueMarker({
  ticket, pos, onClick, onHover,
}: {
  ticket: MapTicket;
  pos: [number, number, number];
  onClick: () => void;
  onHover: (t: MapTicket | null) => void;
}) {
  const markerRef = useRef<THREE.Mesh>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);
  const { hex, glow } = PRIORITY_COLORS[ticket.priority] ?? PRIORITY_COLORS.Low;
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (markerRef.current) {
      markerRef.current.position.y = pos[1] + 0.35 + Math.sin(t * 1.4 + pos[0]) * 0.12;
    }
    if (ringRef.current) {
      const s = 1 + Math.sin(t * 2 + pos[0]) * 0.18;
      ringRef.current.scale.set(s, s, s);
      const mat = ringRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.25 + Math.sin(t * 2) * 0.15;
    }
  });

  return (
    <group position={pos}>
      {/* Pulsing ring */}
      <mesh ref={ringRef} position={[0, 0.35, 0]}>
        <torusGeometry args={[0.22, 0.035, 8, 24]} />
        <meshBasicMaterial color={hex} transparent opacity={0.3} />
      </mesh>

      {/* Sphere marker */}
      <mesh ref={markerRef} position={[0, 0.35, 0]}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); onHover(ticket); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); onHover(null); document.body.style.cursor = 'default'; }}>
        <sphereGeometry args={[0.14, 16, 16]} />
        <meshStandardMaterial color={hex} emissive={glow} emissiveIntensity={hovered ? 2.5 : 1.4} roughness={0.2} metalness={0.1} />
      </mesh>

      {/* Vertical stem */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.25, 6]} />
        <meshBasicMaterial color={hex} />
      </mesh>

      {/* Tooltip */}
      {hovered && (
        <Html position={[0, 0.7, 0]} center distanceFactor={8}>
          <div className="pointer-events-none w-44 rounded-xl border text-xs p-2.5"
            style={{ background: 'rgba(2,8,23,0.95)', borderColor: `${hex}44`, backdropFilter: 'blur(12px)', boxShadow: `0 8px 24px rgba(0,0,0,0.6), 0 0 16px ${glow}30` }}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: hex, boxShadow: `0 0 6px ${glow}` }} />
              <span className="font-bold" style={{ color: hex }}>{ticket.priority}</span>
              <span className="text-slate-600 ml-auto">#{ticket._id.slice(-5)}</span>
            </div>
            <p className="font-semibold text-white leading-tight mb-1">{ticket.category}</p>
            <p className="text-slate-500 text-[10px] line-clamp-2 leading-relaxed">{ticket.description}</p>
            <p className="text-slate-700 text-[9px] mt-1.5">{ticket.department}</p>
          </div>
        </Html>
      )}
    </group>
  );
}

// ─── GROUND GRID ──────────────────────────────────────
function GroundGrid() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[22, 18]} />
        <meshStandardMaterial color="#050d1a" roughness={0.9} metalness={0.1} />
      </mesh>
      {/* Grid lines */}
      {Array.from({ length: 12 }, (_, i) => i - 6).map(x => (
        <Line key={`vx${x}`} points={[[x, 0, -9], [x, 0, 9]]} color="rgba(34,211,238,0.07)" lineWidth={0.6} />
      ))}
      {Array.from({ length: 10 }, (_, i) => i - 5).map(z => (
        <Line key={`vz${z}`} points={[[-11, 0, z * 1.8], [11, 0, z * 1.8]]} color="rgba(34,211,238,0.07)" lineWidth={0.6} />
      ))}
    </group>
  );
}

// ─── HEATMAP OVERLAY ──────────────────────────────────
// Maps world x (-10..10) → canvas u (0..1), world z (-8..8) → canvas v (0..1)
const WORLD_W = 20, WORLD_H = 16;
const CANVAS_RES = 512;

function worldToCanvas(wx: number, wz: number): [number, number] {
  return [
    ((wx + WORLD_W / 2) / WORLD_W) * CANVAS_RES,
    ((wz + WORLD_H / 2) / WORLD_H) * CANVAS_RES,
  ];
}

// Heat color: 0 = cool blue, 0.5 = yellow, 1 = hot red
function heatColor(t: number): string {
  const clamp = Math.max(0, Math.min(1, t));
  if (clamp < 0.5) {
    // blue → yellow
    const r = Math.round(clamp * 2 * 255);
    const g = Math.round(clamp * 2 * 200);
    return `rgba(${r},${g},255,`;
  } else {
    // yellow → red
    const f = (clamp - 0.5) * 2;
    const g = Math.round((1 - f) * 200);
    return `rgba(255,${g},0,`;
  }
}

interface HeatSpot { x: number; z: number; count: number; priority: number; }

function buildHeatmapTexture(spots: HeatSpot[], time: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_RES; canvas.height = CANVAS_RES;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, CANVAS_RES, CANVAS_RES);

  const maxCount = Math.max(...spots.map(s => s.count), 1);

  for (const spot of spots) {
    if (spot.count === 0) continue;
    const [cx, cz] = worldToCanvas(spot.x, spot.z);
    const intensity = spot.count / maxCount;
    // Radius grows with intensity, breathes with time
    const radius = (60 + intensity * 100) * (1 + Math.sin(time * 0.8 + spot.x) * 0.08);
    const alpha = (0.55 + intensity * 0.35) * (1 + Math.sin(time * 1.1 + spot.z) * 0.1);

    const grad = ctx.createRadialGradient(cx, cz, 0, cx, cz, radius);
    const col = heatColor(intensity);
    grad.addColorStop(0,   col + (alpha * 0.9).toFixed(2) + ')');
    grad.addColorStop(0.35, col + (alpha * 0.55).toFixed(2) + ')');
    grad.addColorStop(0.7,  col + (alpha * 0.15).toFixed(2) + ')');
    grad.addColorStop(1,   'rgba(0,0,0,0)');

    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cz, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  return new THREE.CanvasTexture(canvas);
}

function HeatmapOverlay({ spots }: { spots: HeatSpot[] }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const matRef  = useRef<THREE.MeshBasicMaterial>(null!);
  const timeRef = useRef(0);

  useFrame(({ clock }) => {
    timeRef.current = clock.getElapsedTime();
    if (!matRef.current) return;
    // Rebuild texture every ~4 frames (throttle)
    if (Math.round(clock.getElapsedTime() * 15) % 4 !== 0) return;
    const oldTex = matRef.current.map;
    matRef.current.map = buildHeatmapTexture(spots, timeRef.current);
    matRef.current.needsUpdate = true;
    oldTex?.dispose();
    // Slow global opacity breath
    matRef.current.opacity = 0.68 + Math.sin(timeRef.current * 0.4) * 0.12;
  });

  const initialTex = useMemo(() => buildHeatmapTexture(spots, 0), [spots]);

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
      <planeGeometry args={[WORLD_W, WORLD_H]} />
      <meshBasicMaterial
        ref={matRef}
        map={initialTex}
        transparent
        opacity={0.68}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

// ─── HEATMAP LEGEND BAR ───────────────────────────────
function HeatmapLegend() {
  return (
    <div className="absolute bottom-4 left-4 z-10 px-3 py-2.5 rounded-xl border"
      style={{ background: 'rgba(2,8,23,0.88)', borderColor: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)' }}>
      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">Issue Density</p>
      <div className="flex items-center gap-2">
        <span className="text-[9px] text-blue-400">Low</span>
        <div className="w-24 h-2 rounded-full" style={{ background: 'linear-gradient(90deg, #3b82f6, #fbbf24, #ef4444)' }} />
        <span className="text-[9px] text-red-400">High</span>
      </div>
    </div>
  );
}

// ─── AMBIENT LIGHT PULSER ─────────────────────────────
function SceneLighting() {
  const lightRef = useRef<THREE.PointLight>(null!);
  useFrame(({ clock }) => {
    if (lightRef.current) lightRef.current.intensity = 0.5 + Math.sin(clock.getElapsedTime() * 0.5) * 0.15;
  });
  return (
    <>
      <ambientLight intensity={0.35} color="#1a2a4a" />
      <directionalLight position={[5, 8, 4]} intensity={0.7} color="#aad4ff" castShadow />
      <pointLight ref={lightRef} position={[0, 6, 0]} color="#22d3ee" intensity={0.5} distance={18} />
      <pointLight position={[-8, 3, 4]} color="#7c3aed" intensity={0.3} distance={10} />
    </>
  );
}

// ─── GENTLE CAMERA DRIFT ─────────────────────────────
function CameraDrift() {
  const { camera } = useThree();
  const startPos = useRef(new THREE.Vector3(0, 11, 12));
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.12;
    camera.position.x = startPos.current.x + Math.sin(t) * 0.8;
    camera.position.z = startPos.current.z + Math.cos(t * 0.7) * 0.6;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

// ─── MARKER PLACEMENT: map ticket → building pos ─────
function placeMarker(ticket: MapTicket, existing: Map<string, number>): [number, number, number] {
  const b = BUILDINGS.find(bd => bd.dept.includes(ticket.department)) ?? BUILDINGS[0];
  const key = b.id;
  const count = existing.get(key) ?? 0;
  existing.set(key, count + 1);
  const spread = 0.45;
  const angle = (count / 6) * Math.PI * 2;
  return [
    b.pos[0] + Math.cos(angle) * spread * Math.min(count, 1),
    b.pos[1] + b.size[1] / 2 + 0.05,
    b.pos[2] + Math.sin(angle) * spread * Math.min(count, 1),
  ];
}

// ─── TICKET DETAILS SIDE PANEL ────────────────────────
function TicketPanel({ ticket, onClose }: { ticket: MapTicket; onClose: () => void }) {
  const { hex } = PRIORITY_COLORS[ticket.priority] ?? PRIORITY_COLORS.Low;
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="absolute top-4 right-4 bottom-4 w-64 rounded-2xl border flex flex-col overflow-hidden"
      style={{ background: 'rgba(2,6,18,0.97)', borderColor: `${hex}30`, boxShadow: `0 0 40px rgba(0,0,0,0.6), 0 0 20px ${hex}18`, backdropFilter: 'blur(16px)' }}
    >
      <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: hex }}>Ticket #{ticket._id.slice(-6)}</p>
          <p className="text-sm font-bold text-white mt-0.5">{ticket.category}</p>
        </div>
        <button onClick={onClose} className="text-slate-600 hover:text-white transition-colors text-lg leading-none cursor-pointer">✕</button>
      </div>
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {[
          { label: 'Priority', value: ticket.priority, color: hex },
          { label: 'Department', value: ticket.department, color: '#94a3b8' },
          { label: 'Status', value: ticket.status, color: '#22d3ee' },
        ].map(r => (
          <div key={r.label}>
            <p className="text-[10px] text-slate-600 uppercase tracking-widest mb-1">{r.label}</p>
            <p className="text-sm font-semibold" style={{ color: r.color }}>{r.value}</p>
          </div>
        ))}
        <div>
          <p className="text-[10px] text-slate-600 uppercase tracking-widest mb-1">Description</p>
          <p className="text-sm text-slate-400 leading-relaxed">{ticket.description || '—'}</p>
        </div>
      </div>
      <div className="px-5 pb-5">
        <motion.div className="h-px bg-gradient-to-r from-transparent mb-4" style={{ background: `linear-gradient(90deg, transparent, ${hex}60, transparent)` }} />
        <p className="text-[10px] text-slate-700 text-center">Click "View" in the ticket queue for full details</p>
      </div>
    </motion.div>
  );
}

// ─── MAIN EXPORT ──────────────────────────────────────
export default function CampusMap3D({ tickets }: { tickets: MapTicket[] }) {
  const [selectedTicket, setSelectedTicket] = useState<MapTicket | null>(null);
  const [hoveredTicket, setHoveredTicket] = useState<MapTicket | null>(null);

  const activeTickets = useMemo(
    () => tickets.filter(t => t.status !== 'Resolved' && t.status !== 'Closed'),
    [tickets]
  );

  const markerPositions = useMemo(() => {
    const placed = new Map<string, number>();
    return activeTickets.map(t => ({ ticket: t, pos: placeMarker(t, placed) }));
  }, [activeTickets]);

  // Build density spots: one per building, count = active tickets mapped there
  const densitySpots = useMemo<HeatSpot[]>(() => {
    return BUILDINGS.map(b => {
      const matching = activeTickets.filter(t => b.dept.includes(t.department));
      const priority = matching.reduce((acc, t) =>
        acc + (t.priority === 'High' ? 3 : t.priority === 'Medium' ? 2 : 1), 0);
      return { x: b.pos[0], z: b.pos[2], count: matching.length, priority };
    });
  }, [activeTickets]);

  const counts = {
    high:   activeTickets.filter(t => t.priority === 'High').length,
    medium: activeTickets.filter(t => t.priority === 'Medium').length,
    low:    activeTickets.filter(t => t.priority === 'Low').length,
  };

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border"
      style={{ background: '#020817', borderColor: 'rgba(34,211,238,0.1)' }}>

      {/* Legend */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 px-3 py-2.5 rounded-xl border"
        style={{ background: 'rgba(2,8,23,0.88)', borderColor: 'rgba(34,211,238,0.15)', backdropFilter: 'blur(12px)' }}>
        <p className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest mb-1">Issue Markers</p>
        {([['High', counts.high], ['Medium', counts.medium], ['Low', counts.low]] as const).map(([p, c]) => (
          <div key={p} className="flex items-center gap-2 text-[11px]">
            <div className="w-2 h-2 rounded-full" style={{ background: PRIORITY_COLORS[p].hex, boxShadow: `0 0 5px ${PRIORITY_COLORS[p].glow}` }} />
            <span className="text-slate-400">{p}</span>
            <span className="ml-auto font-bold tabular-nums" style={{ color: PRIORITY_COLORS[p].hex }}>{c}</span>
          </div>
        ))}
      </div>

      {/* Canvas */}
      <Canvas shadows camera={{ position: [0, 11, 12], fov: 48 }}>
        <Suspense fallback={null}>
          <SceneLighting />
          <CameraDrift />
          <GroundGrid />
          <HeatmapOverlay spots={densitySpots} />
          {BUILDINGS.map(b => <BuildingMesh key={b.id} b={b} />)}
          {markerPositions.map(({ ticket, pos }) => (
            <IssueMarker
              key={ticket._id}
              ticket={ticket}
              pos={pos as [number, number, number]}
              onClick={() => setSelectedTicket(ticket)}
              onHover={setHoveredTicket}
            />
          ))}
          <OrbitControls
            enablePan={false} maxPolarAngle={Math.PI / 2.2} minDistance={6} maxDistance={20}
            enableDamping dampingFactor={0.08}
          />
        </Suspense>
      </Canvas>

      {/* Ticket detail panel */}
      <AnimatePresence>
        {selectedTicket && (
          <TicketPanel ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />
        )}
      </AnimatePresence>

      {/* Heatmap legend */}
      <HeatmapLegend />

      {/* Corner scan decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(34,211,238,0.04), transparent)' }} />
    </div>
  );
}
