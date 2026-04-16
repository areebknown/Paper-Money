'use client';

import React from 'react';
import { ShoppingCart, Tag, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function ConsumerPage() {
    return (
        <div className="min-h-screen bg-slate-950 pb-24 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-24 h-24 bg-emerald-500/10 rounded-3xl flex items-center justify-center mb-8 relative">
                <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
                <ShoppingCart className="w-12 h-12 text-emerald-500" />
                <Tag className="w-5 h-5 text-emerald-400 absolute top-2 right-2 animate-bounce" />
            </div>
            
            <h1 className="text-3xl font-black text-white mb-4 uppercase tracking-[0.15em]">Supply Store</h1>
            
            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl max-w-md w-full mb-8">
                <div className="flex items-center gap-3 text-emerald-500 mb-2 justify-center">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-bold text-sm tracking-widest uppercase">Restocking Shelves</span>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">
                    The consumer marketplace is currently being built. Eventually, you will be able to buy power-ups, skip-tickets, and consumable utility items here.
                </p>
            </div>

            <Link href="/home" className="px-8 py-3 bg-white text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-colors active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                Back to Home
            </Link>
        </div>
    );
}
