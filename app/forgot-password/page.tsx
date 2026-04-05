'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Mail, Loader2, CheckCircle2, ShieldCheck, User, XCircle } from 'lucide-react';
import { LOGO_URL } from '@/lib/cloudinary';

type Mode = 'choice' | 'email' | 'telegram' | 'success';
type CheckState = 'idle' | 'checking' | 'valid' | 'invalid';

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

function TelegramIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
    );
}

function FieldIndicator({ state, validMsg, invalidMsg }: { state: CheckState; validMsg?: string; invalidMsg?: string }) {
    if (state === 'checking') return <Loader2 size={16} className="animate-spin text-slate-500 shrink-0" />;
    if (state === 'valid') return (
        <div className="flex items-center gap-1 shrink-0">
            <CheckCircle2 size={16} className="text-emerald-500" />
            {validMsg && <span className="text-[9px] text-emerald-500 font-bold uppercase">{validMsg}</span>}
        </div>
    );
    if (state === 'invalid') return (
        <div className="flex items-center gap-1 shrink-0">
            <XCircle size={16} className="text-rose-500" />
            {invalidMsg && <span className="text-[9px] text-rose-500 font-bold uppercase">{invalidMsg}</span>}
        </div>
    );
    return null;
}

export default function ForgotPasswordPage() {
    const [mode, setMode] = useState<Mode>('choice');
    const [email, setEmail] = useState('');
    const [telegramUsername, setTelegramUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successType, setSuccessType] = useState<'email' | 'telegram'>('email');

    // Tick validation states
    const [emailCheck, setEmailCheck] = useState<CheckState>('idle');
    const [emailHint, setEmailHint] = useState('');
    const [tgCheck, setTgCheck] = useState<CheckState>('idle');
    const [tgHint, setTgHint] = useState('');

    // ── Email debounced DB check ────────────────────────────────────────────────
    useEffect(() => {
        if (!email.includes('@') || email.length < 5) {
            setEmailCheck('idle');
            setEmailHint('');
            return;
        }
        setEmailCheck('checking');
        const t = setTimeout(async () => {
            try {
                const res = await fetch(`/api/user/check-email?email=${encodeURIComponent(email)}`);
                const data = await res.json();
                // available: false → email IS registered → valid for reset
                if (data.available === false) {
                    setEmailCheck('valid');
                    setEmailHint('Found');
                } else {
                    setEmailCheck('invalid');
                    setEmailHint('Not found');
                }
            } catch {
                setEmailCheck('idle');
            }
        }, 600);
        return () => clearTimeout(t);
    }, [email]);

    // ── Telegram username debounced DB check ────────────────────────────────────
    useEffect(() => {
        if (telegramUsername.trim().length < 3) {
            setTgCheck('idle');
            setTgHint('');
            return;
        }
        setTgCheck('checking');
        const t = setTimeout(async () => {
            try {
                const res = await fetch(`/api/user/check-main-account?username=${encodeURIComponent(telegramUsername.trim())}`);
                const data = await res.json();
                if (!data.exists) {
                    setTgCheck('invalid');
                    setTgHint('Not found');
                } else if (!data.isMain) {
                    setTgCheck('invalid');
                    setTgHint('Not a Main Account');
                } else if (!data.hasTelegram) {
                    setTgCheck('invalid');
                    setTgHint('No Telegram linked');
                } else {
                    setTgCheck('valid');
                    setTgHint('Found');
                }
            } catch {
                setTgCheck('idle');
            }
        }, 600);
        return () => clearTimeout(t);
    }, [telegramUsername]);

    const handleEmailReset = async () => {
        if (!email.includes('@')) return setError('Enter a valid email address');
        setLoading(true); setError('');
        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (res.ok) { setSuccessType('email'); setMode('success'); }
            else { setError(data.message || data.error || 'Something went wrong'); }
        } catch { setError('Connection failed. Try again.'); }
        finally { setLoading(false); }
    };

    const handleTelegramReset = async () => {
        if (!telegramUsername.trim()) return setError('Enter your Main Account username');
        setLoading(true); setError('');
        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ telegramUsername: telegramUsername.trim() }),
            });
            const data = await res.json();
            if (res.ok) { setSuccessType('telegram'); setMode('success'); }
            else { setError(data.message || data.error || 'Something went wrong'); }
        } catch { setError('Connection failed. Try again.'); }
        finally { setLoading(false); }
    };

    const back = (toMode: Mode = 'choice') => { setMode(toMode); setError(''); };

    return (
        <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 relative overflow-hidden selection:bg-yellow-500/30">
            <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-400/10 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-yellow-900/5 blur-[150px] rounded-full pointer-events-none" />

            <div className="w-full max-w-sm relative z-10">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center mb-8">
                    <img src={LOGO_URL} alt="Bid Wars" className="h-16 w-auto drop-shadow-[0_4px_30px_rgba(96,165,250,0.2)]" />
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


                    <AnimatePresence mode="wait">

                        {/* ── CHOICE ────────────────────────────────────────────────── */}
                        {mode === 'choice' && (
                            <motion.div key="choice" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.35, ease: EASE }} className="space-y-5">
                                <div className="mb-4 text-center border-b border-white/5 pb-3">
                                    <h1 className="text-lg font-black text-white tracking-tight uppercase">Reset <span className="text-[#FBBF24]">Password</span></h1>
                                    <p className="text-slate-500 text-[9px] uppercase tracking-widest mt-0.5">Choose a recovery method</p>
                                </div>

                                <button onClick={() => setMode('email')} className="w-full p-4 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-[#FBBF24]/50 transition-all text-left flex items-center gap-4">
                                    <div className="w-10 h-10 bg-[#FBBF24]/10 rounded-xl flex items-center justify-center text-[#FBBF24]"><Mail size={20} /></div>
                                    <div>
                                        <p className="text-white font-black text-sm uppercase tracking-tight">Via Email</p>
                                        <p className="text-slate-500 text-[10px]">Reset link to your inbox · Finance Accounts</p>
                                    </div>
                                </button>

                                <button onClick={() => setMode('telegram')} className="w-full p-4 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-blue-400/50 transition-all text-left flex items-center gap-4">
                                    <div className="w-10 h-10 bg-blue-400/10 rounded-xl flex items-center justify-center text-blue-400"><TelegramIcon className="w-5 h-5" /></div>
                                    <div>
                                        <p className="text-white font-black text-sm uppercase tracking-tight">Via Telegram</p>
                                        <p className="text-slate-500 text-[10px]">Reset link via bot · Main Accounts</p>
                                    </div>
                                </button>

                                <p className="text-[9px] text-slate-600 text-center leading-relaxed px-2 pt-1">
                                    Main Accounts are verified through Telegram. Finance Accounts use email.
                                </p>
                            </motion.div>
                        )}

                        {/* ── EMAIL ─────────────────────────────────────────────────── */}
                        {mode === 'email' && (
                            <motion.div key="email" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.35, ease: EASE }} className="space-y-5">
                                <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                                    <button onClick={() => back()} className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400"><ArrowLeft size={14} /></button>
                                    <div>
                                        <h1 className="text-lg font-black text-white tracking-tight uppercase">Email <span className="text-[#FBBF24]">Recovery</span></h1>
                                        <p className="text-slate-500 text-[9px] uppercase tracking-widest">Reset link to your inbox</p>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1 block">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                                        <input
                                            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                            className={`w-full pl-11 pr-24 py-3.5 bg-slate-950/50 border rounded-xl text-white text-sm outline-none transition-all placeholder:text-slate-700 ${
                                                emailCheck === 'valid' ? 'border-emerald-500/50 focus:border-emerald-500' :
                                                emailCheck === 'invalid' ? 'border-rose-500/30 focus:border-rose-500/50' :
                                                'border-slate-800 focus:border-[#FBBF24]'
                                            }`}
                                            placeholder="you@example.com"
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                            <FieldIndicator state={emailCheck} validMsg={emailHint} invalidMsg={emailHint} />
                                        </div>
                                    </div>
                                    {emailCheck === 'invalid' && (
                                        <p className="text-[9px] text-rose-400 pl-1">No account with this email was found.</p>
                                    )}
                                </div>

                                {error && <p className="text-rose-400 text-[11px] font-medium">{error}</p>}

                                <button onClick={handleEmailReset} disabled={!email || loading || emailCheck === 'invalid'} className="w-full bg-[#FBBF24] text-slate-950 font-black py-3.5 rounded-xl uppercase tracking-widest text-xs active:scale-95 transition-all disabled:opacity-40 flex items-center justify-center gap-2">
                                    {loading ? <Loader2 size={16} className="animate-spin" /> : 'Send Reset Link'}
                                </button>

                                <p className="text-[9px] text-slate-600 text-center leading-relaxed">
                                    Email not working?{' '}
                                    <button onClick={() => back('telegram')} className="text-blue-400 underline">
                                        Try Telegram recovery for Main Accounts.
                                    </button>
                                </p>
                            </motion.div>
                        )}

                        {/* ── TELEGRAM ──────────────────────────────────────────────── */}
                        {mode === 'telegram' && (
                            <motion.div key="telegram" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.35, ease: EASE }} className="space-y-5">
                                <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                                    <button onClick={() => back()} className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400"><ArrowLeft size={14} /></button>
                                    <div>
                                        <h1 className="text-lg font-black text-white tracking-tight uppercase">Telegram <span className="text-[#FBBF24]">Recovery</span></h1>
                                        <p className="text-slate-500 text-[9px] uppercase tracking-widest">Reset link via Bid Wars bot</p>
                                    </div>
                                </div>

                                <div className="bg-blue-400/5 border border-blue-400/20 rounded-2xl p-3 flex items-center gap-3">
                                    <TelegramIcon className="w-5 h-5 text-blue-400 shrink-0" />
                                    <p className="text-[10px] text-slate-400 leading-relaxed">
                                        Enter your Main Account username. We'll send a reset link to your linked Telegram.
                                    </p>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1 block">Main Account Username</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                                        <input
                                            type="text" value={telegramUsername}
                                            onChange={(e) => setTelegramUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                            className={`w-full pl-11 pr-24 py-3.5 bg-slate-950/50 border rounded-xl text-white font-mono text-sm outline-none transition-all placeholder:text-slate-700 ${
                                                tgCheck === 'valid' ? 'border-emerald-500/50 focus:border-emerald-500' :
                                                tgCheck === 'invalid' ? 'border-rose-500/30 focus:border-rose-500/50' :
                                                'border-slate-800 focus:border-blue-400/50'
                                            }`}
                                            placeholder="trader_name"
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                            <FieldIndicator state={tgCheck} validMsg={tgHint} invalidMsg={tgHint} />
                                        </div>
                                    </div>
                                    {tgCheck === 'invalid' && tgHint === 'No Telegram linked' && (
                                        <p className="text-[9px] text-rose-400 pl-1">This account has no Telegram linked. Try email recovery.</p>
                                    )}
                                    {tgCheck === 'invalid' && tgHint === 'Not a Main Account' && (
                                        <p className="text-[9px] text-rose-400 pl-1">That's a Finance Account. Only Main Accounts use Telegram recovery.</p>
                                    )}
                                    {tgCheck === 'invalid' && tgHint === 'Not found' && (
                                        <p className="text-[9px] text-rose-400 pl-1">No account found with that username.</p>
                                    )}
                                </div>

                                {error && <p className="text-rose-400 text-[11px] font-medium">{error}</p>}

                                <button onClick={handleTelegramReset} disabled={!telegramUsername.trim() || loading || tgCheck !== 'valid'} className="w-full bg-blue-400 text-slate-950 font-black py-3.5 rounded-xl uppercase tracking-widest text-xs active:scale-95 transition-all disabled:opacity-40 flex items-center justify-center gap-2">
                                    {loading ? <Loader2 size={16} className="animate-spin" /> : <><TelegramIcon className="w-4 h-4" />Send Reset Link</>}
                                </button>
                            </motion.div>
                        )}

                        {/* ── SUCCESS ───────────────────────────────────────────────── */}
                        {mode === 'success' && (
                            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, ease: EASE }} className="py-6 text-center space-y-4">
                                <div className="w-16 h-16 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto">
                                    <CheckCircle2 size={36} className="text-emerald-400" />
                                </div>
                                <h2 className="text-lg font-black text-white uppercase tracking-tight">
                                    Check Your <span className="text-emerald-400">{successType === 'email' ? 'Inbox' : 'Telegram'}</span>
                                </h2>
                                <p className="text-slate-400 text-[11px] leading-relaxed px-2">
                                    {successType === 'email'
                                        ? `A password reset link has been sent to ${email}. Check your spam folder if you don't see it.`
                                        : `A reset link has been sent to your Telegram via the Bid Wars Login Bot. Open the bot and tap the button.`}
                                </p>
                                {successType === 'telegram' && (
                                    <a href="https://t.me/bidwars_login_bot" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-blue-400/10 border border-blue-400/20 text-blue-400 font-black text-xs uppercase rounded-xl px-4 py-2.5 active:scale-95 transition-all">
                                        <TelegramIcon className="w-4 h-4" /> Open Telegram Bot
                                    </a>
                                )}
                            </motion.div>
                        )}

                    </AnimatePresence>
                </motion.div>

                <div className="mt-6 text-center">
                    <Link href="/login" className="text-slate-600 text-[10px] font-black uppercase tracking-widest hover:text-slate-400 transition-colors flex items-center justify-center gap-1.5">
                        <ArrowLeft size={12} /> Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
