
'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import useSWR from 'swr';
import { cn } from '@/lib/utils';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function HistoryPage() {
    const { data, error, isLoading } = useSWR('/api/user', fetcher);

    if (error) return <div className="p-8 text-center text-red-500">Failed to load data</div>;
    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

    const { history } = data;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <div className="bg-white p-4 shadow-sm flex items-center gap-4 sticky top-0 z-10">
                <Link href="/dashboard" className="text-gray-600">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-lg font-semibold">Transaction History</h1>
            </div>

            <div className="p-4 space-y-4">
                {history.length === 0 ? (
                    <p className="text-center text-gray-500 mt-10">No transactions found.</p>
                ) : (
                    history.map((t: any) => (
                        <div key={t.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "w-12 h-12 rounded-full flex items-center justify-center",
                                    t.type === 'RECEIVED' ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
                                )}>
                                    {t.type === 'RECEIVED' ? <ArrowDownLeft size={24} /> : <ArrowUpRight size={24} />}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">{t.otherUser}</p>
                                    <p className="text-xs text-gray-500">{new Date(t.createdAt).toLocaleString()}</p>
                                    <p className="text-xs text-gray-400 mt-1">Ref: {t.id.slice(0, 8)}...</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={cn(
                                    "font-bold text-lg",
                                    t.type === 'RECEIVED' ? "text-emerald-600" : "text-gray-900"
                                )}>
                                    {t.type === 'RECEIVED' ? '+' : '-'} ₹{t.amount.toFixed(2)}
                                </p>
                                <span className={cn(
                                    "text-xs px-2 py-1 rounded-full",
                                    t.status === 'COMPLETED' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                )}>
                                    {t.status}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
