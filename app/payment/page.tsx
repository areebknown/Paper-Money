'use client';

import React, { useState } from 'react';
import { QrCode, Copy, Check, Download } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

export default function PaymentPage() {
    const [copied, setCopied] = useState(false);

    // Mock UPI data
    const upiId = 'bidwars@upi';
    const amount = 1000;

    const handleCopy = () => {
        navigator.clipboard.writeText(upiId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-slate-950 pb-24">
            {/* Header */}
            <header className="sticky top-0 z-[200] bg-slate-900 border-b border-gray-800 px-6 py-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-100">Payment</h1>
                    <QrCode className="w-5 h-5 text-gray-400" />
                </div>
            </header>

            {/* Content */}
            <main className="px-6 py-6">
                {/* Amount Input */}
                <div className="card mb-6">
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Enter Amount
                    </label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">₹</span>
                        <input
                            type="number"
                            defaultValue={amount}
                            className="w-full pl-10 pr-4 py-4 bg-gray-800 border border-gray-700 rounded-lg text-2xl font-bold text-gray-100 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                        />
                    </div>
                </div>

                {/* QR Code Display */}
                <div className="card text-center mb-6">
                    <p className="text-sm text-gray-400 mb-4">Scan to Pay</p>

                    {/* QR Code Placeholder */}
                    <div className="w-64 h-64 bg-white rounded-lg mx-auto mb-4 flex items-center justify-center">
                        <div className="text-center">
                            <QrCode className="w-48 h-48 text-gray-800 mx-auto mb-2" />
                            <p className="text-xs text-gray-600">UPI QR Code</p>
                        </div>
                    </div>

                    <button className="btn btn-secondary w-full flex items-center justify-center gap-2">
                        <Download className="w-4 h-4" />
                        Download QR Code
                    </button>
                </div>

                {/* UPI ID */}
                <div className="card mb-6">
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                        UPI ID
                    </label>
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={upiId}
                            readOnly
                            className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 outline-none"
                        />
                        <button
                            onClick={handleCopy}
                            className="p-3 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition"
                        >
                            {copied ? (
                                <Check className="w-5 h-5 text-green-400" />
                            ) : (
                                <Copy className="w-5 h-5 text-gray-400" />
                            )}
                        </button>
                    </div>
                    {copied && (
                        <p className="text-xs text-green-400 mt-2">Copied to clipboard!</p>
                    )}
                </div>

                {/* Quick Amount Buttons */}
                <div className="card mb-6">
                    <p className="text-sm font-semibold text-gray-300 mb-3">Quick Add</p>
                    <div className="grid grid-cols-3 gap-2">
                        {[500, 1000, 2000, 5000, 10000, 25000].map((amt) => (
                            <button
                                key={amt}
                                className="py-3 bg-gray-800 text-gray-100 rounded-lg font-semibold text-sm hover:bg-gray-700 transition"
                            >
                                ₹{amt.toLocaleString()}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Instructions */}
                <div className="card bg-blue-500/5 border-blue-500/20">
                    <h3 className="text-sm font-bold text-blue-400 mb-2">Payment Instructions</h3>
                    <ul className="space-y-2 text-xs text-gray-400">
                        <li>• Scan the QR code using any UPI app</li>
                        <li>• Or copy the UPI ID and paste in your app</li>
                        <li>• Enter the amount you want to add</li>
                        <li>• Balance will be updated within 2-3 minutes</li>
                    </ul>
                </div>
            </main>

            <BottomNav />
        </div>
    );
}
