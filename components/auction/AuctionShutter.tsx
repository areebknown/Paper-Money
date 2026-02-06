'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AuctionShutterProps {
    status: 'CLOSED' | 'OPENING' | 'OPEN' | 'CLOSING' | 'BIDDING';
    children: React.ReactNode; // The Artifacts
}

export default function AuctionShutter({ status, children }: AuctionShutterProps) {
    // Logic: 
    // CLOSED/PRE_OPEN: Full cover
    // OPEN: Slide Up (Reveal)
    // CLOSING/BIDDING: Slide Down (Cover)

    const isClosed = status === 'CLOSED' || status === 'CLOSING' || status === 'BIDDING';

    return (
        <div className="relative w-full h-96 overflow-hidden rounded-xl border-4 border-gray-800 bg-[#1a1a1a] shadow-inner font-mono">
            {/* Background (Brick Wall) */}
            <div
                className="absolute inset-0 flex items-center justify-center p-8 bg-cover bg-center"
                style={{
                    backgroundImage: `url("https://www.transparenttextures.com/patterns/brick-wall-dark.png")`,
                    backgroundColor: '#2a2a2a'
                }}
            >
                {/* The Artifacts (Always rendered, revealed when shutter opens) */}
                <div className="relative z-0 w-full h-full flex items-center justify-center">
                    {children}
                </div>
            </div>

            {/* The Shutter */}
            <motion.div
                initial={false}
                animate={{
                    y: isClosed ? '0%' : '-100%',
                }}
                transition={{
                    type: "spring",
                    stiffness: 40,
                    damping: 15, // Heavy metal feel
                    mass: 1.5
                }}
                className="absolute inset-0 z-10 bg-gradient-to-b from-slate-700 via-slate-600 to-slate-800 flex flex-col items-center justify-end pb-4"
                style={{
                    backgroundSize: '100% 20px',
                    backgroundImage: 'linear-gradient(to bottom, transparent 19px, rgba(0,0,0,0.5) 20px)'
                }}
            >
                {/* Shutter Handle */}
                <div className="w-32 h-2 bg-gray-400 rounded-full shadow-lg mb-8" />

                {/* Warning Text on Shutter */}
                {status === 'BIDDING' && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center transform -rotate-12 border-4 border-yellow-500/50 p-4 rounded-xl">
                        <h2 className="text-4xl font-black text-yellow-500/50 tracking-widest uppercase">
                            BIDDING<br />ACTIVE
                        </h2>
                    </div>
                )}
            </motion.div>

            {/* Shutter Rails (Sides) */}
            <div className="absolute left-0 top-0 bottom-0 w-4 bg-gray-900 border-r border-gray-700 z-20" />
            <div className="absolute right-0 top-0 bottom-0 w-4 bg-gray-900 border-l border-gray-700 z-20" />
        </div>
    );
}
