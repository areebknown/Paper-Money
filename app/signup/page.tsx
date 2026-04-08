'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    CheckCircle2,
    Mail,
    User,
    ShieldCheck,
    ArrowRight,
    ArrowLeft,
    Loader2,
    Eye,
    EyeOff,
    Camera,
    Sparkles,
    Plus,
    Globe,
    Link2,
    XCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LOGO_URL } from '@/lib/cloudinary';
import ImageCropper from '@/components/ImageCropper';

type SignupStep = 'choice' | 'username' | 'verification' | 'details' | 'profile-pic' | 'link-account';
type AccountType = 'main' | 'side' | null;

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

// Telegram SVG icon
function TelegramIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
    );
}

export default function SignupPage() {
    const router = useRouter();

    const [step, setStep] = useState<SignupStep>('choice');
    const [accountType, setAccountType] = useState<AccountType>(null);

    // Username
    const [username, setUsername] = useState('');
    const [isUsernameValid, setIsUsernameValid] = useState<boolean | null>(null);
    const [checkingUsername, setCheckingUsername] = useState(false);

    // Telegram auth (Main Account)
    const [telegramSessionId, setTelegramSessionId] = useState('');
    const [telegramBotLink, setTelegramBotLink] = useState('');
    const [telegramPolling, setTelegramPolling] = useState(false);
    const [telegramVerified, setTelegramVerified] = useState(false);
    const [telegramId, setTelegramId] = useState('');
    const [telegramPhoneNumber, setTelegramPhoneNumber] = useState('');
    const pollingRef = useRef<NodeJS.Timeout | null>(null);

    // Finance Account — Email
    const [email, setEmail] = useState('');
    const [isEmailAvailable, setIsEmailAvailable] = useState<boolean | null>(null);
    const [checkingEmail, setCheckingEmail] = useState(false);
    const [emailOtpSent, setEmailOtpSent] = useState(false);
    const [emailOtp, setEmailOtp] = useState('');

    // Details
    const [password, setPassword] = useState('');
    const [realName, setRealName] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Profile Pic
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');
    const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);

    // Link account (Finance → Main)
    const [linkUsername, setLinkUsername] = useState('');
    const [linkMainUserId, setLinkMainUserId] = useState('');
    const [linkOtp, setLinkOtp] = useState('');
    const [linkStep, setLinkStep] = useState<'username' | 'otp'>('username');
    const [linkLoading, setLinkLoading] = useState(false);
    const [linkUsernameCheck, setLinkUsernameCheck] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');
    const [linkUsernameHint, setLinkUsernameHint] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [pmuid] = useState(() => {
        const digits = Math.floor(10000000 + Math.random() * 90000000).toString();
        return `PM-${digits.slice(0, 4)}-${digits.slice(4)}`;
    });

    // ─── Restore Telegram state after callback page redirect ───────────────────
    useEffect(() => {
        const stored = sessionStorage.getItem('tg_auth');
        if (!stored) return;
        try {
            const { sessionId, telegramId: tgId, phoneNumber: tgPhone, username: storedUsername } = JSON.parse(stored);
            sessionStorage.removeItem('tg_auth');
            if (storedUsername) setUsername(storedUsername);
            setTelegramSessionId(sessionId);
            setTelegramId(tgId);
            if (tgPhone) setTelegramPhoneNumber(tgPhone);
            setTelegramVerified(true);
            setIsUsernameValid(true);
            setAccountType('main');
            setStep('details'); // Skip straight to password/name step
        } catch {
            sessionStorage.removeItem('tg_auth');
        }
    }, []);

    // ─── Cleanup polling on unmount ─────────────────────────────────────────────
    useEffect(() => {
        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, []);

    // ─── Username check ─────────────────────────────────────────────────────────
    useEffect(() => {
        if (username.length < 3) { setIsUsernameValid(null); return; }
        setCheckingUsername(true);
        const timer = setTimeout(async () => {
            try {
                const res = await fetch(`/api/user/check-username?username=${username}`);
                const data = await res.json();
                setIsUsernameValid(data.available);
            } catch { setIsUsernameValid(false); }
            finally { setCheckingUsername(false); }
        }, 500);
        return () => clearTimeout(timer);
    }, [username]);

    // ─── Link account username check ────────────────────────────────────────────
    useEffect(() => {
        if (linkUsername.trim().length < 3) { setLinkUsernameCheck('idle'); setLinkUsernameHint(''); return; }
        setLinkUsernameCheck('checking');
        const timer = setTimeout(async () => {
            try {
                const res = await fetch(`/api/user/check-main-account?username=${encodeURIComponent(linkUsername.trim())}`);
                const data = await res.json();
                if (!data.exists) { setLinkUsernameCheck('invalid'); setLinkUsernameHint('Not found'); }
                else if (!data.isMain) { setLinkUsernameCheck('invalid'); setLinkUsernameHint('Not a Main Account'); }
                else if (!data.hasTelegram) { setLinkUsernameCheck('invalid'); setLinkUsernameHint('No Telegram linked'); }
                else { setLinkUsernameCheck('valid'); setLinkUsernameHint('Valid'); }
            } catch { setLinkUsernameCheck('idle'); }
        }, 600);
        return () => clearTimeout(timer);
    }, [linkUsername]);

    // ─── Email check ────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!email.includes('@') || email.length < 5) { setIsEmailAvailable(null); return; }
        setCheckingEmail(true);
        const timer = setTimeout(async () => {
            try {
                const res = await fetch(`/api/user/check-email?email=${encodeURIComponent(email)}`);
                const data = await res.json();
                setIsEmailAvailable(data.available);
            } catch { setIsEmailAvailable(false); }
            finally { setCheckingEmail(false); }
        }, 600);
        return () => clearTimeout(timer);
    }, [email]);

    // ─── Telegram polling ───────────────────────────────────────────────────────
    const startPolling = useCallback((sessionId: string) => {
        if (pollingRef.current) clearInterval(pollingRef.current);
        pollingRef.current = setInterval(async () => {
            try {
                const res = await fetch(`/api/auth/telegram/status?s=${sessionId}`);
                const data = await res.json();
                if (data.status === 'verified' && data.telegramId) {
                    clearInterval(pollingRef.current!);
                    setTelegramPolling(false);
                    setTelegramVerified(true);
                    setTelegramId(data.telegramId);
                    if (data.phoneNumber) setTelegramPhoneNumber(data.phoneNumber);
                    setStep('details');
                } else if (data.status === 'expired') {
                    clearInterval(pollingRef.current!);
                    setTelegramPolling(false);
                    setError('Verification expired. Please try again.');
                    setTelegramSessionId('');
                    setTelegramBotLink('');
                }
            } catch { /* keep polling */ }
        }, 2000);
    }, []);

    const initTelegramAuth = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`/api/auth/telegram/init?username=${encodeURIComponent(username)}`);
            const data = await res.json();
            setTelegramSessionId(data.sessionId);
            setTelegramBotLink(data.botLink);
            setTelegramPolling(true);
            startPolling(data.sessionId);
            window.open(data.botLink, '_blank');
        } catch {
            setError('Could not start Telegram verification. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const resetTelegramAuth = () => {
        if (pollingRef.current) clearInterval(pollingRef.current);
        setTelegramPolling(false);
        setTelegramSessionId('');
        setTelegramBotLink('');
        setError('');
    };

    // ─── File upload ────────────────────────────────────────────────────────────
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        setCropImageSrc(url);
        e.target.value = ''; // Reset input
    };

    const handleCropDone = async (croppedFile: File) => {
        setCropImageSrc(null);
        setUploadState('uploading');
        try {
            const fd = new FormData();
            fd.append('file', croppedFile);
            fd.append('folder', 'user_pfps');
            fd.append('public_id', pmuid);
            const res = await fetch('/api/upload', { method: 'POST', body: fd });
            if (!res.ok) throw new Error();
            const data = await res.json();
            setProfileImage(data.url);
            setUploadState('done');
        } catch {
            setUploadState('error');
            setError('Image upload failed. Try again.');
        }
    };

    // ─── Email OTP ──────────────────────────────────────────────────────────────
    const sendEmailOtp = async () => {
        setLoading(true); setError('');
        try {
            const res = await fetch('/api/auth/email/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, username }),
            });
            const data = await res.json();
            if (res.ok) { setEmailOtpSent(true); }
            else { setError(data.error || 'Failed to send code'); }
        } catch { setError('Email service unavailable'); }
        finally { setLoading(false); }
    };

    const verifyEmailOtp = async () => {
        if (emailOtp.length < 6) return setError('Enter the 6-digit code from your email');
        setLoading(true); setError('');
        try {
            const res = await fetch('/api/auth/email/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp: emailOtp, username }),
            });
            const data = await res.json();
            if (res.ok && data.verified) { nextStep(); }
            else { setError(data.error || 'Verification failed'); }
        } catch { setError('Verification failed'); }
        finally { setLoading(false); }
    };

    // ─── Final signup ───────────────────────────────────────────────────────────
    const handleSignup = async () => {
        setLoading(true); setError('');
        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username,
                    password,
                    isMainAccount: accountType === 'main',
                    telegramId: accountType === 'main' ? telegramId : null,
                    phoneNumber: accountType === 'main' ? telegramPhoneNumber : null,
                    email: accountType === 'side' ? email : null,
                    realName: accountType === 'main' ? realName : null,
                    profileImage,
                    publicId: pmuid,
                }),
            });
            const data = await res.json();
            if (res.ok) { router.push('/home'); }
            else { setError(data.error || 'Signup failed'); }
        } catch { setError('Connection failed'); }
        finally { setLoading(false); }
    };

    // ─── Link account (Finance → Main) ─────────────────────────────────────────
    const sendLinkOtp = async () => {
        if (!linkUsername.trim()) return;
        setLinkLoading(true); setError('');
        try {
            const res = await fetch('/api/auth/link-account/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mainUsername: linkUsername.trim() }),
            });
            const data = await res.json();
            if (res.ok) { setLinkMainUserId(data.mainUserId); setLinkStep('otp'); }
            else { setError(data.error || 'Failed to send OTP'); }
        } catch { setError('Connection failed'); }
        finally { setLinkLoading(false); }
    };

    const verifyLinkOtp = async () => {
        if (linkOtp.length < 6) return;
        setLinkLoading(true); setError('');
        try {
            await handleSignup();
            const res = await fetch('/api/auth/link-account/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mainUserId: linkMainUserId, otp: linkOtp }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || 'Link failed — account created but not linked'); }
        } catch { setError('Link verification failed'); }
        finally { setLinkLoading(false); }
    };

    // ─── Navigation ─────────────────────────────────────────────────────────────
    const nextStep = () => {
        if (step === 'choice') setStep('username');
        else if (step === 'username' && isUsernameValid) setStep('verification');
        else if (step === 'verification') setStep('details');
        else if (step === 'details') setStep('profile-pic');
        else if (step === 'profile-pic' && accountType === 'side') setStep('link-account');
        else if (step === 'profile-pic' && accountType === 'main') handleSignup();
        else if (step === 'link-account') handleSignup();
    };

    const prevStep = () => {
        if (step === 'username') setStep('choice');
        else if (step === 'verification') setStep('username');
        else if (step === 'details') {
            // If coming back to details after Telegram verify, go back to verification step
            // but reset Telegram so they can re-verify if needed
            setStep('verification');
        }
        else if (step === 'profile-pic') setStep('details');
        else if (step === 'link-account') setStep('profile-pic');
    };

    const AvailabilityIndicator = ({ checking, available }: { checking: boolean; available: boolean | null }) => {
        if (checking) return <Loader2 size={16} className="animate-spin text-slate-500" />;
        if (available === true) return <CheckCircle2 size={18} className="text-emerald-500" />;
        if (available === false) return <div className="px-2 py-0.5 bg-rose-500/20 text-rose-500 text-[8px] font-black rounded uppercase">Taken</div>;
        return null;
    };

    return (
        <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 relative overflow-hidden selection:bg-yellow-500/30">
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-400/15 via-blue-400/5 to-transparent rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-900/10 via-yellow-900/5 to-transparent rounded-full pointer-events-none" />

            <div className="w-full max-w-sm relative z-10">
                {/* Logo */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center mb-8">
                    <img src={LOGO_URL} alt="Bid Wars" className="h-20 w-auto drop-shadow-[0_4px_30px_rgba(96,165,250,0.2)]" />
                    <div className="mt-4 flex items-center gap-2">
                        <div className="h-px w-6 bg-gradient-to-r from-transparent to-slate-700" />
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Create Account</span>
                        <div className="h-px w-6 bg-gradient-to-l from-transparent to-slate-700" />
                    </div>
                </motion.div>

                <AnimatePresence mode="wait">

                    {/* ── STEP 0: ACCOUNT TYPE ─────────────────────────────────────── */}
                    {step === 'choice' && (
                        <motion.div key="choice" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.35, ease: EASE }} className="space-y-4">
                            <div className="text-center mb-4">
                                <h1 className="text-xl font-black text-white tracking-tight uppercase">Join the <span className="text-[#FBBF24]">Game</span></h1>
                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Select Your Account Type</p>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                                {/* Main Account card */}
                                <button
                                    onClick={() => setAccountType('main')}
                                    className={`relative p-4 rounded-3xl text-left transition-all border-2 ${accountType === 'main' ? 'bg-slate-900 border-blue-400 shadow-[0_0_40px_rgba(96,165,250,0.15)]' : 'bg-slate-900/50 border-slate-800/50 hover:border-slate-700'}`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shrink-0 ${accountType === 'main' ? 'bg-blue-400 text-slate-950' : 'bg-slate-800 text-slate-500'}`}>
                                            <Sparkles size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-black text-sm text-white uppercase">Main Account</h3>
                                            </div>
                                            <div className="px-2 py-0.5 bg-[#FBBF24] text-slate-950 text-[8px] font-black rounded-lg inline-block mb-1.5 uppercase tracking-tighter">₹1 Lakh Starter Bonus</div>
                                            <p className="text-[10px] text-slate-500 font-medium">Full Progress. Telegram Verified.</p>
                                            {/* Telegram requirement one-liner */}
                                            <div className="flex items-center gap-1 mt-1.5">
                                                <TelegramIcon className="w-3 h-3 text-blue-400" />
                                                <span className="text-[9px] text-blue-400 font-bold uppercase tracking-wider">Requires Telegram</span>
                                            </div>
                                        </div>
                                    </div>
                                </button>

                                {/* Finance Account card */}
                                <button
                                    onClick={() => setAccountType('side')}
                                    className={`relative p-4 rounded-3xl text-left transition-all border-2 ${accountType === 'side' ? 'bg-slate-900 border-blue-400 shadow-[0_0_40px_rgba(96,165,250,0.15)]' : 'bg-slate-900/50 border-slate-800/50 hover:border-slate-700'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${accountType === 'side' ? 'bg-blue-400 text-slate-950' : 'bg-slate-800 text-slate-500'}`}>
                                            <Globe size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-sm text-white uppercase">Finance Account</h3>
                                            <p className="text-[10px] text-slate-500 font-medium">Alternate. Email Linked.</p>
                                        </div>
                                    </div>
                                </button>
                            </div>
                            <button disabled={!accountType} onClick={nextStep} className="w-full mt-2 bg-[#FBBF24] text-slate-950 font-black py-4 rounded-2xl active:scale-95 transition-all disabled:opacity-30 flex items-center justify-center gap-2 uppercase tracking-widest text-xs">
                                CONTINUE <ArrowRight size={16} />
                            </button>
                        </motion.div>
                    )}

                    {/* ── STEP 1: USERNAME ─────────────────────────────────────────── */}
                    {step === 'username' && (
                        <motion.div key="username" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.35, ease: EASE }} className="space-y-6">
                            <div className="flex items-center gap-3">
                                <button onClick={prevStep} className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400"><ArrowLeft size={16} /></button>
                                <h1 className="text-xl font-black text-white tracking-tight uppercase">Choose <span className="text-[#FBBF24]">Username</span></h1>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2 block">Your Name in the Game</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))}
                                        className="w-full bg-slate-900 border border-slate-800 px-12 py-4 rounded-2xl text-white font-mono text-lg focus:border-[#FBBF24] outline-none transition-all placeholder:text-slate-700"
                                        placeholder="trader_name"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        <AvailabilityIndicator checking={checkingUsername} available={isUsernameValid} />
                                    </div>
                                </div>
                            </div>
                            <button disabled={!isUsernameValid || checkingUsername || username.endsWith('.')} onClick={nextStep} className="w-full bg-[#FBBF24] text-slate-950 font-black py-4 rounded-2xl active:scale-95 transition-all disabled:opacity-30 disabled:grayscale uppercase tracking-widest text-xs">
                                CONTINUE
                            </button>
                        </motion.div>
                    )}

                    {/* ── STEP 2: VERIFICATION ─────────────────────────────────────── */}
                    {step === 'verification' && (
                        <motion.div key="verification" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.35, ease: EASE }} className="space-y-6">
                            <div className="flex items-center gap-3">
                                <button onClick={prevStep} className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400"><ArrowLeft size={16} /></button>
                                <h1 className="text-xl font-black text-white tracking-tight uppercase">Confirm <span className="text-[#FBBF24]">Account</span></h1>
                            </div>

                            {/* ── MAIN: Telegram Verification ─────────────────────── */}
                            {accountType === 'main' ? (
                                <div className="space-y-4">
                                    {!telegramSessionId ? (
                                        /* Initial state */
                                        <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-3xl text-center space-y-4">
                                            <div className="w-14 h-14 bg-blue-400/10 rounded-2xl flex items-center justify-center mx-auto">
                                                <TelegramIcon className="w-8 h-8 text-blue-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-white font-black uppercase text-sm">Telegram Verification</h3>
                                                <p className="text-[10px] text-slate-500 mt-1 font-bold uppercase tracking-wider">One Telegram = One Main Account</p>
                                            </div>
                                            <p className="text-[10px] text-slate-400 leading-relaxed">
                                                We verify your identity through Telegram — no SMS codes, no copy-pasting.
                                                Just tap <strong className="text-white">Start</strong> in the bot and you're done.
                                            </p>
                                            <button
                                                onClick={initTelegramAuth}
                                                disabled={loading}
                                                className="w-full bg-blue-400 text-slate-950 font-black py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all uppercase tracking-widest text-xs disabled:opacity-40"
                                            >
                                                {loading
                                                    ? <Loader2 className="animate-spin" size={18} />
                                                    : <><TelegramIcon className="w-4 h-4" /> Verify with Telegram</>
                                                }
                                            </button>
                                        </div>
                                    ) : telegramPolling ? (
                                        /* Polling — waiting for user to tap Start in bot */
                                        <div className="bg-slate-900/50 border border-blue-400/20 p-5 rounded-3xl text-center space-y-4">
                                            <div className="w-14 h-14 bg-blue-400/10 rounded-2xl flex items-center justify-center mx-auto">
                                                <Loader2 className="animate-spin text-blue-400" size={28} />
                                            </div>
                                            <div>
                                                <h3 className="text-white font-black uppercase text-sm">Waiting for Telegram...</h3>
                                                <p className="text-[10px] text-slate-500 mt-1">Open the bot and tap <strong className="text-white">Start</strong></p>
                                            </div>
                                            <button
                                                onClick={() => window.open(telegramBotLink, '_blank')}
                                                className="w-full bg-blue-400 text-slate-950 font-black py-3 rounded-2xl text-xs uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2"
                                            >
                                                <TelegramIcon className="w-4 h-4" /> Open Telegram Bot
                                            </button>
                                            <button onClick={resetTelegramAuth} className="text-[9px] font-black text-slate-600 uppercase tracking-widest hover:text-slate-400 transition-colors">
                                                Start Over
                                            </button>
                                        </div>
                                    ) : null}

                                    <p className="text-[9px] text-slate-600 text-center uppercase font-bold tracking-widest leading-relaxed px-4">
                                        Each Telegram account can only be linked to one Main Account.
                                    </p>
                                </div>
                            ) : (
                                /* ── FINANCE: Google or Email ──────────────────────── */
                                <div className="space-y-4">
                                    <Link
                                        href={`/api/auth/google?username=${username}&mode=signup`}
                                        className="w-full bg-white text-slate-950 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-100 transition-colors shadow-lg"
                                    >
                                        <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="google" />
                                        Sign In with Google
                                    </Link>

                                    <div className="flex items-center gap-3 py-1">
                                        <div className="h-px bg-slate-800 flex-1" />
                                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">OR EMAIL</span>
                                        <div className="h-px bg-slate-800 flex-1" />
                                    </div>

                                    <div className="space-y-3">
                                        {!emailOtpSent ? (
                                            <>
                                                <div className="relative">
                                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                                                    <input
                                                        type="email"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        className="w-full pl-11 pr-12 py-3.5 bg-slate-900 border border-slate-800 rounded-xl text-white outline-none focus:border-[#FBBF24] transition-all text-sm"
                                                        placeholder="email@example.com"
                                                    />
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                        <AvailabilityIndicator checking={checkingEmail} available={isEmailAvailable} />
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={sendEmailOtp}
                                                    disabled={isEmailAvailable !== true || loading}
                                                    className="w-full bg-slate-800 text-white font-black py-3 rounded-xl uppercase tracking-widest text-[10px] active:scale-95 transition-all flex items-center justify-center disabled:opacity-30 disabled:grayscale"
                                                >
                                                    {loading ? <Loader2 size={16} className="animate-spin" /> : 'Send Email Code'}
                                                </button>
                                            </>
                                        ) : (
                                            <div className="space-y-3 pt-3 border-t border-slate-800">
                                                <p className="text-[10px] text-slate-500 text-center">Code sent to <span className="text-[#FBBF24] font-bold">{email}</span></p>
                                                <input
                                                    type="text"
                                                    value={emailOtp}
                                                    onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                    className="w-full bg-slate-900 border border-slate-800 px-5 py-3 rounded-xl text-white text-center font-mono text-lg tracking-[0.4em] outline-none focus:border-[#FBBF24]"
                                                    placeholder="000000"
                                                />
                                                <button
                                                    onClick={verifyEmailOtp}
                                                    disabled={emailOtp.length < 6 || loading}
                                                    className="w-full bg-[#FBBF24] text-slate-950 font-black py-3 rounded-xl text-xs uppercase flex items-center justify-center disabled:opacity-40"
                                                >
                                                    {loading ? <Loader2 size={16} className="animate-spin" /> : 'Verify Email'}
                                                </button>
                                                <button onClick={() => { setEmailOtpSent(false); setEmailOtp(''); }} className="w-full py-1.5 text-[9px] font-black text-slate-600 uppercase tracking-widest">
                                                    Change Email
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* ── STEP 3: PASSWORD & NAME ───────────────────────────────────── */}
                    {step === 'details' && (
                        <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.35, ease: EASE }} className="space-y-6">
                            <div className="flex items-center gap-3">
                                <button onClick={prevStep} className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400"><ArrowLeft size={16} /></button>
                                <div>
                                    <h1 className="text-xl font-black text-white tracking-tight uppercase">Secret <span className="text-[#FBBF24]">Passcode</span></h1>
                                    {telegramVerified && (
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <TelegramIcon className="w-3 h-3 text-blue-400" />
                                            <span className="text-[9px] text-blue-400 font-bold uppercase tracking-wider">Telegram Verified ✓</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-4">
                                {accountType === 'main' && (
                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2 mb-1 block">Real Name</label>
                                        <input 
                                            type="text" 
                                            value={realName} 
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/[^A-Za-z\s]/g, '').replace(/\s+/g, ' ');
                                                const formatted = val.split(' ').map(word => word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : '').join(' ');
                                                setRealName(formatted);
                                            }} 
                                            className="w-full bg-slate-900 border border-slate-800 px-5 py-4 rounded-xl text-white focus:border-[#FBBF24] outline-none" 
                                            placeholder="Areeb Ghous" 
                                        />
                                        <p className="text-[9px] text-slate-500 mt-1 pl-2">Must contain at least two words (e.g. First Last)</p>
                                    </div>
                                )}
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2 mb-1 block">Choose Password</label>
                                    <div className="relative">
                                        <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-900 border border-slate-800 px-5 py-4 rounded-xl text-white outline-none focus:border-[#FBBF24]" placeholder="••••••••" />
                                        <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600">
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => {
                                    if (accountType === 'main') {
                                        if (/[bcdfghjklmnpqrstvwxyz]{5,}/i.test(realName)) return setError('Real Name appears invalid (too many consecutive consonants)');
                                        if (/([a-z])\1{2,}/i.test(realName)) return setError('Real Name appears invalid (too many repeating characters)');
                                    }
                                    setError('');
                                    nextStep();
                                }} 
                                disabled={!password || (accountType === 'main' && realName.trim().split(' ').filter(Boolean).length < 2)} 
                                className="w-full bg-[#FBBF24] text-slate-950 font-black py-4 rounded-2xl uppercase tracking-widest text-xs active:scale-95 transition-all disabled:opacity-40"
                            >
                                NEXT
                            </button>
                        </motion.div>
                    )}

                    {/* ── STEP 4: PROFILE PIC ───────────────────────────────────────── */}
                    {step === 'profile-pic' && (
                        <motion.div key="profile-pic" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.35, ease: EASE }} className="space-y-8 text-center">
                            <h1 className="text-xl font-black text-white tracking-tight uppercase">Profile <span className="text-[#FBBF24]">Picture</span></h1>
                            <div className="flex flex-col items-center gap-6">
                                <div className="relative">
                                    <div className="w-32 h-32 rounded-3xl bg-slate-900 border-2 border-dashed border-slate-800 flex items-center justify-center overflow-hidden relative">
                                        {profileImage
                                            ? <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                                            : <Camera size={40} className={`transition-colors ${uploadState === 'uploading' ? 'animate-pulse text-[#FBBF24]' : 'text-slate-700'}`} />
                                        }
                                        {uploadState === 'uploading' && (
                                            <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center">
                                                <Loader2 size={32} className="animate-spin text-[#FBBF24]" />
                                            </div>
                                        )}
                                        <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploadState === 'uploading'} className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed" />
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 bg-[#FBBF24] text-slate-950 p-2 rounded-xl shadow-lg border-2 border-[#020617]">
                                        <Plus size={16} strokeWidth={3} />
                                    </div>
                                </div>
                                {uploadState === 'done'
                                    ? (
                                        <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                                            <ShieldCheck size={14} className="text-emerald-400" />
                                            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-[0.2em]">Image Saved</span>
                                        </div>
                                    )
                                    : <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest leading-relaxed">Tap to upload your avatar</p>
                                }
                            </div>

                            {accountType === 'side' ? (
                                <div className="space-y-3">
                                    <button onClick={nextStep} disabled={loading || uploadState === 'uploading'} className="w-full bg-[#FBBF24] text-slate-950 font-black py-4 rounded-2xl active:scale-95 transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-2">
                                        <Link2 size={16} /> Link Main Account
                                    </button>
                                    <p className="text-[9px] text-slate-600 font-bold uppercase tracking-wider">You can also do this later from settings.</p>
                                    <button onClick={handleSignup} disabled={loading} className="w-full py-3 border border-slate-800 rounded-2xl text-slate-400 font-black text-xs uppercase tracking-widest active:scale-95 transition-all">
                                        {loading ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Create Account Now'}
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <button onClick={handleSignup} disabled={loading || uploadState === 'uploading'} className="w-full bg-[#FBBF24] text-slate-950 font-black py-4 rounded-2xl active:scale-95 transition-all text-sm uppercase tracking-widest">
                                        {loading ? <Loader2 size={20} className="animate-spin mx-auto" /> : 'CREATE ACCOUNT'}
                                    </button>
                                    <button onClick={handleSignup} className="text-slate-600 text-[10px] font-black uppercase tracking-widest hover:text-slate-400 transition-colors">Skip for now</button>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* ── STEP 5 (Finance only): LINK MAIN ACCOUNT ─────────────────── */}
                    {step === 'link-account' && (
                        <motion.div key="link-account" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.35, ease: EASE }} className="space-y-6">
                            <div className="flex items-center gap-3">
                                <button onClick={prevStep} className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400"><ArrowLeft size={16} /></button>
                                <div>
                                    <h1 className="text-xl font-black text-white tracking-tight uppercase">Link <span className="text-[#FBBF24]">Main Account</span></h1>
                                    <p className="text-slate-500 text-[10px] uppercase tracking-widest">Connect under a Main Account</p>
                                </div>
                            </div>

                            {linkStep === 'username' ? (
                                <div className="space-y-4">
                                    <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-400/10 rounded-xl flex items-center justify-center text-blue-400"><Link2 size={20} /></div>
                                            <div>
                                                <p className="text-white font-black text-sm uppercase">Verify Ownership</p>
                                                <p className="text-slate-500 text-[10px]">OTP will be sent to that account via Telegram</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1 mb-1.5 block">Main Account Username</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={linkUsername}
                                                onChange={(e) => { setLinkUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, '')); }}
                                                className={`w-full bg-slate-900 border px-4 py-3.5 rounded-xl text-white font-mono text-sm outline-none transition-all pr-24 ${
                                                    linkUsernameCheck === 'valid' ? 'border-emerald-500/50 focus:border-emerald-500' :
                                                    linkUsernameCheck === 'invalid' ? 'border-rose-500/30 focus:border-rose-500/50' :
                                                    'border-slate-800 focus:border-[#FBBF24]'
                                                }`}
                                                placeholder="trader_name"
                                            />
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                                {linkUsernameCheck === 'checking' && <Loader2 size={14} className="animate-spin text-slate-500" />}
                                                {linkUsernameCheck === 'valid' && <><CheckCircle2 size={14} className="text-emerald-500" /><span className="text-[9px] text-emerald-500 font-bold uppercase">{linkUsernameHint}</span></>}
                                                {linkUsernameCheck === 'invalid' && <><XCircle size={14} className="text-rose-500" /><span className="text-[9px] text-rose-500 font-bold uppercase leading-tight text-right max-w-[70px]">{linkUsernameHint}</span></>}
                                            </div>
                                        </div>
                                    </div>
                                    {error && <p className="text-rose-400 text-[11px] font-medium">{error}</p>}
                                    <button onClick={sendLinkOtp} disabled={!linkUsername.trim() || linkLoading || linkUsernameCheck !== 'valid' || linkUsername.endsWith('.')} className="w-full bg-[#FBBF24] text-slate-950 font-black py-4 rounded-2xl uppercase tracking-widest text-xs active:scale-95 transition-all disabled:opacity-40 flex items-center justify-center gap-2">
                                        {linkLoading ? <Loader2 size={16} className="animate-spin" /> : 'Send Verification OTP'}
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="bg-slate-900/50 border border-emerald-500/20 p-4 rounded-2xl text-center">
                                        <ShieldCheck size={24} className="text-emerald-400 mx-auto mb-2" />
                                        <p className="text-slate-300 text-sm font-bold">OTP sent to <span className="text-[#FBBF24]">@{linkUsername}</span>'s Telegram</p>
                                        <p className="text-slate-500 text-[10px] mt-1">Ask the Main Account holder to share the code</p>
                                    </div>
                                    <input
                                        type="text"
                                        value={linkOtp}
                                        onChange={(e) => setLinkOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        className="w-full bg-slate-900 border border-slate-800 px-5 py-4 rounded-2xl text-white text-center font-mono text-2xl tracking-[0.8em] outline-none focus:border-[#FBBF24]"
                                        placeholder="••••••"
                                    />
                                    {error && <p className="text-rose-400 text-[11px] font-medium text-center">{error}</p>}
                                    <button onClick={verifyLinkOtp} disabled={linkOtp.length < 6 || linkLoading} className="w-full bg-emerald-500 text-white font-black py-4 rounded-2xl uppercase tracking-widest text-xs active:scale-95 transition-all disabled:opacity-40 flex items-center justify-center gap-2">
                                        {linkLoading ? <Loader2 size={16} className="animate-spin" /> : 'Verify & Create Account'}
                                    </button>
                                    <button onClick={() => { setLinkStep('username'); setLinkOtp(''); }} className="w-full py-1.5 text-[9px] font-black text-slate-600 uppercase tracking-widest">Change Username</button>
                                </div>
                            )}

                            <button onClick={handleSignup} disabled={loading} className="w-full text-slate-600 text-[10px] font-black uppercase tracking-widest hover:text-slate-400 transition-colors py-1">
                                {loading ? <Loader2 size={14} className="animate-spin mx-auto" /> : 'Skip — Create Account Without Linking'}
                            </button>
                        </motion.div>
                    )}

                </AnimatePresence>

                <p className="mt-10 text-center">
                    <span className="text-slate-600 text-[11px] font-medium uppercase tracking-widest">Already a Trader?</span>
                    <br />
                    <Link href="/login" className="text-[#FBBF24] font-black text-sm uppercase tracking-tight hover:underline inline-block mt-1">Log In</Link>
                    <div className="mt-8 pt-6 border-t border-slate-900/50 space-y-2 opacity-40">
                        <p className="text-[9px] text-slate-500 leading-relaxed uppercase tracking-wider">By creating an account, you agree to our</p>
                        <div className="flex justify-center gap-4 text-[10px] font-bold uppercase">
                            <Link href="/terms" className="text-slate-400 hover:text-white underline decoration-slate-800">Terms & Conditions</Link>
                            <Link href="/privacy" className="text-slate-400 hover:text-white underline decoration-slate-800">Privacy Policy</Link>
                        </div>
                    </div>
                </p>
            </div>

            {/* Error toast */}
            {error && step !== 'link-account' && (
                <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="fixed bottom-6 left-6 right-6 bg-rose-500/10 border border-rose-500/20 backdrop-blur-xl p-4 rounded-2xl shadow-2xl z-50 border-l-4 border-l-rose-500">
                    <p className="text-rose-500 font-black text-[10px] uppercase tracking-widest mb-1">Error</p>
                    <p className="text-rose-400 text-[11px] font-mono leading-tight">{error}</p>
                </motion.div>
            )}

            {/* Cropper Overlay */}
            <AnimatePresence>
                {cropImageSrc && (
                    <ImageCropper
                        imageSrc={cropImageSrc}
                        onCropDone={handleCropDone}
                        onCropCancel={() => setCropImageSrc(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
