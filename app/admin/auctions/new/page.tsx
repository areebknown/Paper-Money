'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Calendar, Clock, DollarSign, Trophy } from 'lucide-react';
import Link from 'next/link';

export default function NewAuctionPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        startTime: '',
        duration: '300',
        startingPrice: '',
        artifactId: '',
        rankRequirement: 'BRONZE',
        status: 'SCHEDULED',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/auctions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    startTime: new Date(formData.startTime).toISOString(),
                    duration: parseInt(formData.duration),
                    startingPrice: parseFloat(formData.startingPrice),
                }),
            });

            if (res.ok) {
                alert('Auction created successfully!');
                router.push('/admin/auctions');
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to create auction');
            }
        } catch (e) {
            alert('Network error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="px-6 py-6">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <Link href="/admin/auctions" className="flex items-center gap-2 text-gray-400 hover:text-gray-200 mb-6 transition">
                    <ChevronLeft className="w-4 h-4" />
                    Back to Auctions
                </Link>

                <h1 className="text-2xl font-bold text-gray-100 mb-6">Create New Auction</h1>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title */}
                    <FormField
                        label="Auction Title"
                        placeholder="Shutter #127"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                    />

                    {/* Description */}
                    <div className="card">
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 outline-none focus:ring-2 focus:ring-red-500 resize-none"
                            rows={4}
                            placeholder="Describe the auction..."
                            required
                        />
                    </div>

                    {/* Start Time */}
                    <FormField
                        label="Start Time"
                        type="datetime-local"
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        required
                        icon={<Calendar className="w-5 h-5 text-gray-500" />}
                    />

                    {/* Duration (seconds) */}
                    <FormField
                        label="Duration (seconds)"
                        type="number"
                        placeholder="300"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        required
                        icon={<Clock className="w-5 h-5 text-gray-500" />}
                        helper="Default: 300s (5 minutes)"
                    />

                    {/* Starting Price */}
                    <FormField
                        label="Starting Price"
                        type="number"
                        placeholder="10000"
                        value={formData.startingPrice}
                        onChange={(e) => setFormData({ ...formData, startingPrice: e.target.value })}
                        required
                        icon={<DollarSign className="w-5 h-5 text-gray-500" />}
                    />

                    {/* Artifact Selection */}
                    <div className="card">
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                            <Trophy className="w-4 h-4 inline mr-2" />
                            Artifact
                        </label>
                        <select
                            value={formData.artifactId}
                            onChange={(e) => setFormData({ ...formData, artifactId: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 outline-none focus:ring-2 focus:ring-red-500"
                            required
                        >
                            <option value="">Select an artifact...</option>
                            <option value="artifact1">Ancient Vase (RARE)</option>
                            <option value="artifact2">Gold Coin (EPIC)</option>
                            <option value="artifact3">Antique Watch (LEGENDARY)</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-2">Artifacts must be created first in Artifacts section</p>
                    </div>

                    {/* Rank Requirement */}
                    <div className="card">
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Minimum Rank</label>
                        <select
                            value={formData.rankRequirement}
                            onChange={(e) => setFormData({ ...formData, rankRequirement: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 outline-none focus:ring-2 focus:ring-red-500"
                        >
                            <option value="BRONZE">Bronze</option>
                            <option value="SILVER">Silver</option>
                            <option value="GOLD">Gold</option>
                            <option value="PLATINUM">Platinum</option>
                            <option value="DIAMOND">Diamond</option>
                        </select>
                    </div>

                    {/* Status */}
                    <div className="card">
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Status</label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 outline-none focus:ring-2 focus:ring-red-500"
                        >
                            <option value="DRAFT">Draft</option>
                            <option value="SCHEDULED">Scheduled</option>
                            <option value="LIVE">Live</option>
                        </select>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-red-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-red-700 transition disabled:opacity-50"
                    >
                        {loading ? 'Creating...' : 'Create Auction'}
                    </button>
                </form>
            </div>
        </div>
    );
}

function FormField({
    label,
    type = 'text',
    placeholder,
    value,
    onChange,
    required,
    icon,
    helper
}: {
    label: string;
    type?: string;
    placeholder?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
    icon?: React.ReactNode;
    helper?: string;
}) {
    return (
        <div className="card">
            <label className="block text-sm font-semibold text-gray-300 mb-2">{label}</label>
            <div className="relative">
                {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2">{icon}</div>}
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    className={`w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 outline-none focus:ring-2 focus:ring-red-500 ${icon ? 'pl-12' : ''
                        }`}
                />
            </div>
            {helper && <p className="text-xs text-gray-500 mt-2">{helper}</p>}
        </div>
    );
}
