'use client';

import React from 'react';
import { Pickaxe, Sparkles, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function DigPage() {
    return (
        <div className="min-h-screen bg-slate-950 pb-24 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-24 h-24 bg-amber-500/10 rounded-3xl flex items-center justify-center mb-8 relative">
                <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
                <Pickaxe className="w-12 h-12 text-amber-500 animate-pulse" />
                <Sparkles className="w-5 h-5 text-amber-400 absolute top-2 right-2" />
            </div>
            
            <h1 className="text-3xl font-black text-white mb-4 uppercase tracking-widest">Excavation Site</h1>
            
            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl max-w-md w-full mb-8">
                <div className="flex items-center gap-3 text-amber-500 mb-2 justify-center">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-bold text-sm tracking-widest uppercase">Under Construction</span>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">
                    Heavy machinery is currently deploying to the dig site. Soon you will be able to excavate rare SSS+ artifacts and ancient relics using your tools.
                </p>
            </div>

            <Link href="/home" className="px-8 py-3 bg-white text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-colors active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                Back to Home
            </Link>
        </div>
    );
}
