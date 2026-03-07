'use client';

import React, { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';
import { Wrench, Wifi, Droplets, Zap, Settings } from 'lucide-react';

// ─── DATA ────────────────────────────────────────────────────────
const ICONS = [
    { Icon: Wrench, x: '10%', y: '18%', delay: 0, size: 18, color: '#22d3ee' },
    { Icon: Wifi, x: '82%', y: '15%', delay: 0.6, size: 22, color: '#a78bfa' },
    { Icon: Droplets, x: '6%', y: '62%', delay: 1.1, size: 16, color: '#60a5fa' },
    { Icon: Zap, x: '90%', y: '55%', delay: 0.3, size: 20, color: '#fbbf24' },
    { Icon: Settings, x: '50%', y: '80%', delay: 0.9, size: 17, color: '#4ade80' },
    { Icon: Wrench, x: '68%', y: '8%', delay: 1.4, size: 14, color: '#f87171' },
    { Icon: Wifi, x: '20%', y: '85%', delay: 0.4, size: 15, color: '#34d399' },
    { Icon: Zap, x: '38%', y: '5%', delay: 0.7, size: 19, color: '#c084fc' },
];

const COLOR_RGB: Record<string, string> = {
    '#22d3ee': '34,211,238',
    '#a78bfa': '167,139,250',
    '#60a5fa': '96,165,250',
    '#fbbf24': '251,191,36',
    '#4ade80': '74,222,128',
    '#f87171': '248,113,113',
    '#34d399': '52,211,153',
    '#c084fc': '192,132,252',
};

const STREAK_LIST = [
    { delay: 0, y: 15, angle: -8 },
    { delay: 3.5, y: 40, angle: -5 },
    { delay: 7, y: 68, angle: -12 },
    { delay: 11, y: 82, angle: -6 },
];

// ─── SUB-COMPONENTS ──────────────────────────────────────────────
function FloatingIcon({ Icon: IconRaw, x, y, delay, size, color, mouseX, mouseY }: {
    Icon: React.ElementType; x: string; y: string;
    delay: number; size: number; color: string;
    mouseX: number; mouseY: number;
}) {
    const Icon = IconRaw as React.FC<{ style?: React.CSSProperties }>;
    const px = parseFloat(x) / 100;
    const py = parseFloat(y) / 100;
    const rgb = COLOR_RGB[color] ?? '34,211,238';
    return (
        <motion.div
            className="absolute pointer-events-none"
            style={{ left: x, top: y }}
            animate={{ y: [0, -12, 0], x: [0, 4, 0], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 6 + delay * 1.5, delay, repeat: Infinity, ease: 'easeInOut' }}
        >
            <motion.div
                animate={{ x: (mouseX - 0.5) * -28 * (px - 0.5), y: (mouseY - 0.5) * -28 * (py - 0.5) }}
                transition={{ type: 'spring', stiffness: 60, damping: 20 }}
            >
                <div className="relative flex items-center justify-center rounded-2xl" style={{
                    width: size * 2.6, height: size * 2.6,
                    background: `rgba(${rgb},0.08)`,
                    border: `1px solid ${color}25`,
                    boxShadow: `0 0 20px ${color}15, inset 0 0 10px ${color}05`,
                    backdropFilter: 'blur(8px)',
                }}>
                    <Icon style={{ width: size, height: size, color }} />
                    <motion.div className="absolute inset-0 rounded-2xl"
                        animate={{ opacity: [0, 0.4, 0] }}
                        transition={{ duration: 3, repeat: Infinity, delay: delay * 0.5 }}
                        style={{ background: `radial-gradient(circle, ${color}20 0%, transparent 70%)` }}
                    />
                </div>
            </motion.div>
        </motion.div>
    );
}

function Particle({ delay, x, height }: { delay: number; x: number; height: number }) {
    return (
        <motion.div className="absolute w-px rounded-full pointer-events-none"
            style={{
                left: `${x}%`, bottom: 0, height: `${height}px`,
                background: 'linear-gradient(to top, transparent, rgba(34,211,238,0.6), rgba(167,139,250,0.4), transparent)',
            }}
            animate={{ y: [0, -(300 + height * 2)], opacity: [0, 0.6, 0.8, 0] }}
            transition={{ duration: 5 + delay * 0.8, delay, repeat: Infinity, ease: 'easeOut' }}
        />
    );
}

function GradientBlob({ cx, cy, color, size, delay }: {
    cx: string; cy: string; color: string; size: number; delay: number;
}) {
    return (
        <motion.div className="absolute rounded-full pointer-events-none"
            style={{
                left: cx, top: cy, width: size, height: size,
                transform: 'translate(-50%, -50%)',
                background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
                filter: 'blur(80px)',
            }}
            animate={{ scale: [1, 1.18, 0.92, 1], x: [0, 35, -25, 0], y: [0, -25, 35, 0], opacity: [0.4, 0.65, 0.35, 0.4] }}
            transition={{ duration: 14 + delay * 2, delay, repeat: Infinity, ease: 'easeInOut' }}
        />
    );
}

// ─── GLOBAL BACKGROUND ───────────────────────────────────────────
// This component is mounted in the root layout OUTSIDE of
// PageTransition, so it is always visible — even on first load.
export default function GlobalBackground() {
    const smoothX = useSpring(0.5, { stiffness: 50, damping: 20 });
    const smoothY = useSpring(0.5, { stiffness: 50, damping: 20 });
    const [mouseXVal, setMouseXVal] = useState(0.5);
    const [mouseYVal, setMouseYVal] = useState(0.5);
    const [particles, setParticles] = useState<{ delay: number; x: number; height: number }[]>([]);

    // Stable particle positions — generated client-side to avoid hydration mismatch
    useEffect(() => {
        setParticles(
            Array.from({ length: 22 }, (_, i) => ({
                delay: i * 0.45,
                x: 2 + (i / 21) * 96,
                height: 40 + Math.floor(Math.random() * 60),
            }))
        );
    }, []);

    useEffect(() => {
        const handle = (e: MouseEvent) => {
            smoothX.set(e.clientX / window.innerWidth);
            smoothY.set(e.clientY / window.innerHeight);
        };
        window.addEventListener('mousemove', handle, { passive: true });
        return () => window.removeEventListener('mousemove', handle);
    }, [smoothX, smoothY]);

    useEffect(() => {
        const unsubX = smoothX.on('change', v => setMouseXVal(v));
        const unsubY = smoothY.on('change', v => setMouseYVal(v));
        return () => { unsubX(); unsubY(); };
    }, [smoothX, smoothY]);

    return (
        <div
            className="fixed inset-0 pointer-events-none overflow-hidden select-none"
            style={{ zIndex: 0 }}
            aria-hidden="true"
        >
            {/* Deep navy radial base */}
            <div className="absolute inset-0" style={{
                background: [
                    'radial-gradient(ellipse 85% 55% at 50% 0%,   rgba(34,211,238,0.07)  0%, transparent 65%)',
                    'radial-gradient(ellipse 60% 45% at 80% 30%,  rgba(139,92,246,0.08)  0%, transparent 55%)',
                    'radial-gradient(ellipse 50% 40% at 20% 80%,  rgba(59,130,246,0.06)  0%, transparent 60%)',
                    'radial-gradient(ellipse 40% 35% at 85% 75%,  rgba(167,139,250,0.05) 0%, transparent 55%)',
                    '#020817',
                ].join(', '),
            }} />

            {/* Grid */}
            <div className="absolute inset-0 grid-pattern opacity-35" />

            {/* Animated blobs */}
            <GradientBlob cx="12%" cy="18%" color="rgba(34,211,238,0.13)" size={650} delay={0} />
            <GradientBlob cx="82%" cy="12%" color="rgba(139,92,246,0.11)" size={520} delay={2} />
            <GradientBlob cx="58%" cy="65%" color="rgba(59,130,246,0.09)" size={580} delay={4} />
            <GradientBlob cx="8%" cy="72%" color="rgba(167,139,250,0.08)" size={430} delay={1.5} />
            <GradientBlob cx="92%" cy="55%" color="rgba(34,211,238,0.07)" size={380} delay={6} />
            <GradientBlob cx="45%" cy="88%" color="rgba(139,92,246,0.08)" size={460} delay={3} />

            {/* Horizontal scan line */}
            <motion.div
                className="absolute left-0 right-0 h-px pointer-events-none"
                style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(34,211,238,0.12) 20%, rgba(34,211,238,0.35) 50%, rgba(34,211,238,0.12) 80%, transparent 100%)' }}
                animate={{ top: ['0%', '100%'] }}
                transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
            />

            {/* Vertical scan line */}
            <motion.div
                className="absolute top-0 bottom-0 w-px pointer-events-none"
                style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(139,92,246,0.18) 30%, rgba(139,92,246,0.45) 50%, rgba(139,92,246,0.18) 70%, transparent 100%)' }}
                animate={{ left: ['0%', '100%'] }}
                transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
            />

            {/* Light streaks */}
            {STREAK_LIST.map((s, i) => (
                <motion.div key={i} className="absolute pointer-events-none"
                    style={{
                        top: `${s.y}%`, left: '-20%', width: '60%', height: '1px',
                        background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.35), rgba(167,139,250,0.2), transparent)',
                        transform: `rotate(${s.angle}deg)`, transformOrigin: 'left center',
                    }}
                    animate={{ x: ['0%', '220%'], opacity: [0, 0.7, 0] }}
                    transition={{ duration: 4, delay: s.delay, repeat: Infinity, repeatDelay: 7, ease: 'easeInOut' }}
                />
            ))}

            {/* Particles + Floating icons — client-side only */}
            {particles.length > 0 && (
                <>
                    {particles.map((p, i) => <Particle key={i} {...p} />)}
                    {ICONS.map((icon, i) => (
                        <FloatingIcon key={i} {...icon} mouseX={mouseXVal} mouseY={mouseYVal} />
                    ))}
                </>
            )}

            {/* Edge vignette */}
            <div className="absolute inset-0 pointer-events-none" style={{
                background: 'radial-gradient(ellipse 110% 110% at 50% 50%, transparent 35%, rgba(2,8,23,0.65) 100%)',
            }} />
        </div>
    );
}
