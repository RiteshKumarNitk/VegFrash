'use client';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { ArrowRight, ShoppingBag } from 'lucide-react';

export default function CartSummary() {
    const { items, total } = useCart();

    if (items.length === 0) return null;

    const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:bottom-8 md:w-96 z-50 animate-slide-up">
            <div className="bg-brand-dark rounded-xl p-4 shadow-xl flex items-center justify-between text-white backdrop-blur-md bg-opacity-95 border border-white/10">
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
