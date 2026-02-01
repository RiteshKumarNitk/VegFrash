'use client';

import { Home, Search, ShoppingBag, User } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { motion } from 'framer-motion';

export default function BottomNav() {
    const pathname = usePathname();
    const router = useRouter();
    const { items } = useCart();
    const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

    const navItems = [
        { label: 'Home', icon: Home, route: '/' },
        { label: 'Explore', icon: Search, route: '/explore' },
        { label: 'Cart', icon: ShoppingBag, route: '/cart', badge: cartCount },
        { label: 'Account', icon: User, route: '/account' },
    ];

    // Only show on mobile (hidden on lg screens)
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-2 lg:hidden z-50 pb-safe">
            <div className="flex justify-between items-center">
                {navItems.map((item) => {
                    const isActive = pathname === item.route;
                    const Icon = item.icon;

                    return (
                        <button
                            key={item.label}
                            onClick={() => router.push(item.route)}
                            className={`flex flex-col items-center gap-1 p-2 relative transition-all duration-300 ${isActive ? 'text-[#0C831F]' : 'text-gray-400'}`}
                        >
                            <div className="relative">
                                <Icon size={isActive ? 24 : 22} strokeWidth={isActive ? 2.5 : 2} />
                                {item.badge ? (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full"
                                    >
                                        {item.badge}
                                    </motion.span>
                                ) : null}
                            </div>
                            <span className={`text-[10px] font-medium ${isActive ? 'font-bold' : ''}`}>
                                {item.label}
                            </span>
                            {isActive && (
                                <motion.div
                                    layoutId="nav-pill"
                                    className="absolute -top-2 w-8 h-1 bg-[#0C831F] rounded-full"
                                />
                            )}
                        </button>
                    );
                })}
            </div>
            {/* Safe Area Spacer for iOS Home Bar */}
            <div className="h-1" />
        </div>
    );
}
