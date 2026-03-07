'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Lock, UserCircle, ArrowRight, Building2, ShieldCheck, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, db, googleProvider } from '@/lib/firebase';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, signOut, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import HeroBackground from '../../components/HeroBackground';
import GlowButton from '../../components/ui/GlowButton';
import NeonInput from '../../components/ui/NeonInput';
import { StaggerContainer, StaggerItem } from '../../components/StaggerContainer';

// ─── Google SVG ───────────────────────────────────────────────────────────
function GoogleIcon() {
    return (
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
    );
}

type TabMode = 'student' | 'admin';

export default function SignupPage() {
    const [mode, setMode] = useState<TabMode>('student');
    const { user: currentUser, role: currentRole, loading: authLoading, refreshRole } = useAuth();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [campusName, setCampusName] = useState(''); // Admin only

    const [errorMsg, setErrorMsg] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const switchTab = (newMode: TabMode) => {
        setMode(newMode);
        setErrorMsg('');
        setName(''); setEmail(''); setPassword(''); setCampusName('');
    };

    // Auto-redirection if already logged in
    useEffect(() => {
        if (!authLoading && currentUser && currentRole) {
            if (currentRole === 'admin') {
                router.push('/admin/dashboard');
            } else {
                router.push('/');
            }
        }
    }, [currentUser, currentRole, authLoading, router]);

    // ─── Email/Password Signup ────────────────────────────────────────────
    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setIsSubmitting(true);
        try {
            const credential = await createUserWithEmailAndPassword(auth!, email, password);
            if (credential.user) {
                await updateProfile(credential.user, { displayName: name });
                const userData: any = {
                    uid: credential.user.uid,
                    email: credential.user.email,
                    displayName: name,
                    role: mode,
                    createdAt: serverTimestamp(),
                };
                if (mode === 'admin') userData.campusName = campusName;

                await setDoc(doc(db!, 'users', credential.user.uid), userData);

                // Disabled forced verification for hackathon speed
                // await sendEmailVerification(credential.user);
                await refreshRole();
                router.push(mode === 'admin' ? '/admin/dashboard' : '/');
            }
        } catch (error: any) {
            console.error("Signup Error:", error);
            let msg = error.message || 'An error occurred during signup.';
            if (msg.includes('email-already-in-use')) msg = 'This email is already registered. Please log in.';
            if (msg.includes('weak-password')) msg = 'Password should be at least 6 characters.';
            setErrorMsg(msg);
            setIsSubmitting(false);
        }
    };

    // ─── Google Signup ────────────────────────────────────────────────────
    const handleGoogleSignup = async () => {
        if (mode === 'admin' && !campusName.trim()) {
            setErrorMsg('Please enter your Property / Organization Name first before using Google Sign-Up.');
            return;
        }

        if (isSubmitting) return;

        setErrorMsg('');
        setIsSubmitting(true);
        try {
            const result = await signInWithPopup(auth!, googleProvider!);
            const user = result.user;

            if (user) {
                // Create user doc if it doesn't exist
                const userRef = doc(db!, 'users', user.uid);
                const userDoc = await getDoc(userRef);
                if (!userDoc.exists()) {
                    const userData: any = {
                        uid: user.uid,
                        email: user.email,
                        displayName: user.displayName,
                        photoURL: user.photoURL,
                        role: mode,
                        createdAt: serverTimestamp(),
                    };
                    if (mode === 'admin') userData.campusName = campusName;
                    await setDoc(userRef, userData);
                } else {
                    // If they already exist, enforce their original role
                    const existingRole = userDoc.data()?.role;
                    if (existingRole && existingRole !== mode) {
                        setErrorMsg(`You already have an account registered as a ${existingRole}. Please log in instead.`);
                        setIsSubmitting(false);
                        return;
                    }
                }

                await refreshRole();
                router.push(mode === 'admin' ? '/admin/dashboard' : '/');
            }
        } catch (error: any) {
            console.error("Google Signup Error:", error);
            if (error.code === 'auth/popup-closed-by-user') {
                setErrorMsg('Sign-in cancelled.');
            } else {
                setErrorMsg('Google Sign-Up failed. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const isCyan = mode === 'student';

    return (
        <HeroBackground>
            <div className="min-h-screen flex items-center justify-center px-4 py-20 pb-32" suppressHydrationWarning>
                <StaggerContainer className="w-full max-w-md relative z-10" delay={0.05} stagger={0.08} direction="up" distance={20}>
                    {/* Header */}
                    <StaggerItem>
                        <div className="text-center mb-6">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/logo.png" alt="InfraMind" className="h-14 mx-auto mb-4 object-contain"
                                style={{ filter: isCyan ? 'drop-shadow(0 0 12px rgba(34,211,238,0.3))' : 'drop-shadow(0 0 12px rgba(139,92,246,0.5))' }} />
                            <h1 className="text-2xl font-bold text-white">Create Account</h1>
                            <p className="text-slate-500 text-sm mt-1">
                                {mode === 'student' ? 'Join InfraMind to report property issues' : 'Register your property for InfraMind'}
                            </p>
                        </div>
                    </StaggerItem>

                    {/* Tabs */}
                    <StaggerItem>
                        <div className="flex p-1 rounded-xl mb-6 relative" style={{ background: 'rgba(2,8,23,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div className="absolute inset-y-1 w-1/2 transition-transform duration-300 ease-[0.22,1,0.36,1]"
                                style={{
                                    transform: `translateX(${mode === 'student' ? '4px' : 'calc(100% - 4px)'})`,
                                    background: isCyan ? 'rgba(34,211,238,0.1)' : 'rgba(139,92,246,0.15)',
                                    border: `1px solid ${isCyan ? 'rgba(34,211,238,0.3)' : 'rgba(139,92,246,0.3)'}`,
                                    borderRadius: '8px',
                                    boxShadow: `0 0 20px ${isCyan ? 'rgba(34,211,238,0.1)' : 'rgba(139,92,246,0.15)'}`,
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => switchTab('student')}
                                className={`flex-1 flex justify-center items-center gap-2 py-2.5 text-sm font-semibold transition-colors duration-300 relative z-10 cursor-pointer ${mode === 'student' ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                <GraduationCap className="w-4 h-4" /> Student
                            </button>
                            <button
                                type="button"
                                onClick={() => switchTab('admin')}
                                className={`flex-1 flex justify-center items-center gap-2 py-2.5 text-sm font-semibold transition-colors duration-300 relative z-10 cursor-pointer ${mode === 'admin' ? 'text-purple-400' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                <ShieldCheck className="w-4 h-4" /> Administrator
                            </button>
                        </div>
                    </StaggerItem>

                    {/* Card */}
                    <StaggerItem>
                        <motion.div
                            key={mode}
                            initial={{ opacity: 0, x: mode === 'admin' ? 20 : -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            className="rounded-2xl border p-8"
                            style={{
                                background: 'rgba(6,13,31,0.8)',
                                borderColor: isCyan ? 'rgba(34,211,238,0.15)' : 'rgba(139,92,246,0.2)',
                                backdropFilter: 'blur(24px)',
                                boxShadow: isCyan ? '0 0 40px rgba(34,211,238,0.06)' : '0 0 50px rgba(139,92,246,0.08)',
                            }}
                        >
                            {/* Error */}
                            <AnimatePresence>
                                {errorMsg && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mb-5 p-3 rounded-xl text-[13px] text-red-300 text-center leading-relaxed"
                                        style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}
                                    >
                                        {errorMsg}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <form onSubmit={handleSignup} className="space-y-4">
                                {/* Admin Campus Field */}
                                <AnimatePresence>
                                    {mode === 'admin' && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="pb-4">
                                                <NeonInput
                                                    label="Property / Organization Name"
                                                    type="text"
                                                    value={campusName}
                                                    onChange={e => setCampusName(e.target.value)}
                                                    placeholder="University / PG / Hostel"
                                                    icon={<Building2 className="w-4 h-4" />}
                                                    accent="purple"
                                                    required
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <NeonInput
                                    label={mode === 'admin' ? "Admin Full Name" : "Full Name"}
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="John Doe"
                                    icon={<UserCircle className="w-4 h-4" />}
                                    accent={isCyan ? 'cyan' : 'purple'}
                                    required
                                />
                                <NeonInput
                                    label={mode === 'admin' ? "Admin / Work Email" : "Work / University Email"}
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="you@organization.com"
                                    icon={<Mail className="w-4 h-4" />}
                                    accent={isCyan ? 'cyan' : 'purple'}
                                    required
                                />
                                <NeonInput
                                    label="Create Password"
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    icon={<Lock className="w-4 h-4" />}
                                    accent={isCyan ? 'cyan' : 'purple'}
                                    hint="Minimum 6 characters"
                                    required
                                />

                                <GlowButton
                                    type="submit"
                                    className="w-full mt-2"
                                    size="lg"
                                    variant="primary"
                                    loading={isSubmitting}
                                    icon={<ArrowRight className="w-4 h-4" />}
                                    disabled={!name || !email || !password || (mode === 'admin' && !campusName) || isSubmitting}
                                    style={isCyan ? {} : {
                                        background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                                        boxShadow: '0 4px 20px rgba(124,58,237,0.3)',
                                    }}
                                >
                                    {mode === 'student' ? 'Sign Up as User/Student' : 'Register Property Admin'}
                                </GlowButton>
                            </form>

                            {/* Divider */}
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }} />
                                </div>
                                <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
                                    <span className="px-3 text-slate-600" style={{ background: 'rgba(6,13,31,0.9)' }}>
                                        Or sign up with
                                    </span>
                                </div>
                            </div>

                            {/* Google Button */}
                            <motion.button
                                type="button"
                                onClick={handleGoogleSignup}
                                disabled={isSubmitting}
                                whileHover={{ scale: 1.01, borderColor: isCyan ? 'rgba(34,211,238,0.3)' : 'rgba(139,92,246,0.4)' }}
                                whileTap={{ scale: 0.99 }}
                                className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl border text-sm font-semibold text-slate-300 hover:text-white transition-all cursor-pointer disabled:opacity-50"
                                style={{
                                    background: isCyan ? 'rgba(255,255,255,0.04)' : 'rgba(139,92,246,0.06)',
                                    borderColor: isCyan ? 'rgba(255,255,255,0.1)' : 'rgba(139,92,246,0.2)'
                                }}
                            >
                                <GoogleIcon />
                                {mode === 'student' ? 'Sign up with Google' : 'Google Admin Sign In'}
                            </motion.button>

                            {/* Security note for Admins */}
                            {mode === 'admin' && (
                                <p className="mt-4 text-center text-[11px] text-purple-400/80 leading-relaxed px-2">
                                    Make sure to enter your Property Name above before signing up with Google.
                                </p>
                            )}

                            <p className="mt-6 text-center text-xs text-slate-600">
                                Already have an account?{' '}
                                <Link href="/login" className="font-medium ml-1 transition-colors hover:text-white"
                                    style={{ color: isCyan ? '#22d3ee' : '#a855f7' }}>
                                    Log in here
                                </Link>
                            </p>
                        </motion.div>
                    </StaggerItem>

                    <StaggerItem>
                        <p className="text-center text-xs text-slate-700 mt-6">
                            <Link href="/" className="hover:text-slate-500 transition-colors">← Back to home</Link>
                        </p>
                    </StaggerItem>
                </StaggerContainer>
            </div>
        </HeroBackground>
    );
}
