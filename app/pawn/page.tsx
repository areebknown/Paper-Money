'use client';

import React from 'react';
import { Scale, Package, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function PawnPage() {
    return (
        <div className="min-h-screen bg-slate-950 pb-24 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-24 h-24 bg-purple-500/10 rounded-3xl flex items-center justify-center mb-8 relative">
                <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
                <Scale className="w-12 h-12 text-purple-500" />
                <Package className="w-6 h-6 text-purple-400 absolute -bottom-2 -right-2 bg-slate-950 rounded-lg p-1 border border-purple-500/20" />
            </div>
            
            <h1 className="text-3xl font-black text-white mb-4 uppercase tracking-widest">The Broker's Pawn</h1>
            
            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl max-w-md w-full mb-8">
                <div className="flex items-center gap-3 text-purple-500 mb-2 justify-center">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-bold text-sm tracking-widest uppercase">Appraising Goods</span>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">
                    The broker is currently setting up shop. Soon you will be able to temporarily pawn your artifacts for quick cash injections without permanently losing them.
                </p>
            </div>

            <Link href="/home" className="px-8 py-3 bg-white text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-colors active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                Back to Home
            </Link>
        </div>
    );
}
