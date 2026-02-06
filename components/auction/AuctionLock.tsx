'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock } from 'lucide-react';

interface AuctionLockProps {
    isLocked: boolean; // True initially, becomes false when "Opening"
    countdown?: number; // Optional countdown to show on the lock
}

export default function AuctionLock({ isLocked, countdown }: AuctionLockProps) {
    return (
        <AnimatePresence>
            {isLocked && (
                <motion.div
                    initial={{ scale: 1, opacity: 1 }}
                    exit={{
                        scale: 1.5,
                        opacity: 0,
                        filter: 'blur(10px)',
                        transition: { duration: 0.5 }
                    }}
                    className="absolute inset-0 z-30 flex flex-col items-center justify-center pointer-events-none"
                >
                    <motion.div
                        animate={{
                            rotate: [-2, 2, -2],
                            transition: { repeat: Infinity, duration: 0.2 }
                        }}
                        className="bg-black/40 backdrop-blur-sm p-8 rounded-full border-4 border-yellow-500/50 shadow-2xl shadow-yellow-900/50"
                    >
                        <Lock className="w-24 h-24 text-yellow-500" />
                    </motion.div>

                    {countdown !== undefined && countdown > 0 && (
                        <div className="mt-8 text-4xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-mono animate-pulse">
                            BID STARTING IN <span className="text-yellow-400 text-6xl block text-center mt-2">{countdown}</span>
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
