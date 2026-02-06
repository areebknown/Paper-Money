'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, Construction } from 'lucide-react';

export default function EditArtifactPage({ params }: { params: { id: string } }) {
    return (
        <div className="px-6 py-6 min-h-screen bg-[#0a0a0a] text-gray-100 flex flex-col items-center justify-center">
            <div className="max-w-md text-center">
                <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mb-6 mx-auto animate-pulse">
                    <Construction className="w-10 h-10 text-purple-500" />
                </div>
                <h1 className="text-3xl font-bold mb-4">Under Construction</h1>
                <p className="text-gray-400 mb-8">
                    The editor for Artifact <span className="text-purple-400 font-mono">{params.id}</span> is coming soon.
                    You can currently delete or re-create artifacts if changes are needed.
                </p>
                <Link href="/admin/artifacts" className="btn btn-primary px-8 py-3 bg-white text-black hover:bg-gray-200 rounded-full font-bold transition">
                    <ChevronLeft className="w-4 h-4 inline mr-2" />
                    Back to Artifacts
                </Link>
            </div>
        </div>
    );
}
