'use client';

import React, { useState } from 'react';
import { MessageSquare, TrendingUp, TrendingDown, Award, ShoppingBag, Clock } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

type TransactionType = 'BID' | 'WIN' | 'RANK' | 'PAYMENT' | 'PAWN';

interface Transaction {
    id: string;
    type: TransactionType;
    message: string;
    amount?: number;
    timestamp: Date;
}

export default function ChatPage() {
    // Mock transaction data
    const transactions: Transaction[] = [
        {
            id: '1',
            type: 'WIN',
            message: 'Won Shutter #127',
            amount: 25000,
            timestamp: new Date('2024-01-25T15:30:00'),
        },
        {
            id: '2',
            type: 'BID',
            message: 'Placed bid on Ancient Vase',
            amount: 15000,
            timestamp: new Date('2024-01-25T14:20:00'),
        },
        {
            id: '3',
            type: 'RANK',
            message: 'Upgraded to Gold Rank',
            timestamp: new Date('2024-01-24T10:15:00'),
        },
        {
            id: '4',
            type: 'PAYMENT',
            message: 'Account recharged',
            amount: 50000,
            timestamp: new Date('2024-01-23T09:00:00'),
        },
        {
            id: '5',
            type: 'PAWN',
            message: 'Opened Pawn Shop',
            timestamp: new Date('2024-01-22T16:45:00'),
        },
    ];

    return (
        <div className="min-h-screen bg-slate-950 pb-24">
            {/* Header */}
            <header className="sticky top-0 z-[200] bg-slate-900 border-b border-gray-800 px-6 py-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-100">Activity</h1>
                    <MessageSquare className="w-5 h-5 text-gray-400" />
                </div>
            </header>

            {/* Timeline */}
            <main className="px-6 py-4">
                <div className="space-y-3">
                    {transactions.map((transaction, index) => (
                        <div key={transaction.id}>
                            {/* Date Separator */}
                            {(index === 0 ||
                                new Date(transactions[index - 1].timestamp).toDateString() !==
                                new Date(transaction.timestamp).toDateString()) && (
                                    <div className="flex items-center gap-3 mb-3 mt-6 first:mt-0">
                                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                            {formatDate(transaction.timestamp)}
                                        </span>
                                        <div className="flex-1 h-px bg-gray-800" />
                                    </div>
                                )}

                            {/* Transaction Message */}
                            <TransactionMessage transaction={transaction} />
                        </div>
                    ))}
                </div>

                {/* Load More */}
                <button className="w-full mt-6 py-3 text-sm text-gray-400 hover:text-gray-300 transition">
                    Load more
                </button>
            </main>

            <BottomNav />
        </div>
    );
}

function TransactionMessage({ transaction }: { transaction: Transaction }) {
    const config = getTransactionConfig(transaction.type);

    return (
        <div className={`card p-4 border-l-4 ${config.borderColor} hover:shadow-lg transition-all cursor-pointer`}>
            <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center flex-shrink-0`}>
                    {config.icon}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-100 mb-1">
                        {transaction.message}
                    </p>
                    {transaction.amount && (
                        <p className={`text-sm font-bold ${config.amountColor}`}>
                            {transaction.type === 'PAYMENT' ? '+' : ''}₹{transaction.amount.toLocaleString()}
                        </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                        {formatTime(transaction.timestamp)}
                    </p>
                </div>
            </div>
        </div>
    );
}

function getTransactionConfig(type: TransactionType) {
    switch (type) {
        case 'WIN':
            return {
                icon: <Award className="w-5 h-5 text-green-400" />,
                bgColor: 'bg-green-500/10',
                borderColor: 'border-green-500',
                amountColor: 'text-green-400',
            };
        case 'BID':
            return {
                icon: <TrendingUp className="w-5 h-5 text-blue-400" />,
                bgColor: 'bg-blue-500/10',
                borderColor: 'border-blue-500',
                amountColor: 'text-blue-400',
            };
        case 'RANK':
            return {
                icon: <Award className="w-5 h-5 text-yellow-400" />,
                bgColor: 'bg-yellow-500/10',
                borderColor: 'border-yellow-500',
                amountColor: 'text-yellow-400',
            };
        case 'PAYMENT':
            return {
                icon: <TrendingDown className="w-5 h-5 text-red-400" />,
                bgColor: 'bg-red-500/10',
                borderColor: 'border-red-500',
                amountColor: 'text-green-400',
            };
        case 'PAWN':
            return {
                icon: <ShoppingBag className="w-5 h-5 text-purple-400" />,
                bgColor: 'bg-purple-500/10',
                borderColor: 'border-purple-500',
                amountColor: 'text-purple-400',
            };
    }
}

function formatDate(date: Date): string {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const dateStr = date.toDateString();
    if (dateStr === today.toDateString()) return 'Today';
    if (dateStr === yesterday.toDateString()) return 'Yesterday';

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}
