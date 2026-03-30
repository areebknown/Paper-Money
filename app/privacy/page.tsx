'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, Lock, EyeOff, Fingerprint, ArrowLeft, Database, Globe } from 'lucide-react';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-[#020617] text-slate-300 font-['Inter'] selection:bg-cyan-500/30 overflow-x-hidden">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-900/5 blur-[120px] rounded-full" />
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
                        Identity <span className="text-cyan-400">Protocol</span>
                    </h1>
                    <div className="h-1 w-24 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full mb-6" />
                    <p className="text-slate-500 text-lg leading-relaxed max-w-xl">
                        At Paper Money UPI (Bid Wars), your identity handles and financial simulation data are protected under our Secure Identity Node system.
                    </p>
                </motion.div>

                {/* Main Content */}
                <div className="space-y-12">
                    {/* 1. Identity Data */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-white">
                            <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
                                <Fingerprint size={24} />
                            </div>
                            <h2 className="text-xl font-bold uppercase tracking-wide">1. Core Identity Nodes</h2>
                        </div>
                        <div className="pl-12 space-y-4 text-slate-400 leading-relaxed">
                            <p>
                                To facilitate the **Paper Money UPI** ecosystem, we collect essential identity markers:
                            </p>
                            <ul className="list-disc pl-5 space-y-2 marker:text-cyan-500">
                                <li><span className="text-slate-200 font-bold">PMUID Handle:</span> An immutable 8-digit unique identifier (e.g., PM-XXXX-XXXX) generated at genesis for every user.</li>
                                <li><span className="text-slate-200 font-bold">WhatsApp Identity:</span> Used strictly for "Main Account" verification via Meta Business API. We do not store your chat history or personal messages.</li>
                                <li><span className="text-slate-200 font-bold">Google Auth:</span> We sync your primary email and profile picture to provide seamless cross-device synchronization for "Side Accounts."</li>
                            </ul>
                        </div>
                    </section>

                    {/* 2. No Sensitive Permission */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-white">
                            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                                <EyeOff size={24} />
                            </div>
                            <h2 className="text-xl font-bold uppercase tracking-wide">2. Privacy Boundaries</h2>
                        </div>
                        <div className="pl-12 space-y-4 text-slate-400 leading-relaxed">
                            <p>
                                Bid Wars is designed with a **Minimum Permission Strategy**. We explicitly guarantee that we do NOT access, collect, or store:
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl flex items-center gap-3">
                                    <div className="w-2 h-2 bg-rose-500 rounded-full" />
                                    <span className="text-xs font-bold uppercase tracking-widest">No Contacts Sync</span>
                                </div>
                                <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl flex items-center gap-3">
                                    <div className="w-2 h-2 bg-rose-500 rounded-full" />
                                    <span className="text-xs font-bold uppercase tracking-widest">No Microphone Access</span>
                                </div>
                                <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl flex items-center gap-3">
                                    <div className="w-2 h-2 bg-rose-500 rounded-full" />
                                    <span className="text-xs font-bold uppercase tracking-widest">No Camera/Video</span>
                                </div>
                                <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl flex items-center gap-3">
                                    <div className="w-2 h-2 bg-rose-500 rounded-full" />
                                    <span className="text-xs font-bold uppercase tracking-widest">No Location Data</span>
                                </div>
                            </div>
                            <p className="text-xs italic mt-4 text-slate-500">
                                *Camera access may be requested only during profile picture uploads, and only with your explicit real-time intent.
                            </p>
                        </div>
                    </section>

                    {/* 3. The Simulated Economy */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-white">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                                <Database size={24} />
                            </div>
                            <h2 className="text-xl font-bold uppercase tracking-wide">3. Simulated Data Architecture</h2>
                        </div>
                        <div className="pl-12 space-y-4 text-slate-400 leading-relaxed">
                            <p>
                                Bid Wars is a financial simulator. All "Paper Money," "UPI Transfers," and "Asset Ownership" (Estates, Vehicles, Resources) are recorded on our internal ledger and have **no correlation** to real-world fiat currency or ownership.
                            </p>
                            <p>
                                We utilize high-performance encryption for our database nodes (Neon/Supabase) to ensure your virtual inventory and bidding progress are shielded from unauthorized tampering.
                            </p>
                        </div>
                    </section>

                    {/* 4. Security & Compliance */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-white">
                            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                                <Shield size={24} />
                            </div>
                            <h2 className="text-xl font-bold uppercase tracking-wide">4. Protocol Compliance</h2>
                        </div>
                        <div className="pl-12 text-slate-400 leading-relaxed">
                            <p>
                                By engaging with the Bid Wars interface, you acknowledge that your handle and profile picture may be visible to other users during "Live Bidding Wars" and on global "Rank Leaderboards."
                            </p>
                            <p className="mt-4">
                                For any identity-related inquiries or handle deletion requests, please contact the Protocol Administrator via the help portal.
                            </p>
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <div className="mt-20 pt-12 border-t border-slate-800 text-center">
                    <p className="text-[10px] uppercase tracking-[0.4em] text-slate-600">
                        Paper Money Secure Protocol · Identity Protection Unit
                    </p>
                    <p className="text-[9px] text-slate-700 mt-2">v2.5.0 Revision Oct 2023</p>
                </div>
            </div>
        </div>
    );
}
