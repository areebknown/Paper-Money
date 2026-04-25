'use client';

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { Send, ScanLine, RefreshCw, Share2, ArrowUpRight, ArrowDownLeft, TrendingUp, TrendingDown, Trophy, ChevronRight, Loader2, Check, X, AlertCircle } from 'lucide-react';
import Header from '@/components/Header';
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then(r => r.json());

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatAmount(n: number) {
    return n.toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

function relativeTime(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

function txMeta(tx: any): { label: string; sub: string; icon: React.ReactNode; color: string; sign: string } {
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

// ─── Transaction Tile ─────────────────────────────────────────────────────────
function TxTile({ tx, showDate = false }: { tx: any; showDate?: boolean }) {
    const m = txMeta(tx);
    return (
        <div className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 ${m.color}`}>
                {m.icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[12px] font-bold text-white leading-tight">{m.label}</p>
                <p className="text-[11px] text-slate-400 truncate">{m.sub}</p>
                {showDate && (
                    <p className="text-[10px] text-slate-600 mt-0.5">
                        {new Date(tx.createdAt).toLocaleString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                        })}
                    </p>
                )}
            </div>
            <div className="shrink-0 text-right">
                <span className={`text-[13px] font-black ${m.sign === '+' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {m.sign}₹{formatAmount(Number(tx.amount))}
                </span>
                {!showDate && (
                    <p className="text-[9px] text-slate-600 mt-0.5">{relativeTime(tx.createdAt)}</p>
                )}
            </div>
        </div>
    );
}

// ─── Pay Modal (full-screen) ──────────────────────────────────────────────────
function PayModal({ initialUsername, onClose }: { initialUsername: string; onClose: () => void }) {
    const [username, setUsername] = useState(initialUsername);
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errMsg, setErrMsg] = useState('');
    const { data: userData } = useSWR('/api/user', fetcher);
    const balance = Number(userData?.user?.balance ?? 0);

    const handleSend = async () => {
        const amt = parseFloat(amount);
        if (!username.trim() || isNaN(amt) || amt <= 0) return;
        setLoading(true);
        setStatus('idle');
        try {
            const res = await fetch('/api/transfer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ receiverUsername: username.trim().toLowerCase(), amount: amt }),
            });
            const data = await res.json();
            if (res.ok) {
                setStatus('success');
                setTimeout(onClose, 1800);
            } else {
                setStatus('error');
                setErrMsg(data.error || 'Transfer failed');
            }
        } catch {
            setStatus('error');
            setErrMsg('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed inset-0 z-[400] bg-[#090f1f] flex flex-col"
        >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-12 pb-5 border-b border-white/5">
                <h2 className="text-lg font-black text-white uppercase tracking-widest">Send Money</h2>
                <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                    <X size={18} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-6 space-y-5">
                {/* Balance indicator */}
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-4 py-3 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Your Balance</span>
                    <span className="text-emerald-400 font-black text-sm">₹{formatAmount(balance)}</span>
                </div>

                {/* Recipient */}
                <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Recipient Username</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">@</span>
                        <input
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                            placeholder="username"
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-9 pr-4 text-sm text-white placeholder-slate-600 outline-none focus:border-[#FBBF24]/60 transition-colors"
                            autoComplete="off"
                        />
                    </div>
                </div>

                {/* Amount */}
                <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Amount (₹)</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
                        <input
                            type="number"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            placeholder="0"
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-9 pr-4 text-2xl font-black text-white placeholder-slate-700 outline-none focus:border-[#FBBF24]/60 transition-colors"
                        />
                    </div>
                </div>

                {/* Quick amounts */}
                <div className="grid grid-cols-3 gap-2">
                    {[500, 1000, 2000, 5000, 10000, 25000].map(a => (
                        <button key={a} onClick={() => setAmount(String(a))}
                            className={`py-2 rounded-xl text-[12px] font-black uppercase border transition-all active:scale-95 ${amount === String(a) ? 'bg-[#FBBF24] text-slate-900 border-[#FBBF24]' : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/20'}`}>
                            ₹{a >= 1000 ? `${a / 1000}K` : a}
                        </button>
                    ))}
                </div>

                {/* Status */}
                <AnimatePresence>
                    {status === 'error' && (
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
                            <AlertCircle size={16} className="text-rose-400 shrink-0" />
                            <p className="text-rose-400 text-[12px] font-bold">{errMsg}</p>
                        </motion.div>
                    )}
                    {status === 'success' && (
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
                            <Check size={16} className="text-emerald-400 shrink-0" />
                            <p className="text-emerald-400 text-[12px] font-bold">Money sent successfully!</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Confirm button */}
            <div className="px-5 pb-10 pt-4 border-t border-white/5">
                <button
                    onClick={handleSend}
                    disabled={loading || !username.trim() || !amount || parseFloat(amount) <= 0 || status === 'success'}
                    className="w-full py-4 bg-[#FBBF24] text-slate-900 font-black text-sm uppercase tracking-widest rounded-2xl active:scale-[0.98] transition-all disabled:opacity-40 flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(251,191,36,0.25)]"
                >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={16} />}
                    {loading ? 'Sending...' : `Send ₹${amount || '0'}`}
                </button>
            </div>
        </motion.div>
    );
}

// ─── Scan Modal ───────────────────────────────────────────────────────────────
function ScanModal({ onResult, onClose }: { onResult: (username: string) => void; onClose: () => void }) {
    const scannerRef = useRef<any>(null);
    const divId = 'qr-reader-div';

    useEffect(() => {
        let scanner: any;
        import('html5-qrcode').then(({ Html5Qrcode }) => {
            scanner = new Html5Qrcode(divId);
            scannerRef.current = scanner;
            scanner.start(
                { facingMode: 'environment' },
                { fps: 10, qrbox: { width: 220, height: 220 } },
                (text: string) => {
                    // Parse username from full URL or plain text
                    try {
                        const url = new URL(text);
                        const pay = url.searchParams.get('pay');
                        if (pay) { scanner.stop().catch(() => {}); onResult(pay); return; }
                    } catch {}
                    // Plain username fallback
                    scanner.stop().catch(() => {});
                    onResult(text.trim().replace('@', ''));
                },
                () => {}
            ).catch(() => {});
        });
        return () => { scannerRef.current?.stop().catch(() => {}); };
    }, []);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[450] bg-black flex flex-col">
            <div className="flex items-center justify-between px-5 pt-12 pb-4">
                <h2 className="text-lg font-black text-white uppercase tracking-widest">Scan QR</h2>
                <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white">
                    <X size={18} />
                </button>
            </div>
            <div className="flex-1 flex items-center justify-center px-6">
                <div className="w-full max-w-sm">
                    <div id={divId} className="rounded-2xl overflow-hidden" />
                    <p className="text-center text-slate-400 text-[12px] mt-6 font-medium">
                        Point at a Bid Wars QR code
                    </p>
                </div>
            </div>
        </motion.div>
    );
}

// ─── Autopay Modal (placeholder) ─────────────────────────────────────────────
function AutopayModal({ onClose }: { onClose: () => void }) {
    return (
        <motion.div initial={{ opacity: 0, y: '100%' }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed inset-0 z-[400] bg-[#090f1f] flex flex-col">
            <div className="flex items-center justify-between px-5 pt-12 pb-5 border-b border-white/5">
                <h2 className="text-lg font-black text-white uppercase tracking-widest">Autopay</h2>
                <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white">
                    <X size={18} />
                </button>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
                <div className="w-20 h-20 rounded-3xl bg-[#FBBF24]/10 border border-[#FBBF24]/20 flex items-center justify-center mb-6">
                    <RefreshCw size={36} className="text-[#FBBF24]" />
                </div>
                <h3 className="text-white font-black text-xl uppercase tracking-widest mb-3">Autopay Mandates</h3>
                <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                    Automatic payment mandates for your active loans and pawn contracts will appear here. This feature is being built.
                </p>
                <div className="mt-8 px-5 py-4 bg-white/5 border border-white/10 rounded-2xl w-full max-w-xs">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active Mandates</p>
                    <p className="text-3xl font-black text-slate-600 mt-1">0</p>
                </div>
            </div>
        </motion.div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
function PaymentPageInner() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [modal, setModal] = useState<'pay' | 'scan' | 'autopay' | null>(null);
    const [payUsername, setPayUsername] = useState('');

    // Transactions lazy loading
    const [txList, setTxList] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [txLoading, setTxLoading] = useState(false);
    const observerRef = useRef<HTMLDivElement>(null);

    const { data: userData } = useSWR('/api/user', fetcher);
    const user = userData?.user;
    const qrValue = user ? `https://bidwars.xyz/payment?pay=${user.username}` : '';

    // Auto-open Pay modal if ?pay= param is present
    useEffect(() => {
        const pay = searchParams.get('pay');
        if (pay) {
            setPayUsername(pay);
            setModal('pay');
        }
    }, [searchParams]);

    // Load first batch of transactions
    const loadTx = useCallback(async (pageNum: number) => {
        if (txLoading || !hasMore) return;
        setTxLoading(true);
        try {
            const res = await fetch(`/api/transactions?page=${pageNum}&limit=10`);
            const data = await res.json();
            setTxList(prev => pageNum === 1 ? data.history : [...prev, ...data.history]);
            setHasMore(data.hasMore);
            setPage(pageNum + 1);
        } catch {}
        finally { setTxLoading(false); }
    }, [txLoading, hasMore]);

    useEffect(() => { loadTx(1); }, []);

    // Intersection observer for lazy loading
    useEffect(() => {
        const node = observerRef.current;
        if (!node) return;
        const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting && hasMore && !txLoading) loadTx(page); }, { rootMargin: '100px' });
        obs.observe(node);
        return () => obs.disconnect();
    }, [hasMore, txLoading, page]);

    // QR share
    const handleShareQR = async () => {
        if (navigator.share) {
            navigator.share({ title: `Pay @${user?.username} on Bid Wars`, url: qrValue });
        } else {
            navigator.clipboard.writeText(qrValue);
        }
    };

    const openPay = (username = '') => { setPayUsername(username); setModal('pay'); };
    const openScan = () => setModal('scan');
    const openAutopay = () => setModal('autopay');

    return (
        <>
            <div className="min-h-screen bg-[#090f1f] pb-28 text-white">
                <Header />

                <main className="max-w-lg mx-auto px-4 pt-6 space-y-6">

                    {/* ── QR CARD ── */}
                    <div className="bg-gradient-to-b from-[#111c35] to-[#0c1328] border border-white/8 rounded-3xl p-6 flex flex-col items-center relative overflow-hidden">
                        {/* Glow */}
                        <div className="absolute inset-0 bg-[#FBBF24]/3 blur-[80px] rounded-full pointer-events-none" />

                        {/* Share button */}
                        <button onClick={handleShareQR}
                            className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all active:scale-95">
                            <Share2 size={16} />
                        </button>

                        {/* Username */}
                        {user && (
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] mb-5">
                                @{user.username}
                            </p>
                        )}

                        {/* QR */}
                        <div className="bg-white p-4 rounded-2xl shadow-[0_0_60px_rgba(251,191,36,0.15)]">
                            {qrValue ? (
                                <QRCodeSVG
                                    value={qrValue}
                                    size={200}
                                    bgColor="#ffffff"
                                    fgColor="#0a0a0a"
                                    level="M"
                                />
                            ) : (
                                <div className="w-[200px] h-[200px] flex items-center justify-center">
                                    <Loader2 size={32} className="animate-spin text-slate-300" />
                                </div>
                            )}
                        </div>

                        <p className="text-[11px] text-slate-500 font-medium mt-4 text-center">
                            Scan to send me money on Bid Wars
                        </p>
                    </div>

                    {/* ── THREE ACTION BUTTONS ── */}
                    <div className="grid grid-cols-3 gap-3">
                        <button onClick={() => openPay()}
                            className="flex flex-col items-center justify-center py-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl gap-2 active:scale-95 transition-all hover:bg-emerald-500/15 group">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Send size={22} className="text-emerald-400" />
                            </div>
                        </button>

                        <button onClick={openScan}
                            className="flex flex-col items-center justify-center py-5 bg-[#FBBF24]/10 border border-[#FBBF24]/20 rounded-2xl gap-2 active:scale-95 transition-all hover:bg-[#FBBF24]/15 group">
                            <div className="w-12 h-12 rounded-xl bg-[#FBBF24]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <ScanLine size={22} className="text-[#FBBF24]" />
                            </div>
                        </button>

                        <button onClick={openAutopay}
                            className="flex flex-col items-center justify-center py-5 bg-blue-500/10 border border-blue-500/20 rounded-2xl gap-2 active:scale-95 transition-all hover:bg-blue-500/15 group">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <RefreshCw size={22} className="text-blue-400" />
                            </div>
                        </button>
                    </div>

                    {/* ── TRANSACTIONS ── */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-sm font-black text-white uppercase tracking-widest">Transactions</h2>
                            <Link href="/transactions" className="flex items-center gap-1 text-[11px] font-bold text-[#FBBF24] hover:underline">
                                See all <ChevronRight size={13} />
                            </Link>
                        </div>

                        <div className="bg-[#111c35]/60 border border-white/5 rounded-2xl px-4">
                            {txList.length === 0 && !txLoading ? (
                                <div className="py-10 text-center text-slate-600 text-xs font-bold uppercase tracking-widest">
                                    No transactions yet
                                </div>
                            ) : (
                                txList.map((tx: any) => <TxTile key={tx.id} tx={tx} />)
                            )}

                            {/* Lazy load sentinel */}
                            <div ref={observerRef} className="py-1" />

                            {txLoading && (
                                <div className="flex justify-center py-4">
                                    <Loader2 size={18} className="animate-spin text-slate-600" />
                                </div>
                            )}

                            {!hasMore && txList.length > 0 && (
                                <p className="text-center text-[10px] text-slate-700 font-bold uppercase py-3">
                                    All transactions loaded
                                </p>
                            )}
                        </div>
                    </div>

                </main>
            </div>

            {/* ── MODALS ── */}
            <AnimatePresence>
                {modal === 'pay' && (
                    <PayModal
                        key="pay"
                        initialUsername={payUsername}
                        onClose={() => { setModal(null); setPayUsername(''); }}
                    />
                )}
                {modal === 'scan' && (
                    <ScanModal
                        key="scan"
                        onResult={(u) => { setModal(null); openPay(u); }}
                        onClose={() => setModal(null)}
                    />
                )}
                {modal === 'autopay' && (
                    <AutopayModal key="autopay" onClose={() => setModal(null)} />
                )}
            </AnimatePresence>
        </>
    );
}

export default function PaymentPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#090f1f] flex items-center justify-center">
                <Loader2 size={32} className="animate-spin text-[#FBBF24]" />
            </div>
        }>
            <PaymentPageInner />
        </Suspense>
    );
}
