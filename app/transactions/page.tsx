'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, TrendingUp, TrendingDown, Trophy, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatAmount(n: number) {
    return n.toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

function txMeta(tx: any) {
    const cat = tx.category;
    const isReceived = tx.type === 'RECEIVED';

    if (cat === 'MARKET_BUY') return {
        label: 'Invested in market',
        sub: tx.otherUser || tx.description || '',
        icon: <TrendingUp size={16} />,
        color: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
        sign: '-',
    };
    if (cat === 'MARKET_SELL') return {
        label: 'Cashed out from market',
        sub: tx.otherUser || tx.description || '',
        icon: <TrendingDown size={16} />,
        color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
        sign: '+',
    };
    if (cat === 'AUCTION_WIN') return {
        label: 'Bought auction',
        sub: tx.description || 'Artifact',
        icon: <Trophy size={16} />,
        color: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
        sign: '-',
    };
    if (isReceived) return {
        label: 'Received from',
        sub: `@${tx.otherUser}`,
        icon: <ArrowDownLeft size={16} />,
        color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
        sign: '+',
    };
    return {
        label: 'Sent to',
        sub: `@${tx.otherUser}`,
        icon: <ArrowUpRight size={16} />,
        color: 'text-rose-400 bg-rose-400/10 border-rose-400/20',
        sign: '-',
    };
}

function TxTile({ tx }: { tx: any }) {
    const m = txMeta(tx);
    const date = new Date(tx.createdAt);
    const dateStr = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const timeStr = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="flex items-center gap-3 py-3.5 border-b border-white/5 last:border-0">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${m.color}`}>
                {m.icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-white leading-tight">{m.label}</p>
                <p className="text-[11px] text-slate-400 truncate">{m.sub}</p>
                <p className="text-[10px] text-slate-600 mt-0.5 font-medium">
                    {dateStr} · {timeStr}
                </p>
            </div>
            <div className="shrink-0 text-right">
                <span className={`text-[14px] font-black ${m.sign === '+' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {m.sign}₹{formatAmount(Number(tx.amount))}
                </span>
                <p className="text-[9px] text-slate-700 mt-0.5 uppercase tracking-wider font-bold">
                    {tx.category?.replace('_', ' ')}
                </p>
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function TransactionsPage() {
    const router = useRouter();
    const [txList, setTxList] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const observerRef = useRef<HTMLDivElement>(null);

    const loadTx = useCallback(async (pageNum: number) => {
        if (loading) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/transactions?page=${pageNum}&limit=20`);
            const data = await res.json();
            setTxList(prev => pageNum === 1 ? data.history : [...prev, ...data.history]);
            setHasMore(data.hasMore);
            setPage(pageNum + 1);
        } catch {}
        finally { setLoading(false); }
    }, [loading]);

    useEffect(() => { loadTx(1); }, []);

    useEffect(() => {
        const node = observerRef.current;
        if (!node) return;
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting && hasMore && !loading) loadTx(page); },
            { rootMargin: '150px' }
        );
        obs.observe(node);
        return () => obs.disconnect();
    }, [hasMore, loading, page]);

    return (
        <div className="min-h-screen bg-[#090f1f] pb-28 text-white">
            <Header />

            {/* Sticky sub-header */}
            <div className="sticky top-[calc(var(--header-h,72px))] z-[90] bg-[#090f1f]/95 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center gap-3">
                <button onClick={() => router.back()}
                    className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors active:scale-95">
                    <ArrowLeft size={16} />
                </button>
                <h1 className="text-sm font-black text-white uppercase tracking-widest">All Transactions</h1>
                {txList.length > 0 && (
                    <span className="ml-auto text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        {txList.length} loaded
                    </span>
                )}
            </div>

            <main className="max-w-lg mx-auto px-4 pt-5">
                <div className="bg-[#111c35]/60 border border-white/5 rounded-2xl px-4">
                    {txList.length === 0 && !loading ? (
                        <div className="py-16 text-center text-slate-600 text-xs font-bold uppercase tracking-widest">
                            No transactions yet
                        </div>
                    ) : (
                        txList.map((tx: any) => <TxTile key={tx.id} tx={tx} />)
                    )}

                    <div ref={observerRef} className="py-1" />

                    {loading && (
                        <div className="flex justify-center py-5">
                            <Loader2 size={20} className="animate-spin text-slate-600" />
                        </div>
                    )}

                    {!hasMore && txList.length > 0 && (
                        <p className="text-center text-[10px] text-slate-700 font-bold uppercase tracking-widest py-4">
                            — End of history —
                        </p>
                    )}
                </div>
            </main>
        </div>
    );
}
