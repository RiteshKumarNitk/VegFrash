'use client';
import { useCart } from '@/context/CartContext';
import ModernHeader from '@/components/ui/ModernHeader';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export default function CartPage() {
    const { items, updateQuantity, removeItem, total: itemTotal } = useCart();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    // Billing Constants
    const PLATFORM_FEE = 2; // Fixed as per screenshot req
    const DELIVERY_CHARGE = itemTotal > 99 ? 0 : 25; // Free above 99, else 25
    const GRAND_TOTAL = itemTotal + PLATFORM_FEE + DELIVERY_CHARGE;
    const SAVINGS = 120; // Mock savings for demo visual

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            setLoading(false);
        };
        checkUser();
    }, []);

    return (
        <main className="min-h-screen bg-white pb-32">
            <ModernHeader deviceType="mobile" />

            <div className="max-w-3xl mx-auto px-4 pt-6">
                <div className="flex items-center gap-2 mb-6">
                    <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-slate-100">
                        <span className="text-xl">←</span>
                    </Link>
                    <h1 className="text-xl font-bold">Your Cart</h1>
                </div>

                {items.length === 0 ? (
                    <div className="text-center py-20 animate-in fade-in zoom-in">
                        <div className="w-40 h-40 mx-auto bg-slate-50 rounded-full flex items-center justify-center mb-6">
                            <span className="text-6xl text-slate-300">🛒</span>
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 mb-2">Your cart is empty</h2>
                        <p className="text-slate-500 mb-8 max-w-xs mx-auto">Looks like you haven't added anything to your cart yet.</p>
                        <Link href="/" className="bg-brand text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6 animate-slide-up">
                        {/* Delivery Banner */}
                        <div className="bg-indigo-50 p-4 rounded-xl flex items-center gap-4 border border-indigo-100">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-lg shadow-sm">
                                ⚡
                            </div>
                            <div>
                                <h3 className="font-bold text-indigo-900 text-sm">Delivery in 10 minutes</h3>
                                <p className="text-xs text-indigo-700/80">Shipment of {items.length} items</p>
                            </div>
                        </div>

                        {/* Items List */}
                        <div className="bg-white rounded-xl border border-slate-100 divide-y divide-slate-50 shadow-sm">
                            {items.map(item => (
                                <div key={item.id} className="flex items-center justify-between p-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-slate-50 rounded-lg flex items-center justify-center text-2xl border border-slate-100 overflow-hidden relative">
                                            {item.image?.startsWith('http') ? (
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span>{item.image || '🥗'}</span>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800 text-sm line-clamp-1">{item.name}</h3>
                                            <p className="text-xs text-slate-500">₹{item.price} / {item.unit}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center bg-brand-dark/5 rounded-lg border border-brand/10 h-8">
                                        <button
                                            onClick={() => {
                                                if (item.quantity <= 1 && item.unit !== 'kg') removeItem(item.id);
                                                else if (item.quantity <= 0.5 && item.unit === 'kg') removeItem(item.id);
                                                else updateQuantity(item.id, item.unit === 'kg' ? -0.5 : -1);
                                            }}
                                            className="px-2.5 h-full text-brand-dark font-bold hover:bg-brand/10 rounded-l-lg"
                                        >-</button>
                                        <span className="text-xs font-bold min-w-[20px] text-center text-brand-dark">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.unit === 'kg' ? 0.5 : 1)}
                                            className="px-2.5 h-full text-brand-dark font-bold hover:bg-brand/10 rounded-r-lg"
                                        >+</button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Bill Details */}
                        <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
                            <h3 className="font-bold text-sm mb-4 text-slate-800">Bill Details</h3>

                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Items total</span>
                                    <div className="flex flex-col items-end">
                                        <span className="text-xs text-slate-400 line-through decoration-slate-400">₹{itemTotal + SAVINGS}</span>
                                        <span className="font-medium">₹{itemTotal}</span>
                                    </div>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-slate-500">Delivery charge</span>
                                    {DELIVERY_CHARGE === 0 ? (
                                        <span className="text-brand font-bold text-xs uppercase">Free</span>
                                    ) : (
                                        <span>₹{DELIVERY_CHARGE}</span>
                                    )}
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-slate-500">Handling charge</span>
                                    <span>₹{PLATFORM_FEE}</span>
                                </div>

                                <div className="border-t border-slate-100 pt-3 flex justify-between font-bold text-base text-slate-800">
                                    <span>Grand total</span>
                                    <span>₹{GRAND_TOTAL}</span>
                                </div>
                            </div>
                        </div>

                        {/* Savings Banner */}
                        <div className="bg-green-50/50 border border-green-100 rounded-lg p-3 flex items-center justify-center gap-2 text-xs font-medium text-green-700">
                            <span className="text-lg">🎉</span>
                            You saved ₹{SAVINGS} on this order!
                        </div>

                        {/* Cancellation Policy */}
                        <div className="text-[10px] text-slate-400 px-2 leading-relaxed text-center max-w-sm mx-auto">
                            Orders cannot be cancelled once packed for delivery. In case of unexpected delays, a refund will be provided.
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Bar: Conditional */}
            {items.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 shadow-[0_-5px_10px_rgba(0,0,0,0.02)] z-40">
                    <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
                        <div className="flex flex-col">
                            <span className="font-bold text-lg text-slate-800">₹{GRAND_TOTAL}</span>
                            <span className="text-[10px] text-brand font-bold uppercase tracking-wider cursor-pointer">View Detailed Bill</span>
                        </div>

                        {user ? (
                            <Link
                                href="/checkout"
                                className="bg-brand text-white px-6 py-3 rounded-xl font-bold text-base hover:bg-brand-dark hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-brand/20"
                            >
                                Proceed to Pay <span>→</span>
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                className="bg-slate-800 text-white px-6 py-3 rounded-xl font-bold text-base hover:bg-slate-700 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 shadow-lg"
                            >
                                Login to Proceed <span>→</span>
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </main>
    );
}
