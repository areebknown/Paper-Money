'use client';

import { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { QrCode, Send, X, ArrowDownLeft, ArrowUpRight, Bell, ShieldAlert, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface DashboardClientProps {
    fallbackData?: any;
}

export default function DashboardClient({ fallbackData }: DashboardClientProps) {
    const { data, error, isLoading } = useSWR('/api/user', fetcher, {
        refreshInterval: 2000, // Poll every 2 seconds
        fallbackData,
        revalidateOnFocus: true,
        revalidateIfStale: true,
        shouldRetryOnError: true,
        errorRetryInterval: 3000,
    });

    const router = useRouter();
    const [showQR, setShowQR] = useState(false);
    const [newReceipt, setNewReceipt] = useState<any>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const lastTransactionId = useRef<string | null>(null);

    // Notification Logic
    useEffect(() => {
        if (data?.history && data.history.length > 0) {
            const latest = data.history[0];

            // If it's a new "RECEIVED" transaction that we haven't acknowledged yet
            if (
                lastTransactionId.current &&
                latest.id !== lastTransactionId.current &&
                latest.type === 'RECEIVED'
            ) {
                setNewReceipt(latest);
                // Auto-dismiss after 5 seconds
                const timer = setTimeout(() => setNewReceipt(null), 5000);
                return () => clearTimeout(timer);
            }

            // Initialize or update the stable reference
            if (!lastTransactionId.current) {
                lastTransactionId.current = latest.id;
            } else if (latest.id !== lastTransactionId.current) {
                lastTransactionId.current = latest.id;
            }
        }
    }, [data?.history]);

    // ONLY show full-screen error if we have NO data at all
    if (error && !data) return <div className="p-8 text-center text-red-500">Failed to load data. Please check your connection.</div>;

    // Note: With fallbackData and cache, we prioritize showing the UI
    if (isLoading && !data) return <div className="p-8 text-center text-gray-500">Loading your profile...</div>;
    if (!data || !data.user) return <div className="p-8 text-center text-gray-500">Connecting to secure server...</div>;

    const { user, history } = data;

    return (
        <div className="flex flex-col h-full relative">
            {/* Receipt Notification Toast */}
            {newReceipt && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] w-[90%] max-w-sm animate-in slide-in-from-top-4 duration-300">
                    <div className="bg-emerald-600 text-white p-4 rounded-2xl shadow-xl flex items-center justify-between border border-emerald-500/50 backdrop-blur-md bg-opacity-95">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <Bell size={20} className="animate-bounce" />
                            </div>
                            <div>
                                <p className="text-xs font-medium opacity-80">Money Received!</p>
                                <p className="font-bold">₹{newReceipt.amount.toFixed(2)} from {newReceipt.otherUser}</p>
                            </div>
                        </div>
                        <button onClick={() => setNewReceipt(null)} className="p-1 hover:bg-white/10 rounded-full">
                            <X size={18} />
                        </button>
                    </div>
                </div>
            )}

            {/* QR Modal */}
            {showQR && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-sm flex flex-col items-center shadow-2xl relative">
                        <button
                            onClick={() => setShowQR(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2"
                        >
                            <X size={24} />
                        </button>

                        <h3 className="text-xl font-bold text-gray-800 mb-2">Receive Money</h3>
                        <p className="text-gray-500 text-sm mb-6 text-center">Show this QR code to receive payments</p>

                        <div className="p-4 bg-white border-2 border-indigo-100 rounded-2xl shadow-sm mb-6">
                            <QRCodeSVG
                                value={user.username}
                                size={200}
                                level="H"
                                fgColor="#4F46E5"
                            />
                        </div>

                        <div className="text-center">
                            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Username</p>
                            <p className="text-2xl font-bold text-indigo-600">@{user.username}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Header / Balance Card */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-6 rounded-b-3xl shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <p className="text-indigo-100 text-sm font-medium mb-1">Total Balance</p>
                            <h1 className="text-4xl font-bold">₹ {user.balance.toFixed(2)}</h1>
                        </div>
                        <button
                            onClick={() => setShowQR(true)}
                            className="bg-white/20 p-2 rounded-full cursor-pointer hover:bg-white/30 transition shadow-lg backdrop-blur-sm"
                        >
                            <QrCode size={24} />
                        </button>
                    </div>
                    <p className="text-sm text-indigo-200">Hello, {user.username}</p>
                </div>

                {/* Suspension Badge */}
                {user.isSuspended && (
                    <div className="absolute bottom-4 right-4 animate-in slide-in-from-right-4 duration-500">
                        <div className="bg-red-500/20 backdrop-blur-md border border-red-400/30 text-white px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-lg">
                            <ShieldAlert size={14} className="text-red-300" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-red-100">Account Restricted</span>
                        </div>
                    </div>
                )}

                {/* Decorative circles */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-10 -mb-10 blur-xl"></div>
            </div>

            {/* Quick Actions */}
            <div className="p-6">
                <h2 className="text-gray-800 font-semibold mb-4 text-sm uppercase tracking-wider">Quick Actions</h2>
                <div className="grid grid-cols-3 gap-3">
                    <Link href="/send" className="flex flex-col items-center gap-2 group p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-indigo-100 hover:shadow-md transition-all">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Send size={20} />
                        </div>
                        <span className="text-[10px] text-gray-600 font-bold uppercase tracking-tighter">Send</span>
                    </Link>
                    <Link href="/scan" className="flex flex-col items-center gap-2 group p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-purple-100 hover:shadow-md transition-all">
                        <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <QrCode size={20} />
                        </div>
                        <span className="text-[10px] text-gray-600 font-bold uppercase tracking-tighter">Scan</span>
                    </Link>
                    <Link href="/market" className="flex flex-col items-center gap-2 group p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-emerald-100 hover:shadow-md transition-all">
                        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <TrendingUp size={20} />
                        </div>
                        <span className="text-[10px] text-gray-600 font-bold uppercase tracking-tighter">Market</span>
                    </Link>
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="flex-1 bg-gray-50 rounded-t-3xl p-6 shadow-inner overflow-hidden flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-gray-800 font-semibold text-lg">Recent Transactions</h2>
                    <Link href="/history" className="text-indigo-600 text-sm font-medium hover:underline">View All</Link>
                </div>

                <div className="space-y-4 overflow-y-auto pb-20 no-scrollbar">
                    {history.length === 0 ? (
                        isLoading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-xl"></div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400 text-center py-8">No transactions yet</p>
                        )
                    ) : (
                        history.map((t: any) => (
                            <div
                                key={t.id}
                                onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}
                                className={cn(
                                    "flex flex-col p-4 bg-white rounded-xl shadow-sm border border-gray-100 transition-all cursor-pointer",
                                    expandedId === t.id ? "ring-2 ring-indigo-500 shadow-md transform scale-[1.02]" : "hover:bg-gray-50"
                                )}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center",
                                            t.type === 'RECEIVED' ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
                                        )}>
                                            {t.type === 'RECEIVED' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{t.otherUser}</p>
                                            <p className="text-xs text-gray-500">{new Date(t.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={cn(
                                            "font-bold",
                                            t.type === 'RECEIVED' ? "text-emerald-600" : "text-gray-900"
                                        )}>
                                            {t.type === 'RECEIVED' ? '+' : '-'} ₹{t.amount.toFixed(2)}
                                        </p>
                                        <p className="text-xs text-gray-400 capitalize">{t.status.toLowerCase()}</p>
                                    </div>
                                </div>

                                {/* Pay Again Action */}
                                {expandedId === t.id && (
                                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end animate-in fade-in slide-in-from-top-2 duration-200">
                                        <Link
                                            href={`/send?to=${t.otherUser}`}
                                            onClick={(e) => e.stopPropagation()}
                                            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition shadow-md shadow-indigo-100"
                                        >
                                            <Send size={14} /> Pay Again
                                        </Link>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
