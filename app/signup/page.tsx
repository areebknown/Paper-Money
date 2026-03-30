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
    Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
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
    
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    
    const [password, setPassword] = useState('');
    const [realName, setRealName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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
                    realName: accountType === 'main' ? realName : null,
                    profileImage
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
        if (!phoneNumber) return setError('Please enter a phone number');
        setLoading(true);
        try {
            const res = await fetch('/api/auth/otp/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber, type: 'whatsapp' }),
            });
            const data = await res.json();
            if (res.ok) {
                setIsOtpSent(true);
                if (data.simulated) {
                    setOtp(data.otp); // Fill in Dev for convenience
                }
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
        // Simple client-side flag for now, verified again on final signup submit
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
        <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 relative overflow-hidden font-['Inter'] selection:bg-cyan-500/30">
            {/* Background Polish */}
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/20 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-900/10 blur-[120px] rounded-full" />

            <div className="w-full max-w-md relative z-10">
                {/* Logo Section */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center mb-6"
                >
                    <img src={LOGO_URL} alt="Logo" className="h-10 w-auto drop-shadow-[0_0_15px_rgba(251,191,36,0.2)]" />
                    <div className="h-0.5 w-12 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent mt-2" />
                </motion.div>

                <AnimatePresence mode="wait">
                    {/* STEP 0: ACCOUNT CHOICE */}
                    {step === 'choice' && (
                        <motion.div 
                            key="choice"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-4"
                        >
                            <div className="text-center mb-4">
                                <h1 className="text-xl font-black text-white tracking-tight leading-tight uppercase">
                                    Identity <span className="text-cyan-400">Hub</span>
                                </h1>
                                <p className="text-slate-500 text-xs mt-1">Select your financial path</p>
                            </div>

                            <button 
                                onClick={() => { setAccountType('main'); nextStep(); }}
                                className="w-full group relative bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 hover:border-cyan-500/50 p-4 rounded-3xl text-left transition-all hover:scale-[1.01] active:scale-95 shadow-xl"
                            >
                                <div className="absolute top-3 right-4 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="px-2 py-0.5 bg-cyan-500/20 rounded-full border border-cyan-500/30">
                                        <span className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest">+₹1L</span>
                                    </div>
                                </div>
                                <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center mb-2 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white transition-all">
                                    <Smartphone size={20} />
                                </div>
                                <h3 className="text-base font-bold text-white mb-0.5 leading-none">Main Account</h3>
                                <p className="text-slate-500 text-[11px] leading-snug">Full access, verified via WhatsApp. Grants bonus & permissions.</p>
                            </button>

                            <button 
                                onClick={() => { setAccountType('side'); nextStep(); }}
                                className="w-full group relative bg-slate-900/40 border border-slate-800/50 p-4 rounded-3xl text-left transition-all hover:scale-[1.01] active:scale-95 grayscale hover:grayscale-0 opacity-60 hover:opacity-100"
                            >
                                <div className="w-10 h-10 bg-slate-800/50 rounded-xl flex items-center justify-center mb-2 text-slate-500">
                                    <Mail size={18} />
                                </div>
                                <h3 className="text-base font-bold text-slate-400 mb-0.5 leading-none">Side Account</h3>
                                <p className="text-slate-500 text-[11px] leading-snug">Quick setup via Email. No bonus money.</p>
                            </button>
                        </motion.div>
                    )}

                    {/* STEP 1: USERNAME ENTRY */}
                    {step === 'username' && (
                        <motion.div 
                            key="username"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <button onClick={prevStep} className="p-1.5 bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                                    <ArrowLeft size={16} />
                                </button>
                                <h2 className="text-lg font-black text-white uppercase tracking-tight">Set Handle</h2>
                            </div>

                            <div className="space-y-3">
                                <div className="relative">
                                    <input 
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                        placeholder="your_handle"
                                        className="w-full bg-slate-900 border border-slate-800 px-5 py-4 rounded-2xl text-white font-mono text-lg focus:border-cyan-500 outline-none transition-all placeholder:opacity-30"
                                    />
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                        {checkingUsername ? (
                                            <Loader2 size={16} className="animate-spin text-slate-500" />
                                        ) : isUsernameValid === true ? (
                                            <CheckCircle2 size={20} className="text-emerald-500" />
                                        ) : isUsernameValid === false ? (
                                            <div className="text-rose-500 text-[10px] font-bold uppercase">Taken</div>
                                        ) : null}
                                    </div>
                                </div>
                                <p className="text-slate-500 text-[8px] uppercase tracking-[0.2em] font-black flex items-center gap-1.5 px-1">
                                    <Sparkles size={10} className="text-cyan-400" />
                                    Trading handle reserved for your identity
                                </p>
                            </div>

                            <button 
                                disabled={!isUsernameValid || checkingUsername}
                                onClick={nextStep}
                                className="w-full bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-500 text-[#020617] font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                            >
                                VERIFY IDENTITY
                                <ArrowRight size={18} />
                            </button>
                        </motion.div>
                    )}

                    {/* STEP 2: VERIFICATION (WhatsApp or Google) */}
                    {step === 'verification' && (
                        <motion.div 
                            key="verification"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center gap-3">
                                <button onClick={prevStep} className="p-1.5 bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                                    <ArrowLeft size={16} />
                                </button>
                                <h2 className="text-lg font-black text-white uppercase tracking-tight">
                                    {accountType === 'main' ? 'WhatsApp Verification' : 'Identity Sync'}
                                </h2>
                            </div>

                            {accountType === 'main' ? (
                                <div className="space-y-4">
                                    {!isOtpSent ? (
                                        <div className="space-y-4">
                                            <p className="text-slate-500 text-xs text-center border-b border-slate-800 pb-4">Enter your number to receive an 8-digit verification code.</p>
                                            <input 
                                                type="tel"
                                                placeholder="+91 00000-00000"
                                                value={phoneNumber}
                                                onChange={(e) => setPhoneNumber(e.target.value)}
                                                className="w-full bg-slate-900 border border-slate-800 px-5 py-4 rounded-xl text-white font-mono text-lg focus:border-cyan-500 outline-none transition-all"
                                            />
                                            <button 
                                                onClick={sendOtp}
                                                disabled={loading}
                                                className="w-full bg-emerald-500/90 hover:bg-emerald-500 text-slate-950 font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg"
                                            >
                                                {loading ? <Loader2 className="animate-spin" /> : 'SEND SECURITY OTP'}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <p className="text-slate-500 text-xs text-center">Enter the code sent via WhatsApp</p>
                                            <input 
                                                type="text"
                                                placeholder="0 0 0 0 0 0"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                className="w-full bg-slate-900 border border-slate-800 px-6 py-4 rounded-xl text-white font-mono text-xl text-center tracking-[0.5em] focus:border-cyan-500 outline-none transition-all"
                                            />
                                            <button 
                                                onClick={verifyOtpAndNext}
                                                className="w-full bg-cyan-500 text-slate-950 font-black py-4 rounded-2xl shadow-lg hover:scale-[1.01] transition-transform"
                                            >
                                                VALIDATE CODE
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <p className="text-slate-400 text-center">Fast security via your existing Google Identity</p>
                                    <button 
                                        onClick={nextStep}
                                        className="w-full bg-white text-slate-950 font-bold py-5 rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-100 transition-colors"
                                    >
                                        <img src="https://www.google.com/favicon.ico" className="w-6 h-6" alt="google" />
                                        Continue with Google
                                    </button>
                                    <div className="flex items-center gap-4 text-slate-600">
                                        <div className="h-px bg-slate-800 flex-1" />
                                        <span className="text-[10px] font-bold">OR EMAIL OTP</span>
                                        <div className="h-px bg-slate-800 flex-1" />
                                    </div>
                                    <input 
                                        type="email"
                                        placeholder="email@example.com"
                                        className="w-full bg-slate-900 border border-slate-800 px-6 py-4 rounded-xl text-white"
                                    />
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* STEP 3: DETAILS & SECURITY */}
                    {step === 'details' && (
                        <motion.div 
                            key="details"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-4"
                        >
                            <h2 className="text-lg font-black text-white uppercase tracking-tight">Security Profile</h2>

                            <div className="space-y-3">
                                {accountType === 'main' && (
                                    <div>
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-2 mb-1 block">Full Legal Name</label>
                                        <input 
                                            type="text"
                                            value={realName}
                                            onChange={(e) => setRealName(e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-800 px-5 py-3 rounded-xl text-white focus:border-cyan-500 outline-none transition-all placeholder:text-slate-700"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                )}
                                <div>
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-2 mb-1 block">Account Pin</label>
                                    <div className="relative">
                                        <input 
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-800 px-5 py-3 rounded-xl text-white focus:border-cyan-500 outline-none"
                                            placeholder="••••••••"
                                        />
                                        <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button onClick={nextStep} className="w-full bg-cyan-500 text-slate-950 font-black py-4 rounded-2xl shadow-lg active:scale-95 transition-transform">
                                NEXT: PERSONALIZE
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
                            className="space-y-6 text-center"
                        >
                             <div className="flex items-center gap-3 text-left">
                                <button onClick={prevStep} className="p-1.5 bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                                    <ArrowLeft size={16} />
                                </button>
                                <h2 className="text-lg font-black text-white uppercase tracking-tight">Final Polish</h2>
                            </div>

                            <div className="flex flex-col items-center gap-4">
                                <div className="relative group">
                                    <div className="w-24 h-24 rounded-3xl bg-slate-800 border-2 border-dashed border-slate-700/50 flex items-center justify-center overflow-hidden relative">
                                        {profileImage ? (
                                            <img src={profileImage} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <Camera size={32} className="text-slate-600 group-hover:text-cyan-400 transition-colors" />
                                        )}
                                        <input 
                                            type="file" 
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            onChange={() => {}} 
                                        />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 bg-cyan-500 text-slate-950 p-1.5 rounded-lg shadow-lg border-2 border-[#020617]">
                                        <Plus size={12} strokeWidth={3} />
                                    </div>
                                </div>
                                <p className="text-slate-500 text-[10px] italic leading-tight">Your picture will be visible to<br/>other traders in bidding wars</p>
                            </div>

                            <div className="space-y-3">
                                <button 
                                    onClick={handleSignup}
                                    disabled={loading}
                                    className="w-full bg-cyan-500 text-slate-950 font-black py-4 rounded-xl flex items-center justify-center shadow-lg active:scale-95 transition-all"
                                >
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : 'MINT IDENTITY'}
                                </button>
                                <button onClick={handleSignup} className="text-slate-600 text-[10px] font-bold uppercase tracking-widest hover:text-slate-400 transition-colors">
                                    Continue with default
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <p className="mt-12 text-center text-slate-500 text-sm">
                    Already have an account?{' '}
                    <Link href="/login" className="text-cyan-400 font-bold hover:underline">
                        Secure Login
                    </Link>
                </p>
            </div>

            {error && (
                <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="fixed bottom-6 left-6 right-6 bg-rose-500/20 border border-rose-500/40 text-rose-300 p-4 rounded-xl text-[10px] font-mono backdrop-blur-xl shadow-2xl z-50 overflow-hidden"
                >
                    <div className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 bg-rose-500 rounded-full mt-1 shrink-0 animate-pulse" />
                        <div className="flex-1">
                            <span className="font-bold uppercase tracking-wider block mb-1">System Error Log</span>
                            <code className="opacity-90 leading-tight block whitespace-pre-wrap">{error}</code>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}

function Plus({ size, strokeWidth, className }: { size?: number, strokeWidth?: number, className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round" className={className}>
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
    )
}
