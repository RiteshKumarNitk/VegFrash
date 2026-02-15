'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Package, ShoppingCart, Settings, LogOut, Truck, Layers, Tags, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

const NAV_ITEMS = [
    { label: 'Overview', href: '/', icon: LayoutDashboard },
    { label: 'Live Orders', href: '/orders', icon: Truck, badge: true },
    { label: 'Customers', href: '/customers', icon: ShoppingCart },
    { label: 'Coupons', href: '/coupons', icon: Tags },
    { label: 'Staff Accounts', href: '/staff', icon: Users },
    { label: 'Products', href: '/products', icon: Package },
    { label: 'Categories', href: '/categories', icon: Tags },
    { label: 'Live Control', href: '/stock', icon: Layers },
    { label: 'Batch Inventory', href: '/inventory', icon: Layers },
    { label: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    return (
        <aside className="w-64 bg-white border-r border-slate-200 h-screen flex flex-col fixed left-0 top-0 z-50">
            <div className="p-6 border-b border-slate-100">
                <div className="flex items-center gap-2 group">
                    <div className="w-9 h-9 bg-brand rounded-xl flex items-center justify-center text-white text-xl shadow-lg shadow-brand/20 group-hover:scale-105 transition-transform">
                        🍃
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-slate-800 tracking-tight">Veg<span className="text-brand">Frash</span></h1>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest -mt-1">Store Ops</p>
                    </div>
                </div>
            </div>

            <div className="p-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">Menu</p>
                <nav className="space-y-1">
                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group",
                                    isActive
                                        ? "bg-slate-900 text-white shadow-md shadow-slate-900/10 scale-[1.02]"
                                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                )}
                            >
                                <Icon size={18} className={cn("transition-colors", isActive ? "text-brand" : "text-slate-400 group-hover:text-slate-600")} />
                                <span className="font-medium text-sm flex-1">{item.label}</span>
                                {item.badge && (
                                    <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="mt-auto p-4 border-t border-slate-100 bg-slate-50/50">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2 w-full text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                >
                    <LogOut size={18} />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
}
