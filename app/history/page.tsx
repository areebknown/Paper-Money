'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowDownLeft, ArrowUpRight, Send, Loader2 } from 'lucide-react';
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
                                            t.type === 'RECEIVED' ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
                                        )}>
                                            {t.type === 'RECEIVED' ? <ArrowDownLeft size={24} /> : <ArrowUpRight size={24} />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{t.otherUser}</p>
                                            <p className="text-xs text-gray-500">{new Date(t.createdAt).toLocaleString()}</p>
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
                                            "text-xs px-2 py-1 rounded-full capitalize",
                                            t.status === 'COMPLETED' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                        )}>
                                            {t.status.toLowerCase()}
                                        </span>
                                    </div>
                                </div>

                                {/* Pay Again Action */}
                                {expandedId === t.id && (
                                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-200">
                                        <p className="text-xs text-gray-400 font-mono">ID: {t.id.slice(0, 12)}...</p>
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
