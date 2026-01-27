
'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User, LogOut } from 'lucide-react';
import useSWR, { mutate } from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ProfilePage() {
    const router = useRouter();
    const { data: userData } = useSWR('/api/user', fetcher);


    const [email, setEmail] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Sync email state when data loads
    useEffect(() => {
        if (userData?.user?.email) {
            setEmail(userData.user.email);
        }
    }, [userData]);

    const handleUpdateEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const res = await fetch('/api/user', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage({ type: 'success', text: 'Email updated successfully!' });
                mutate('/api/user');
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to update email' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Something went wrong' });
        } finally {
            setIsSaving(false);
        }
    };

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

                <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Account Settings</h3>

                    {message.text && (
                        <div className={`p-3 rounded-lg mb-4 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleUpdateEmail} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-black placeholder:text-gray-500"
                                placeholder="your@email.com"
                                required
                            />
                            <p className="mt-1 text-xs text-gray-500">Link your email to enable password recovery.</p>
                        </div>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="w-full bg-indigo-600 text-white font-semibold py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                        >
                            {isSaving ? 'Saving...' : 'Save Email'}
                        </button>
                    </form>
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

