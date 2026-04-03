'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
    TrendingUp, 
    Gavel, 
    ArrowRight,
    Award,
    MessageCircle
} from 'lucide-react';
import { LOGO_URL } from '@/lib/cloudinary';

// Animation variants for smooth, orchestrated reveals
const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as [number, number, number, number];

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.13,
            delayChildren: 0.05,
        },
    },
};

const cardVariants = {
    hidden: { opacity: 0, y: 56, scale: 0.96 },
    show: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.7,
            ease: EASE_OUT_EXPO,
        },
    },
};

const fadeUpVariants = {
    hidden: { opacity: 0, y: 28 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.7,
            ease: EASE_OUT_EXPO,
        },
    },
};

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
                        <img src={LOGO_URL} alt="Bid Wars" className="h-10 w-auto object-contain" />
                    </div>
                    <div className="flex items-center gap-6">
                        <Link href="/login" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Log In</Link>
                        <Link href="/signup" className="px-6 py-2.5 bg-[#FBBF24] text-slate-950 text-xs font-black uppercase tracking-widest rounded-full hover:scale-105 transition-all">Join Game</Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-32 px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: EASE_OUT_EXPO, delay: 0.1 }}
                        className="text-5xl md:text-8xl font-black tracking-tighter uppercase leading-[0.9] mb-8"
                    >
                        Bid. Collect. <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FBBF24] to-orange-500">Dominate.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: EASE_OUT_EXPO, delay: 0.22 }}
                        className="text-slate-400 text-sm md:text-lg max-w-2xl mx-auto font-medium leading-relaxed mb-12"
                    >
                        The ultimate virtual bidding ecosystem. Collect legendary artifacts, outsmart rivals in 10-second snipes, and ascend the elite player ranks using pure strategy.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: EASE_OUT_EXPO, delay: 0.36 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-6"
                    >
                        <Link 
                            href="/signup" 
                            className="w-full sm:w-auto px-10 py-5 bg-[#FBBF24] text-slate-950 text-sm font-black uppercase tracking-widest rounded-2xl shadow-[0_0_50px_rgba(251,191,36,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 group"
                        >
                            Enter The Arena
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* The Game Path Section */}
            <section className="py-24 bg-slate-950/50 border-y border-slate-900 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        className="text-center mb-16"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.4 }}
                    >
                        <motion.h2 
                            variants={fadeUpVariants}
                            className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-4"
                        >
                            The Path to <span className="text-[#FBBF24]">Monarch</span>
                        </motion.h2>
                        <motion.p 
                            variants={fadeUpVariants}
                            className="text-slate-500 font-medium max-w-xl mx-auto"
                        >
                            Master the virtual economy through strategy, precise timing, and bold decisions.
                        </motion.p>
                    </motion.div>

                    <motion.div
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.1 }}
                    >
                        {/* Connecting Line (Desktop only) */}
                        <div className="hidden lg:block absolute top-[40%] left-10 right-10 h-0.5 bg-gradient-to-r from-transparent via-slate-800 to-transparent -z-10" />

                        <motion.div variants={cardVariants} className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm group hover:border-[#FBBF24]/50 transition-colors text-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-b from-[#FBBF24]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="w-16 h-16 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center text-[#FBBF24] mb-6 mx-auto group-hover:scale-110 group-hover:bg-[#FBBF24]/10 transition-all shadow-xl">
                                <Gavel size={32} />
                            </div>
                            <h3 className="text-xl font-black uppercase tracking-tight mb-3">1. Join Bids</h3>
                            <p className="text-slate-400 text-sm font-medium leading-relaxed mb-4">
                                Participate in high-stakes 10-second snipes across Bronze, Silver, Gold, and Diamond scheduled auctions.
                            </p>
                            <div className="text-[9px] font-black uppercase tracking-widest text-slate-600">Timing is Everything</div>
                        </motion.div>

                        <motion.div variants={cardVariants} className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm group hover:border-blue-500/50 transition-colors text-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="w-16 h-16 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center text-blue-400 mb-6 mx-auto group-hover:scale-110 group-hover:bg-blue-500/10 transition-all shadow-xl">
                                <Award size={32} />
                            </div>
                            <h3 className="text-xl font-black uppercase tracking-tight mb-3">2. Win Artifacts</h3>
                            <p className="text-slate-400 text-sm font-medium leading-relaxed mb-4">
                                Outsmart rivals to secure legendary virtual items ranging from standard Tier E all the way up to mythical SSS+.
                            </p>
                            <div className="text-[9px] font-black uppercase tracking-widest text-slate-600">Build Your Vault</div>
                        </motion.div>

                        <motion.div variants={cardVariants} className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm group hover:border-emerald-500/50 transition-colors text-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="w-16 h-16 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center text-emerald-400 mb-6 mx-auto group-hover:scale-110 group-hover:bg-emerald-500/10 transition-all shadow-xl">
                                <TrendingUp size={32} />
                            </div>
                            <h3 className="text-xl font-black uppercase tracking-tight mb-3">3. Resell & Invest</h3>
                            <p className="text-slate-400 text-sm font-medium leading-relaxed mb-4">
                                Flip your won items on the volatile virtual market to grow your wealth and climb player ranks from Rookie to Monarch.
                            </p>
                            <div className="text-[9px] font-black uppercase tracking-widest text-slate-600">Rule The Market</div>
                        </motion.div>

                        <motion.div variants={cardVariants} className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm group hover:border-purple-500/50 transition-colors text-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="w-16 h-16 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center text-purple-400 mb-6 mx-auto group-hover:scale-110 group-hover:bg-purple-500/10 transition-all shadow-xl">
                                <MessageCircle size={32} />
                            </div>
                            <h3 className="text-xl font-black uppercase tracking-tight mb-3">4. Talk Market</h3>
                            <p className="text-slate-400 text-sm font-medium leading-relaxed mb-4">
                                Chat live with other players to discuss virtual market trends, negotiate prices, or brag about your prized vault.
                            </p>
                            <div className="text-[9px] font-black uppercase tracking-widest text-slate-600">Join The Community</div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Stats/Showcase Section */}
            <section className="py-24 px-6 relative">
                <div className="max-w-5xl mx-auto">
                    <motion.div 
                        variants={fadeUpVariants}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.25 }}
                        className="p-8 md:p-10 rounded-[2rem] bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 blur-[100px] rounded-full pointer-events-none" />
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                            <div className="flex-1 text-center md:text-left">
                                <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tight mb-4 text-white">
                                    Strategic Tiers & Rankings
                                </h3>
                                <p className="text-slate-400 font-medium leading-relaxed">
                                    Every bid counts. Ascend through an intricate ecosystem connecting player ranks, artifact rarities, and auction complexities. Designed for users who love pure economic strategy.
                                </p>
                            </div>
                            
                            <motion.div
                                className="flex-1 w-full grid grid-cols-2 gap-4"
                                variants={containerVariants}
                                initial="hidden"
                                whileInView="show"
                                viewport={{ once: true, amount: 0.3 }}
                            >
                                <motion.div variants={cardVariants} className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800/80 text-center">
                                    <div className="text-3xl font-black text-white mb-1">6</div>
                                    <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Player Ranks</div>
                                </motion.div>
                                <motion.div variants={cardVariants} className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800/80 text-center">
                                    <div className="text-3xl font-black text-[#FBBF24] mb-1">SSS+</div>
                                    <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Max Artifact Tier</div>
                                </motion.div>
                                <motion.div variants={cardVariants} className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800/80 text-center">
                                    <div className="text-3xl font-black text-white mb-1">4</div>
                                    <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Auction Tiers</div>
                                </motion.div>
                                <motion.div variants={cardVariants} className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800/80 text-center">
                                    <div className="text-3xl font-black text-blue-400 mb-1">Live</div>
                                    <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Virtual Market</div>
                                </motion.div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 px-6 border-t border-slate-900/50 bg-slate-950/80">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="flex flex-col items-center md:items-start gap-4">
                        <div className="flex items-center gap-3">
                            <img src={LOGO_URL} alt="Bid Wars" className="h-8 w-auto grayscale opacity-50 object-contain" />
                        </div>
                        <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest text-center md:text-left leading-relaxed">
                            © 2026 areebknown ecosystem. <br />
                            Designed strictly for virtual gaming. <br />
                            No real-world financial value. 
                        </p>
                    </div>
                    
                    <nav className="flex gap-4 sm:gap-6 text-[11px] font-black uppercase tracking-widest text-slate-500">
                        <Link href="/terms" className="hover:text-[#FBBF24] transition-colors">Terms of Service</Link>
                        <Link href="/privacy" className="hover:text-[#FBBF24] transition-colors">Privacy</Link>
                        <a href="mailto:support@bidwars.xyz" className="hover:text-[#FBBF24] transition-colors">Support</a>
                    </nav>

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
