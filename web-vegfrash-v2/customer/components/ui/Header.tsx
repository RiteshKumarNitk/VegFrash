'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { createClient } from '@/lib/supabase';
import ProfileSidebar from './ProfileSidebar';

type HeaderProps = {
    deviceType?: 'mobile' | 'desktop';
};

export default function Header({ deviceType = 'desktop' }: HeaderProps) {
    const { total, count } = useCart();
    const [mounted, setMounted] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [location, setLocation] = useState('Select Location');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const supabase = createClient();

    useEffect(() => {
        setMounted(true);
        checkUser();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        // Mock fetching saved address if logged in
        if (user) {
            // In real app, fetch default address
            setLocation('Home - Koramangala');
        }
    };

    const CartButton = () => (
        <Link href="/cart" className="bg-brand text-white px-2 lg:px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-brand-dark transition-colors animate-in fade-in">
            <span className="text-lg">🛒</span>
            {mounted && count > 0 ? (
                <div className="flex flex-col items-start leading-none">
                    <span className="text-xs font-medium">{count} items</span>
                    <span className="text-[10px] lg:text-sm">₹{total}</span>
                </div>
            ) : (
                <span className="hidden lg:inline text-sm">My Cart</span>
            )}
        </Link>
    );

    const UserAvatar = () => (
        user ? (
            <button
                onClick={() => setSidebarOpen(true)}
                className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition-colors outline-none focus:ring-2 focus:ring-brand/20"
                aria-label="Open Profile"
            >
                <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-brand text-white flex items-center justify-center font-bold text-lg border border-transparent hover:border-brand/20">
                    {user.email?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium hidden xl:block max-w-[100px] truncate text-slate-700">{user.email?.split('@')[0]}</span>
            </button>
        ) : (
            <Link href="/login" className="flex items-center gap-2 text-slate-600 hover:text-black">
                <span className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-xl">👤</span>
                <span className="hidden lg:inline font-medium">Login</span>
            </Link>
        )
    );

    // Render Mobile Header
    if (deviceType === 'mobile') {
        return (
            <>
                <ProfileSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                <header className="sticky top-0 z-50 bg-white shadow-sm pb-2">
                    <div className="flex items-center justify-between px-4 py-3">
                        <div className="flex flex-col">
                            <h1 className="text-2xl font-extrabold text-brand tracking-tight">VegFrash</h1>
                            <div className="flex items-center gap-1 text-xs font-bold text-slate-700">
                                <span>⚡ 10m</span>
                                <span className="text-slate-300">|</span>
                                <span className="truncate max-w-[120px]">{location}</span>
                                <span className="text-xs">▼</span>
                            </div>
                        </div>
                        <UserAvatar />
                    </div>

                    {/* Mobile Cart Floating Bar */}
                    {mounted && count > 0 && (
                        <Link href="/cart" className="fixed bottom-4 left-4 right-4 bg-brand text-white p-3 rounded-xl shadow-xl z-50 flex justify-between items-center animate-slide-up">
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold">{count} ITEMS</span>
                                <span className="font-bold">₹{total}</span>
                            </div>
                            <span className="font-bold flex items-center gap-1">View Cart <span>→</span></span>
                        </Link>
                    )}

                    <div className="px-4">
                        <div className="flex items-center gap-3 px-3 py-3 rounded-lg border bg-slate-50 border-slate-200">
                            <span className="text-lg">🔍</span>
                            <input
                                type="text"
                                placeholder="Search &quot;milk&quot;"
                                className="flex-1 bg-transparent outline-none text-sm font-medium placeholder:text-slate-400"
                            />
                        </div>
                    </div>
                </header>
            </>
        );
    }

    // Desktop View (Responsive)
    return (
        <>
            <ProfileSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm h-16 lg:h-20 flex items-center px-4 lg:px-20 justify-between gap-4 lg:gap-8 transition-all">

                {/* Logo & Location */}
                <div className="flex items-center gap-4 lg:gap-8 shrink-0">
                    <Link href="/" className="flex flex-col lg:border-r border-slate-200 pr-0 lg:pr-6">
                        <h1 className="text-2xl lg:text-3xl font-extrabold text-brand tracking-tighter">blinkit</h1>
                    </Link>
                    <div className="hidden md:flex flex-col cursor-pointer hover:opacity-75 transition-opacity max-w-[200px]">
                        <h2 className="font-extrabold text-sm lg:text-lg leading-none">Delivery in 8 minutes</h2>
                        <div className="flex items-center gap-1 text-xs lg:text-sm text-slate-500 hover:text-brand truncate">
                            <span className="truncate">{location}</span>
                            <span className="text-[10px]">▼</span>
                        </div>
                    </div>
                </div>

                {/* Search Bar - Flex Grow */}
                <div className="hidden sm:flex flex-1 max-w-xl bg-slate-50 border border-slate-200 rounded-lg items-center px-4 py-2 hover:shadow-sm focus-within:shadow-md transition-shadow">
                    <span className="text-lg text-slate-400 mr-3">🔍</span>
                    <input
                        type="text"
                        placeholder="Search &quot;sugar&quot;"
                        className="flex-1 bg-transparent outline-none text-sm font-medium text-slate-700 min-w-0"
                    />
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-4 lg:gap-6 shrink-0">
                    <UserAvatar />
                    <CartButton />
                </div>
            </header>
        </>
    );
}
