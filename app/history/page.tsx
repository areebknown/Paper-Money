'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowDownLeft, ArrowUpRight, Send, Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function HistoryPage() {
    const [history, setHistory] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    // Observer ref for infinite scroll
    const observer = useRef<IntersectionObserver | null>(null);
    const lastElementRef = useCallback((node: HTMLDivElement | null) => {
        if (isLoading) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });

        if (node) observer.current.observe(node);
    }, [isLoading, hasMore]);

    const fetchHistory = async (pageNumber: number) => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/transactions?page=${pageNumber}&limit=20`);
            const data = await res.json();
            if (data.history) {
                setHistory(prev => pageNumber === 1 ? data.history : [...prev, ...data.history]);
                setHasMore(data.hasMore);
            }
        } catch (error) {
            console.error('Failed to fetch history:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory(page);
    }, [page]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <div className="bg-white p-4 shadow-sm flex items-center gap-4 sticky top-0 z-10">
                <Link href="/dashboard" className="text-gray-600">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-lg font-semibold text-gray-900">Transaction History</h1>
            </div>

            <div className="p-4 space-y-4">
                {history.length === 0 && !isLoading ? (
                    <p className="text-center text-gray-500 mt-10">No transactions found.</p>
                ) : (
                    <>
                        {history.map((t: any, index: number) => (
                            <div
                                key={t.id}
                                ref={index === history.length - 1 ? lastElementRef : null}
                                onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}
                                className={cn(
                                    "flex flex-col p-4 bg-white rounded-xl shadow-sm border border-gray-100 transition-all cursor-pointer",
                                    expandedId === t.id ? "ring-2 ring-indigo-500 shadow-md transform scale-[1.02] z-10" : "hover:bg-gray-50"
                                )}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-12 h-12 rounded-full flex items-center justify-center",
                                            t.category === 'MARKET_BUY' ? "bg-indigo-100 text-indigo-600" :
                                                t.category === 'MARKET_SELL' ? "bg-emerald-100 text-emerald-600" :
                                                    t.type === 'RECEIVED' ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                                        )}>
                                            {t.category === 'MARKET_BUY' ? <TrendingUp size={24} /> :
                                                t.category === 'MARKET_SELL' ? <TrendingDown size={24} /> :
                                                    t.type === 'RECEIVED' ? <ArrowDownLeft size={24} /> : <ArrowUpRight size={24} />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 leading-tight">
                                                {t.category !== 'TRANSFER' ? t.description : t.otherUser}
                                            </p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                                                {t.category === 'MARKET_BUY' ? `Investment in ${t.asset?.name}` :
                                                    t.category === 'MARKET_SELL' ? `Sold ${t.asset?.name}` :
                                                        t.type === 'SENT' ? `Sent to ${t.otherUser}` : `Received from ${t.otherUser}`}
                                            </p>
                                            <p className="text-[10px] text-gray-400 font-medium">
                                                {new Date(t.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={cn(
                                            "font-black text-lg tracking-tight",
                                            t.type === 'RECEIVED' || t.category === 'MARKET_SELL' ? "text-emerald-600" : "text-gray-900"
                                        )}>
                                            {t.type === 'RECEIVED' || t.category === 'MARKET_SELL' ? '+' : '-'}₹{Number(t.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </p>
                                        <span className={cn(
                                            "text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter border",
                                            t.status === 'COMPLETED' ? "bg-green-50 text-green-700 border-green-100" : "bg-red-50 text-red-700 border-red-100"
                                        )}>
                                            {t.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Detailed View */}
                                {expandedId === t.id && (
                                    <div className="mt-4 pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
                                        {t.category === 'TRANSFER' ? (
                                            <div className="flex items-center justify-between">
                                                <p className="text-[10px] text-gray-400 font-mono">ID: {t.id}</p>
                                                <Link
                                                    href={`/send?to=${t.otherUser}`}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-black hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
                                                >
                                                    <Send size={14} /> Pay Again
                                                </Link>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                                                    <div>
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase block">Transaction Reference</span>
                                                        <span className="text-[10px] font-mono text-gray-900"># {t.id.slice(-12)}</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase block">Asset</span>
                                                        <span className="text-xs font-black text-indigo-600">{t.asset?.name || 'Commodity'}</span>
                                                    </div>
                                                </div>
                                                <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest italic pt-2">
                                                    Market Transaction Verified by Paper Money System
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex justify-center p-4">
                                <Loader2 className="animate-spin text-indigo-600" size={24} />
                            </div>
                        )}

                        {!hasMore && history.length > 0 && (
                            <p className="text-center text-gray-400 text-sm py-8">
                                You've reached the end of your history.
                            </p>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
