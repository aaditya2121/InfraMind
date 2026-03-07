'use client';

import React, { useEffect, useRef } from 'react';

interface Trail {
  x1: number; y1: number; x2: number; y2: number;
  opacity: number; life: number; maxLife: number;
  speed: number; angle: number; length: number; color: string; width: number;
}

const TRAIL_COLORS = [
  'rgba(34,211,238,VAL)',
  'rgba(96,165,250,VAL)',
  'rgba(139,92,246,VAL)',
];

export default function LightTrails() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId: number;
    const trails: Trail[] = [];
    const MAX_TRAILS = 12;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const spawnTrail = (): Trail => {
      const angle = (Math.random() * 60 - 30) * (Math.PI / 180); // mostly horizontal
      const length = 80 + Math.random() * 200;
      const maxLife = 120 + Math.random() * 120;
      const side = Math.random() > 0.5;
      const startX = side ? -length : canvas.width + length;
      const color = TRAIL_COLORS[Math.floor(Math.random() * TRAIL_COLORS.length)];
      return {
        x1: startX,
        y1: canvas.height * (0.1 + Math.random() * 0.7),
        x2: startX + Math.cos(angle) * length * (side ? 1 : -1),
        y2: 0,
        opacity: 0,
        life: 0,
        maxLife,
        speed: 1.5 + Math.random() * 2.5,
        angle: side ? angle : Math.PI - angle,
        length,
        color,
        width: 0.8 + Math.random() * 1.5,
      };
    };

    for (let i = 0; i < MAX_TRAILS; i++) {
      const t = spawnTrail();
      t.life = Math.floor(Math.random() * t.maxLife);
      trails.push(t);
    }

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const t of trails) {
        t.life++;
        const half = t.maxLife * 0.3;
        t.opacity = t.life < half
          ? t.life / half
          : Math.max(0, 1 - (t.life - half) / (t.maxLife - half));

        const dx = Math.cos(t.angle) * t.speed;
        const dy = Math.sin(t.angle) * t.speed;
        t.x1 += dx; t.y1 += dy;
        t.x2 += dx; t.y2 += dy;

        const alpha = t.opacity * 0.7;
        const grad = ctx.createLinearGradient(t.x1, t.y1, t.x2, t.y2);
        grad.addColorStop(0, 'transparent');
        grad.addColorStop(0.5, t.color.replace('VAL', (alpha * 0.5).toFixed(3)));
        grad.addColorStop(1, t.color.replace('VAL', alpha.toFixed(3)));

        ctx.beginPath();
        ctx.strokeStyle = grad;
        ctx.lineWidth = t.width;
        ctx.shadowColor = t.color.replace('VAL', '0.6');
        ctx.shadowBlur = 6;
        ctx.moveTo(t.x1, t.y1);
        ctx.lineTo(t.x2, t.y2);
        ctx.stroke();
        ctx.shadowBlur = 0;

        if (t.life >= t.maxLife) Object.assign(t, spawnTrail());
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
      style={{ opacity: 0.6 }}
    />
  );
}
