'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock } from 'lucide-react';

interface ShutterProps {
    status: 'locked' | 'revealing' | 'bidding' | 'completed';
    rankTier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';
    startingPrice: number;
    currentBid?: number;
    countdown?: number;
    onRevealComplete?: () => void;
}

export default function Shutter({
    status,
    rankTier,
    startingPrice,
    currentBid,
    countdown,
    onRevealComplete,
}: ShutterProps) {
    const [isLockShattered, setIsLockShattered] = useState(false);

    useEffect(() => {
        if (status === 'revealing' && !isLockShattered) {
            // Trigger lock shatter after a brief moment
            const timer = setTimeout(() => setIsLockShattered(true), 500);
            return () => clearTimeout(timer);
        }
    }, [status, isLockShattered]);

    const rankConfig = {
        BRONZE: { label: 'Bronze', icon: '🥉', gradient: 'from-orange-400 via-orange-500 to-orange-600' },
        SILVER: { label: 'Silver', icon: '🥈', gradient: 'from-gray-300 via-gray-400 to-gray-500' },
        GOLD: { label: 'Gold', icon: '🥇', gradient: 'from-yellow-400 via-yellow-500 to-yellow-600' },
        PLATINUM: { label: 'Platinum', icon: '💎', gradient: 'from-cyan-400 via-blue-500 to-purple-600' },
        DIAMOND: { label: 'Diamond', icon: '💠', gradient: 'from-blue-400 via-cyan-500 to-teal-600' },
    };

    const config = rankConfig[rankTier];

    return (
        <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden">
            {/* Shutter Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900" />

            {/* Shutter Body */}
            <AnimatePresence>
                {status !== 'revealing' && status !== 'completed' && (
                    <motion.div
                        className="absolute inset-0 z-10"
                        initial={false}
                        animate={status === 'bidding' ? { y: 0 } : { y: 0 }}
                        exit={{ y: '-85%' }}
                        transition={{
                            type: 'spring',
                            stiffness: 200,
                            damping: 30,
                            duration: 0.8,
                        }}
                        onAnimationComplete={() => {
                            // Callback fires when shutter closes - no action needed
                        }}
                        style={{
                            background: `repeating-linear-gradient(
                180deg,
                #4a5568 0px,
                #2d3748 4px,
                #1a202c 8px,
                #2d3748 12px,
                #4a5568 16px
              )`,
                            boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.5), 0 8px 20px rgba(0,0,0,0.4)',
                        }}
                    >
                        {/* Lock (only when locked or bidding) */}
                        <AnimatePresence>
                            {status === 'locked' && !isLockShattered && (
                                <motion.div
                                    className="absolute inset-0 flex items-center justify-center"
                                    exit={{
                                        opacity: 0,
                                        scale: 0.5,
                                        transition: { duration: 0.3 },
                                    }}
                                >
                                    <motion.div
                                        className="relative"
                                        animate={{
                                            scale: [1, 1.05, 1],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: 'easeInOut',
                                        }}
                                    >
                                        <div className="w-20 h-24 bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl flex items-center justify-center shadow-2xl">
                                            <Lock className="w-12 h-12 text-gray-800" strokeWidth={3} />
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}

                            {/* Lock Shatter Animation */}
                            {isLockShattered && (
                                <>
                                    {[...Array(6)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            className="absolute"
                                            style={{
                                                top: '50%',
                                                left: '50%',
                                            }}
                                            initial={{ x: '-50%', y: '-50%', opacity: 1 }}
                                            animate={{
                                                x: `${Math.cos((i * Math.PI) / 3) * 200 - 50}%`,
                                                y: `${Math.sin((i * Math.PI) / 3) * 200 - 50}%`,
                                                rotate: Math.random() * 360,
                                                opacity: 0,
                                            }}
                                            transition={{
                                                duration: 0.6,
                                                ease: 'easeOut',
                                            }}
                                        >
                                            <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 opacity-70" />
                                        </motion.div>
                                    ))}
                                </>
                            )}
                        </AnimatePresence>

                        {/* Countdown Text (when bidding) */}
                        {status === 'bidding' && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-center"
                                >
                                    <p className="text-sm font-semibold opacity-80 mb-2">COUNTING FOR</p>
                                    <p className="text-4xl font-bold mb-4">
                                        ₹{currentBid?.toLocaleString() || startingPrice.toLocaleString()}
                                    </p>
                                    <motion.p
                                        key={countdown}
                                        className="text-6xl font-black"
                                        initial={{ scale: 1.2, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {countdown}
                                    </motion.p>
                                </motion.div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Contents Behind Shutter (visible during reveal) */}
            {status === 'revealing' && (
                <motion.div
                    className="absolute inset-0 flex items-center justify-center p-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="grid grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <motion.div
                                key={i}
                                className="text-4xl"
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{
                                    delay: 0.5 + i * 0.1,
                                    type: 'spring',
                                    stiffness: 200,
                                }}
                            >
                                {['📦', '💎', '🏺', '🗿', '👑', '⚱️'][i - 1]}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Bottom Info Bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-3 flex items-center justify-between z-20">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">{config.icon}</span>
                    <span className="font-bold text-white">{config.label}</span>
                </div>
                <div className="text-right">
                    <p className="text-xs text-white/80">Starting Price</p>
                    <p className="font-bold text-white">₹{startingPrice.toLocaleString()}</p>
                </div>
            </div>
        </div>
    );
}
