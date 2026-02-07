'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Clock, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface WaitingRoomProps {
    auction: {
        id: string;
        name: string;
        scheduledAt: string;
        rankTier: string;
        artifacts?: {
            artifact: {
                name: string;
            };
        }[];
    };
}

export default function WaitingRoom({ auction }: WaitingRoomProps) {
    const router = useRouter();
    const [countdown, setCountdown] = useState(0);
    const [userCount] = useState(Math.floor(Math.random() * 50) + 10); // Simulated

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const scheduled = new Date(auction.scheduledAt).getTime();
            const diff = Math.max(0, Math.ceil((scheduled - now) / 1000));
            setCountdown(diff);

            // Auto-redirect when countdown expires (auction should start)
            if (diff === 0) {
                setTimeout(() => window.location.reload(), 1000);
            }
        }, 100);

        return () => clearInterval(interval);
    }, [auction.scheduledAt]);

    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;

    return (
        <div className="h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 opacity-20">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            y: [0, -30, 0],
                            opacity: [0.2, 1, 0.2],
                        }}
                        transition={{
                            duration: 2 + Math.random() * 2,
                            repeat: Infinity,
                            delay: Math.random() * 2,
                        }}
                    />
                ))}
            </div>

            {/* Lock Icon */}
            <motion.div
                className="text-9xl mb-8 relative z-10"
                animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                }}
            >
                🔒
            </motion.div>

            {/* Title */}
            <h1 className="text-2xl font-bold mb-2 text-gray-300 uppercase tracking-wider">
                Auction Waiting Room
            </h1>

            {/* Countdown */}
            <div className="mb-8">
                <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-7xl font-black text-yellow-400">
                        {String(minutes).padStart(2, '0')}
                    </span>
                    <span className="text-5xl text-gray-600 font-bold">:</span>
                    <span className="text-7xl font-black text-yellow-400">
                        {String(seconds).padStart(2, '0')}
                    </span>
                </div>
                <p className="text-center text-gray-500 text-sm uppercase tracking-widest">
                    Until Auction Starts
                </p>
            </div>

            {/* Item Preview (Blurred) */}
            <motion.div
                className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 mb-8 max-w-md relative overflow-hidden"
                whileHover={{ scale: 1.02 }}
            >
                {/* Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />

                <div className="relative z-10">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Sparkles className="w-5 h-5 text-yellow-400" />
                        <span className="text-yellow-400 font-bold uppercase tracking-wider text-sm">
                            {auction.rankTier} Tier
                        </span>
                    </div>

                    <h2 className="text-3xl font-black text-center mb-4 blur-sm select-none">
                        {auction.name}
                    </h2>

                    <div className="flex flex-wrap gap-2 justify-center">
                        {auction.artifacts?.map((a, i) => (
                            <span
                                key={i}
                                className="px-3 py-1 bg-gray-800/50 border border-gray-700 rounded text-gray-500 text-xs font-mono blur-sm select-none"
                            >
                                {a.artifact.name}
                            </span>
                        ))}
                    </div>

                    <div className="mt-6 text-center">
                        <p className="text-gray-400 text-sm italic">
                            Full details will be revealed when auction starts
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* User Count */}
            <div className="flex items-center gap-3 text-gray-400 mb-6">
                <div className="flex -space-x-2">
                    {[...Array(3)].map((_, i) => (
                        <div
                            key={i}
                            className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 border-2 border-gray-900 flex items-center justify-center"
                        >
                            <User className="w-4 h-4 text-white" />
                        </div>
                    ))}
                </div>
                <span className="font-semibold">
                    <span className="text-cyan-400 text-xl">{userCount}</span> users waiting
                </span>
            </div>

            {/* Helper Text */}
            <div className="text-center space-y-2 max-w-md">
                <p className="text-gray-500 text-sm">
                    🎯 Get ready! The auction will start automatically.
                </p>
                <p className="text-gray-600 text-xs">
                    Do not refresh or leave this page.
                </p>
            </div>

            {/* Back Button */}
            <button
                onClick={() => router.push('/home')}
                className="mt-8 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-semibold transition"
            >
                ← Back to Home
            </button>

            {/* Pulse Animation at Bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-50 animate-pulse" />
        </div>
    );
}
