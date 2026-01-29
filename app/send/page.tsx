
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Send } from 'lucide-react';
import useSWR from 'swr';

import { Suspense } from 'react';

// ... other imports

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function SendPageContent() {
    // ... existing logic of SendPage ...
    const router = useRouter();
    const searchParams = useSearchParams();
    const [receiverUsername, setReceiverUsername] = useState(searchParams.get('to') || '');
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const { data: userData } = useSWR('/api/user', fetcher);

    const handleSend = async (e: React.FormEvent) => {
        // ... same handleSend logic ...
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/transfer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ receiverUsername, amount }),
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess(true);
                setTimeout(() => router.push('/dashboard'), 2000);
            } else {
                setError(data.error || 'Transfer failed');
            }
        } catch (err) {
            setError('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-green-50 p-4">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 animate-bounce">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-green-800 mb-2">Payment Successful!</h2>
                <p className="text-green-600">Sent ₹{amount} to {receiverUsername}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <div className="bg-white p-4 shadow-sm flex items-center gap-4">
                <Link href="/dashboard" className="text-gray-600">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-lg font-semibold text-gray-900">Send Money</h1>
            </div>

            <div className="p-6 flex-1">
                <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                    <p className="text-sm text-gray-500 mb-4">Current Balance: <span className="font-bold text-gray-900">₹{userData?.user?.balance?.toFixed(2) || '...'}</span></p>

                    <form onSubmit={handleSend} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                            <input
                                type="text"
                                value={receiverUsername}
                                onChange={(e) => setReceiverUsername(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-lg text-black placeholder:text-gray-400"
                                placeholder="Username"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-xl">₹</span>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-2xl font-bold text-gray-900 placeholder:text-gray-300"
                                    placeholder="0"
                                    required
                                    min="1"
                                    step="0.01"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm text-center">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Processing...' : (
                                <>
                                    Pay <Send size={20} />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default function SendPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading...</div>}>
            <SendPageContent />
        </Suspense>
    );
}
