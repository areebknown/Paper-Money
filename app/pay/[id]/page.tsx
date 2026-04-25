'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import { Loader2 } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(r => r.json());

/**
 * /pay/[id]
 * Fetches the target user's username by their DB id,
 * then redirects to /payment?pay={username} so the Pay modal opens pre-filled.
 */
export default function PayRedirectPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const { data, error } = useSWR(id ? `/api/profile/${id}` : null, fetcher, {
        revalidateOnFocus: false,
    });

    useEffect(() => {
        if (data?.profile?.username) {
            router.replace(`/payment?pay=${encodeURIComponent(data.profile.username)}`);
        } else if (error || data?.error) {
            router.replace('/payment');
        }
    }, [data, error, router]);

    return (
        <div className="min-h-screen bg-[#090f1f] flex items-center justify-center">
            <Loader2 size={32} className="animate-spin text-[#FBBF24]" />
        </div>
    );
}
