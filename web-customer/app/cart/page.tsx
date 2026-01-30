'use client';
import { useCart } from '@/context/CartContext';
import Header from '@/components/ui/Header';
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
        <main className="min-h-screen bg-slate-50 pb-32">
            <Header />

            <div className="max-w-3xl mx-auto px-4 pt-6">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold">My Cart</h1>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Step 1 of 2</span>
                </div>

                {items.length === 0 ? (
                    <div className="text-center py-20 animate-in fade-in zoom-in">
                        <div className="text-6xl mb-4 grayscale opacity-50">🛒</div>
                        <h2 className="text-xl font-bold text-slate-700">Your cart is empty</h2>
                        <p className="text-slate-500 mb-6">Add items to get started</p>
                        <Link href="/" className="bg-brand text-white px-6 py-3 rounded-lg font-bold">
                            Browse Products
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4 animate-in slide-in-from-bottom-4 duration-500">
                        {/* Delivery Banner */}
                        <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-xl">
                                ⏱️
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">Delivery in 14 minutes</h3>
                                <p className="text-xs text-slate-500">Shipment of {items.length} items</p>
                            </div>
                        </div>

                        {/* Items List */}
                        <div className="bg-white rounded-xl shadow-sm p-4 divide-y divide-slate-100">
                            {items.map(item => (
                                <div key={item.id} className="flex items-center justify-between py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center text-2xl relative overflow-hidden">
                                            {item.image || '🥗'}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800 text-sm">{item.name}</h3>
                                            <p className="text-xs text-slate-500">₹{item.price} / {item.unit}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center bg-brand rounded-lg text-white h-9 shadow-sm">
                                        <button
                                            onClick={() => {
                                                if (item.quantity <= 1 && item.unit !== 'kg') removeItem(item.id);
                                                else if (item.quantity <= 0.5 && item.unit === 'kg') removeItem(item.id);
                                                else updateQuantity(item.id, item.unit === 'kg' ? -0.5 : -1);
                                            }}
                                            className="px-3 h-full font-bold hover:bg-brand-dark rounded-l-lg"
                                        >-</button>
                                        <span className="text-sm font-bold min-w-[24px] text-center">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.unit === 'kg' ? 0.5 : 1)}
                                            className="px-3 h-full font-bold hover:bg-brand-dark rounded-r-lg"
                                        >+</button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Bill Details */}
                        <div className="bg-white rounded-xl shadow-sm p-4">
                            <h3 className="font-bold text-sm mb-4">Bill Details</h3>

                            <div className="flex justify-between text-sm mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-600">Items total</span>
                                    <span className="bg-blue-50 text-blue-600 text-[10px] px-1 rounded border border-blue-100">Saved ₹{SAVINGS}</span>
                                </div>
                                <div className="flex gap-2">
                                    <span className="text-slate-400 line-through decoration-slate-400">₹{itemTotal + SAVINGS}</span>
                                    <span className="font-medium">₹{itemTotal}</span>
                                </div>
                            </div>

                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-slate-600 flex items-center gap-1">Delivery charge ⓘ</span>
                                {DELIVERY_CHARGE === 0 ? (
                                    <span className="text-brand font-bold">FREE</span>
                                ) : (
                                    <span>₹{DELIVERY_CHARGE}</span>
                                )}
                            </div>

                            <div className="flex justify-between text-sm mb-4">
                                <span className="text-slate-600 flex items-center gap-1">Handling charge ⓘ</span>
                                <span>₹{PLATFORM_FEE}</span>
                            </div>

                            <div className="border-t border-dashed pt-3 flex justify-between font-bold text-lg text-slate-800">
                                <span>Grand total</span>
                                <span>₹{GRAND_TOTAL}</span>
                            </div>
                        </div>

                        {/* Cancellation Policy */}
                        <div className="bg-white rounded-xl shadow-sm p-4 text-xs text-slate-500 mb-6">
                            <h3 className="font-bold text-slate-600 mb-1">Cancellation Policy</h3>
                            <p className="leading-relaxed">
                                Orders cannot be cancelled once packed for delivery. In case of unexpected delays, a refund will be provided, if applicable.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Bar: Conditional */}
            {items.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-2xl z-40">
                    <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
                        <div className="flex flex-col">
                            <span className="font-bold text-lg">₹{GRAND_TOTAL}</span>
                            <span className="text-xs text-brand font-bold uppercase">View Detailed Bill</span>
                        </div>

                        {user ? (
                            <Link
                                href="/checkout"
                                className="bg-brand text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-brand-dark transition-colors flex items-center gap-2"
                            >
                                Proceed to Checkout <span>→</span>
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                className="bg-brand text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-brand-dark transition-colors flex items-center gap-2"
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
