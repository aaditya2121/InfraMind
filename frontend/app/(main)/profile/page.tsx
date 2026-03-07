'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle, Clock, MapPin, Search, Loader2, User, LogOut, FileText } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Link from 'next/link';

const glassCard = "bg-white/60 dark:bg-black/40 backdrop-blur-2xl border border-white/40 dark:border-white/10 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]";

interface TicketItem {
    _id: string;
    category: string;
    department: string;
    priority: string;
    description: string;
    created_at: string;
    status: string;
    image_url: string;
    user_id: string;
    adminNote?: string;
    recurrence_note?: string;
}

export default function Profile() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [tickets, setTickets] = useState<TicketItem[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    // If you want to force login:
    // useEffect(() => {
    //     if (!loading && !user) {
    //         router.push('/login');
    //     }
    // }, [user, loading, router]);

    // Fetch user tickets
    useEffect(() => {
        const fetchTickets = async () => {
            // Wait for real user or definite guest state if we need to fetch secure data
            if (loading) return;

            const uid = user?.uid || (typeof window !== 'undefined' ? localStorage.getItem('infraMindSessionId') : null);
            if (!uid) {
                setIsLoadingData(false);
                return;
            }

            try {
                // Defensive check: getIdToken only exists on the real Firebase User object
                const token = (user && typeof user.getIdToken === 'function') ? await user.getIdToken() : null;
                const headers: Record<string, string> = {};
                if (token) headers['Authorization'] = `Bearer ${token}`;

                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                const res = await fetch(`${apiUrl}/api/complaints?user_id=${uid}`, { headers });
                const json = await res.json();
                if (json && json.data) {
                    setTickets(json.data);
                }
            } catch (err) {
                console.error("Error fetching tickets:", err);
            } finally {
                setIsLoadingData(false);
            }
        };
        fetchTickets();
    }, [user, loading]);

    const handleLogout = async () => {
        try {
            await signOut(auth!);
            router.push('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    if (loading || isLoadingData) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen gap-6">
                <img
                    src="/logo.png"
                    alt="InfraMind loading"
                    className="h-16 w-auto object-contain animate-pulse"
                />
                <Loader2 className="w-6 h-6 animate-spin text-[#0369A1]" />
            </div>
        );
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "Resolved": return <CheckCircle className="w-5 h-5 text-green-500" />;
            case "In Progress": return <Clock className="w-5 h-5 text-amber-500" />;
            default: return <AlertCircle className="w-5 h-5 text-blue-500" />;
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case "Resolved": return "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-500/30";
            case "In Progress": return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-500/30";
            default: return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-500/30";
        }
    };

    return (
        <main className="flex flex-col items-center w-full min-h-screen pt-24 pb-20 px-4 sm:px-6" suppressHydrationWarning>
            <div className="w-full max-w-5xl mx-auto">

                {/* ── PROFILE HEADER ───────────────────────────────── */}
                <div className={`${glassCard} p-6 sm:p-8 mb-8 sm:mb-10 flex flex-col sm:flex-row items-center justify-between gap-6`}>
                    <div className="flex items-center gap-5 text-center sm:text-left">
                        <div className="w-20 h-20 bg-gradient-to-br from-[#0369A1] to-[#0ea5e9] rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
                            <User className="w-10 h-10 text-white -rotate-3" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] dark:text-white capitalize">{user?.email?.split('@')[0] || 'Anonymous'}</h1>
                            <p className="text-[#64748B] dark:text-[#94A3B8] font-medium">{user?.email || 'Tracking Session'}</p>
                            <span className="inline-block mt-2 px-2.5 py-1 bg-[#0F172A] dark:bg-white/10 text-white dark:text-[#E2E8F0] text-xs font-semibold rounded-md uppercase tracking-wider">
                                {user ? 'Student Account' : 'Guest Account'}
                            </span>
                        </div>
                    </div>
                    {user && (
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-200 text-red-600 dark:border-red-500/30 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium transition-colors text-sm"
                        >
                            <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                    )}
                </div>

                {/* ── TICKET TRACKING DASHBOARD ────────────────────── */}
                <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center mb-6 gap-4">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
                            <FileText className="w-6 h-6 text-[#0369A1] dark:text-[#38bdf8]" /> My Tickets
                        </h2>
                        <p className="text-sm text-[#64748B] dark:text-[#94A3B8] mt-1">Track the status of infrastructure issues you've reported.</p>
                    </div>
                    <Link href="/" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0369A1] to-[#0ea5e9] text-white text-sm font-semibold shadow-[0_4px_12px_rgba(3,105,161,0.3)] hover:shadow-[0_6px_20px_rgba(3,105,161,0.4)] transition-all">
                        + New Ticket
                    </Link>
                </div>

                {/* Tickets List */}
                <div className="space-y-4">
                    {tickets.length === 0 ? (
                        <div className={`${glassCard} p-10 text-center`}>
                            <p className="text-[#64748B] dark:text-[#94A3B8]">You haven't reported any issues yet.</p>
                        </div>
                    ) : tickets.map((ticket) => (
                        <div key={ticket._id} className={`${glassCard} p-5 sm:p-6 transition-transform hover:-translate-y-1 duration-300`}>
                            <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`px-2.5 py-1 text-xs font-bold border rounded-md uppercase tracking-wider ${getStatusStyle(ticket.status)} flex items-center gap-1.5`}>
                                            {getStatusIcon(ticket.status)} {ticket.status}
                                        </span>
                                        <span className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">TKT-{ticket._id.slice(-6)}</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-[#0F172A] dark:text-white mb-1">{ticket.category} - {ticket.description}</h3>
                                    <div className="flex items-center gap-4 text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
                                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {ticket.department}</span>
                                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {new Date(ticket.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                {ticket.adminNote && (
                                    <div className="lg:max-w-xs xl:max-w-sm mt-3 lg:mt-0 p-4 bg-gray-50/80 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl">
                                        <span className="block text-[10px] font-bold text-[#0369A1] dark:text-[#38bdf8] uppercase tracking-wider mb-1">Admin Update</span>
                                        <p className="text-sm text-[#334155] dark:text-[#cbd5e1] leading-relaxed italic">
                                            "{ticket.adminNote}"
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </main>
    );
}
