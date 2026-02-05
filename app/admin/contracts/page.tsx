'use client';

import React from 'react';
import { FileText, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function ContractsPage() {
    // Mock data
    const contracts = [
        {
            id: '1',
            type: 'LOAN',
            user: 'user123',
            amount: 50000,
            status: 'PENDING',
            createdAt: new Date('2024-02-05'),
            expiresAt: new Date('2024-03-05'),
        },
        {
            id: '2',
            type: 'PAWN',
            user: 'player456',
            amount: 25000,
            status: 'ACTIVE',
            createdAt: new Date('2024-02-01'),
            expiresAt: new Date('2024-03-01'),
        },
    ];

    const handleApprove = async (id: string) => {
        if (!confirm('Approve this contract?')) return;
        // TODO: API call
        alert('Contract approved!');
    };

    const handleReject = async (id: string) => {
        if (!confirm('Reject this contract?')) return;
        // TODO: API call
        alert('Contract rejected!');
    };

    return (
        <div className="px-6 py-6">
            <h1 className="text-2xl font-bold text-gray-100 mb-6">Contract Management</h1>

            {/* Contracts List */}
            <div className="space-y-4">
                {contracts.map((contract) => (
                    <div key={contract.id} className="card">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <FileText className="w-5 h-5 text-cyan-400" />
                                    <h3 className="text-lg font-bold text-gray-100">{contract.type} Contract</h3>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${contract.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-400' :
                                        contract.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400' :
                                            'bg-gray-500/10 text-gray-400'
                                        }`}>
                                        {contract.status}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-400 mb-2">User: {contract.user}</p>
                                <div className="flex items-center gap-6 text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-500">Amount:</span>
                                        <span className="text-cyan-400 font-bold">₹{contract.amount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-gray-500" />
                                        <span className="text-gray-400">Expires: {contract.expiresAt.toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {contract.status === 'PENDING' && (
                            <div className="flex gap-3 pt-4 border-t border-gray-800">
                                <button
                                    onClick={() => handleApprove(contract.id)}
                                    className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-green-700 transition"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    Approve
                                </button>
                                <button
                                    onClick={() => handleReject(contract.id)}
                                    className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-red-700 transition"
                                >
                                    <XCircle className="w-4 h-4" />
                                    Reject
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {contracts.length === 0 && (
                <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-4 mx-auto">
                        <FileText className="w-10 h-10 text-gray-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-300 mb-2">No Contracts</h3>
                    <p className="text-sm text-gray-500">No contracts requiring review</p>
                </div>
            )}
        </div>
    );
}
