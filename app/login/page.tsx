'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, EyeOff, Lock, User as UserIcon } from 'lucide-react';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (res.ok) {
                if (data.user.isAdmin) {
                    router.push('/admin');
                } else {
                    router.push('/home');
                }
            } else {
                setError(data.error || 'Login failed');
            }
        } catch (err) {
            setError('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className=\"flex flex-col items-center justify-center min-h-screen bg-[var(--color-bg-primary)] p-6\">
            < div className =\"w-full max-w-md\">
    {/* Logo */ }
    <div className=\"flex justify-center mb-8\">
        < Image
    src =\"/bid-wars-logo.png\"
    alt =\"Bid Wars\"
    width = { 200}
    height = { 90}
    priority
    className =\"object-contain\"
        />
                </div >

        {/* Login Card */ }
        < div className =\"card-elevated p-8 space-y-6\">
            < div className =\"text-center\">
                < h1 className =\"text-2xl font-bold text-[var(--color-text-primary)] mb-2\">
                            Welcome Back
                        </h1 >
        <p className=\"text-sm text-[var(--color-text-tertiary)]\">
    Sign in to continue to Bid Wars
                        </p >
                    </div >

        { error && (
            <div className=\"bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm text-center\">
    { error }
                        </div >
                    )
}

<form onSubmit={handleLogin} className=\"space-y-5\">
{/* Username */ }
                        <div>
                            <label className=\"block text-sm font-medium text-[var(--color-text-secondary)] mb-2\">
                                Username
                            </label>
                            <div className=\"relative\">
    < div className =\"absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]\">
        < UserIcon size = { 18} />
                                </div >
    <input
        type=\"text\"
value = { username }
onChange = {(e) => setUsername(e.target.value)}
className =\"w-full pl-10 pr-4 py-3 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-accent-primary)] focus:border-transparent outline-none transition-all text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]\"
placeholder =\"Enter your username\"
required
    />
                            </div >
                        </div >

    {/* Password */ }
    < div >
    <label className=\"block text-sm font-medium text-[var(--color-text-secondary)] mb-2\">
Password
                            </label >
    <div className=\"relative\">
        < div className =\"absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]\">
            < Lock size = { 18} />
                                </div >
    <input
        type={showPassword ?\"text\" : \"password\"}
value = { password }
onChange = {(e) => setPassword(e.target.value)}
className =\"w-full pl-10 pr-12 py-3 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-accent-primary)] focus:border-transparent outline-none transition-all text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]\"
placeholder =\"Enter your password\"
required
    />
    <button
        type=\"button\"
onClick = {() => setShowPassword(!showPassword)}
className =\"absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors\"
    >
    { showPassword?<EyeOff size = { 18 } /> : <Eye size={18} />}
                                </button >
                            </div >
                        </div >

    {/* Forgot Password */ }
    < div className =\"text-right\">
        < Link
href =\"/forgot-password\" 
className =\"text-sm text-[var(--color-accent-primary)] hover:text-[var(--color-accent-secondary)] font-medium transition-colors\"
    >
    Forgot password ?
                            </Link >
                        </div >

    {/* Submit Button */ }
    < button
type =\"submit\"
disabled = { loading }
className =\"btn btn-primary w-full py-3 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed\"
    >
    { loading? 'Signing in...': 'Sign In' }
                        </button >
                    </form >

    {/* Sign Up Link */ }
    < div className =\"text-center pt-4 border-t border-[var(--color-border)]\">
        < p className =\"text-sm text-[var(--color-text-tertiary)]\">
                            Don't have an account?{' '}
    < Link
href =\"/signup\" 
className =\"text-[var(--color-accent-primary)] hover:text-[var(--color-accent-secondary)] font-semibold transition-colors\"
    >
    Sign up
                            </Link >
                        </p >
                    </div >
                </div >

    {/* Footer */ }
    < p className =\"text-center text-xs text-[var(--color-text-muted)] mt-8\">
                    © 2026 Bid Wars.All rights reserved.
                </p >
            </div >
        </div >
    );
}
