'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, UserCircle, Menu, X, LayoutDashboard, LogOut } from 'lucide-react';
import GlowButton from './ui/GlowButton';
import { useAuth } from '@/context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const links = [
  { label: 'About', href: '/about' },
  { label: 'How it works', href: '/#how-it-works' },
  { label: 'Features', href: '/#features' },
];

export default function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { user, role, loading } = useAuth(); // <--- pull useAuth

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="fixed top-0 w-full z-50 transition-all duration-500"
        style={{
          paddingTop: scrolled ? '8px' : '12px',
          paddingBottom: scrolled ? '8px' : '12px',
          borderBottom: scrolled ? '1px solid rgba(34,211,238,0.08)' : '1px solid transparent',
          background: scrolled ? 'rgba(2,8,23,0.85)' : 'transparent',
          backdropFilter: scrolled ? 'blur(24px)' : 'none',
          boxShadow: scrolled ? '0 8px 32px rgba(0,0,0,0.4)' : 'none',
        }}
      >
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 outline-none group shrink-0">
            <motion.img
              src="/logo.png"
              alt="InfraMind"
              className="h-12 w-auto object-contain"
              style={{ filter: 'drop-shadow(0 0 10px rgba(34,211,238,0.25))' }}
              whileHover={{
                filter: 'drop-shadow(0 0 20px rgba(34,211,238,0.55))',
                scale: 1.04,
              }}
              transition={{ duration: 0.25 }}
            />
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(link => (
              <NavLink key={link.href} href={link.href}>
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 shrink-0" suppressHydrationWarning>
            {!loading && user ? (
              <>
                {role === 'admin' ? (
                  <Link href="/admin/dashboard" className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-purple-400 border border-transparent hover:border-purple-500/20 hover:bg-purple-500/5 transition-all duration-200">
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Link>
                ) : (
                  <Link href="/profile" className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-cyan-400 border border-transparent hover:border-cyan-500/20 hover:bg-cyan-500/5 transition-all duration-200">
                    <UserCircle className="w-4 h-4" /> Profile
                  </Link>
                )}
                <button
                  onClick={() => signOut(auth!)}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all cursor-pointer text-sm font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" /> Logout
                </button>
              </>
            ) : !loading ? (
              <>
                {/* Login */}
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    href="/login"
                    className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-cyan-300 border border-transparent hover:border-cyan-500/20 hover:bg-cyan-500/5 transition-all duration-200"
                  >
                    <LogIn className="w-4 h-4" /> Login
                  </Link>
                </motion.div>

                {/* Sign Up */}
                <Link href="/signup">
                  <GlowButton size="sm">
                    <span className="flex items-center gap-1.5">
                      <UserCircle className="w-4 h-4 shrink-0" />
                      <span className="hidden sm:inline">Sign Up</span>
                    </span>
                  </GlowButton>
                </Link>
              </>
            ) : (
              <div className="w-32 h-9 rounded-xl bg-white/5 animate-pulse" />
            )}

            {/* Mobile menu toggle */}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl border border-white/10 bg-white/5 text-slate-400 cursor-pointer"
              onClick={() => setMobileOpen(v => !v)}
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={mobileOpen ? 'close' : 'open'}
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.15 }}
                >
                  {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                </motion.span>
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="fixed top-[64px] left-0 right-0 z-40 border-b border-cyan-500/10 px-6 py-4 flex flex-col gap-1 md:hidden"
              style={{ background: 'rgba(2,8,23,0.97)', backdropFilter: 'blur(24px)' }}
            >
              {links.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 + 0.05 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center py-3 text-sm font-medium text-slate-300 hover:text-cyan-300 border-b border-white/5 transition-colors"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              <motion.div
                className="flex flex-col gap-2 pt-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
              >
                {user ? (
                  <>
                    <Link href={role === 'admin' ? "/admin/dashboard" : "/profile"} className="w-full text-center py-2.5 rounded-xl border border-white/10 text-sm font-semibold text-slate-300 hover:text-cyan-300 transition-colors">
                      {role === 'admin' ? 'Dashboard' : 'Profile'}
                    </Link>
                    <button
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-500/30 text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                      onClick={() => { signOut(auth!); setMobileOpen(false); }}
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="flex gap-2">
                    <Link href="/login" className="flex-1 text-center py-2.5 rounded-xl border border-white/10 text-sm font-semibold text-slate-400 hover:text-cyan-300 transition-colors">Login</Link>
                    <Link href="/signup" className="flex-1">
                      <GlowButton className="w-full justify-center" size="sm">Sign Up</GlowButton>
                    </Link>
                  </div>
                )}
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── NAV LINK ────────────────────────────────────────────────
function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200"
      style={{ color: hovered ? '#22d3ee' : '#94a3b8' }}
    >
      {/* Hover background pill */}
      <AnimatePresence>
        {hovered && (
          <motion.span
            className="absolute inset-0 rounded-lg"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            style={{ background: 'rgba(34,211,238,0.06)' }}
          />
        )}
      </AnimatePresence>

      <span className="relative z-10 flex items-center">{children}</span>

      {/* Animated underline */}
      <motion.span
        className="absolute bottom-1 left-4 right-4 h-px rounded-full"
        style={{ background: 'linear-gradient(90deg, transparent, #22d3ee, transparent)' }}
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: hovered ? 1 : 0, opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      />
    </Link>
  );
}
