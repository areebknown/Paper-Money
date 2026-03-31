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
        <div className="min-h-screen bg-[#020617] text-white overflow-x-hidden selection:bg-cyan-500/30">
            {/* Global Background Glows */}
            <div className="fixed top-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-900/10 blur-[150px] rounded-full pointer-events-none" />
            <div className="fixed bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-cyan-900/10 blur-[150px] rounded-full pointer-events-none" />

            {/* Navigation */}
            <nav className="relative z-50 px-6 py-6 border-b border-slate-900/50 backdrop-blur-md sticky top-0">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <img src={LOGO_URL} alt="Bid Wars" className="h-10 w-auto" />
                        <span className="text-xl font-black tracking-tighter uppercase hidden sm:block">
                            Bid <span className="text-cyan-400">Wars</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-6">
                        <Link href="/login" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Log In</Link>
                        <Link href="/signup" className="px-6 py-2.5 bg-white text-slate-950 text-xs font-black uppercase tracking-widest rounded-full hover:bg-cyan-400 hover:scale-105 transition-all">Join Game</Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-20 pb-32 px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900/50 border border-cyan-500/20 rounded-full mb-8"
                    >
                        <span className="flex h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">Live Artifact Exchange Open</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-8xl font-black tracking-tighter uppercase leading-[0.9] mb-8"
                    >
                        Bid. Win. <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Dominate.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-400 text-sm md:text-lg max-w-2xl mx-auto font-medium leading-relaxed mb-12"
                    >
                        Join the high-stakes world of digital auctions. Trade legendary artifacts, exploit the market engine, and win real UPI rewards in the most aesthetic gaming ecosystem.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Link 
                            href="/signup" 
                            className="w-full sm:w-auto px-10 py-5 bg-cyan-500 text-slate-950 text-sm font-black uppercase tracking-widest rounded-2xl shadow-[0_0_50px_rgba(34,211,238,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                        >
                            Claim ₹1 Lakh Bonus
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
                    <div className="p-8 rounded-3xl bg-slate-900/30 border border-slate-800/50 backdrop-blur-sm group hover:border-cyan-500/30 transition-all">
                        <div className="w-14 h-14 bg-cyan-500/10 rounded-2xl flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 transition-transform">
                            <ShieldCheck size={32} />
                        </div>
                        <h3 className="text-xl font-black uppercase tracking-tight mb-3">Biometric Security</h3>
                        <p className="text-slate-500 text-sm font-medium leading-relaxed">
                            Verified by WebAuthn Passkeys. Your fingerprint is your identity. Secure, hardware-backed authentication for every trade.
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="p-8 rounded-3xl bg-slate-900/30 border border-slate-800/50 backdrop-blur-sm group hover:border-blue-500/30 transition-all">
                        <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                            <TrendingUp size={32} />
                        </div>
                        <h3 className="text-xl font-black uppercase tracking-tight mb-3">Dynamic Economy</h3>
                        <p className="text-slate-500 text-sm font-medium leading-relaxed">
                            A living market engine with booms, crashes, and real-time asset tracking. Trade your way from Bronze to SSS+ Tier.
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="p-8 rounded-3xl bg-slate-900/30 border border-slate-800/50 backdrop-blur-sm group hover:border-purple-500/30 transition-all">
                        <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform">
                            <Gavel size={32} />
                        </div>
                        <h3 className="text-xl font-black uppercase tracking-tight mb-3">Live Auctions</h3>
                        <p className="text-slate-500 text-sm font-medium leading-relaxed">
                            Compete in heart-pounding live bidding wars. Outbid rivals in the final seconds to claim legendary digital artifacts.
                        </p>
                    </div>
                </div>
            </section>

            {/* Explainer / Detailed Info */}
            <section className="py-32 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-8">What is <span className="text-cyan-400">Bid Wars?</span></h2>
                    <p className="text-slate-400 text-base md:text-xl font-medium leading-relaxed mb-16 px-4">
                        Bid Wars is the first fully biometric digital auction platform. Players register as "Traders" using their device's native security systems (FaceID/Fingerprint). You enter a high-stakes environment where digital artifacts are auctioned in real-time. By mastering the market cycles, you accumulate wealth that can be leveraged for game progression and ecosystem rewards.
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
                            <div className="text-2xl font-black text-white mb-1">Passkey</div>
                            <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Verified Auth</div>
                        </div>
                        <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
                            <div className="text-2xl font-black text-white mb-1">₹1 Lakh</div>
                            <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Starter Bonus</div>
                        </div>
                        <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
                            <div className="text-2xl font-black text-white mb-1">Real-Time</div>
                            <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Market Engine</div>
                        </div>
                        <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
                            <div className="text-2xl font-black text-white mb-1">SSS+</div>
                            <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Artifact Tiers</div>
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
                        <p className="text-slate-600 text-xs font-bold uppercase tracking-widest">© 2026 areebknown ecosystem. All rights reserved.</p>
                    </div>
                    
                    <div className="flex gap-8 text-[11px] font-black uppercase tracking-widest text-slate-500">
                        <Link href="/terms" className="hover:text-cyan-400 transition-colors">Terms of Service</Link>
                        <Link href="/privacy" className="hover:text-cyan-400 transition-colors">Privacy Policy</Link>
                        <a href="mailto:support@wars-bid.vercel.app" className="hover:text-cyan-400 transition-colors">Support</a>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg flex items-center gap-2">
                             <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                             <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Server Status: Online</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
