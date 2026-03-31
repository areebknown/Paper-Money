'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
    ShieldCheck, 
    Zap, 
    TrendingUp, 
    Gavel, 
    Smartphone, 
    ArrowRight,
    Play,
    Award,
    Dna
} from 'lucide-react';
import { LOGO_URL } from '@/lib/cloudinary';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[#020617] text-white overflow-x-hidden selection:bg-yellow-500/30">
            {/* Global Background Glows */}
            <div className="fixed top-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-900/10 blur-[150px] rounded-full pointer-events-none" />
            <div className="fixed bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-yellow-900/10 blur-[150px] rounded-full pointer-events-none" />

            {/* Navigation */}
            <nav className="relative z-50 px-6 py-6 border-b border-slate-900/50 backdrop-blur-md sticky top-0">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <img src={LOGO_URL} alt="Bid Wars" className="h-10 w-auto" />
                        <span className="text-xl font-black tracking-tighter uppercase hidden sm:block">
                            Bid <span className="text-[#FBBF24]">Wars</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-6">
                        <Link href="/login" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Log In</Link>
                        <Link href="/signup" className="px-6 py-2.5 bg-[#FBBF24] text-slate-950 text-xs font-black uppercase tracking-widest rounded-full hover:scale-105 transition-all">Join Game</Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-20 pb-32 px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900/50 border border-[#FBBF24]/20 rounded-full mb-8"
                    >
                        <span className="flex h-2 w-2 rounded-full bg-[#FBBF24] animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FBBF24]">Global Virtual Auction Live</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-8xl font-black tracking-tighter uppercase leading-[0.9] mb-8"
                    >
                        Bid. Collect. <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FBBF24] to-orange-500">Dominate.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-400 text-sm md:text-lg max-w-2xl mx-auto font-medium leading-relaxed mb-6"
                    >
                        The ultimate 2.5D virtual bidding challenge. Collect legendary artifacts, outsmart rivals in 10-second snipes, and climb the SSS+ ranks using 100% paper money.
                    </motion.p>
                    
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.25 }}
                        className="mb-12"
                    >
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 px-4 py-1.5 border border-slate-800 rounded-lg bg-black/20">
                           🎮 100% Virtual • No Real Money • For Entertainment
                        </span>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Link 
                            href="/signup" 
                            className="w-full sm:w-auto px-10 py-5 bg-[#FBBF24] text-slate-950 text-sm font-black uppercase tracking-widest rounded-2xl shadow-[0_0_50px_rgba(251,191,36,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                        >
                            Claim ₹1 Lakh Bonus (Paper Money)
                            <ArrowRight size={18} />
                        </Link>
                        <button className="w-full sm:w-auto px-10 py-5 bg-slate-900 text-white text-sm font-black uppercase tracking-widest rounded-2xl border border-slate-800 hover:bg-slate-800 transition-all flex items-center justify-center gap-3">
                            <Play size={18} fill="white" />
                            How to play
                        </button>
                    </motion.div>
                </div>
            </section>

            {/* Feature Grid */}
            <section className="py-32 bg-slate-950/50 border-y border-slate-900 px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Feature 1 */}
                    <div className="p-8 rounded-3xl bg-slate-900/30 border border-slate-800/50 backdrop-blur-sm group hover:border-[#FBBF24]/30 transition-all text-center md:text-left">
                        <div className="w-14 h-14 bg-[#FBBF24]/10 rounded-2xl flex items-center justify-center text-[#FBBF24] mb-6 mx-auto md:mx-0 group-hover:scale-110 transition-transform">
                            <ShieldCheck size={32} />
                        </div>
                        <h3 className="text-xl font-black uppercase tracking-tight mb-3">Secure Game ID</h3>
                        <p className="text-slate-500 text-sm font-medium leading-relaxed">
                            Protect your collection with hardware-backed security. Your device's biometrics lock your game profile securely. No bank logins needed.
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="p-8 rounded-3xl bg-slate-900/30 border border-slate-800/50 backdrop-blur-sm group hover:border-blue-500/30 transition-all text-center md:text-left">
                        <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 mb-6 mx-auto md:mx-0 group-hover:scale-110 transition-transform">
                            <TrendingUp size={32} />
                        </div>
                        <h3 className="text-xl font-black uppercase tracking-tight mb-3">Virtual Market</h3>
                        <p className="text-slate-500 text-sm font-medium leading-relaxed">
                            Simulate market cycles, master the virtual trade, and grow your "Paper Money" wealth. Climb the tiers from Bronze to SSS+ Legend.
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="p-8 rounded-3xl bg-slate-900/30 border border-slate-800/50 backdrop-blur-sm group hover:border-purple-500/30 transition-all text-center md:text-left">
                        <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400 mb-6 mx-auto md:mx-0 group-hover:scale-110 transition-transform">
                            <Gavel size={32} />
                        </div>
                        <h3 className="text-xl font-black uppercase tracking-tight mb-3">10-Second Snipes</h3>
                        <p className="text-slate-500 text-sm font-medium leading-relaxed">
                            Compete in live bidding wars for legendary artifacts. It's about speed, strategy, and virtual glory for all fans and collectors.
                        </p>
                    </div>
                </div>
            </section>

            {/* Explainer / Detailed Info */}
            <section className="py-32 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-8">What is <span className="text-[#FBBF24]">Bid Wars?</span></h2>
                    <p className="text-slate-400 text-base md:text-xl font-medium leading-relaxed mb-16 px-4">
                        Bid Wars is a fun and safe virtual bidding game designed for fans and kids. You use "Paper Money"—our virtual game currency—to collect digital artifacts in a unique 2.5D environment. It's a competitive ecosystem where your strategy and timing determine your rank. We use biometric "Account Binding" so you never have to remember a password to play.
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
                            <div className="text-2xl font-black text-white mb-1">Game ID</div>
                            <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Biometric Play</div>
                        </div>
                        <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
                            <div className="text-2xl font-black text-white mb-1">1 Lakh</div>
                            <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Paper Money Bonus</div>
                        </div>
                        <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
                            <div className="text-2xl font-black text-white mb-1">Real-Time</div>
                            <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Game Simulation</div>
                        </div>
                        <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
                            <div className="text-2xl font-black text-white mb-1">SSS+</div>
                            <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Virtual Tiers</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 px-6 border-t border-slate-900/50 bg-slate-950/80">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="flex flex-col items-center md:items-start gap-4">
                        <div className="flex items-center gap-3">
                            <img src={LOGO_URL} alt="Bid Wars" className="h-8 w-auto grayscale opacity-50" />
                            <span className="text-lg font-black tracking-tighter uppercase opacity-50">Bid Wars</span>
                        </div>
                        <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest text-center md:text-left">
                            © 2026 areebknown ecosystem. <br />
                            Designed strictly for virtual gaming. <br />
                            No real-world financial value. 
                        </p>
                    </div>
                    
                    <div className="flex gap-8 text-[11px] font-black uppercase tracking-widest text-slate-500">
                        <Link href="/terms" className="hover:text-[#FBBF24] transition-colors">Term of Service</Link>
                        <Link href="/privacy" className="hover:text-[#FBBF24] transition-colors">Privacy Policy</Link>
                        <a href="mailto:support@wars-bid.vercel.app" className="hover:text-[#FBBF24] transition-colors">Support</a>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg flex items-center gap-2">
                             <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                             <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Game Server: Online</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
