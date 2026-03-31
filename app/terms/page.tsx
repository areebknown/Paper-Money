'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Scale, MessageSquare, ShieldAlert, Cpu, ArrowLeft, Gavel, UserX } from 'lucide-react';
import { LOGO_URL } from '@/lib/cloudinary';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-[#020617] text-slate-300 font-['Inter'] selection:bg-yellow-500/30 overflow-x-hidden">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/10 blur-[120px] rounded-full" />
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
                        Game <span className="text-[#FBBF24]">Rules</span>
                    </h1>
                    <div className="h-1 w-24 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-full mb-6" />
                    
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl mb-6 text-center md:text-left">
                        <p className="text-[#FBBF24] text-xs font-black uppercase tracking-[0.2em]">
                           🎮 100% Virtual • No Real Money • For Fun
                        </p>
                    </div>

                    <p className="text-slate-500 text-lg leading-relaxed max-w-xl text-center md:text-left">
                        By playing Bid Wars, you agree to these game rules. This is a virtual simulation for fun and artifact collection.
                    </p>
                </motion.div>

                {/* Main Content */}
                <div className="space-y-12">
                    {/* 1. The Virtual Sandbox */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-white">
                            <div className="p-2 bg-yellow-500/10 rounded-lg text-[#FBBF24]">
                                <Cpu size={24} />
                            </div>
                            <h2 className="text-xl font-bold uppercase tracking-wide">1. The Virtual Sandbox</h2>
                        </div>
                        <div className="pl-12 space-y-4 text-slate-400 leading-relaxed">
                            <p>
                                Bid Wars is a **purely virtual gaming experience**. You acknowledge and agree that:
                            </p>
                            <ul className="list-disc pl-5 space-y-2 marker:text-[#FBBF24]">
                                <li>All "Paper Money" (₹) balances are for game-use only and hold **zero real-world value**.</li>
                                <li>Game currency, assets, and inventory cannot be cashed out or used in any real-world financial systems.</li>
                                <li>The Game assumes no liability for virtual losses, artifact trades, or in-game market fluctuations.</li>
                            </ul>
                        </div>
                    </section>

                    {/* 2. Bidding Wars Rules */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-white">
                            <div className="p-2 bg-orange-500/10 rounded-lg text-orange-400">
                                <Gavel size={24} />
                            </div>
                            <h2 className="text-xl font-bold uppercase tracking-wide">2. Fair Play Protocols</h2>
                        </div>
                        <div className="pl-12 space-y-4 text-slate-400 leading-relaxed">
                            <p>
                                Participation in live "Bidding Wars" and "Wait Rooms" is for fun and strategy:
                            </p>
                            <ul className="list-disc pl-5 space-y-2 marker:text-orange-500">
                                <li><span className="text-slate-200 font-bold">Good Sportsmanship:</span> Use of scripts, bots, or external hacks to manipulate timers is strictly against the game's competitive spirit.</li>
                                <li><span className="text-slate-200 font-bold">Virtual Assets:</span> Artifacts acquired through bidding (Estates, Vehicles, etc.) are digital collectibles for your game vault.</li>
                                <li><span className="text-slate-200 font-bold">Respect:</span> Keep it fun for everyone. Offensive usernames or disruptive chat during auctions will result in game suspension.</li>
                            </ul>
                        </div>
                    </section>

                    {/* 3. Account Identity */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-white">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                                <Scale size={24} />
                            </div>
                            <h2 className="text-xl font-bold uppercase tracking-wide">3. Game Account Integrity</h2>
                        </div>
                        <div className="pl-12 space-y-4 text-slate-400 leading-relaxed">
                            <p>
                                We use secure device binding to keep your game progress safe:
                            </p>
                            <ul className="list-disc pl-5 space-y-2 marker:text-blue-500">
                                <li><span className="text-slate-200 font-bold">Elite Traders:</span> Use device-secure biometrics to protect your rank and bonus. These accounts receive exclusive starter paper money.</li>
                                <li><span className="text-slate-200 font-bold">Lite Traders:</span> Simple accounts for exploring the game. These do not receive the same Paper Money bonuses.</li>
                                <li><span className="text-slate-200 font-bold">Multi-Account Clause:</span> Creating multiple accounts to cheat or manipulate game ranks is not allowed.</li>
                            </ul>
                        </div>
                    </section>

                    {/* 4. Game Moderation */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-white">
                            <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400">
                                <ShieldAlert size={24} />
                            </div>
                            <h2 className="text-xl font-bold uppercase tracking-wide">4. Fair Play Enforcement</h2>
                        </div>
                        <div className="pl-12 text-slate-400 leading-relaxed space-y-4">
                            <p>
                                Breaking game rules will result in:
                            </p>
                            <div className="flex items-center gap-3 p-4 bg-rose-500/5 border border-rose-500/20 rounded-xl">
                                <UserX size={20} className="text-rose-500 shrink-0" />
                                <span className="text-xs font-black uppercase tracking-widest text-rose-300">Game Account Suspension</span>
                            </div>
                            <p>
                                Our game community moderation team monitors the environment to ensure a fair and safe experience for all bidders.
                            </p>
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <div className="mt-20 pt-12 border-t border-slate-800 text-center">
                    <p className="text-[10px] uppercase tracking-[0.4em] text-slate-600">
                        Bid Wars · Game Community Protection Team
                    </p>
                    <p className="text-[9px] text-slate-700 mt-2">v4.0.0 Global Revision for Fans & Kids</p>
                </div>
            </div>
        </div>
    );
}
