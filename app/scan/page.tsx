
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Html5QrcodeScanner } from 'html5-qrcode';
import Link from 'next/link';
import { ArrowLeft, ScanLine } from 'lucide-react';

export default function ScanPage() {
    const router = useRouter();
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [manualUsername, setManualUsername] = useState('');

    useEffect(() => {
        const scanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
            /* verbose= */ false
        );

        scanner.render(onScanSuccess, onScanFailure);

        function onScanSuccess(decodedText: string, decodedResult: any) {
            // Handle success
            setScanResult(decodedText);
            scanner.clear();
            router.push(`/send?to=${decodedText}`);
        }

        function onScanFailure(error: any) {
            // handle error, often ignorable if just scanning
        }

        return () => {
            scanner.clear().catch(error => console.error("Failed to clear scanner", error));
        };
    }, [router]);

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (manualUsername.trim()) {
            router.push(`/send?to=${manualUsername}`);
        }
    };

    return (
        <div className="min-h-screen bg-black flex flex-col text-white">
            <div className="p-4 flex items-center gap-4 relative z-10">
                <Link href="/dashboard" className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-lg font-semibold">Scan QR Code</h1>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-4 relative">
                <div className="w-full max-w-sm aspect-square bg-gray-900 rounded-3xl overflow-hidden shadow-2xl relative border border-gray-800">
                    <div id="reader" className="w-full h-full"></div>

                    {/* Overlay styling for scanner can be limited, but this container holds it */}
                    {!scanResult && (
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                            <div className="w-64 h-64 border-2 border-indigo-500 rounded-3xl relative">
                                <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-indigo-500 -mt-1 -ml-1"></div>
                                <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-indigo-500 -mt-1 -mr-1"></div>
                                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-indigo-500 -mb-1 -ml-1"></div>
                                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-indigo-500 -mb-1 -mr-1"></div>
                            </div>
                        </div>
                    )}
                </div>

                <p className="mt-8 text-gray-400 text-sm text-center">
                    Align QR code within the frame to scan
                </p>

                <div className="mt-8 w-full max-w-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="h-px bg-gray-800 flex-1"></div>
                        <span className="text-gray-500 text-xs uppercase tracking-widest">Or enter manually</span>
                        <div className="h-px bg-gray-800 flex-1"></div>
                    </div>

                    <form onSubmit={handleManualSubmit} className="flex gap-2">
                        <input
                            type="text"
                            value={manualUsername}
                            onChange={(e) => setManualUsername(e.target.value)}
                            className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="username"
                        />
                        <button
                            type="submit"
                            className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 transition"
                        >
                            <ScanLine size={24} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
