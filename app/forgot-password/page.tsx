'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Mail, Smartphone, Loader2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { LOGO_URL } from '@/lib/cloudinary';

type Mode = 'choice' | 'email' | 'phone' | 'success';

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

export default function ForgotPasswordPage() {
    const [mode, setMode] = useState<Mode>('choice');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successType, setSuccessType] = useState<'email' | 'phone'>('email');

    const handleEmailReset = async () => {
        if (!email.includes('@')) return setError('Enter a valid email address');
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (res.ok) {
                setSuccessType('email');
                setMode('success');
            } else {
                setError(data.message || data.error || 'Something went wrong');
            }
        } catch {
            setError('Connection failed. Try again.');
        } finally {
            setLoading(false);
        }
    };

    const handlePhoneReset = async () => {
        if (phone.length !== 10) return setError('Enter a 10-digit phone number');
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone }),
            });
            const data = await res.json();
            if (res.ok) {
                setSuccessType('phone');
                setMode('success');
            } else {
                setError(data.message || data.error || 'Something went wrong');
            }
        } catch {
            setError('Connection failed. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 relative overflow-hidden selection:bg-yellow-500/30">
            <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/15 via-blue-900/5 to-transparent rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/10 via-indigo-900/5 to-transparent rounded-full pointer-events-none" />

            <div className="w-full max-w-sm relative z-10">
                {/* Logo */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center mb-8"
                >
                    <img src={LOGO_URL} alt="Bid Wars" className="h-16 w-auto drop-shadow-[0_4px_30px_rgba(34,211,238,0.2)]" />
                    <div className="mt-2 flex items-center gap-2">
                        <div className="h-px w-6 bg-gradient-to-r from-transparent to-slate-700" />
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em]">Account Recovery</span>
                        <div className="h-px w-6 bg-gradient-to-l from-transparent to-slate-700" />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: EASE }}
                    className="bg-[#0f172a] border border-white/5 shadow-2xl rounded-[2rem] p-6 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <ShieldCheck size={60} className="text-white" />
                    </div>

                    <AnimatePresence mode="wait">
                        {/* CHOICE */}
                        {mode === 'choice' && (
                            <motion.div
                                key="choice"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.35, ease: EASE }}
                                className="space-y-5"
                            >
                                <div className="mb-4 text-center border-b border-white/5 pb-3">
                                    <h1 className="text-lg font-black text-white tracking-tight uppercase">Reset <span className="text-[#FBBF24]">Password</span></h1>
                                    <p className="text-slate-500 text-[9px] uppercase tracking-widest mt-0.5">Choose a recovery method</p>
                                </div>

                                <button
                                    onClick={() => setMode('email')}
                                    className="w-full p-4 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-[#FBBF24]/50 transition-all text-left flex items-center gap-4"
                                >
                                    <div className="w-10 h-10 bg-[#FBBF24]/10 rounded-xl flex items-center justify-center text-[#FBBF24]">
                                        <Mail size={20} />
                                    </div>
                                    <div>
                                        <p className="text-white font-black text-sm uppercase tracking-tight">Via Email</p>
                                        <p className="text-slate-500 text-[10px]">Receive a reset link to your inbox</p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setMode('phone')}
                                    className="w-full p-4 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-blue-500/50 transition-all text-left flex items-center gap-4"
                                >
                                    <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400">
                                        <Smartphone size={20} />
                                    </div>
                                    <div>
                                        <p className="text-white font-black text-sm uppercase tracking-tight">Via SMS OTP</p>
                                        <p className="text-slate-500 text-[10px]">Get a code on your registered mobile</p>
                                    </div>
                                </button>

                                <p className="text-[9px] text-slate-600 text-center leading-relaxed px-2 pt-1">
                                    Email recovery only works if your account has an email linked. Main Accounts use mobile numbers — use SMS if email isn't working.
                                </p>
                            </motion.div>
                        )}

                        {/* EMAIL */}
                        {mode === 'email' && (
                            <motion.div
                                key="email"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.35, ease: EASE }}
                                className="space-y-5"
                            >
                                <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                                    <button onClick={() => { setMode('choice'); setError(''); }} className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400">
                                        <ArrowLeft size={14} />
                                    </button>
                                    <div>
                                        <h1 className="text-lg font-black text-white tracking-tight uppercase">Email <span className="text-[#FBBF24]">Recovery</span></h1>
                                        <p className="text-slate-500 text-[9px] uppercase tracking-widest">Reset link sent to your inbox</p>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1 block">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3.5 bg-slate-950/50 border border-slate-800 rounded-xl text-white text-sm focus:border-[#FBBF24] outline-none transition-all placeholder:text-slate-700"
                                            placeholder="you@example.com"
                                        />
                                    </div>
                                </div>

                                {error && <p className="text-rose-400 text-[11px] font-medium">{error}</p>}

                                <button
                                    onClick={handleEmailReset}
                                    disabled={!email || loading}
                                    className="w-full bg-[#FBBF24] text-slate-950 font-black py-3.5 rounded-xl uppercase tracking-widest text-xs active:scale-95 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 size={16} className="animate-spin" /> : 'Send Reset Link'}
                                </button>

                                <p className="text-[9px] text-slate-600 text-center leading-relaxed">
                                    Email not working? Your Main Account may be linked to a mobile number.{' '}
                                    <button onClick={() => { setMode('phone'); setError(''); }} className="text-blue-400 underline">Try SMS instead.</button>
                                </p>
                            </motion.div>
                        )}

                        {/* PHONE */}
                        {mode === 'phone' && (
                            <motion.div
                                key="phone"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.35, ease: EASE }}
                                className="space-y-5"
                            >
                                <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                                    <button onClick={() => { setMode('choice'); setError(''); }} className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400">
                                        <ArrowLeft size={14} />
                                    </button>
                                    <div>
                                        <h1 className="text-lg font-black text-white tracking-tight uppercase">SMS <span className="text-[#FBBF24]">Recovery</span></h1>
                                        <p className="text-slate-500 text-[9px] uppercase tracking-widest">OTP to your registered mobile</p>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1 block">Phone Number</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[11px] font-black text-slate-600">+91</div>
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                            className="w-full pl-12 pr-4 py-3.5 bg-slate-950/50 border border-slate-800 rounded-xl text-white font-mono text-sm tracking-widest focus:border-blue-500 outline-none transition-all placeholder:text-slate-700"
                                            placeholder="XXXXXXXXXX"
                                        />
                                    </div>
                                </div>

                                {error && <p className="text-rose-400 text-[11px] font-medium">{error}</p>}

                                <button
                                    onClick={handlePhoneReset}
                                    disabled={phone.length !== 10 || loading}
                                    className="w-full bg-blue-500 text-white font-black py-3.5 rounded-xl uppercase tracking-widest text-xs active:scale-95 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 size={16} className="animate-spin" /> : <>
                                        <Smartphone size={14} />
                                        Send SMS OTP
                                    </>}
                                </button>
                            </motion.div>
                        )}

                        {/* SUCCESS */}
                        {mode === 'success' && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4, ease: EASE }}
                                className="py-6 text-center space-y-4"
                            >
                                <div className="w-16 h-16 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto">
                                    <CheckCircle2 size={36} className="text-emerald-400" />
                                </div>
                                <h2 className="text-lg font-black text-white uppercase tracking-tight">
                                    Check Your <span className="text-emerald-400">{successType === 'email' ? 'Inbox' : 'Phone'}</span>
                                </h2>
                                <p className="text-slate-400 text-[11px] leading-relaxed px-2">
                                    {successType === 'email'
                                        ? `A password reset link has been sent to ${email}. Check your spam folder if you don't see it.`
                                        : `An OTP has been sent to +91 ${phone}. Use it to reset your password.`}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                <div className="mt-6 text-center">
                    <Link href="/login" className="text-slate-600 text-[10px] font-black uppercase tracking-widest hover:text-slate-400 transition-colors flex items-center justify-center gap-1.5">
                        <ArrowLeft size={12} />
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
