'use client';

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { Toaster } from 'sonner';

export default function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAuthPage = pathname === '/login' || pathname === '/signup';

    if (isAuthPage) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center bg-slate-900">
                {children}
            </div>
        );
    }

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen bg-slate-50">
                {children}
            </main>
        </div>
    );
}
