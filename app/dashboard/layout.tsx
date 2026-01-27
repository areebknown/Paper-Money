
import { BottomNav } from '@/components/BottomNav';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <main className="max-w-md mx-auto min-h-screen bg-white shadow-2xl overflow-hidden relative">
                {children}
            </main>
            <div className="max-w-md mx-auto relative">
                <BottomNav />
            </div>
        </div>
    );
}
