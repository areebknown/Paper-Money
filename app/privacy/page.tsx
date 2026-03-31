'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, Lock, EyeOff, Fingerprint, ArrowLeft, Database, Globe, ShieldCheck } from 'lucide-react';
import { LOGO_URL } from '@/lib/cloudinary';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-[#020617] text-slate-300 font-['Inter'] selection:bg-yellow-500/30 overflow-x-hidden">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-yellow-900/5 blur-[120px] rounded-full" />
            </div>

            <div className="max-w-3xl mx-auto px-6 py-16 relative z-10">
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 flex flex-col items-center md:items-start"
                >
                    <Link href="/login" className="inline-flex items-center gap-2 text-[#FBBF24] hover:text-yellow-300 transition-colors text-sm font-bold mb-8 group self-start">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        BACK TO LOGIN
                    </Link>

                    <img 
                        src={LOGO_URL} 
                        alt="Bid Wars" 
                        className="h-20 w-auto mb-8 drop-shadow-[0_4px_30px_rgba(251,191,36,0.2)]"
                    />

                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight uppercase mb-4 text-center md:text-left">
                        Privacy <span className="text-[#FBBF24]">Policy</span>
                    </h1>
                    <div className="h-1 w-24 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full mb-6" />
                    
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl mb-6 text-center md:text-left">
                        <p className="text-[#FBBF24] text-xs font-black uppercase tracking-[0.2em]">
                           🛡️ Gamer Profile Protection • Paper Money Only
                        </p>
                    </div>

                    <p className="text-slate-500 text-lg leading-relaxed max-w-xl text-center md:text-left">
                        At Bid Wars, your game progress and virtual collection are protected under our Gamer Privacy protocols.
                    </p>
                </motion.div>

                {/* Main Content */}
                <div className="space-y-12">
                    {/* 1. Identity Data */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-white">
                            <div className="p-2 bg-yellow-500/10 rounded-lg text-[#FBBF24]">
                                <Fingerprint size={24} />
                            </div>
                            <h2 className="text-xl font-bold uppercase tracking-wide">1. Gamer ID Profiles</h2>
                        </div>
                        <div className="pl-12 space-y-4 text-slate-400 leading-relaxed">
                            <p>
                                To save your game progress and artifact collection, we use simple non-intrusive markers:
                            </p>
                            <ul className="list-disc pl-5 space-y-2 marker:text-[#FBBF24]">
                                <li><span className="text-slate-200 font-bold">GamerID:</span> A unique 8-digit code (e.g., BW-XXXX-XXXX) assigned to your profile.</li>
                                <li><span className="text-slate-200 font-bold">Account Binding:</span> Used strictly for "Elite Trader" progress saving. We do not access contacts, banking details, or real identity.</li>
                                <li><span className="text-slate-200 font-bold">Google Sign-in:</span> We only sync your public name and avatar for "Lite Trader" profiles.</li>
                            </ul>
                        </div>
                    </section>

                    {/* 2. Privacy Boundaries */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-white">
                            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                                <EyeOff size={24} />
                            </div>
                            <h2 className="text-xl font-bold uppercase tracking-wide">2. Privacy Boundaries</h2>
                        </div>
                        <div className="pl-12 space-y-4 text-slate-400 leading-relaxed">
                            <p>
                                Bid Wars is a safe environment with a **Minimal Data Strategy**. We explicitly guarantee that we do NOT access, collect, or store:
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
                                    <span className="text-xs font-bold uppercase tracking-widest">No Sensitive Sensors</span>
                                </div>
                                <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl flex items-center gap-3">
                                    <div className="w-2 h-2 bg-rose-500 rounded-full" />
                                    <span className="text-xs font-bold uppercase tracking-widest">No Location Data</span>
                                </div>
                            </div>
                            <p className="text-[10px] italic mt-4 text-slate-500 leading-tight">
                                *Camera access is only ever used if you choose to upload a custom profile icon, and only with your active choice.
                            </p>
                        </div>
                    </section>

                    {/* 3. The Virtual Gameplay */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-white">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                                <Database size={24} />
                            </div>
                            <h2 className="text-xl font-bold uppercase tracking-wide">3. In-Game Progress Ledger</h2>
                        </div>
                        <div className="pl-12 space-y-4 text-slate-400 leading-relaxed">
                            <p>
                                Bid Wars is a simulation for artifact fans. All "Paper Money," and virtual "Asset Ownership" (Estates, Vehicles, Resources) are recorded on our internal game ledger.
                            </p>
                            <p>
                                These virtual records have **no link** to real-world money or ownership. We use standard secure servers to ensure your game progress and rank history aren't lost.
                            </p>
                        </div>
                    </section>

                    {/* 4. Game Community Safety */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-white">
                            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                                <Shield size={24} />
                            </div>
                            <h2 className="text-xl font-bold uppercase tracking-wide">4. Community Integrity</h2>
                        </div>
                        <div className="pl-12 text-slate-400 leading-relaxed">
                            <p>
                                When playing Bid Wars, your chosen game name and avatar may be seen by other players during live bidding wars and on the rank leaderboards.
                            </p>
                            <p className="mt-4">
                                If you want to reset your game progress or delete your profile, simply contact our game support team.
                            </p>
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <div className="mt-20 pt-12 border-t border-slate-800 text-center">
                    <p className="text-[10px] uppercase tracking-[0.4em] text-slate-600">
                        Bid Wars · Gamer Support & Safety Team
                    </p>
                    <p className="text-[9px] text-slate-700 mt-2">v3.0.0 Global Safety Revision · 2026</p>
                </div>
            </div>
        </div>
    );
}
