'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { usePathname } from 'next/navigation';

const EASE = [0.21, 0.47, 0.32, 0.98] as [number, number, number, number];

// ─── ROUTE PROGRESS BAR ──────────────────────────────
function RouteProgressBar({ transitioning }: { transitioning: boolean }) {
  return (
    <AnimatePresence>
      {transitioning && (
        <motion.div
          className="fixed top-0 left-0 right-0 z-[9999] h-[2px] pointer-events-none origin-left"
          style={{ background: 'linear-gradient(90deg, #22d3ee, #a78bfa, #22d3ee)' }}
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: EASE }}
        />
      )}
    </AnimatePresence>
  );
}

// ─── PAGE VARIANTS ───────────────────────────────────
const pageVariants: Variants = {
  initial: { opacity: 0, y: 18, filter: 'blur(5px)', scale: 0.995 },
  enter: {
    opacity: 1, y: 0, filter: 'blur(0px)', scale: 1,
    transition: { duration: 0.38, ease: EASE, staggerChildren: 0.06, delayChildren: 0.1 },
  },
  exit: {
    opacity: 0, y: -12, filter: 'blur(3px)', scale: 0.998,
    transition: { duration: 0.22, ease: 'easeIn' as const },
  },
};

// ─── PAGE TRANSITION WRAPPER ─────────────────────────
export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [transitioning, setTransitioning] = useState(false);
  const [prevPath, setPrevPath] = useState(pathname);

  useEffect(() => {
    if (pathname !== prevPath) {
      setTransitioning(true);
      setPrevPath(pathname);
      const t = setTimeout(() => setTransitioning(false), 420);
      return () => clearTimeout(t);
    }
  }, [pathname, prevPath]);

  return (
    <>
      <RouteProgressBar transitioning={transitioning} />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          variants={pageVariants}
          initial="initial"
          animate="enter"
          exit="exit"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
