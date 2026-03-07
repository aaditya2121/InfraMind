'use client';

import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number; y: number; vx: number; vy: number;
  radius: number; opacity: number; life: number; maxLife: number;
  color: string;
}

const COLORS = [
  'rgba(34,211,238,VAL)',   // cyan
  'rgba(96,165,250,VAL)',   // blue
  'rgba(167,139,250,VAL)',  // purple
  'rgba(34,211,238,VAL)',   // cyan again (more weight)
];

export default function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId: number;
    const particles: Particle[] = [];
    const MAX_PARTICLES = 80;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const spawn = (): Particle => {
      const maxLife = 180 + Math.random() * 240;
      const baseColor = COLORS[Math.floor(Math.random() * COLORS.length)];
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35 - 0.05,
        radius: 1 + Math.random() * 2.2,
        opacity: 0,
        life: 0,
        maxLife,
        color: baseColor,
      };
    };

    for (let i = 0; i < MAX_PARTICLES; i++) {
      const p = spawn();
      p.life = Math.floor(Math.random() * p.maxLife); // stagger start
      particles.push(p);
    }

    // Connection lines
    const drawConnections = () => {
      const MAX_DIST = 120;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DIST) {
            const alpha = (1 - dist / MAX_DIST) * 0.08 * Math.min(a.opacity, b.opacity);
            ctx.beginPath();
            ctx.strokeStyle = `rgba(34,211,238,${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
    };

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      drawConnections();

      for (const p of particles) {
        p.life++;

        // fade in / out
        const half = p.maxLife / 2;
        p.opacity = p.life < half
          ? Math.min(1, p.life / 60)
          : Math.max(0, 1 - (p.life - half) / 80);

        p.x += p.vx;
        p.y += p.vy;

        // draw particle
        ctx.beginPath();
        const alpha = p.opacity * 0.75;
        const colorStr = p.color.replace('VAL', alpha.toFixed(3));
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 2.5);
        grad.addColorStop(0, colorStr);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.arc(p.x, p.y, p.radius * 2.5, 0, Math.PI * 2);
        ctx.fill();

        if (p.life >= p.maxLife) Object.assign(p, spawn());
      }

      rafId = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: 0.9 }}
    />
  );
}
