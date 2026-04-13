'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Eye,
    EyeOff,
    Lock,
    User,
    ArrowRight,
    ShieldCheck,
    Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { LOGO_URL } from '@/lib/cloudinary';

export default function LoginPage() {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const preset = params.get('preset_username');
        if (preset) {
            setIdentifier(preset);
        }
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, password }),
            });

            const data = await res.json();

            if (res.ok) {
                // Set Up Multi-account cache
                try {
                    const accounts = JSON.parse(localStorage.getItem('pm_accounts') || '[]');
                    const existingIdx = accounts.findIndex((a: any) => a.id === data.user.id);
                    const acctData = {
                        id: data.user.id,
                        username: data.user.username,
                        isMainAccount: data.user.isMainAccount,
                        parentAccountId: data.user.parentAccountId,
                        profileImage: data.user.profileImage,
                        switchToken: data.switchToken,
                        lastActive: Date.now()
                    };
                    if (existingIdx > -1) {
                        accounts[existingIdx] = { ...accounts[existingIdx], ...acctData };
                    } else {
                        accounts.push(acctData);
                    }

                    // Discover Finance Accounts from backend
                    if (data.user.financeAccounts && Array.isArray(data.user.financeAccounts)) {
                        data.user.financeAccounts.forEach((financeNode: any) => {
                            const fIdx = accounts.findIndex((a: any) => a.id === financeNode.id);
                            if (fIdx === -1) {
                                accounts.push({
                                    id: financeNode.id,
                                    username: financeNode.username,
                                    profileImage: financeNode.profileImage,
                                    isMainAccount: false,
                                    parentAccountId: data.user.id,
                                });
                            }
                        });
                    }
                    localStorage.setItem('pm_accounts', JSON.stringify(accounts));
                } catch (e) {
                    console.error('Failed to save account to device');
                }

                if (data.user.isAdmin) {
                    router.push('/admin');
                } else {
                    router.push('/home');
                }
            } else {
                setError(data.error || 'Identity verification failed');
            }
        } catch (err) {
            setError('Connection failure');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-400/10 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-400/5 blur-[150px] rounded-full pointer-events-none" />

            <div className="w-full max-w-md relative z-10">
                {/* Logo Section */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center mb-4"
                >
                    <img
                        src={LOGO_URL}
                        alt="Bid Wars"
                        className="h-16 w-auto drop-shadow-[0_4px_30px_rgba(34,211,238,0.2)]"
                    />
                    <div className="mt-2 flex items-center gap-2">
                        <div className="h-px w-6 bg-gradient-to-r from-transparent to-slate-700" />
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em]">Secure Login</span>
                        <div className="h-px w-6 bg-gradient-to-l from-transparent to-slate-700" />
                    </div>
                </motion.div>

                {/* Main Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#0f172a] border border-white/5 shadow-2xl rounded-[2rem] p-5 md:p-7 relative overflow-hidden"
                >


                    <div className="mb-4 text-center border-b border-white/5 pb-3">
                        <h1 className="text-lg font-black text-white tracking-tight uppercase">Welcome <span className="text-[#FBBF24]">Trader</span></h1>
                        <p className="text-slate-500 text-[9px] uppercase tracking-widest mt-0.5">Resume your journey</p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl mb-4 text-[11px] font-medium flex items-center gap-3"
                        >
                            <div className="w-1 h-1 bg-rose-500 rounded-full animate-pulse" />
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-3">
                        {/* Username */}
                        <div className="space-y-1">
                            <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1 leading-tight block">Username / Email / Phone</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors">
                                    <User size={14} />
                                </div>
                                <input
                                    type="text"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    className="w-full pl-10 pr-5 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:border-blue-400/50 outline-none transition-all text-white font-mono text-xs placeholder:text-slate-800"
                                    placeholder="Username, Email, or Phone"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-tight block">Password</label>
                            </div>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors">
                                    <Lock size={14} />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-10 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:border-blue-400/50 outline-none transition-all text-white font-mono text-xs placeholder:text-slate-800"
                                    placeholder="Enter your password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full group bg-[#FBBF24] text-slate-950 font-black py-3.5 rounded-xl flex items-center justify-center gap-3 transition-all hover:scale-[1.01] active:scale-95 shadow-lg relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />
                            {loading ? <Loader2 size={18} className="animate-spin" /> : (
                                <>
                                    LOGIN
                                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-4 flex items-center gap-3 text-slate-700">
                        <div className="h-px bg-slate-800/50 flex-1" />
                        <span className="text-[8px] font-black uppercase tracking-widest">Connect Via</span>
                        <div className="h-px bg-slate-800/50 flex-1" />
                    </div>

                    <div className="mt-3">
                        <Link
                            href="/api/auth/google?mode=login"
                            className="w-full bg-white text-slate-950 border border-white py-2.5 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-[#FBBF24] hover:border-[#FBBF24] transition-all active:scale-[0.98]"
                        >
                            <img src="https://www.google.com/favicon.ico" className="w-3.5 h-3.5" />
                            Google Login
                        </Link>
                    </div>
                </motion.div>

                <p className="mt-4 text-center">
                    <span className="text-slate-600 text-[10px] font-medium uppercase tracking-widest leading-none">New to Bid Wars?</span>
                    <br />
                    <Link href="/signup" className="text-[#FBBF24] font-black text-xs uppercase tracking-tight hover:underline transition-all inline-block mt-0.5">
                        Create Account
                    </Link>
                    <span className="text-slate-700 mx-2 text-xs">·</span>
                    <Link href="/forgot-password" className="text-slate-500 font-black text-xs uppercase tracking-tight hover:text-slate-300 transition-all inline-block mt-0.5">
                        Forgot Password
                    </Link>

                    <div className="mt-4 pt-4 border-t border-slate-900/50 space-y-1.5 opacity-40">
                        <p className="text-[8px] text-slate-500 leading-relaxed uppercase tracking-wider">
                            By signing in, you agree to our
                        </p>
                        <div className="flex justify-center gap-4 text-[9px] font-bold uppercase">
                            <Link href="/terms" className="text-slate-400 hover:text-white underline decoration-slate-800">Terms & Conditions</Link>
                            <Link href="/privacy" className="text-slate-400 hover:text-white underline decoration-slate-800">Privacy Policy</Link>
                        </div>
                    </div>
                </p>
            </div>

            {/* Footer Tag */}
            <div className="mt-6 opacity-20 pointer-events-none">
                <p className="font-mono text-[8px] text-slate-600 tracking-[0.4em] uppercase">Paper Money Secure Protocol</p>
            </div>
        </div>
    );
}
