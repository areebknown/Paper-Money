'use client';

import { useState, useEffect } from 'react';
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
    Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { startRegistration } from '@simplewebauthn/browser';
import { LOGO_URL } from '@/lib/cloudinary';

type SignupStep = 'choice' | 'username' | 'verification' | 'details' | 'profile-pic';
type AccountType = 'main' | 'side' | null;

export default function SignupPage() {
    const router = useRouter();

    // Form States
    const [step, setStep] = useState<SignupStep>('choice');
    const [accountType, setAccountType] = useState<AccountType>(null);
    const [username, setUsername] = useState('');
    const [isUsernameValid, setIsUsernameValid] = useState<boolean | null>(null);
    const [checkingUsername, setCheckingUsername] = useState(false);

    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);

    const [password, setPassword] = useState('');
    const [realName, setRealName] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [authenticatorData, setAuthenticatorData] = useState<any>(null);

    // PMUID for naming PFP
    const [pmuid, setPmuid] = useState('');
    useEffect(() => {
        const digits = Math.floor(10000000 + Math.random() * 90000000).toString();
        setPmuid(`PM-${digits.slice(0, 4)}-${digits.slice(4)}`);
    }, []);

    // Real-time Username Check
    useEffect(() => {
        const check = async () => {
            if (username.length < 3) {
                setIsUsernameValid(null);
                return;
            }
            setCheckingUsername(true);
            try {
                const res = await fetch(`/api/user/check-username?username=${username}`);
                const data = await res.json();
                setIsUsernameValid(data.available);
            } catch (err) {
                setIsUsernameValid(false);
            } finally {
                setCheckingUsername(false);
            }
        };

        const timer = setTimeout(check, 500);
        return () => clearTimeout(timer);
    }, [username]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadState('uploading');
        try {
            const fd = new FormData();
            fd.append('file', file);
            fd.append('folder', 'user_pfps');
            fd.append('public_id', pmuid);

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: fd,
            });

            if (!res.ok) throw new Error('Upload failed');
            const data = await res.json();
            setProfileImage(data.url);
            setUploadState('done');
        } catch (err) {
            setUploadState('error');
            setError('Image upload failed. Please try again.');
        }
    };

    const sendWhatsappOtp = async () => {
        if (!phoneNumber) return setError('Please enter your WhatsApp number');
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/auth/whatsapp/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber, username }),
            });
            const data = await res.json();
            if (res.ok) {
                setIsOtpSent(true);
                if (data.simulated) setOtp(data.otp || '');
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError('WhatsApp service unavailable');
        } finally {
            setLoading(false);
        }
    };

    const verifyWhatsappOtp = async () => {
        if (otp.length < 6) return setError('Enter the 6-digit code');
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/auth/whatsapp/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber, otp, username }),
            });
            const data = await res.json();
            if (res.ok) {
                // Account created successfully in the verify route
                router.push('/home');
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError('Verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async () => {
        setLoading(true);
        setError('');

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

            if (res.ok) {
                router.push('/home');
            } else {
                setError(data.error || 'Signup failed');
            }
        } catch (err) {
            setError('Connection failed');
        } finally {
            setLoading(false);
        }
    };

    const sendOtp = async () => {
        const payload = accountType === 'main'
            ? { phoneNumber, type: 'whatsapp' }
            : { email, type: 'email' };

        if (accountType === 'main' && !phoneNumber) return setError('Please enter a phone number');
        if (accountType === 'side' && !email) return setError('Please enter an email address');

        setLoading(true);
        try {
            const res = await fetch('/api/auth/otp/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (res.ok) {
                setIsOtpSent(true);
                if (data.simulated) setOtp(data.otp);
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError('Failed to send code');
        } finally {
            setLoading(false);
        }
    };

    const verifyOtpAndNext = () => {
        if (otp.length < 6) return setError('Enter a valid 6-digit code');
        nextStep();
    };

    const nextStep = () => {
        if (step === 'choice') setStep('username');
        else if (step === 'username' && isUsernameValid) setStep('verification');
        else if (step === 'verification') setStep('details');
        else if (step === 'details') setStep('profile-pic');
        else if (step === 'profile-pic') handleSignup();
    };

    const prevStep = () => {
        if (step === 'username') setStep('choice');
        else if (step === 'verification') setStep('username');
        else if (step === 'details') setStep('verification');
        else if (step === 'profile-pic') setStep('details');
    };

    return (
        <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 relative overflow-hidden font-['Inter'] selection:bg-yellow-500/30">
            {/* Background Effects */}
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-yellow-900/5 blur-[120px] rounded-full" />

            <div className="w-full max-w-sm relative z-10">
                {/* Logo Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center mb-8"
                >
                    <img
                        src={LOGO_URL}
                        alt="Bid Wars"
                        className="h-20 w-auto drop-shadow-[0_4px_30px_rgba(34,211,238,0.2)]"
                    />
                    <div className="mt-4 flex items-center gap-2">
                        <div className="h-px w-6 bg-gradient-to-r from-transparent to-slate-700" />
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Create Account</span>
                        <div className="h-px w-6 bg-gradient-to-l from-transparent to-slate-700" />
                    </div>
                </motion.div>

                <AnimatePresence mode="wait">
                    {/* STEP 0: CHOICE */}
                    {step === 'choice' && (
                        <motion.div
                            key="choice"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-4"
                        >
                            <div className="text-center mb-4">
                                <h1 className="text-xl font-black text-white tracking-tight uppercase">Join the <span className="text-[#FBBF24]">Game</span></h1>
                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Select Your Account Type</p>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                {/* MAIN ACCOUNT */}
                                <button
                                    onClick={() => setAccountType('main')}
                                    className={`relative group p-4 rounded-3xl text-left transition-all border-2 ${accountType === 'main'
                                        ? 'bg-slate-900 border-[#FBBF24] shadow-[0_0_40px_rgba(251,191,36,0.15)]'
                                        : 'bg-slate-900/50 border-slate-800/50 hover:border-slate-700'
                                        }`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shrink-0 ${accountType === 'main' ? 'bg-[#FBBF24] text-slate-950' : 'bg-slate-800 text-slate-500'}`}>
                                            <Sparkles size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-black text-sm text-white uppercase mb-1">Main Account</h3>
                                            <div className="px-2 py-0.5 bg-[#FBBF24] text-slate-950 text-[8px] font-black rounded-lg inline-block mb-1.5 uppercase tracking-tighter">₹1 Lakh Starter BONUS</div>
                                            <p className="text-[10px] text-slate-500 font-medium">Full Progress. Device Bound.</p>
                                        </div>
                                    </div>
                                </button>

                                {/* SIDE ACCOUNT */}
                                <button
                                    onClick={() => setAccountType('side')}
                                    className={`relative group p-4 rounded-3xl text-left transition-all border-2 ${accountType === 'side'
                                        ? 'bg-slate-900 border-indigo-500 shadow-[0_0_40px_rgba(99,102,241,0.15)]'
                                        : 'bg-slate-900/50 border-slate-800/50 hover:border-slate-700'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${accountType === 'side' ? 'bg-indigo-500 text-slate-950' : 'bg-slate-800 text-slate-500'}`}>
                                            <Globe size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-sm text-white uppercase">Finance Account</h3>
                                            <p className="text-[10px] text-slate-500 font-medium">Alternate. Email Linked.</p>
                                        </div>
                                    </div>
                                </button>
                            </div>

                            <button
                                disabled={!accountType}
                                onClick={nextStep}
                                className="w-full mt-2 bg-[#FBBF24] text-slate-950 font-black py-4 rounded-2xl shadow-lg active:scale-95 transition-all disabled:opacity-30 flex items-center justify-center gap-2 group uppercase tracking-widest text-xs"
                            >
                                CONTINUE
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </motion.div>
                    )}

                    {/* STEP 1: USERNAME */}
                    {step === 'username' && (
                        <motion.div
                            key="username"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center gap-3">
                                <button onClick={prevStep} className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors">
                                    <ArrowLeft size={16} />
                                </button>
                                <h1 className="text-xl font-black text-white tracking-tight uppercase">Choose <span className="text-[#FBBF24]">Username</span></h1>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2 mb-1 block">Your Name in the Game</label>
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
                                        {checkingUsername ? (
                                            <Loader2 size={16} className="animate-spin text-slate-500" />
                                        ) : isUsernameValid === true ? (
                                            <CheckCircle2 size={20} className="text-emerald-500" />
                                        ) : isUsernameValid === false ? (
                                            <div className="px-2 py-0.5 bg-rose-500/20 text-rose-500 text-[8px] font-black rounded uppercase">Taken</div>
                                        ) : null}
                                    </div>
                                </div>
                            </div>

                            <button
                                disabled={!isUsernameValid || checkingUsername}
                                onClick={nextStep}
                                className="w-full bg-[#FBBF24] text-slate-950 font-black py-4 rounded-2xl shadow-lg active:scale-95 transition-all disabled:opacity-30 disabled:grayscale uppercase tracking-widest text-xs"
                            >
                                CONTINUE
                            </button>
                        </motion.div>
                    )}

                    {/* STEP 2: VERIFICATION */}
                    {step === 'verification' && (
                        <motion.div
                            key="verification"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center gap-3">
                                <button onClick={prevStep} className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors">
                                    <ArrowLeft size={16} />
                                </button>
                                <h1 className="text-xl font-black text-white tracking-tight uppercase">Confirm <span className="text-[#FBBF24]">Account</span></h1>
                            </div>                             {accountType === 'main' ? (
                                <div className="space-y-4">
                                    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl text-center space-y-4">
                                        <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
                                            <Smartphone size={32} />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-black uppercase text-sm">WhatsApp Security</h3>
                                            <p className="text-[10px] text-slate-500 mt-1 font-bold uppercase tracking-wider">Verification required for bonus</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[11px] font-black text-slate-700">+91</div>
                                            <input
                                                type="tel"
                                                value={phoneNumber}
                                                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                                className="w-full pl-12 pr-5 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white outline-none focus:border-[#FBBF24] transition-all text-sm font-mono tracking-widest"
                                                placeholder="XXXXXXXXXX"
                                            />
                                        </div>
                                        
                                        {!isOtpSent ? (
                                            <button
                                                onClick={sendWhatsappOtp}
                                                disabled={phoneNumber.length < 10 || loading}
                                                className="w-full bg-[#FBBF24] text-slate-950 font-black py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all uppercase tracking-widest text-xs"
                                            >
                                                {loading ? <Loader2 className="animate-spin text-slate-950" /> : (
                                                    <>
                                                        Send WhatsApp OTP
                                                        <ArrowRight size={16} />
                                                    </>
                                                )}
                                            </button>
                                        ) : (
                                            <div className="space-y-4 pt-2">
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        value={otp}
                                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                        className="w-full bg-slate-900 border border-emerald-500/30 px-5 py-4 rounded-2xl text-white text-center font-mono text-xl tracking-[0.6em] outline-none shadow-[0_0_20px_rgba(16,185,129,0.05)]"
                                                        placeholder="••••••"
                                                    />
                                                </div>
                                                <button 
                                                    onClick={verifyWhatsappOtp}
                                                    disabled={otp.length < 6 || loading}
                                                    className="w-full bg-emerald-500 text-white font-black py-4 rounded-2xl text-xs uppercase shadow-lg shadow-emerald-500/10 active:scale-95 transition-all flex items-center justify-center"
                                                >
                                                    {loading ? <Loader2 size={16} className="animate-spin" /> : 'Claim 1 Lakh Bonus'}
                                                </button>
                                                <button 
                                                    onClick={() => setIsOtpSent(false)} 
                                                    className="w-full py-2 text-[9px] font-black text-slate-600 uppercase tracking-widest"
                                                >
                                                    Change Number
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <p className="text-[9px] text-slate-600 text-center uppercase font-bold tracking-widest leading-relaxed px-4">
                                        Elite status requires a verified phone identity.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <Link
                                        href={`/api/auth/google?username=${username}`}
                                        className="w-full bg-white text-slate-950 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-100 transition-colors shadow-lg"
                                    >
                                        <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="google" />
                                        Sign In with Google
                                    </Link>
                                    <div className="flex items-center gap-3 py-2">
                                        <div className="h-px bg-slate-800 flex-1" />
                                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">OR EMAIL</span>
                                        <div className="h-px bg-slate-800 flex-1" />
                                    </div>
                                    <div className="space-y-3">
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-800 px-5 py-3.5 rounded-xl text-white outline-none focus:border-cyan-500 transition-all text-sm"
                                            placeholder="email@example.com"
                                        />
                                        <button
                                            onClick={sendOtp}
                                            disabled={!email || loading}
                                            className="w-full bg-slate-800 text-white font-black py-3 rounded-xl uppercase tracking-widest text-[10px] active:scale-95 transition-all flex items-center justify-center"
                                        >
                                            {loading ? <Loader2 size={16} className="animate-spin" /> : 'Send Email Code'}
                                        </button>
                                        {isOtpSent && (
                                            <div className="space-y-3 pt-4 border-t border-slate-800">
                                                <input
                                                    type="text"
                                                    value={otp}
                                                    onChange={(e) => setOtp(e.target.value)}
                                                    className="w-full bg-slate-900 border border-slate-800 px-5 py-3 rounded-xl text-white text-center font-mono text-lg tracking-[0.4em] outline-none"
                                                    placeholder="000000"
                                                />
                                                <button onClick={verifyOtpAndNext} className="w-full bg-[#FBBF24] text-slate-950 font-black py-3 rounded-xl text-xs uppercase">Verify Email</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* STEP 3: PASSWORD */}
                    {step === 'details' && (
                        <motion.div
                            key="details"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <h1 className="text-xl font-black text-white tracking-tight uppercase">Secret <span className="text-[#FBBF24]">Passcode</span></h1>

                            <div className="space-y-4">
                                {accountType === 'main' && (
                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2 mb-1 block">Full Name</label>
                                        <input
                                            type="text"
                                            value={realName}
                                            onChange={(e) => setRealName(e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-800 px-5 py-4 rounded-xl text-white focus:border-[#FBBF24] outline-none"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                )}
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2 mb-1 block">Choose Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-800 px-5 py-4 rounded-xl text-white outline-none focus:border-cyan-500"
                                            placeholder="••••••••"
                                        />
                                        <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600">
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button onClick={nextStep} className="w-full bg-[#FBBF24] text-slate-950 font-black py-4 rounded-2xl uppercase tracking-widest text-xs active:scale-95 transition-all">
                                NEXT
                            </button>
                        </motion.div>
                    )}

                    {/* STEP 4: PROFILE PIC */}
                    {step === 'profile-pic' && (
                        <motion.div
                            key="profile-pic"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="space-y-8 text-center"
                        >
                            <h1 className="text-xl font-black text-white tracking-tight uppercase">Profile <span className="text-[#FBBF24]">Picture</span></h1>

                            <div className="flex flex-col items-center gap-6">
                                <div className="relative">
                                    <div className="w-32 h-32 rounded-3xl bg-slate-900 border-2 border-dashed border-slate-800 flex items-center justify-center overflow-hidden relative">
                                        {profileImage ? (
                                            <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <Camera size={40} className={`transition-colors ${uploadState === 'uploading' ? 'animate-pulse text-[#FBBF24]' : 'text-slate-700'}`} />
                                        )}
                                        {uploadState === 'uploading' && (
                                            <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center">
                                                <Loader2 size={32} className="animate-spin text-[#FBBF24]" />
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            disabled={uploadState === 'uploading'}
                                            className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                        />
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 bg-[#FBBF24] text-slate-950 p-2 rounded-xl shadow-lg border-2 border-[#020617]">
                                        <Plus size={16} strokeWidth={3} />
                                    </div>
                                </div>

                                {uploadState === 'done' ? (
                                    <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                                        <ShieldCheck size={14} className="text-emerald-400" />
                                        <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-[0.2em]">Image Saved</span>
                                    </div>
                                ) : (
                                    <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest leading-relaxed">
                                        Tap box to upload identity icon
                                    </p>
                                )}
                            </div>

                            <button
                                onClick={handleSignup}
                                disabled={loading || uploadState === 'uploading'}
                                className="w-full bg-[#FBBF24] text-slate-950 font-black py-4 rounded-2xl shadow-lg group active:scale-95 transition-all text-sm uppercase tracking-widest"
                            >
                                {loading ? <Loader2 size={20} className="animate-spin mx-auto" /> : 'CREATE ACCOUNT'}
                            </button>

                            <button onClick={handleSignup} className="text-slate-600 text-[10px] font-black uppercase tracking-widest hover:text-slate-400 transition-colors">
                                Skip for now
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Footer Selection */}
                <p className="mt-10 text-center">
                    <span className="text-slate-600 text-[11px] font-medium uppercase tracking-widest">Already a Trader?</span>
                    <br />
                    <Link href="/login" className="text-[#FBBF24] font-black text-sm uppercase tracking-tight hover:underline transition-all inline-block mt-1">
                        Log In
                    </Link>

                    <div className="mt-8 pt-6 border-t border-slate-900/50 space-y-2 opacity-40">
                        <p className="text-[9px] text-slate-500 leading-relaxed uppercase tracking-wider">
                            By creating an account, you agree to our
                        </p>
                        <div className="flex justify-center gap-4 text-[10px] font-bold uppercase">
                            <Link href="/terms" className="text-slate-400 hover:text-white underline decoration-slate-800">Terms & Conditions</Link>
                            <Link href="/privacy" className="text-slate-400 hover:text-white underline decoration-slate-800">Privacy Policy</Link>
                        </div>
                    </div>
                </p>
            </div>

            {/* Error Log */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="fixed bottom-6 left-6 right-6 bg-rose-500/10 border border-rose-500/20 backdrop-blur-xl p-4 rounded-2xl shadow-2xl z-50 border-l-4 border-l-rose-500"
                >
                    <p className="text-rose-500 font-black text-[10px] uppercase tracking-widest mb-1">System Error Log</p>
                    <p className="text-rose-400 text-[11px] font-mono leading-tight">{error}</p>
                </motion.div>
            )}
        </div>
    );
}

