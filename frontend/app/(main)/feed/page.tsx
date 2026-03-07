'use client';

import React from 'react';
import { Camera, CheckCircle, Clock, MapPin, Search } from 'lucide-react';
import Link from 'next/link';

const glassCard = "bg-white/60 dark:bg-black/40 backdrop-blur-2xl border border-white/40 dark:border-white/10 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]";

const mockResolvedIssues = [
    {
        id: "TKT-1084",
        title: "Leaking Pipe in Science Block",
        category: "Plumbing",
        timeResolved: "2 hours ago",
        resolutionTime: "1h 45m",
        image: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&q=80&w=400",
        department: "Maintenance"
    },
    {
        id: "TKT-1083",
        title: "Broken Projector in Room 4A",
        category: "IT Support",
        timeResolved: "4 hours ago",
        resolutionTime: "45m",
        image: "https://images.unsplash.com/photo-1517420704952-d9f39ce080cd?auto=format&fit=crop&q=80&w=400",
        department: "IT Services"
    },
    {
        id: "TKT-1082",
        title: "Overgrown Pathway Near Hostel",
        category: "Grounds",
        timeResolved: "Yesterday",
        resolutionTime: "4h 20m",
        image: "https://images.unsplash.com/photo-1558905051-4c740c0617ef?auto=format&fit=crop&q=80&w=400",
        department: "Landscaping"
    },
    {
        id: "TKT-1079",
        title: "AC Malfunction in Library",
        category: "HVAC",
        timeResolved: "Yesterday",
        resolutionTime: "2h 10m",
        image: "https://images.unsplash.com/photo-1620301131973-10e8b23c57bc?auto=format&fit=crop&q=80&w=400",
        department: "Maintenance"
    },
    {
        id: "TKT-1075",
        title: "Flickering Lights in Hall",
        category: "Electrical",
        timeResolved: "2 days ago",
        resolutionTime: "30m",
        image: "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=400",
        department: "Electrical"
    },
    {
        id: "TKT-1071",
        title: "Vending Machine Coin Jam",
        category: "Amenities",
        timeResolved: "2 days ago",
        resolutionTime: "3h 15m",
        image: "https://images.unsplash.com/photo-1625698457121-1b0d2d3126f5?auto=format&fit=crop&q=80&w=400",
        department: "Facilities"
    }
];

export default function LiveFeed() {
    return (
        <main className="flex flex-col items-center w-full min-h-screen pt-24 pb-20 px-4 sm:px-6" suppressHydrationWarning>
            <div className="w-full max-w-6xl mx-auto">
                <div className="text-center mb-12 sm:mb-16">
                    <span className="inline-block px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-500/30 text-xs font-semibold text-green-700 dark:text-green-400 mb-4 shadow-sm uppercase tracking-wider">
                        Live Resolution Feed
                    </span>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0F172A] dark:text-white mb-4 tracking-tight">
                        See what we've fixed lately
                    </h1>
                    <p className="text-sm sm:text-base lg:text-lg text-[#334155] dark:text-[#94A3B8] max-w-2xl mx-auto leading-relaxed">
                        InfraMind empowers students and staff to swiftly report issues. Here’s a live look at the recent tickets resolved across the campus.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-8">
                    <div className="relative w-full sm:max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search resolved issues..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0369A1]/30 transition-shadow"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {mockResolvedIssues.map((issue, i) => (
                        <div key={issue.id} className={`${glassCard} overflow-hidden group hover:-translate-y-1 transition-all duration-300`}>
                            <div className="relative h-48 w-full overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={issue.image}
                                    alt={issue.title}
                                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                                    <span className="px-2 py-1 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg text-xs font-medium text-white shadow-sm">
                                        {issue.category}
                                    </span>
                                </div>
                                <div className="absolute top-3 right-3 bg-green-500 text-white rounded-full p-1.5 shadow-md">
                                    <CheckCircle className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="p-5 sm:p-6">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-base text-[#0F172A] dark:text-white line-clamp-1 group-hover:text-[#0369A1] transition-colors">{issue.title}</h3>
                                </div>
                                <div className="flex items-center text-xs text-[#64748B] dark:text-[#94A3B8] mb-4 font-medium uppercase tracking-wider">
                                    {issue.id} <span className="mx-2">•</span> {issue.department}
                                </div>
                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-white/10">
                                    <div className="flex items-center gap-1.5 text-xs text-[#334155] dark:text-[#cbd5e1]">
                                        <Clock className="w-3.5 h-3.5 text-[#0369A1] dark:text-[#38bdf8]" />
                                        <span>Fixed in <span className="font-semibold text-[#0F172A] dark:text-white">{issue.resolutionTime}</span></span>
                                    </div>
                                    <span className="text-xs text-gray-400 dark:text-gray-500">{issue.timeResolved}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <Link href="/" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#0369A1] to-[#0ea5e9] text-white text-sm font-semibold shadow-[0_4px_12px_rgba(3,105,161,0.3)] hover:shadow-[0_6px_20px_rgba(3,105,161,0.4)] transition-all">
                        <Camera className="w-4 h-4" /> Report New Issue
                    </Link>
                </div>
            </div>
        </main>
    );
}
