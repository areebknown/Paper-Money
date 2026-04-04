'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CheckCircle2, Loader2, Plus, ArrowRight, ArrowLeft, Link2, ShieldCheck, Smartphone } from 'lucide-react';
import { LOGO_URL } from '@/lib/cloudinary';

type Step = 'pfp' | 'link';
type LinkStep = 'username' | 'otp';

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

export default function GoogleCompletePage() {
    const router = useRouter();

    const [step, setStep] = useState<Step>('pfp');
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'done'>('idle');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Link account states
    const [linkStep, setLinkStep] = useState<LinkStep>('username');
    const [mainUsername, setMainUsername] = useState('');
    const [mainUserId, setMainUserId] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [linkLoading, setLinkLoading] = useState(false);
    const [linkError, setLinkError] = useState('');
    const [linked, setLinked] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadState('uploading');
        const fd = new FormData();
        fd.append('file', file);
        fd.append('folder', 'user_pfps');
        const res = await fetch('/api/upload', { method: 'POST', body: fd });
        if (res.ok) {
            const data = await res.json();
            setProfileImage(data.url);
            setUploadState('done');
        } else {
            setUploadState('idle');
            setError('Upload failed, try again');
        }
    };

    const completeSignup = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/auth/google-complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ profileImage }),
            });
            if (res.ok) {
                router.push('/home');
            } else {
                const d = await res.json();
                setError(d.error || 'Something went wrong');
            }
        } catch {
            setError('Connection failed');
        } finally {
            setLoading(false);
        }
    };

    const sendLinkOtp = async () => {
        if (!mainUsername.trim()) return;
        setLinkLoading(true);
        setLinkError('');
        try {
            const res = await fetch('/api/auth/link-account/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mainUsername: mainUsername.trim() }),
            });
            const data = await res.json();
            if (res.ok) {
                setMainUserId(data.mainUserId);
                setOtpSent(true);
                setLinkStep('otp');
            } else {
                setLinkError(data.error || 'Failed to send OTP');
            }
        } catch {
            setLinkError('Connection failed');
        } finally {
            setLinkLoading(false);
        }
    };

    const verifyLinkOtp = async () => {
        if (otp.length < 6) return;
        setLinkLoading(true);
        setLinkError('');
        try {
            const res = await fetch('/api/auth/link-account/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mainUserId, otp }),
            });
            const data = await res.json();
            if (res.ok) {
                setLinked(true);
                // Auto-complete signup after linking
                setTimeout(() => completeSignup(), 1200);
            } else {
                setLinkError(data.error || 'Verification failed');
            }
        } catch {
            setLinkError('Connection failed');
        } finally {
            setLinkLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 relative overflow-hidden selection:bg-yellow-500/30">
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/15 via-blue-900/5 to-transparent rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-900/15 via-yellow-900/5 to-transparent rounded-full pointer-events-none" />

            <div className="w-full max-w-sm relative z-10">
                {/* Logo */}
                <motion.div
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: EASE }}
                    className="flex flex-col items-center mb-8"
                >
                    <img src={LOGO_URL} alt="Bid Wars" className="h-16 w-auto" />
                    <div className="mt-3 flex items-center gap-2">
                        <div className="h-px w-6 bg-gradient-to-r from-transparent to-slate-700" />
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Almost There</span>
                        <div className="h-px w-6 bg-gradient-to-l from-transparent to-slate-700" />
                    </div>
                </motion.div>

                {/* Step indicators */}
                <div className="flex items-center gap-2 mb-6 px-1">
                    {['pfp', 'link'].map((s, i) => (
                        <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-500 ${step === s || (s === 'pfp' && step === 'link') ? 'bg-[#FBBF24]' : 'bg-slate-800'}`} />
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {/* STEP 1: Profile Picture */}
                    {step === 'pfp' && (
                        <motion.div
                            key="pfp"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.4, ease: EASE }}
                            className="space-y-6 text-center"
                        >
                            <div>
                                <h1 className="text-xl font-black text-white tracking-tight uppercase">Profile <span className="text-[#FBBF24]">Picture</span></h1>
                                <p className="text-slate-500 text-[10px] uppercase tracking-widest mt-1">Optional — you can always change it later</p>
                            </div>

                            <div className="flex flex-col items-center gap-4">
                                <div className="relative">
                                    <div className="w-28 h-28 rounded-3xl bg-slate-900 border-2 border-dashed border-slate-800 flex items-center justify-center overflow-hidden">
                                        {profileImage ? (
                                            <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <Camera size={36} className={`transition-colors ${uploadState === 'uploading' ? 'animate-pulse text-[#FBBF24]' : 'text-slate-700'}`} />
                                        )}
                                        {uploadState === 'uploading' && (
                                            <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center">
                                                <Loader2 size={28} className="animate-spin text-[#FBBF24]" />
                                            </div>
                                        )}
                                        <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploadState === 'uploading'} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 bg-[#FBBF24] text-slate-950 p-1.5 rounded-xl border-2 border-[#020617]">
                                        <Plus size={14} strokeWidth={3} />
                                    </div>
                                </div>

                                {uploadState === 'done' && (
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                                        <CheckCircle2 size={12} className="text-emerald-400" />
                                        <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Photo Saved</span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={() => setStep('link')}
                                    className="w-full bg-[#FBBF24] text-slate-950 font-black py-4 rounded-2xl uppercase tracking-widest text-xs active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    Next
                                    <ArrowRight size={16} />
                                </button>
                                <button onClick={() => setStep('link')} className="w-full text-slate-600 text-[10px] font-black uppercase tracking-widest py-1">
                                    Skip for now
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 2: Link Parent Account */}
                    {step === 'link' && (
                        <motion.div
                            key="link"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.4, ease: EASE }}
                            className="space-y-6"
                        >
                            <div className="flex items-center gap-3">
                                <button onClick={() => setStep('pfp')} className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400">
                                    <ArrowLeft size={16} />
                                </button>
                                <div>
                                    <h1 className="text-xl font-black text-white tracking-tight uppercase">Link <span className="text-[#FBBF24]">Main Account</span></h1>
                                    <p className="text-slate-500 text-[10px] uppercase tracking-widest">Finance account under a main account</p>
                                </div>
                            </div>

                            {linked ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-3xl text-center space-y-3"
                                >
                                    <CheckCircle2 size={40} className="text-emerald-400 mx-auto" />
                                    <p className="text-emerald-400 font-black uppercase tracking-widest text-sm">Accounts Linked!</p>
                                    <p className="text-slate-500 text-[10px]">Redirecting to home...</p>
                                </motion.div>
                            ) : linkStep === 'username' ? (
                                <div className="space-y-4">
                                    <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400">
                                                <Link2 size={20} />
                                            </div>
                                            <div>
                                                <p className="text-white font-black text-sm uppercase">Connect your Main Account</p>
                                                <p className="text-slate-500 text-[10px]">We'll send an OTP to verify ownership</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1 mb-1.5 block">Main Account Username</label>
                                        <input
                                            type="text"
                                            value={mainUsername}
                                            onChange={(e) => setMainUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                            className="w-full bg-slate-900 border border-slate-800 px-4 py-3.5 rounded-xl text-white font-mono text-sm focus:border-[#FBBF24] outline-none"
                                            placeholder="trader_name"
                                        />
                                    </div>

                                    {linkError && <p className="text-rose-400 text-[11px] font-medium px-1">{linkError}</p>}

                                    <button
                                        onClick={sendLinkOtp}
                                        disabled={!mainUsername.trim() || linkLoading}
                                        className="w-full bg-[#FBBF24] text-slate-950 font-black py-4 rounded-2xl uppercase tracking-widest text-xs active:scale-95 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                                    >
                                        {linkLoading ? <Loader2 size={16} className="animate-spin" /> : <>
                                            <Smartphone size={16} />
                                            Send Verification OTP
                                        </>}
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="bg-slate-900/50 border border-emerald-500/20 p-4 rounded-2xl text-center">
                                        <ShieldCheck size={24} className="text-emerald-400 mx-auto mb-2" />
                                        <p className="text-slate-300 text-sm font-bold">OTP sent to <span className="text-[#FBBF24]">@{mainUsername}</span>'s phone</p>
                                        <p className="text-slate-500 text-[10px] mt-1">Ask the Main Account holder to share the code</p>
                                    </div>

                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        className="w-full bg-slate-900 border border-slate-800 px-5 py-4 rounded-2xl text-white text-center font-mono text-2xl tracking-[0.8em] outline-none focus:border-[#FBBF24]"
                                        placeholder="••••••"
                                    />

                                    {linkError && <p className="text-rose-400 text-[11px] font-medium text-center">{linkError}</p>}

                                    <button
                                        onClick={verifyLinkOtp}
                                        disabled={otp.length < 6 || linkLoading}
                                        className="w-full bg-emerald-500 text-white font-black py-4 rounded-2xl uppercase tracking-widest text-xs active:scale-95 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                                    >
                                        {linkLoading ? <Loader2 size={16} className="animate-spin" /> : 'Verify & Link'}
                                    </button>

                                    <button onClick={() => { setLinkStep('username'); setOtp(''); }} className="w-full text-slate-600 text-[10px] font-black uppercase tracking-widest py-1">
                                        Change Username
                                    </button>
                                </div>
                            )}

                            {!linked && (
                                <button
                                    onClick={completeSignup}
                                    disabled={loading}
                                    className="w-full text-slate-600 text-[10px] font-black uppercase tracking-widest py-1 hover:text-slate-400 transition-colors"
                                >
                                    {loading ? <Loader2 size={14} className="animate-spin mx-auto" /> : 'Skip — I\'ll do this later'}
                                </button>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="fixed bottom-6 left-6 right-6 bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl z-50"
                    >
                        <p className="text-rose-400 text-[11px] font-mono">{error}</p>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
