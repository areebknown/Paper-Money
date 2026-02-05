'use client';

import React, { useState } from 'react';
import { Vault as VaultIcon, FileText, Package, Clock, ChevronRight } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

type TabOption = 'contracts' | 'stored';

interface Contract {
    id: string;
    type: 'LOAN' | 'PAWN' | 'TRADE';
    amount: number;
    status: 'ACTIVE' | 'PENDING' | 'COMPLETED';
    expiresAt: Date;
    terms: string;
}

interface StoredArtifact {
    id: string;
    name: string;
    storageFee: number;
    storedDate: Date;
}

export default function VaultPage() {
    const [activeTab, setActiveTab] = useState<TabOption>('contracts');

    // Mock data
    const contracts: Contract[] = [
        {
            id: '1',
            type: 'LOAN',
            amount: 50000,
            status: 'ACTIVE',
            expiresAt: new Date('2024-02-15T23:59:59'),
            terms: 'Repay within 30 days',
        },
        {
            id: '2',
            type: 'PAWN',
            amount: 25000,
            status: 'ACTIVE',
            expiresAt: new Date('2024-02-10T23:59:59'),
            terms: 'Artifact held as collateral',
        },
    ];

    const storedArtifacts: StoredArtifact[] = [
        {
            id: '1',
            name: 'Ancient Scroll',
            storageFee: 500,
            storedDate: new Date('2024-01-15'),
        },
    ];

    return (
        <div className="min-h-screen bg-slate-950 pb-24">
            {/* Header */}
            <header className="sticky top-0 z-[200] bg-slate-900 border-b border-gray-800 px-6 py-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-100">Vault</h1>
                    <VaultIcon className="w-5 h-5 text-gray-400" />
                </div>
            </header>

            {/* Content */}
            <main className="px-6 py-4">
                {/* Tab Toggle */}
                <div className="flex gap-2 bg-gray-800 p-1 rounded-lg mb-6">
                    <button
                        onClick={() => setActiveTab('contracts')}
                        className={`flex-1 py-2 px-4 rounded-md font-semibold text-sm transition-all ${activeTab === 'contracts'
                                ? 'bg-cyan-500 text-white shadow-lg'
                                : 'text-gray-400 hover:text-gray-200'
                            }`}
                    >
                        Contracts
                    </button>
                    <button
                        onClick={() => setActiveTab('stored')}
                        className={`flex-1 py-2 px-4 rounded-md font-semibold text-sm transition-all ${activeTab === 'stored'
                                ? 'bg-cyan-500 text-white shadow-lg'
                                : 'text-gray-400 hover:text-gray-200'
                            }`}
                    >
                        Stored Items
                    </button>
                </div>

                {/* Content Area */}
                {activeTab === 'contracts' ? (
                    <ContractsTab contracts={contracts} />
                ) : (
                    <StoredTab artifacts={storedArtifacts} />
                )}
            </main>

            <BottomNav />
        </div>
    );
}

function ContractsTab({ contracts }: { contracts: Contract[] }) {
    if (contracts.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <FileText className="w-10 h-10 text-gray-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-300 mb-2">No Active Contracts</h3>
                <p className="text-sm text-gray-500">You don't have any contracts at the moment</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {contracts.map((contract) => (
                <div key={contract.id} className="card cursor-pointer hover:shadow-lg transition-all">
                    <div className="flex items-start gap-3">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${contract.type === 'LOAN' ? 'bg-blue-500/10' :
                                contract.type === 'PAWN' ? 'bg-purple-500/10' :
                                    'bg-green-500/10'
                            }`}>
                            <FileText className={`w-6 h-6 ${contract.type === 'LOAN' ? 'text-blue-400' :
                                    contract.type === 'PAWN' ? 'text-purple-400' :
                                        'text-green-400'
                                }`} />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="font-bold text-gray-100">{contract.type} Contract</h3>
                                <span className={`text-xs px-2 py-1 rounded-full ${contract.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400' :
                                        contract.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-400' :
                                            'bg-gray-500/10 text-gray-400'
                                    }`}>
                                    {contract.status}
                                </span>
                            </div>
                            <p className="text-sm text-gray-400 mb-2">{contract.terms}</p>
                            <div className="flex items-center justify-between">
                                <span className="text-lg font-bold text-gray-100">₹{contract.amount.toLocaleString()}</span>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <Clock className="w-3 h-3" />
                                    Expires {formatExpiry(contract.expiresAt)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {contract.status === 'ACTIVE' && (
                        <div className="flex gap-2 mt-4">
                            <button className="flex-1 py-2 bg-cyan-500 text-white rounded-lg font-semibold text-sm hover:bg-cyan-600 transition">
                                Repay
                            </button>
                            <button className="flex-1 py-2 bg-gray-800 text-gray-300 rounded-lg font-semibold text-sm hover:bg-gray-700 transition">
                                Extend
                            </button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

function StoredTab({ artifacts }: { artifacts: StoredArtifact[] }) {
    if (artifacts.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <Package className="w-10 h-10 text-gray-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-300 mb-2">No Stored Items</h3>
                <p className="text-sm text-gray-500">Your vault is empty</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {artifacts.map((artifact) => (
                <div key={artifact.id} className="card cursor-pointer hover:shadow-lg transition-all">
                    <div className="flex items-center gap-3">
                        <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">📜</span>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-gray-100 mb-1">{artifact.name}</h3>
                            <p className="text-xs text-gray-500 mb-1">
                                Stored since {artifact.storedDate.toLocaleDateString()}
                            </p>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-yellow-400">Storage: ₹{artifact.storageFee}/mo</span>
                            </div>
                        </div>
                        <button className="p-2 hover:bg-gray-800 rounded-lg transition">
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}

function formatExpiry(date: Date): string {
    const days = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'today';
    if (days === 1) return 'tomorrow';
    if (days < 7) return `in ${days} days`;
    return date.toLocaleDateString();
}
