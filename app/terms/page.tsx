'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Scale, MessageSquare, ShieldAlert, Cpu, ArrowLeft, Gavel, UserX } from 'lucide-react';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-[#020617] text-slate-300 font-['Inter'] selection:bg-cyan-500/30 overflow-x-hidden">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/5 blur-[120px] rounded-full" />
            </div>

            <div className="max-w-3xl mx-auto px-6 py-16 relative z-10">
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <Link href="/login" className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors text-sm font-bold mb-8 group">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        BACK TO TERMINAL
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight uppercase mb-4">
                        Protocol of <span className="text-cyan-400">Conduct</span>
                    </h1>
                    <div className="h-1 w-24 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-6" />
                    <p className="text-slate-500 text-lg leading-relaxed max-w-xl">
                        By syncing your identity handle with the Paper Money UPI (Bid Wars) ecosystem, you agree to abide by the digital laws of our financial simulation.
                    </p>
                </motion.div>

                {/* Main Content */}
                <div className="space-y-12">
                    {/* 1. Simulated Financial Status */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-white">
                            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                                <Cpu size={24} />
                            </div>
                            <h2 className="text-xl font-bold uppercase tracking-wide">1. The Digital Sandbox</h2>
                        </div>
                        <div className="pl-12 space-y-4 text-slate-400 leading-relaxed">
                            <p>
                                Bid Wars (Paper Money UPI) is a **purely simulated financial environment**. You acknowledge and agree that:
                            </p>
                            <ul className="list-disc pl-5 space-y-2 marker:text-indigo-500">
                                <li>All "Paper Money" (₹) balances are virtual and hold **zero real-world value**.</li>
                                <li>Simulated currency, assets, and inventory cannot be cashed out, sold for fiat, or transferred to real-world financial institutions.</li>
                                <li>The Platform assumes no liability for virtual losses, bad trades, or market fluctuations within the simulation.</li>
                            </ul>
                        </div>
                    </section>

                    {/* 2. Bidding Wars Rules */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-white">
                            <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
                                <Gavel size={24} />
                            </div>
                            <h2 className="text-xl font-bold uppercase tracking-wide">2. Bidding War Protocols</h2>
                        </div>
                        <div className="pl-12 space-y-4 text-slate-400 leading-relaxed">
                            <p>
                                Participation in live "Bidding Wars" and "Wait Rooms" is subject to strict rules:
                            </p>
                            <ul className="list-disc pl-5 space-y-2 marker:text-cyan-500">
                                <li><span className="text-slate-200 font-bold">Fair Bidding:</span> Users must bid in good faith. Manipulation of auction timers via script or exploit is strictly prohibited.</li>
                                <li><span className="text-slate-200 font-bold">Inventory Integrity:</span> Virtual assets (Real Estate, Vehicles, Resources) acquired through bidding are bound to your PMUID handle and cannot be "cloned" or exploited.</li>
                                <li><span className="text-slate-200 font-bold">Wait Room Etiquette:</span> Offensive handles or disruptive behavior during auction countdowns will result in immediate identity suspension.</li>
                            </ul>
                        </div>
                    </section>

                    {/* 3. Account Tiers & Identity */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-white">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                                <Scale size={24} />
                            </div>
                            <h2 className="text-xl font-bold uppercase tracking-wide">3. Account Integrity</h2>
                        </div>
                        <div className="pl-12 space-y-4 text-slate-400 leading-relaxed">
                            <p>
                                Our identity system uses tiered accounts to maintain ecosystem stability:
                            </p>
                            <ul className="list-disc pl-5 space-y-2 marker:text-blue-500">
                                <li><span className="text-slate-200 font-bold">Main Accounts:</span> Verified through WhatsApp for permanent access. These are entitled to exclusive starter bonuses and high-rank perks.</li>
                                <li><span className="text-slate-200 font-bold">Side Accounts:</span> Linked to Google Auth. These are for alternate trading strategies and do not receive the ₹1L starter bonus.</li>
                                <li><span className="text-slate-200 font-bold">Multi-Account Clause:</span> Creating multiple Side Accounts to artificially inflate ranks or manipulate Bidding Wars is an offense that triggers permanent handle liquidation.</li>
                            </ul>
                        </div>
                    </section>

                    {/* 4. Violation Consequences */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-white">
                            <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400">
                                <ShieldAlert size={24} />
                            </div>
                            <h2 className="text-xl font-bold uppercase tracking-wide">4. Protocol Enforcement</h2>
                        </div>
                        <div className="pl-12 text-slate-400 leading-relaxed space-y-4">
                            <p>
                                Failure to comply with these digital laws will result in:
                            </p>
                            <div className="flex items-center gap-3 p-4 bg-rose-500/5 border border-rose-500/20 rounded-xl">
                                <UserX size={20} className="text-rose-500 shrink-0" />
                                <span className="text-xs font-black uppercase tracking-widest text-rose-300">Permanent Handle Liquidation (Banning)</span>
                            </div>
                            <p>
                                All decisions made by the Paper Money Protocol Administrator regarding account suspensions and digital asset seizures are final.
                            </p>
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <div className="mt-20 pt-12 border-t border-slate-800 text-center">
                    <p className="text-[10px] uppercase tracking-[0.4em] text-slate-600">
                        Paper Money Secure Protocol · Enforcement Division (PED)
                    </p>
                    <p className="text-[9px] text-slate-700 mt-2">v3.1.2 Revision Oct 2023</p>
                </div>
            </div>
        </div>
    );
}
