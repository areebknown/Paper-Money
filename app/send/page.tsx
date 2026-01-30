'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import useSWR from 'swr';
import { Suspense } from 'react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function SendPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [receiverUsername, setReceiverUsername] = useState(searchParams.get('to') || '');
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isOptimistic, setIsOptimistic] = useState(false);

    const { data: userData } = useSWR('/api/user', fetcher);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const sendAmount = parseFloat(amount);
        if (isNaN(sendAmount) || sendAmount <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        if (userData?.user?.balance < sendAmount) {
            setError(`Insufficient balance. You have ₹${userData.user.balance}`);
            return;
        }

        // --- OPTIMISTIC UI: START ---
        // Trigger success immediately for that "Instant" feel
        setSuccess(true);
        setIsOptimistic(true);
        // ----------------------------

        try {
            const res = await fetch('/api/transfer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    receiverUsername: receiverUsername.trim(),
                    amount: sendAmount
                }),
            });
            const data = await res.json();

            if (res.ok) {
                // Confirmed by server
                setIsOptimistic(false);
                // Redirect after a short delay so they can enjoy the success screen
                setTimeout(() => router.push('/dashboard'), 2500);
            } else {
                // --- ROLLBACK: Server rejected the transaction ---
                setSuccess(false);
                setIsOptimistic(false);
                setError(data.error || 'Transfer failed. Please check the username.');
            }
        } catch (err) {
            // --- ROLLBACK: Network or other error ---
            setSuccess(false);
            setIsOptimistic(false);
            setError('Network error. Transaction might not have gone through.');
        }
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4 animate-in fade-in duration-500">
                <div className="relative">
                    <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-8 animate-in zoom-in duration-500">
                        <CheckCircle2 size={48} className="text-emerald-600 animate-in slide-in-from-bottom-4" />
                    </div>
                    {/* Ring animation */}
                    <div className="absolute inset-0 w-24 h-24 border-4 border-emerald-500 rounded-full animate-ping opacity-20"></div>
                </div>

                <h2 className="text-3xl font-black text-gray-900 mb-2">Money Sent!</h2>
                <div className="flex items-center gap-2 mb-8 bg-emerald-50 px-4 py-2 rounded-full">
                    <span className="text-emerald-700 font-bold text-xl">₹{parseFloat(amount).toFixed(2)}</span>
                    <span className="text-emerald-600/60 font-medium">to</span>
                    <span className="text-emerald-800 font-bold">@{receiverUsername}</span>
                </div>

                {isOptimistic ? (
                    <div className="flex items-center gap-2 text-gray-400 text-sm italic animate-pulse">
                        Securing transaction...
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-4">
                        <p className="text-gray-500 font-medium">Redirecting to Dashboard...</p>
                        <div className="w-48 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 w-full animate-in slide-in-from-left duration-[2500ms] ease-linear"></div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <div className="bg-white p-4 shadow-sm flex items-center gap-4 sticky top-0 z-10 transition-colors">
                <Link href="/dashboard" className="text-gray-600 hover:text-indigo-600 transition-colors">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-lg font-bold text-gray-900 tracking-tight">Send Money</h1>
            </div>

            <div className="p-6 flex-1 max-w-md mx-auto w-full">
                <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100/50 p-8 mb-6 border border-indigo-50/50">
                    <div className="flex justify-between items-center mb-8 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/20">
                        <span className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">Available Balance</span>
                        <span className="font-black text-indigo-900 text-xl">₹{userData?.user?.balance?.toFixed(2) || '...'}</span>
                    </div>

                    <form onSubmit={handleSend} className="space-y-8">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Recipient Username</label>
                            <input
                                type="text"
                                value={receiverUsername}
                                onChange={(e) => setReceiverUsername(e.target.value)}
                                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-xl font-bold text-gray-900 placeholder:text-gray-300"
                                placeholder="@username"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Amount to Transfer</label>
                            <div className="relative group">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-black text-2xl group-focus-within:text-indigo-600 transition-colors">₹</span>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full pl-12 pr-5 py-5 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-4xl font-black text-gray-900 placeholder:text-gray-200"
                                    placeholder="0.00"
                                    required
                                    min="1"
                                    step="0.01"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold text-center border border-red-100 animate-in shake duration-300">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-indigo-200 flex items-center justify-center gap-3 text-xl group"
                        >
                            Pay Securely <Send size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </button>
                    </form>
                </div>

                <p className="text-center text-xs text-gray-400 font-medium px-4">
                    Your payments are encrypted and protected by PaperPay Security.
                </p>
            </div>
        </div>
    );
}

export default function SendPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-gray-500 animate-pulse">Loading secure gateway...</div>}>
            <SendPageContent />
        </Suspense>
    );
}
