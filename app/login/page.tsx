'use client';

import { useState } from 'react';
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
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (res.ok) {
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
        <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 relative overflow-hidden font-['Inter']">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-900/10 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-900/10 blur-[150px] rounded-full pointer-events-none" />

            <div className="w-full max-w-md relative z-10">
                {/* Logo Section */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center mb-10"
                >
                    <img 
                        src={LOGO_URL} 
                        alt="Bid Wars" 
                        className="h-20 w-auto drop-shadow-[0_0_20px_rgba(251,191,36,0.15)]"
                    />
                    <div className="mt-4 flex items-center gap-2">
                        <div className="h-px w-8 bg-gradient-to-r from-transparent to-slate-700" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] pl-1">Authorized Access Only</span>
                        <div className="h-px w-8 bg-gradient-to-l from-transparent to-slate-700" />
                    </div>
                </motion.div>

                {/* Main Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#0f172a] border border-white/5 shadow-2xl rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                        <ShieldCheck size={120} className="text-white" />
                    </div>

                    <div className="mb-10 text-left">
                        <h1 className="text-3xl font-black text-white tracking-tight leading-tight">SECURE <span className="text-cyan-400">LOGIN</span></h1>
                        <p className="text-slate-400 text-sm mt-2">Enter your identity credentials</p>
                    </div>

                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl mb-6 text-sm font-medium flex items-center gap-3"
                        >
                            <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        {/* Username */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 leading-tight block">Username Handle</label>
                            <div className="relative group">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                                    <User size={18} />
                                </div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pl-12 pr-6 py-5 bg-slate-900 border-2 border-slate-800 rounded-2xl focus:border-cyan-500 outline-none transition-all text-white font-mono placeholder:text-slate-700"
                                    placeholder="your_handle"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-tight block">Security Pin</label>
                                <Link href="/api/auth/forgot-password" title="Recover account" className="text-[10px] font-bold text-cyan-500 uppercase tracking-wider hover:text-cyan-400 transition-colors">Recover</Link>
                            </div>
                            <div className="relative group">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-12 py-5 bg-slate-900 border-2 border-slate-800 rounded-2xl focus:border-cyan-500 outline-none transition-all text-white font-mono placeholder:text-slate-700"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full group bg-cyan-500 text-slate-950 font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 shadow-[0_10px_40px_rgba(6,182,212,0.25)] relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />
                            {loading ? <Loader2 size={24} className="animate-spin" /> : (
                                <>
                                    ENTER SYSTEM
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 flex items-center gap-4 text-slate-600">
                        <div className="h-px bg-slate-800 flex-1" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">or login with</span>
                        <div className="h-px bg-slate-800 flex-1" />
                    </div>

                    <div className="mt-6">
                        <button className="w-full bg-slate-900 border border-slate-800 py-4 rounded-2xl flex items-center justify-center gap-3 text-slate-300 font-bold hover:bg-slate-800 hover:text-white transition-all active:scale-[0.98]">
                            <img src="https://www.google.com/favicon.ico" className="w-5 h-5 grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100" />
                            Connect via Google
                        </button>
                    </div>
                </motion.div>

                <p className="mt-10 text-center text-slate-500 text-sm">
                    Don't have an identity yet?{' '}
                    <Link href="/signup" className="text-cyan-400 font-black hover:underline tracking-tight">
                        Create Account
                    </Link>
                </p>
            </div>

            {/* Footer Tag */}
            <div className="mt-12 opacity-30 pointer-events-none">
                <p className="font-mono text-[9px] text-slate-600 tracking-[0.4em] uppercase">Paper Money Secure Protocol v2.5.0</p>
            </div>
        </div>
    );
}
