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
                    className="flex flex-col items-center mb-6"
                >
                    <img 
                        src={LOGO_URL} 
                        alt="Bid Wars" 
                        className="h-10 w-auto drop-shadow-[0_0_20px_rgba(251,191,36,0.15)]"
                    />
                    <div className="mt-3 flex items-center gap-2">
                        <div className="h-px w-6 bg-gradient-to-r from-transparent to-slate-700" />
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em]">Secure Auth Port</span>
                        <div className="h-px w-6 bg-gradient-to-l from-transparent to-slate-700" />
                    </div>
                </motion.div>

                {/* Main Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#0f172a] border border-white/5 shadow-2xl rounded-3xl p-6 md:p-8 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <ShieldCheck size={80} className="text-white" />
                    </div>

                    <div className="mb-6 text-left border-b border-white/5 pb-4">
                        <h1 className="text-xl font-black text-white tracking-tight uppercase">Terminal <span className="text-cyan-400">Login</span></h1>
                        <p className="text-slate-500 text-[10px] uppercase tracking-widest mt-1">Authorized identities only</p>
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

                    <form onSubmit={handleLogin} className="space-y-4">
                        {/* Username */}
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 leading-tight block">User Identifier</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                                    <User size={16} />
                                </div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pl-11 pr-5 py-3.5 bg-slate-950/50 border border-slate-800 rounded-xl focus:border-cyan-500/50 outline-none transition-all text-white font-mono text-sm placeholder:text-slate-800"
                                    placeholder="handle_v1.0"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-tight block">Access Pin</label>
                            </div>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                                    <Lock size={16} />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-11 pr-11 py-3.5 bg-slate-950/50 border border-slate-800 rounded-xl focus:border-cyan-500/50 outline-none transition-all text-white font-mono text-sm placeholder:text-slate-800"
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
                            className="w-full group bg-cyan-500 text-slate-950 font-black py-4 rounded-xl flex items-center justify-center gap-3 transition-all hover:scale-[1.01] active:scale-95 shadow-lg relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />
                            {loading ? <Loader2 size={20} className="animate-spin" /> : (
                                <>
                                    SYNC IDENTITY
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-5 flex items-center gap-3 text-slate-700">
                        <div className="h-px bg-slate-800/50 flex-1" />
                        <span className="text-[8px] font-black uppercase tracking-widest">Connect Via</span>
                        <div className="h-px bg-slate-800/50 flex-1" />
                    </div>

                    <div className="mt-4">
                        <Link 
                            href="/api/auth/google" 
                            className="w-full bg-slate-950/50 border border-slate-800 py-3 rounded-xl flex items-center justify-center gap-2 text-slate-400 text-xs font-bold hover:bg-slate-900 hover:text-white transition-all active:scale-[0.98]"
                        >
                            <img src="https://www.google.com/favicon.ico" className="w-4 h-4 grayscale opacity-50" />
                            Google Auth
                        </Link>
                    </div>
                </motion.div>

                <p className="mt-6 text-center text-slate-600 text-[11px] font-medium leading-relaxed">
                    New user?{' '}
                    <Link href="/signup" className="text-cyan-500 font-black hover:underline tracking-tight">
                        Create Account
                    </Link>
                    <br/>
                    <span className="opacity-50">By syncing identity, you agree to our </span>
                    <Link href="/terms" className="text-slate-400 hover:text-white underline decoration-slate-800 transition-colors">Protocol of Conduct</Link>
                    <span className="opacity-50"> & </span>
                    <Link href="/privacy" className="text-slate-400 hover:text-white underline decoration-slate-800 transition-colors">Privacy Protocol</Link>
                </p>
            </div>

            {/* Footer Tag */}
            <div className="mt-6 opacity-20 pointer-events-none">
                <p className="font-mono text-[8px] text-slate-600 tracking-[0.4em] uppercase">Paper Money Secure Protocol</p>
            </div>
        </div>
    );
}
