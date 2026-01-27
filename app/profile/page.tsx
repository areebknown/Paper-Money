
'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User, LogOut } from 'lucide-react';
import useSWR, { mutate } from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ProfilePage() {
    const router = useRouter();
    const { data: userData } = useSWR('/api/user', fetcher);

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        mutate('/api/user', null, { revalidate: false }); // Clear cache
        router.push('/login');
        router.refresh();
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <div className="bg-white p-4 shadow-sm flex items-center gap-4">
                <Link href="/dashboard" className="text-gray-600">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-lg font-semibold">Profile</h1>
            </div>

            <div className="p-6">
                <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col items-center mb-6">
                    <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                        <User size={40} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">{userData?.user?.username || 'User'}</h2>
                    <p className="text-gray-500 text-sm">ID: {userData?.user?.id.slice(0, 8)}...</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-4 p-4 text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-xs text-gray-400">PaperPay v1.0.0</p>
                </div>
            </div>
        </div>
    );
}
