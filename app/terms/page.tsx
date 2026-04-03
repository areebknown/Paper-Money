'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Scale, ShieldAlert, ArrowLeft, Gavel, UserX, BookOpen, AlertTriangle, RefreshCw, FileText } from 'lucide-react';
import { LOGO_URL } from '@/lib/cloudinary';

const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as [number, number, number, number];

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE_OUT_EXPO } },
};

const stagger = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

function Section({ icon, color, title, children }: {
    icon: React.ReactNode;
    color: string;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <motion.section variants={fadeUp} className="space-y-5">
            <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${color}`}>{icon}</div>
                <h2 className="text-lg font-black text-white uppercase tracking-widest">{title}</h2>
            </div>
            <div className="pl-14 space-y-4 text-slate-400 leading-relaxed text-sm">
                {children}
            </div>
        </motion.section>
    );
}

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-[#020617] text-slate-300 selection:bg-yellow-500/30 overflow-x-hidden">
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-yellow-900/5 blur-[120px] rounded-full" />
            </div>

            <div className="max-w-3xl mx-auto px-6 py-16 relative z-10">

                {/* Back Link */}
                <Link href="/" className="inline-flex items-center gap-2 text-[#FBBF24] hover:text-yellow-300 transition-colors text-xs font-black uppercase tracking-widest mb-12 group">
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Home
                </Link>

                {/* Header */}
                <motion.div
                    variants={stagger}
                    initial="hidden"
                    animate="show"
                    className="mb-16"
                >
                    <motion.div variants={fadeUp} className="flex items-center gap-4 mb-8">
                        <img src={LOGO_URL} alt="Bid Wars" className="h-12 w-auto object-contain" />
                    </motion.div>

                    <motion.h1 variants={fadeUp} className="text-4xl md:text-6xl font-black text-white tracking-tight uppercase mb-3">
                        Terms of <span className="text-[#FBBF24]">Service</span>
                    </motion.h1>
                    <div className="h-0.5 w-20 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full mb-6" />

                    <motion.p variants={fadeUp} className="text-slate-500 text-sm leading-relaxed max-w-2xl">
                        Effective Date: April 1, 2026 &nbsp;·&nbsp; Last Revised: April 3, 2026
                    </motion.p>
                    <motion.p variants={fadeUp} className="text-slate-400 text-base leading-relaxed max-w-2xl mt-4">
                        These Terms of Service ("Terms") constitute a legally binding agreement between you ("User") and the areebknown ecosystem ("we," "us," "our"), governing your access to and use of the Bid Wars platform, available at bidwars.xyz and any associated applications. By accessing or using the platform, you agree to be bound by these Terms in their entirety.
                    </motion.p>
                </motion.div>

                {/* Sections */}
                <motion.div
                    variants={stagger}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.05 }}
                    className="space-y-14"
                >
                    <Section icon={<BookOpen size={20} className="text-[#FBBF24]" />} color="bg-yellow-500/10" title="1. Nature of the Platform">
                        <p>Bid Wars is an entertainment and strategy platform that simulates an economic bidding environment using an internal virtual currency designated as "Paper Money" (₹). Users acknowledge and agree that:</p>
                        <ul className="list-disc pl-5 space-y-2 marker:text-[#FBBF24]">
                            <li>Paper Money and all virtual assets (estates, vehicles, resources, and artifacts) held within the platform carry no real-world monetary value and cannot be exchanged for legal tender or any form of real currency.</li>
                            <li>Platform rankings, scores, and ownership records are internal metrics relevant solely to the Bid Wars ecosystem and hold no legal or financial standing outside of the platform.</li>
                            <li>Bid Wars does not constitute gambling, a financial product, an investment scheme, or any service regulated under financial services legislation.</li>
                        </ul>
                    </Section>

                    <Section icon={<UserX size={20} className="text-blue-400" />} color="bg-blue-500/10" title="2. Eligibility & Account Registration">
                        <p>To register an account on Bid Wars, users must meet the following requirements:</p>
                        <ul className="list-disc pl-5 space-y-2 marker:text-blue-400">
                            <li>You must be at least 13 years of age. Users under 18 are advised to obtain parental or guardian consent prior to registration.</li>
                            <li>You must provide accurate and truthful information during the registration process.</li>
                            <li>You are responsible for maintaining the confidentiality of your account credentials. Any activity conducted through your account is your responsibility.</li>
                            <li><span className="text-slate-200 font-semibold">Main Accounts</span> require a verified email address and are eligible for the full platform feature set, including the introductory Paper Money bonus.</li>
                            <li><span className="text-slate-200 font-semibold">Finance Accounts</span> are authenticated via Google OAuth or email OTP and provide access to select platform features as outlined in the platform documentation.</li>
                        </ul>
                        <p>Creating multiple accounts to circumvent bans, exploit bonus systems, or manipulate competitive rankings is strictly prohibited and may result in permanent termination of all associated accounts.</p>
                    </Section>

                    <Section icon={<Gavel size={20} className="text-orange-400" />} color="bg-orange-500/10" title="3. Auction Participation & Fair Play">
                        <p>Participation in Bid Wars auctions is governed by the following conduct standards:</p>
                        <ul className="list-disc pl-5 space-y-2 marker:text-orange-400">
                            <li><span className="text-slate-200 font-semibold">Bid Commitment:</span> All bids placed by a user during a live auction constitute a binding commitment to pay the stated Paper Money amount from their account balance if the bid is successful. Bid withdrawal is not permitted once placed.</li>
                            <li><span className="text-slate-200 font-semibold">Snipe Mechanics:</span> The platform implements a 10-second snipe extension window. Users agree that this mechanic is by design and waive any objection to its application during live auctions.</li>
                            <li><span className="text-slate-200 font-semibold">Automation Prohibition:</span> The use of bots, scripts, macros, or any automated tooling to place bids, interact with the platform, or gain a competitive advantage is strictly prohibited.</li>
                            <li><span className="text-slate-200 font-semibold">Claim Window:</span> Following a successful auction, winning users must complete payment within the designated claim window. Failure to do so will result in forfeiture of the item and may result in a platform penalty.</li>
                        </ul>
                    </Section>

                    <Section icon={<Scale size={20} className="text-emerald-400" />} color="bg-emerald-500/10" title="4. Virtual Market & Economy">
                        <p>The Bid Wars virtual market allows players to list, buy, and trade virtual assets accumulated through auctions and gameplay. The following terms govern market interactions:</p>
                        <ul className="list-disc pl-5 space-y-2 marker:text-emerald-400">
                            <li>Market prices are determined by platform-defined parameters and user activity. We do not guarantee any specific return on virtual investments or trades.</li>
                            <li>Collusive trading, artificial price inflation, and coordinated market manipulation between multiple accounts or players are prohibited.</li>
                            <li>We reserve the right to adjust market mechanics, asset valuations, and economy parameters at our discretion to maintain platform balance and integrity.</li>
                        </ul>
                    </Section>

                    <Section icon={<ShieldAlert size={20} className="text-rose-400" />} color="bg-rose-500/10" title="5. Prohibited Conduct">
                        <p>The following actions constitute a material breach of these Terms and may result in immediate account suspension or permanent termination:</p>
                        <div className="space-y-2 mt-2">
                            {[
                                'Using the platform to engage in fraud, deception, or impersonation of other users.',
                                'Attempting to exploit technical vulnerabilities, security flaws, or undocumented platform behaviours.',
                                'Disseminating offensive, harassing, or threatening content in any user-facing communication feature.',
                                'Circumventing account restrictions, bans, or geographic limitations through alternative accounts or proxies.',
                                'Reverse engineering, scraping, or reproducing any portion of the Bid Wars platform without explicit written consent.',
                            ].map(item => (
                                <div key={item} className="flex items-start gap-3 p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl">
                                    <div className="w-1.5 h-1.5 bg-rose-500 rounded-full mt-1.5 shrink-0" />
                                    <span className="text-xs text-slate-400">{item}</span>
                                </div>
                            ))}
                        </div>
                    </Section>

                    <Section icon={<AlertTriangle size={20} className="text-yellow-500" />} color="bg-yellow-500/10" title="6. Disclaimers & Limitation of Liability">
                        <p>The Bid Wars platform is provided on an "as-is" and "as-available" basis. We make no representations or warranties, express or implied, regarding:</p>
                        <ul className="list-disc pl-5 space-y-2 marker:text-yellow-500">
                            <li>Uninterrupted or error-free platform availability.</li>
                            <li>The accuracy or completeness of any market data, rankings, or platform statistics.</li>
                            <li>The preservation of virtual assets, balances, or progress in the event of a technical failure, platform reset, or service discontinuation.</li>
                        </ul>
                        <p>To the fullest extent permitted by applicable law, the areebknown ecosystem shall not be liable for any indirect, incidental, consequential, or punitive damages arising from your use or inability to use the platform.</p>
                    </Section>

                    <Section icon={<RefreshCw size={20} className="text-indigo-400" />} color="bg-indigo-500/10" title="7. Platform Modifications & Termination">
                        <p>We reserve the right to modify, suspend, or discontinue any aspect of the Bid Wars platform at any time without prior notice, including but not limited to: game mechanics, virtual economy parameters, user interface, feature sets, and account tier structures.</p>
                        <p>We also reserve the right to terminate or suspend access to accounts that are found to be in violation of these Terms, at our sole discretion, with or without notice in cases of severe or repeated breaches.</p>
                    </Section>

                    <Section icon={<FileText size={20} className="text-slate-400" />} color="bg-slate-800/60" title="8. Governing Law & Amendments">
                        <p>These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising from these Terms or your use of the platform shall be subject to the exclusive jurisdiction of the competent courts located in India.</p>
                        <p>We reserve the right to revise these Terms at any time. Continued use of the platform following the publication of revised Terms constitutes your acceptance of those changes. We encourage users to review this page periodically.</p>
                        <p>For any queries regarding these Terms, please contact us at <a href="mailto:support@bidwars.xyz" className="text-[#FBBF24] hover:underline">support@bidwars.xyz</a>.</p>
                    </Section>
                </motion.div>

                {/* Footer */}
                <div className="mt-20 pt-12 border-t border-slate-800/60 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-slate-600">
                        © 2026 areebknown ecosystem · All rights reserved
                    </p>
                    <p className="text-[10px] uppercase tracking-widest text-slate-700">
                        <a href="mailto:support@bidwars.xyz" className="hover:text-[#FBBF24] transition-colors">support@bidwars.xyz</a>
                    </p>
                </div>

            </div>
        </div>
    );
}
