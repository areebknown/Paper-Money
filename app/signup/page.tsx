'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    CheckCircle2,
    Smartphone,
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
    RefreshCw,
    Timer,
    XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LOGO_URL } from '@/lib/cloudinary';

type SignupStep = 'choice' | 'username' | 'verification' | 'details' | 'profile-pic' | 'link-account';
type AccountType = 'main' | 'side' | null;

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

export default function SignupPage() {
    const router = useRouter();

    const [step, setStep] = useState<SignupStep>('choice');
    const [accountType, setAccountType] = useState<AccountType>(null);

    // Username Check
    const [username, setUsername] = useState('');
    const [isUsernameValid, setIsUsernameValid] = useState<boolean | null>(null);
    const [checkingUsername, setCheckingUsername] = useState(false);

    // Main Account — Phone
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isPhoneAvailable, setIsPhoneAvailable] = useState<boolean | null>(null);
    const [checkingPhone, setCheckingPhone] = useState(false);
    const [phoneOtpSent, setPhoneOtpSent] = useState(false);
    const [phoneOtp, setPhoneOtp] = useState('');
    const [phoneVerified, setPhoneVerified] = useState(false);

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

    // SMS countdown & resend
    const [otpCountdown, setOtpCountdown] = useState(0); // seconds remaining
    const countdownRef = useRef<NodeJS.Timeout | null>(null);
    const startCountdown = useCallback(() => {
        setOtpCountdown(60);
        if (countdownRef.current) clearInterval(countdownRef.current);
        countdownRef.current = setInterval(() => {
            setOtpCountdown(prev => {
                if (prev <= 1) { clearInterval(countdownRef.current!); return 0; }
                return prev - 1;
            });
        }, 1000);
    }, []);

    // Link account (Finance → Main)
    const [linkUsername, setLinkUsername] = useState('');
    const [linkMainUserId, setLinkMainUserId] = useState('');
    const [linkOtp, setLinkOtp] = useState('');
    const [linkStep, setLinkStep] = useState<'username' | 'otp'>('username');
    const [linkLoading, setLinkLoading] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [pmuid] = useState(() => {
        const digits = Math.floor(10000000 + Math.random() * 90000000).toString();
        return `PM-${digits.slice(0, 4)}-${digits.slice(4)}`;
    });

    // --- Real-time Username Check ---
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

    // --- Real-time Phone Check ---
    useEffect(() => {
        if (phoneNumber.length !== 10) { setIsPhoneAvailable(null); return; }
        setCheckingPhone(true);
        const timer = setTimeout(async () => {
            try {
                const res = await fetch(`/api/user/check-phone?phone=${phoneNumber}`);
                const data = await res.json();
                setIsPhoneAvailable(data.available);
            } catch { setIsPhoneAvailable(false); }
            finally { setCheckingPhone(false); }
        }, 500);
        return () => clearTimeout(timer);
    }, [phoneNumber]);

    // --- Real-time Email Check ---
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

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadState('uploading');
        try {
            const fd = new FormData();
            fd.append('file', file);
            fd.append('folder', 'user_pfps');
            fd.append('public_id', pmuid);
            const res = await fetch('/api/upload', { method: 'POST', body: fd });
            if (!res.ok) throw new Error('Upload failed');
            const data = await res.json();
            setProfileImage(data.url);
            setUploadState('done');
        } catch {
            setUploadState('error');
            setError('Image upload failed. Try again.');
        }
    };

    const sendSmsOtp = async () => {
        setLoading(true); setError('');
        try {
            const res = await fetch('/api/auth/sms/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber, username }),
            });
            const data = await res.json();
            if (res.ok) { setPhoneOtpSent(true); startCountdown(); }
            else { setError(data.error || 'Failed to send OTP'); }
        } catch { setError('SMS service unavailable'); }
        finally { setLoading(false); }
    };

    const resendSmsOtp = async () => {
        setPhoneOtp('');
        setError('');
        setLoading(true);
        try {
            const res = await fetch('/api/auth/sms/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber, username }),
            });
            const data = await res.json();
            if (res.ok) { startCountdown(); }
            else { setError(data.error || 'Failed to resend OTP'); }
        } catch { setError('SMS service unavailable'); }
        finally { setLoading(false); }
    };

    const verifySmsOtp = async () => {
        if (phoneOtp.length < 6) return setError('Enter the 6-digit code');
        setLoading(true); setError('');
        try {
            const res = await fetch('/api/auth/sms/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber, otp: phoneOtp }),
            });
            const data = await res.json();
            if (res.ok && data.verified) {
                setPhoneVerified(true);
                nextStep();
            } else { setError(data.error || 'Verification failed'); }
        } catch { setError('Verification failed'); }
        finally { setLoading(false); }
    };

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
                    phoneNumber: accountType === 'main' ? phoneNumber : null,
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
        else if (step === 'details') setStep('verification');
        else if (step === 'profile-pic') setStep('details');
        else if (step === 'link-account') setStep('profile-pic');
    };

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
            // First complete signup to get a session cookie
            await handleSignup();
            // Then link
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

    const AvailabilityIndicator = ({ checking, available }: { checking: boolean; available: boolean | null }) => {
        if (checking) return <Loader2 size={16} className="animate-spin text-slate-500" />;
        if (available === true) return <CheckCircle2 size={18} className="text-emerald-500" />;
        if (available === false) return <div className="px-2 py-0.5 bg-rose-500/20 text-rose-500 text-[8px] font-black rounded uppercase">Taken</div>;
        return null;
    };

    return (
        <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 relative overflow-hidden selection:bg-yellow-500/30">
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/15 via-blue-900/5 to-transparent rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-900/10 via-yellow-900/5 to-transparent rounded-full pointer-events-none" />

            <div className="w-full max-w-sm relative z-10">
                {/* Logo */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center mb-8">
                    <img src={LOGO_URL} alt="Bid Wars" className="h-20 w-auto drop-shadow-[0_4px_30px_rgba(34,211,238,0.2)]" />
                    <div className="mt-4 flex items-center gap-2">
                        <div className="h-px w-6 bg-gradient-to-r from-transparent to-slate-700" />
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Create Account</span>
                        <div className="h-px w-6 bg-gradient-to-l from-transparent to-slate-700" />
                    </div>
                </motion.div>

                <AnimatePresence mode="wait">
                    {/* STEP 0: ACCOUNT TYPE */}
                    {step === 'choice' && (
                        <motion.div key="choice" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.35, ease: EASE }} className="space-y-4">
                            <div className="text-center mb-4">
                                <h1 className="text-xl font-black text-white tracking-tight uppercase">Join the <span className="text-[#FBBF24]">Game</span></h1>
                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Select Your Account Type</p>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                                <button onClick={() => setAccountType('main')} className={`relative p-4 rounded-3xl text-left transition-all border-2 ${accountType === 'main' ? 'bg-slate-900 border-blue-400 shadow-[0_0_40px_rgba(96,165,250,0.15)]' : 'bg-slate-900/50 border-slate-800/50 hover:border-slate-700'}`}>
                                    <div className="flex items-start gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shrink-0 ${accountType === 'main' ? 'bg-blue-400 text-slate-950' : 'bg-slate-800 text-slate-500'}`}><Sparkles size={24} /></div>
                                        <div className="flex-1">
                                            <h3 className="font-black text-sm text-white uppercase mb-1">Main Account</h3>
                                            <div className="px-2 py-0.5 bg-[#FBBF24] text-slate-950 text-[8px] font-black rounded-lg inline-block mb-1.5 uppercase tracking-tighter">₹1 Lakh Starter Bonus</div>
                                            <p className="text-[10px] text-slate-500 font-medium">Full Progress. Phone Verified.</p>
                                        </div>
                                    </div>
                                </button>
                                <button onClick={() => setAccountType('side')} className={`relative p-4 rounded-3xl text-left transition-all border-2 ${accountType === 'side' ? 'bg-slate-900 border-blue-400 shadow-[0_0_40px_rgba(96,165,250,0.15)]' : 'bg-slate-900/50 border-slate-800/50 hover:border-slate-700'}`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${accountType === 'side' ? 'bg-blue-400 text-slate-950' : 'bg-slate-800 text-slate-500'}`}><Globe size={24} /></div>
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

                    {/* STEP 1: USERNAME */}
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
                                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                        className="w-full bg-slate-900 border border-slate-800 px-12 py-4 rounded-2xl text-white font-mono text-lg focus:border-[#FBBF24] outline-none transition-all placeholder:text-slate-700"
                                        placeholder="trader_name"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        <AvailabilityIndicator checking={checkingUsername} available={isUsernameValid} />
                                    </div>
                                </div>
                            </div>
                            <button disabled={!isUsernameValid || checkingUsername} onClick={nextStep} className="w-full bg-[#FBBF24] text-slate-950 font-black py-4 rounded-2xl active:scale-95 transition-all disabled:opacity-30 disabled:grayscale uppercase tracking-widest text-xs">
                                CONTINUE
                            </button>
                        </motion.div>
                    )}

                    {/* STEP 2: VERIFICATION */}
                    {step === 'verification' && (
                        <motion.div key="verification" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.35, ease: EASE }} className="space-y-6">
                            <div className="flex items-center gap-3">
                                <button onClick={prevStep} className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400"><ArrowLeft size={16} /></button>
                                <h1 className="text-xl font-black text-white tracking-tight uppercase">Confirm <span className="text-[#FBBF24]">Account</span></h1>
                            </div>

                            {/* MAIN — SMS OTP */}
                            {accountType === 'main' ? (
                                <div className="space-y-4">
                                    <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-3xl text-center space-y-3">
                                        <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto text-emerald-400"><Smartphone size={28} /></div>
                                        <div>
                                            <h3 className="text-white font-black uppercase text-sm">SMS Verification</h3>
                                            <p className="text-[10px] text-slate-500 mt-1 font-bold uppercase tracking-wider">One number, one Main Account</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        {/* Phone Input */}
                                        {!phoneOtpSent && (
                                            <>
                                                <div className="relative">
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[11px] font-black text-slate-600">+91</div>
                                                    <input
                                                        type="tel"
                                                        value={phoneNumber}
                                                        onChange={(e) => { setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10)); setPhoneOtpSent(false); }}
                                                        className="w-full pl-12 pr-12 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white outline-none focus:border-[#FBBF24] transition-all text-sm font-mono tracking-widest"
                                                        placeholder="XXXXXXXXXX"
                                                    />
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                        <AvailabilityIndicator checking={checkingPhone} available={isPhoneAvailable} />
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={sendSmsOtp}
                                                    disabled={phoneNumber.length < 10 || isPhoneAvailable !== true || loading}
                                                    className="w-full bg-[#FBBF24] text-slate-950 font-black py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all uppercase tracking-widest text-xs disabled:opacity-30 disabled:grayscale"
                                                >
                                                    {loading ? <Loader2 className="animate-spin" size={18} /> : <><Smartphone size={16} /> Send SMS OTP</>}
                                                </button>
                                            </>
                                        )}

                                        {/* OTP Input */}
                                        {phoneOtpSent && (
                                            <div className="space-y-3 pt-1">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Timer size={12} className="text-slate-600" />
                                                    <p className="text-[10px] text-slate-500 text-center">OTP sent to <span className="text-[#FBBF24] font-bold">+91 {phoneNumber}</span></p>
                                                </div>
                                                <input
                                                    type="text"
                                                    value={phoneOtp}
                                                    onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                    className="w-full bg-slate-900 border border-emerald-500/30 px-5 py-4 rounded-2xl text-white text-center font-mono text-xl tracking-[0.6em] outline-none"
                                                    placeholder="••••••"
                                                />
                                                {otpCountdown > 0 ? (
                                                    <p className="text-[9px] text-center text-slate-600 font-mono">
                                                        SMS may take up to 45 sec to arrive · resend in {otpCountdown}s
                                                    </p>
                                                ) : (
                                                    <button
                                                        onClick={resendSmsOtp}
                                                        disabled={loading}
                                                        className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[9px] font-black text-slate-500 uppercase tracking-widest hover:text-[#FBBF24] transition-colors disabled:opacity-40"
                                                    >
                                                        <RefreshCw size={10} />
                                                        Resend OTP
                                                    </button>
                                                )}
                                                <button
                                                    onClick={verifySmsOtp}
                                                    disabled={phoneOtp.length < 6 || loading}
                                                    className="w-full bg-emerald-500 text-white font-black py-4 rounded-2xl text-xs uppercase tracking-widest active:scale-95 transition-all disabled:opacity-40 flex items-center justify-center"
                                                >
                                                    {loading ? <Loader2 size={16} className="animate-spin" /> : 'Verify OTP'}
                                                </button>
                                                <button onClick={() => { setPhoneOtpSent(false); setPhoneOtp(''); setOtpCountdown(0); if (countdownRef.current) clearInterval(countdownRef.current); }} className="w-full py-1.5 text-[9px] font-black text-slate-600 uppercase tracking-widest">
                                                    Change Number
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-[9px] text-slate-600 text-center uppercase font-bold tracking-widest leading-relaxed px-4">
                                        Each phone number can only be linked to one Main Account.
                                    </p>
                                </div>
                            ) : (
                                /* FINANCE — Google or Email */
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
                                        {/* Email Input */}
                                        {!emailOtpSent && (
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
                                        )}

                                        {/* Email OTP Input */}
                                        {emailOtpSent && (
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

                    {/* STEP 3: PASSWORD & NAME */}
                    {step === 'details' && (
                        <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.35, ease: EASE }} className="space-y-6">
                            <h1 className="text-xl font-black text-white tracking-tight uppercase">Secret <span className="text-[#FBBF24]">Passcode</span></h1>
                            <div className="space-y-4">
                                {accountType === 'main' && (
                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2 mb-1 block">Full Name</label>
                                        <input type="text" value={realName} onChange={(e) => setRealName(e.target.value)} className="w-full bg-slate-900 border border-slate-800 px-5 py-4 rounded-xl text-white focus:border-[#FBBF24] outline-none" placeholder="John Doe" />
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
                            <button onClick={nextStep} disabled={!password} className="w-full bg-[#FBBF24] text-slate-950 font-black py-4 rounded-2xl uppercase tracking-widest text-xs active:scale-95 transition-all disabled:opacity-40">
                                NEXT
                            </button>
                        </motion.div>
                    )}

                    {/* STEP 4: PROFILE PIC */}
                    {step === 'profile-pic' && (
                        <motion.div key="profile-pic" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.35, ease: EASE }} className="space-y-8 text-center">
                            <h1 className="text-xl font-black text-white tracking-tight uppercase">Profile <span className="text-[#FBBF24]">Picture</span></h1>
                            <div className="flex flex-col items-center gap-6">
                                <div className="relative">
                                    <div className="w-32 h-32 rounded-3xl bg-slate-900 border-2 border-dashed border-slate-800 flex items-center justify-center overflow-hidden relative">
                                        {profileImage ? <img src={profileImage} alt="Profile" className="w-full h-full object-cover" /> : <Camera size={40} className={`transition-colors ${uploadState === 'uploading' ? 'animate-pulse text-[#FBBF24]' : 'text-slate-700'}`} />}
                                        {uploadState === 'uploading' && <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center"><Loader2 size={32} className="animate-spin text-[#FBBF24]" /></div>}
                                        <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploadState === 'uploading'} className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed" />
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 bg-[#FBBF24] text-slate-950 p-2 rounded-xl shadow-lg border-2 border-[#020617]"><Plus size={16} strokeWidth={3} /></div>
                                </div>
                                {uploadState === 'done' ? (
                                    <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                                        <ShieldCheck size={14} className="text-emerald-400" />
                                        <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-[0.2em]">Image Saved</span>
                                    </div>
                                ) : <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest leading-relaxed">Tap to upload your avatar</p>}
                            </div>

                            {/* Finance: next goes to link-account step; Main: creates account directly */}
                            {accountType === 'side' ? (
                                <div className="space-y-3">
                                    <button onClick={nextStep} disabled={loading || uploadState === 'uploading'} className="w-full bg-[#FBBF24] text-slate-950 font-black py-4 rounded-2xl active:scale-95 transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-2">
                                        <Link2 size={16} />
                                        Link Main Account
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

                    {/* STEP 5 (Finance only): LINK MAIN ACCOUNT */}
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
                                            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400"><Link2 size={20} /></div>
                                            <div>
                                                <p className="text-white font-black text-sm uppercase">Verify Ownership</p>
                                                <p className="text-slate-500 text-[10px]">OTP will be sent to that account's phone</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1 mb-1.5 block">Main Account Username</label>
                                        <input
                                            type="text"
                                            value={linkUsername}
                                            onChange={(e) => setLinkUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                            className="w-full bg-slate-900 border border-slate-800 px-4 py-3.5 rounded-xl text-white font-mono text-sm focus:border-[#FBBF24] outline-none"
                                            placeholder="trader_name"
                                        />
                                    </div>
                                    {error && <p className="text-rose-400 text-[11px] font-medium">{error}</p>}
                                    <button onClick={sendLinkOtp} disabled={!linkUsername.trim() || linkLoading} className="w-full bg-[#FBBF24] text-slate-950 font-black py-4 rounded-2xl uppercase tracking-widest text-xs active:scale-95 transition-all disabled:opacity-40 flex items-center justify-center gap-2">
                                        {linkLoading ? <Loader2 size={16} className="animate-spin" /> : <><Smartphone size={14} /> Send Verification OTP</>}
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="bg-slate-900/50 border border-emerald-500/20 p-4 rounded-2xl text-center">
                                        <ShieldCheck size={24} className="text-emerald-400 mx-auto mb-2" />
                                        <p className="text-slate-300 text-sm font-bold">OTP sent to <span className="text-[#FBBF24]">@{linkUsername}</span>'s phone</p>
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

            {error && (
                <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="fixed bottom-6 left-6 right-6 bg-rose-500/10 border border-rose-500/20 backdrop-blur-xl p-4 rounded-2xl shadow-2xl z-50 border-l-4 border-l-rose-500">
                    <p className="text-rose-500 font-black text-[10px] uppercase tracking-widest mb-1">System Error Log</p>
                    <p className="text-rose-400 text-[11px] font-mono leading-tight">{error}</p>
                </motion.div>
            )}
        </div>
    );
}
