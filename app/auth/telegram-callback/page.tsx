'use client';

// This page reads search params at runtime — must not be statically prerendered
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { LOGO_URL } from '@/lib/cloudinary';

type State = 'loading' | 'success' | 'error';

export default function TelegramCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('s');

    const [state, setState] = useState<State>('loading');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (!sessionId) {
            setState('error');
            setErrorMsg('No session found. Please start over from the website.');
            return;
        }

        const verify = async () => {
            try {
                const res = await fetch(`/api/auth/telegram/status?s=${sessionId}`);
                const data = await res.json();

                if (data.status === 'verified' && data.telegramId) {
                    // Store everything signup page needs to resume
                    sessionStorage.setItem(
                        'tg_auth',
                        JSON.stringify({
                            sessionId,
                            telegramId: data.telegramId,
                            username: data.username || '',
                        })
                    );
                    setState('success');
                    // Brief success display, then redirect
                    setTimeout(() => router.replace('/signup'), 1800);
                } else if (data.status === 'expired' || !data.status) {
                    setState('error');
                    setErrorMsg('This verification link has expired. Please go back and try again.');
                } else {
                    // Still pending — shouldn't happen via this URL, but handle gracefully
                    setState('error');
                    setErrorMsg('Verification not yet complete. Please tap Start in the Telegram bot first.');
                }
            } catch {
                setState('error');
                setErrorMsg('Something went wrong. Please go back and try again.');
            }
        };

        verify();
    }, [sessionId, router]);

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-400/10 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-yellow-900/5 blur-[150px] rounded-full pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-sm text-center relative z-10"
            >
                <img src={LOGO_URL} alt="Bid Wars" className="h-14 w-auto object-contain mx-auto mb-8" />

                <div className="bg-[#0f172a] border border-white/5 rounded-[2rem] p-8">
                    {state === 'loading' && (
                        <div className="space-y-4">
                            <Loader2 size={40} className="animate-spin text-blue-400 mx-auto" />
                            <h2 className="text-white font-black uppercase tracking-widest text-sm">Confirming Identity...</h2>
                            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Talking to our verification server</p>
                        </div>
                    )}

                    {state === 'success' && (
                        <div className="space-y-4">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', damping: 12 }}
                            >
                                <CheckCircle2 size={48} className="text-emerald-400 mx-auto" />
                            </motion.div>
                            <h2 className="text-white font-black uppercase tracking-widest text-sm">Identity Confirmed!</h2>
                            <p className="text-slate-400 text-[11px] leading-relaxed">
                                Returning you to the signup form...
                            </p>
                            <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: '0%' }}
                                    animate={{ width: '100%' }}
                                    transition={{ duration: 1.8, ease: 'linear' }}
                                    className="h-full bg-emerald-400 rounded-full"
                                />
                            </div>
                        </div>
                    )}

                    {state === 'error' && (
                        <div className="space-y-4">
                            <XCircle size={48} className="text-rose-400 mx-auto" />
                            <h2 className="text-white font-black uppercase tracking-widest text-sm">Verification Failed</h2>
                            <p className="text-slate-400 text-[11px] leading-relaxed">{errorMsg}</p>
                            <button
                                onClick={() => router.replace('/signup')}
                                className="w-full bg-[#FBBF24] text-slate-950 font-black py-3 rounded-2xl text-xs uppercase tracking-widest active:scale-95 transition-all"
                            >
                                Back to Signup
                            </button>
                        </div>
                    )}
                </div>

                <p className="mt-6 text-[9px] text-slate-700 uppercase font-bold tracking-widest">
                    Bid Wars · Secure Telegram Auth
                </p>
            </motion.div>
        </div>
    );
}
