'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { ArrowRight, ShoppingBag, X } from 'lucide-react';

export default function CartSummary() {
    const { items, total } = useCart();
    const [isVisible, setIsVisible] = useState(true);

    // Re-show if items change significantly (optional, but good for UX)
    useEffect(() => {
        if (items.length > 0) {
            setIsVisible(true);
        }
    }, [items.length]);

    if (items.length === 0 || !isVisible) return null;

    const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-8 md:bottom-8 md:w-96 z-50 animate-slide-up">
            <div className="bg-brand-dark rounded-xl p-4 shadow-xl flex items-center justify-between text-white backdrop-blur-md bg-opacity-95 border border-white/10 relative">
                {/* Close Button */}
                <button
                    onClick={() => setIsVisible(false)}
                    className="absolute -top-2 -right-2 bg-white text-slate-800 rounded-full p-1 shadow-lg hover:bg-slate-100 transition-colors border border-slate-200"
                >
                    <X size={14} />
                </button>

                <div className="flex flex-col">
                    <span className="text-xs font-medium text-brand-light uppercase tracking-wider flex items-center gap-1">
                        <ShoppingBag size={12} /> {itemCount} Items
                    </span>
                    <span className="font-bold text-lg">₹{total}</span>
                </div>

                <Link href="/cart" className="flex items-center gap-2 font-bold text-sm bg-white/10 px-4 py-2 rounded-lg border border-white/10 relative z-10 hover:bg-white/20 transition-colors group">
                    View Cart <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
        </div>
    );
}
