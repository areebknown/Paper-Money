'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ShieldCheck, Loader2, CheckCircle2, ArrowLeft, Lock } from 'lucide-react';
import { LOGO_URL } from '@/lib/cloudinary';

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

function ResetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!token) setError('Invalid or expired reset link.');
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) return setError('Passwords do not match');
        if (newPassword.length < 6) return setError('Password must be at least 6 characters');

        setLoading(true);
        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword }),
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess(true);
                setTimeout(() => router.push('/login'), 2500);
            } else {
                setError(data.error || 'Failed to reset password');
            }
        } catch {
            setError('Connection failed. Try again.');
        } finally {
            setLoading(false);
        }
    };

    const strength = (() => {
        if (!newPassword) return 0;
        let s = 0;
        if (newPassword.length >= 6) s++;
        if (newPassword.length >= 10) s++;
        if (/[A-Z]/.test(newPassword)) s++;
        if (/[0-9]/.test(newPassword)) s++;
        if (/[^A-Za-z0-9]/.test(newPassword)) s++;
        return s;
    })();

    const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][strength];
    const strengthColor = ['', 'bg-rose-500', 'bg-orange-400', 'bg-yellow-400', 'bg-emerald-400', 'bg-emerald-400'][strength];

    return (
        <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-400/10 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-yellow-900/5 blur-[150px] rounded-full pointer-events-none" />

            <div className="w-full max-w-sm relative z-10">
                {/* Logo */}
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center mb-8">
                    <img src={LOGO_URL} alt="Bid Wars" className="h-16 w-auto drop-shadow-[0_4px_30px_rgba(96,165,250,0.2)]" />
                    <div className="mt-2 flex items-center gap-2">
                        <div className="h-px w-6 bg-gradient-to-r from-transparent to-slate-700" />
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em]">Password Reset</span>
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

                    {success ? (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-6 text-center space-y-4">
                            <div className="w-16 h-16 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto">
                                <CheckCircle2 size={36} className="text-emerald-400" />
                            </div>
                            <h2 className="text-lg font-black text-white uppercase tracking-tight">Password <span className="text-emerald-400">Updated!</span></h2>
                            <p className="text-slate-400 text-[11px] leading-relaxed">Redirecting you to login in a moment...</p>
                            <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: '0%' }}
                                    animate={{ width: '100%' }}
                                    transition={{ duration: 2.5, ease: 'linear' }}
                                    className="h-full bg-emerald-400 rounded-full"
                                />
                            </div>
                        </motion.div>
                    ) : (
                        <div className="space-y-5">
                            <div className="mb-2 border-b border-white/5 pb-3">
                                <h1 className="text-lg font-black text-white tracking-tight uppercase text-center">Set New <span className="text-[#FBBF24]">Password</span></h1>
                                <p className="text-slate-500 text-[9px] uppercase tracking-widest mt-0.5 text-center">Choose something strong</p>
                            </div>

                            {!token && (
                                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-[11px] font-medium text-center">
                                    This reset link is invalid or has expired.
                                    <Link href="/forgot-password" className="block mt-1 text-[#FBBF24] font-black underline">Request a new one</Link>
                                </div>
                            )}

                            {error && (
                                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-[11px] font-medium">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* New Password */}
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1 block">New Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-400 transition-colors" size={16} />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full pl-11 pr-12 py-3.5 bg-slate-950/50 border border-slate-800 rounded-xl text-white text-sm focus:border-blue-400/50 outline-none transition-all placeholder:text-slate-700"
                                            placeholder="Min. 6 characters"
                                            required
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors">
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {/* Strength meter */}
                                    {newPassword && (
                                        <div className="space-y-1 px-1">
                                            <div className="flex gap-1">
                                                {[1, 2, 3, 4, 5].map((i) => (
                                                    <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColor : 'bg-slate-800'}`} />
                                                ))}
                                            </div>
                                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{strengthLabel}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Confirm Password */}
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1 block">Confirm Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className={`w-full pl-11 pr-4 py-3.5 bg-slate-950/50 border rounded-xl text-white text-sm outline-none transition-all placeholder:text-slate-700 ${
                                                confirmPassword && confirmPassword !== newPassword
                                                    ? 'border-rose-500/50 focus:border-rose-500'
                                                    : confirmPassword && confirmPassword === newPassword
                                                    ? 'border-emerald-500/50 focus:border-emerald-500'
                                                    : 'border-slate-800 focus:border-blue-400/50'
                                            }`}
                                            placeholder="Re-enter password"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !token || !newPassword || !confirmPassword}
                                    className="w-full bg-[#FBBF24] text-slate-950 font-black py-4 rounded-xl uppercase tracking-widest text-xs active:scale-95 transition-all disabled:opacity-40 flex items-center justify-center gap-2 shadow-lg relative overflow-hidden group"
                                >
                                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : 'Update Password'}
                                </button>
                            </form>
                        </div>
                    )}
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

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#020617] flex items-center justify-center">
                <Loader2 size={32} className="animate-spin text-blue-400" />
            </div>
        }>
            <ResetPasswordContent />
        </Suspense>
    );
}
