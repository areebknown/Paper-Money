
'use client';

import { useState } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { QrCode, Send, X, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DashboardPage() {
    const { data, error, isLoading } = useSWR('/api/user', fetcher);
    const router = useRouter();
    const [showQR, setShowQR] = useState(false);

    if (error) return <div className="p-8 text-center text-red-500">Failed to load data</div>;
    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

    const { user, history } = data;

    return (
        <div className="flex flex-col h-full relative">
            {/* QR Modal */}
            {showQR && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
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

                {/* Decorative circles */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-10 -mb-10 blur-xl"></div>
            </div>

            {/* Quick Actions */}
            <div className="p-6">
                <h2 className="text-gray-800 font-semibold mb-4 text-sm uppercase tracking-wider">Quick Actions</h2>
                <div className="grid grid-cols-2 gap-4">
                    <Link href="/send" className="flex flex-col items-center gap-2 group p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-indigo-100 hover:shadow-md transition-all">
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Send size={24} />
                        </div>
                        <span className="text-sm text-gray-600 font-medium">Send to User</span>
                    </Link>
                    <Link href="/scan" className="flex flex-col items-center gap-2 group p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-purple-100 hover:shadow-md transition-all">
                        <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <QrCode size={24} />
                        </div>
                        <span className="text-sm text-gray-600 font-medium">Scan QR</span>
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
                        <p className="text-gray-400 text-center py-8">No transactions yet</p>
                    ) : (
                        history.map((t: any) => (
                            <div key={t.id} className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100">
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
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
