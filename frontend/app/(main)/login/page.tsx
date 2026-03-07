'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Lock, ArrowRight, ShieldCheck, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, db, googleProvider } from '@/lib/firebase';
import { signInWithEmailAndPassword, signInWithPopup, signOut, sendPasswordResetEmail, sendEmailVerification } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
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

export default function LoginPage() {
    const [mode, setMode] = useState<TabMode>('student');
    const { user: currentUser, role: currentRole, loading: authLoading, refreshRole } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [needsVerification, setNeedsVerification] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const switchTab = (newMode: TabMode) => {
        setMode(newMode);
        setErrorMsg('');
        setSuccessMsg('');
        setNeedsVerification(false);
        setEmail(''); setPassword('');
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

    // Helper to check role and redirect securely
    const verifyAndRedirect = async (uid: string) => {
        const userDoc = await getDoc(doc(db!, 'users', uid));
        const actualRole = userDoc.exists() ? userDoc.data()?.role : 'student';

        console.log(`[DEBUG-ROUTING] VerifyAndRedirect called for Uid: ${uid}`);
        console.log(`[DEBUG-ROUTING] Selected Tab: ${mode} | Actual Firestore Role: ${actualRole}`);

        if (actualRole !== mode) {
            console.warn(`[DEBUG-ROUTING] Role mismatch! Logging out...`);
            await signOut(auth!);
            setErrorMsg(`This account is registered as a ${actualRole}. Please use the ${actualRole} login instead.`);
            return false;
        }

        console.log(`[DEBUG-ROUTING] Role Validated! Attempting router.push...`);
        if (actualRole === 'admin') await refreshRole();
        router.push(actualRole === 'admin' ? '/admin/dashboard' : '/');
        return true;
    };

    // ─── Email/Password Login ─────────────────────────────────────────────
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');
        setNeedsVerification(false);
        setIsSubmitting(true);
        try {
            await signInWithEmailAndPassword(auth!, email, password);
            // Redirection is handled by the useEffect after AuthContext updates
        } catch (error: any) {
            console.error("Login Error:", error);
            let msg = 'Invalid credentials. Please try again.';
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                msg = 'Invalid email or password.';
            }
            setErrorMsg(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    // ─── Google Login ─────────────────────────────────────────────────────
    const handleGoogleLogin = async () => {
        if (isSubmitting) return;
        setErrorMsg('');
        setIsSubmitting(true);
        try {
            const result = await signInWithPopup(auth!, googleProvider!);
            const user = result.user;

            if (user) {
                // Ensure user doc exists in Firestore, if missing, treat as student fallback
                const userRef = doc(db!, 'users', user.uid);
                const userDoc = await getDoc(userRef);
                if (!userDoc.exists()) {
                    if (mode === 'admin') {
                        // Prevent accidental admin creation via Google Sign In if they haven't registered
                        await signOut(auth!);
                        setErrorMsg('User not found. You must register as a Property Admin first.');
                        setIsSubmitting(false);
                        return;
                    }

                    await setDoc(userRef, {
                        uid: user.uid,
                        email: user.email,
                        displayName: user.displayName,
                        photoURL: user.photoURL,
                        role: 'student',
                        createdAt: serverTimestamp(),
                    });
                }

                // Verify role matches the selected tab
                const actualRole = userDoc.exists() ? userDoc.data()?.role : 'student';
                if (actualRole !== mode) {
                    await signOut(auth!);
                    setErrorMsg(`This account is registered as a ${actualRole}. Please use the ${actualRole} login instead.`);
                    setIsSubmitting(false);
                    return;
                }

                if (actualRole === 'admin') await refreshRole();
                router.push(actualRole === 'admin' ? '/admin/dashboard' : '/');
            }
        } catch (error: any) {
            console.error("Google Login Error:", error);
            if (error.code === 'auth/popup-closed-by-user') {
                setErrorMsg('Sign-in cancelled. Please try again.');
            } else {
                setErrorMsg('Google Sign-In failed. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // ─── Forgot Password ──────────────────────────────────────────────────
    const handleForgotPassword = async () => {
        if (!email) {
            setErrorMsg('Please enter your email address first to reset your password.');
            return;
        }
        setErrorMsg('');
        setSuccessMsg('');
        setIsSubmitting(true);
        try {
            await sendPasswordResetEmail(auth!, email);
            setSuccessMsg('Password reset email sent! Check your inbox.');
        } catch (error: any) {
            console.error("Password Reset Error:", error);
            if (error.code === 'auth/user-not-found' || error.message?.includes('user-not-found')) {
                setErrorMsg('No account found with this email address.');
            } else if (error.code === 'auth/invalid-email') {
                setErrorMsg('Please enter a valid email address.');
            } else {
                setErrorMsg('Failed to send reset email. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // ─── Resend Verification Email ──────────────────────────────────────────
    const handleResendVerification = async () => {
        if (!email || !password) return;

        setErrorMsg('');
        setSuccessMsg('');
        setIsSubmitting(true);
        try {
            // Need to sign in again to get the unverified user object securely to resend the link
            const credential = await signInWithEmailAndPassword(auth!, email, password);
            if (credential.user) {
                await sendEmailVerification(credential.user);
                await signOut(auth!); // immediately sign them out again
                setSuccessMsg('Verification email has been resent. Please check your inbox.');
                setNeedsVerification(false);
            }
        } catch (error: any) {
            console.error("Resend Verification Error:", error);
            setErrorMsg('Failed to resend verification email. Please try again later.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const isCyan = mode === 'student';

    return (
        <HeroBackground>
            <div className="min-h-screen flex items-center justify-center px-4 py-20 pb-32 w-full overflow-x-hidden relative">
                <StaggerContainer className="w-full max-w-md relative z-10" delay={0.05} stagger={0.08} direction="up" distance={20}>

                    {/* Header */}
                    <StaggerItem>
                        <div className="text-center mb-6">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/logo.png" alt="InfraMind" className="h-14 mx-auto mb-4 object-contain"
                                style={{ filter: isCyan ? 'drop-shadow(0 0 12px rgba(34,211,238,0.3))' : 'drop-shadow(0 0 12px rgba(139,92,246,0.5))' }} />
                            <h1 className="text-2xl font-bold text-white mb-2">
                                {mode === 'student' ? 'Welcome Back' : 'Admin Portal'}
                            </h1>
                            <p className="text-slate-500 text-sm mt-1">
                                {mode === 'student' ? 'Sign in to your InfraMind account' : 'Secure access for infrastructure administrators'}
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
                                        {needsVerification && (
                                            <div className="mt-2">
                                                <button
                                                    onClick={handleResendVerification}
                                                    type="button"
                                                    disabled={isSubmitting}
                                                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 transition-colors"
                                                >
                                                    <Mail className="w-3.5 h-3.5" />
                                                    Resend Verification Code
                                                </button>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Success message */}
                            <AnimatePresence>
                                {successMsg && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mb-5 p-3 rounded-xl text-[13px] text-green-300 text-center leading-relaxed"
                                        style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)' }}
                                    >
                                        {successMsg}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <form onSubmit={handleLogin} className="space-y-4">
                                <NeonInput
                                    label={mode === 'student' ? "Email Address" : "Admin Email"}
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="you@organization.com"
                                    icon={<Mail className="w-4 h-4" />}
                                    accent={isCyan ? 'cyan' : 'purple'}
                                    required
                                />
                                <NeonInput
                                    label="Password"
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    icon={<Lock className="w-4 h-4" />}
                                    accent={isCyan ? 'cyan' : 'purple'}
                                    required
                                />

                                <div className="flex justify-end pt-1">
                                    <button
                                        type="button"
                                        onClick={handleForgotPassword}
                                        disabled={isSubmitting}
                                        className={`text-xs font-semibold hover:underline transition-colors ${isCyan ? 'text-cyan-400 hover:text-cyan-300' : 'text-purple-400 hover:text-purple-300'}`}
                                    >
                                        Forgot password?
                                    </button>
                                </div>

                                <GlowButton
                                    type="submit"
                                    className="w-full mt-2"
                                    size="lg"
                                    variant="primary"
                                    loading={isSubmitting}
                                    icon={<ArrowRight className="w-4 h-4" />}
                                    disabled={!email || !password || isSubmitting}
                                    style={isCyan ? {} : {
                                        background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                                        boxShadow: '0 4px 20px rgba(124,58,237,0.3)',
                                    }}
                                >
                                    {mode === 'student' ? 'Log In as Student' : 'Sign In to Dashboard'}
                                </GlowButton>
                            </form>

                            {/* Divider */}
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }} />
                                </div>
                                <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
                                    <span className="px-3 text-slate-600" style={{ background: 'rgba(6,13,31,0.9)' }}>
                                        Or secure sign in with
                                    </span>
                                </div>
                            </div>

                            {/* Google Button */}
                            <motion.button
                                type="button"
                                onClick={handleGoogleLogin}
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
                                {mode === 'student' ? 'Sign in with Google' : 'Google Administrator Sign In'}
                            </motion.button>

                            {/* Security note for Admins */}
                            {mode === 'admin' && (
                                <p className="mt-4 text-center text-[11px] text-purple-400/80 leading-relaxed px-2">
                                    Only accounts registered as Administrators can access this portal.
                                </p>
                            )}

                            <p className="mt-6 text-center text-xs text-slate-600">
                                No account?{' '}
                                <Link href="/signup" className="font-medium ml-1 transition-colors hover:text-white"
                                    style={{ color: isCyan ? '#22d3ee' : '#a855f7' }}>
                                    Sign up here
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
