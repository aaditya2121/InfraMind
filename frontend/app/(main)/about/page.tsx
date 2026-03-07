import React from 'react';
import { Target, Zap, ShieldCheck, Users } from 'lucide-react';
import Link from 'next/link';

const glassCard = "bg-white/60 dark:bg-black/40 backdrop-blur-2xl border border-white/40 dark:border-white/10 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]";

export default function About() {
    return (
        <main className="flex flex-col items-center w-full min-h-screen pt-24 pb-20 px-4 sm:px-6">
            <div className="w-full max-w-4xl mx-auto">
                <div className="text-center mb-12 sm:mb-16">
                    <span className="inline-block px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-500/30 text-xs font-semibold text-[#0369A1] dark:text-[#38bdf8] mb-4 shadow-sm uppercase tracking-wider">
                        Our Mission
                    </span>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0F172A] dark:text-white mb-6 tracking-tight">
                        Transforming Campus Infrastructure with AI
                    </h1>
                    <p className="text-base sm:text-lg text-[#334155] dark:text-[#94A3B8] max-w-3xl mx-auto leading-relaxed">
                        Built during <strong>HACKMINed</strong>, InfraMind tackles one of the most persistent problems in educational and corporate campuses: reporting, tracking, and resolving infrastructure maintenance.
                    </p>
                </div>

                <div className={`${glassCard} p-8 sm:p-10 mb-12`}>
                    <h2 className="text-2xl font-bold text-[#0F172A] dark:text-white mb-4">The Problem</h2>
                    <p className="text-[#475569] dark:text-[#cbd5e1] leading-relaxed mb-6">
                        Maintenance requests are often lost in emails, phone calls, or outdated web portals. Students don't know who to contact when a projector breaks or a pipe leaks, leading to unresolved issues that impact the quality of campus life. Maintenance teams, on the other hand, are overwhelmed by unorganized, duplicate requests lacking crucial details like priority or exact location.
                    </p>

                    <h2 className="text-2xl font-bold text-[#0F172A] dark:text-white mb-4">The Solution</h2>
                    <p className="text-[#475569] dark:text-[#cbd5e1] leading-relaxed">
                        InfraMind acts as an intelligent intermediary. By utilizing Google's Gemini AI, we allow students to report issues instantly via a photo and a brief description—even anonymously. The AI automatically categorizes the issue, assesses its severity, and routes it directly to the dashboard of the responsible department (IT, Plumbing, Ground staff, etc.).
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                    <div className={`${glassCard} p-6 sm:p-8 flex gap-4`}>
                        <div className="shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-[#0369A1] dark:text-[#38bdf8]">
                            <Zap className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-[#0F172A] dark:text-white mb-2">Frictionless Reporting</h3>
                            <p className="text-sm text-[#475569] dark:text-[#94A3B8] leading-relaxed">No complex forms. Snap a picture, add a note, and you're done. Time-to-value measured in seconds.</p>
                        </div>
                    </div>

                    <div className={`${glassCard} p-6 sm:p-8 flex gap-4`}>
                        <div className="shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400">
                            <Target className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-[#0F172A] dark:text-white mb-2">Automated Triage</h3>
                            <p className="text-sm text-[#475569] dark:text-[#94A3B8] leading-relaxed">AI deterministically parses visual and text data to categorize priority and department routing, eliminating central dispatcher bottlenecks.</p>
                        </div>
                    </div>

                    <div className={`${glassCard} p-6 sm:p-8 flex gap-4`}>
                        <div className="shrink-0 w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-green-600 dark:text-green-400">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-[#0F172A] dark:text-white mb-2">Anonymous but Trackable</h3>
                            <p className="text-sm text-[#475569] dark:text-[#94A3B8] leading-relaxed">Submit without logging in. Create an account later to claim your ticket and receive real-time updates.</p>
                        </div>
                    </div>

                    <div className={`${glassCard} p-6 sm:p-8 flex gap-4`}>
                        <div className="shrink-0 w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-[#0F172A] dark:text-white mb-2">Admin Command Center</h3>
                            <p className="text-sm text-[#475569] dark:text-[#94A3B8] leading-relaxed">A centralized dashboard for institutions to view metrics, process tickets, and communicate directly with reporters.</p>
                        </div>
                    </div>
                </div>

                <div className="text-center">
                    <Link href="/" className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#0369A1] to-[#0ea5e9] text-white text-base font-semibold shadow-[0_4px_12px_rgba(3,105,161,0.3)] hover:shadow-[0_6px_20px_rgba(3,105,161,0.4)] transition-all inline-block hover:-translate-y-0.5">
                        Experience InfraMind
                    </Link>
                </div>
            </div>
        </main>
    );
}
