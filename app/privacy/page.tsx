'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, Lock, EyeOff, ArrowLeft, Database, Globe, Server, UserCheck, FileText } from 'lucide-react';
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

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-[#020617] text-slate-300 selection:bg-yellow-500/30 overflow-x-hidden">
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-yellow-900/5 blur-[120px] rounded-full" />
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
                        Privacy <span className="text-[#FBBF24]">Policy</span>
                    </motion.h1>
                    <div className="h-0.5 w-20 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full mb-6" />

                    <motion.p variants={fadeUp} className="text-slate-500 text-sm leading-relaxed max-w-2xl">
                        Effective Date: April 1, 2026 &nbsp;·&nbsp; Last Revised: April 3, 2026
                    </motion.p>
                    <motion.p variants={fadeUp} className="text-slate-400 text-base leading-relaxed max-w-2xl mt-4">
                        This Privacy Policy governs how Bid Wars (operated by the areebknown ecosystem) collects, uses, retains, and protects information provided by users of the platform. We are committed to responsible data stewardship and transparency in all our practices.
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
                    <Section icon={<UserCheck size={20} className="text-[#FBBF24]" />} color="bg-yellow-500/10" title="1. Information We Collect">
                        <p>When you create an account on Bid Wars, we collect only the information necessary to operate the platform effectively. This includes:</p>
                        <ul className="list-disc pl-5 space-y-2 marker:text-[#FBBF24]">
                            <li><span className="text-slate-200 font-semibold">Account Credentials:</span> A chosen username and, for Finance Account holders, a verified email address used solely for authentication and platform communications.</li>
                            <li><span className="text-slate-200 font-semibold">Google OAuth Data:</span> If you choose to authenticate via Google, we receive your public profile name and email address from Google's verified identity service. No passwords are accessed or stored.</li>
                            <li><span className="text-slate-200 font-semibold">Profile Metadata:</span> Optional display name, avatar image, and player preferences that you voluntarily provide within the platform.</li>
                            <li><span className="text-slate-200 font-semibold">Activity Records:</span> Bid history, auction participation timestamps, virtual portfolio composition, and rank progression as required for platform functionality.</li>
                        </ul>
                    </Section>

                    <Section icon={<EyeOff size={20} className="text-emerald-400" />} color="bg-emerald-500/10" title="2. Information We Do Not Collect">
                        <p>Bid Wars operates on a minimal data principle. We explicitly do not collect, request, or process the following categories of personal data:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                            {['Real-world financial information', 'Government-issued ID or KYC data', 'Device contacts or call logs', 'Location or GPS data', 'Microphone or camera feeds', 'Biometric data of any kind'].map(item => (
                                <div key={item} className="flex items-center gap-3 p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
                                    <div className="w-2 h-2 bg-rose-500 rounded-full shrink-0" />
                                    <span className="text-xs font-semibold text-slate-300">{item}</span>
                                </div>
                            ))}
                        </div>
                        <p className="text-[11px] text-slate-500 italic">Camera access may be requested solely when a user voluntarily uploads a custom profile image. This is optional and never automatic.</p>
                    </Section>

                    <Section icon={<Database size={20} className="text-blue-400" />} color="bg-blue-500/10" title="3. How We Use Your Information">
                        <p>Information collected is used exclusively for the following purposes:</p>
                        <ul className="list-disc pl-5 space-y-2 marker:text-blue-400">
                            <li>Authenticating your identity and maintaining session security across devices.</li>
                            <li>Maintaining the accuracy of your virtual portfolio, Paper Money balance, rank standing, and auction history.</li>
                            <li>Sending transactional communications such as OTP codes, auction result notifications, and account security alerts.</li>
                            <li>Improving platform performance, detecting abuse, and investigating reports of policy violations.</li>
                            <li>Complying with applicable legal obligations where required by law.</li>
                        </ul>
                        <p>We do not sell, rent, lease, or share your personal information with third-party advertisers or data brokers under any circumstances.</p>
                    </Section>

                    <Section icon={<Server size={20} className="text-indigo-400" />} color="bg-indigo-500/10" title="4. Data Storage & Retention">
                        <p>All user data is stored on secure, encrypted infrastructure. Your account information is retained for as long as your account is active on the platform. Upon account deletion, all associated personal data is purged from our primary systems within 30 days, subject to legally mandated retention exceptions.</p>
                        <p>Virtual platform records, including auction logs and rank history, may be retained in anonymised aggregate form for platform analytics and fairness auditing.</p>
                    </Section>

                    <Section icon={<Globe size={20} className="text-purple-400" />} color="bg-purple-500/10" title="5. Third-Party Services">
                        <p>Bid Wars integrates a limited number of trusted third-party services necessary for platform operation. These include:</p>
                        <ul className="list-disc pl-5 space-y-2 marker:text-purple-400">
                            <li><span className="text-slate-200 font-semibold">Google OAuth 2.0</span> — Identity verification for Finance Account holders. Subject to Google's Privacy Policy.</li>
                            <li><span className="text-slate-200 font-semibold">Resend</span> — Transactional email delivery for OTPs and account communications.</li>
                            <li><span className="text-slate-200 font-semibold">Cloudinary</span> — Secure storage and delivery of user-uploaded profile images.</li>
                            <li><span className="text-slate-200 font-semibold">Pusher</span> — Real-time communication infrastructure for live auction events.</li>
                            <li><span className="text-slate-200 font-semibold">Vercel</span> — Application hosting and deployment infrastructure.</li>
                        </ul>
                        <p>All third-party providers are contractually required to handle your data in accordance with applicable data protection standards.</p>
                    </Section>

                    <Section icon={<Lock size={20} className="text-rose-400" />} color="bg-rose-500/10" title="6. Security">
                        <p>We implement industry-standard security measures across the platform, including JWT-based session tokens with short-lived expiry windows, encrypted data transmission via HTTPS/TLS, and server-side validation on all sensitive operations.</p>
                        <p>While we apply commercially reasonable protections, no system can guarantee absolute security. Users are encouraged to keep their login credentials and any active OTPs confidential.</p>
                    </Section>

                    <Section icon={<FileText size={20} className="text-slate-400" />} color="bg-slate-800/60" title="7. Your Rights">
                        <p>Subject to applicable law, you retain the following rights with respect to your personal data:</p>
                        <ul className="list-disc pl-5 space-y-2 marker:text-slate-500">
                            <li><span className="text-slate-200 font-semibold">Right of Access:</span> Request a summary of the personal data we hold about you.</li>
                            <li><span className="text-slate-200 font-semibold">Right to Rectification:</span> Correct inaccurate information associated with your account.</li>
                            <li><span className="text-slate-200 font-semibold">Right to Erasure:</span> Request deletion of your account and associated personal data.</li>
                            <li><span className="text-slate-200 font-semibold">Right to Object:</span> Object to processing activities not covered by a legitimate legal basis.</li>
                        </ul>
                        <p>To exercise any of the above rights, contact our team at <a href="mailto:support@bidwars.xyz" className="text-[#FBBF24] hover:underline">support@bidwars.xyz</a>.</p>
                    </Section>

                    <Section icon={<Shield size={20} className="text-slate-400" />} color="bg-slate-800/60" title="8. Policy Updates">
                        <p>We reserve the right to amend this Privacy Policy at any time. Users will be notified of material changes via in-platform notices or email (where applicable). Continued use of the platform following any update constitutes acceptance of the revised terms.</p>
                        <p>This policy is governed by and construed in accordance with the laws of India. Any disputes arising in connection with this policy shall be subject to the exclusive jurisdiction of the courts of India.</p>
                    </Section>
                </motion.div>

                {/* Footer */}
                <div className="mt-20 pt-12 border-t border-slate-800/60 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
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
