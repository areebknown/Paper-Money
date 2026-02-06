'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface BidMessage {
    id: string; // Unique ID per bid (could be timestamp + random)
    username: string;
    amount: number;
    isMine: boolean;
    timestamp: number;
    type: 'QUICK' | 'CUSTOM';
}

interface BidStreamProps {
    bids: BidMessage[];
}

export default function BidStream({ bids }: BidStreamProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [bids]);

    return (
        <div
            className="flex-1 overflow-y-auto px-4 py-2 space-y-3 min-h-[200px] max-h-[300px] hover:overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
            ref={scrollRef}
        >
            <AnimatePresence initial={false}>
                {bids.map((bid) => (
                    <motion.div
                        key={bid.id}
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className={`flex ${bid.isMine ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`
                                max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-md
                                ${bid.isMine
                                    ? 'bg-cyan-600 text-white rounded-tr-none'
                                    : 'bg-gray-800 text-gray-200 rounded-tl-none border border-gray-700'
                                }
                            `}
                        >
                            <div className="flex justify-between items-baseline gap-2 mb-0.5 opacity-80 text-[10px] uppercase font-bold tracking-wider">
                                <span>{bid.username}</span>
                                <span>{new Date(bid.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                            </div>
                            <div className="font-bold text-lg">
                                {bid.type === 'QUICK' ? 'Bid!' : `₹${bid.amount.toLocaleString()}!`}
                            </div>
                            {bid.type === 'QUICK' && (
                                <div className="text-xs opacity-75 mt-0.5">
                                    Placed ₹{bid.amount.toLocaleString()}
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
