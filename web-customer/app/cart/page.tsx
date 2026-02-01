'use client';
import { useCart } from '@/context/CartContext';
import ModernHeader from '@/components/ui/ModernHeader';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';

export default function CartPage() {
    const { items, updateQuantity, removeItem, total: itemTotal } = useCart();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    const [deliveryMsg, setDeliveryMsg] = useState('Next day early morning fresh vegetable');

    // Fee States
    const [platformFee, setPlatformFee] = useState(2);
    const [deliveryFee, setDeliveryFee] = useState(25);
    const [freeDeliveryAbove, setFreeDeliveryAbove] = useState(99);

    useEffect(() => {
        const fetchSettings = async () => {
            const { data } = await supabase.from('site_settings').select('*').eq('key', 'order_rules').single();
            if (data?.value) {
                if (data.value.delivery_msg) setDeliveryMsg(data.value.delivery_msg);
                if (data.value.handling_fee !== undefined) setPlatformFee(data.value.handling_fee);
                if (data.value.delivery_fee !== undefined) setDeliveryFee(data.value.delivery_fee);
                if (data.value.free_delivery_above !== undefined) setFreeDeliveryAbove(data.value.free_delivery_above);
            }
        };
        fetchSettings();

        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            setLoading(false);
        };
        checkUser();
    }, []);

    // Billing Calculations
    const DELIVERY_CHARGE = itemTotal > freeDeliveryAbove ? 0 : deliveryFee;
    const GRAND_TOTAL = itemTotal + platformFee + DELIVERY_CHARGE;
    const SAVINGS = 120; // Mock

    return (
        <main className="min-h-screen bg-slate-50 pb-32">
            <ModernHeader deviceType="desktop" />

            <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
                <div className="flex items-center gap-3 mb-8">
                    <Link href="/" className="md:hidden p-2 -ml-2 text-slate-400 hover:text-slate-800"><ArrowRight className="rotate-180" /></Link>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 flex items-center gap-3">
                        <ShoppingBag className="text-brand hidden md:block" size={32} /> Your Cart
                        {items.length > 0 && <span className="text-lg font-medium text-slate-400">({items.length} items)</span>}
                    </h1>
                </div>

                {items.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-slate-100 max-w-3xl mx-auto">
                        <div className="w-40 h-40 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-6">
                            <span className="text-6xl text-slate-300">🛒</span>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Your cart is empty</h2>
                        <p className="text-slate-500 mb-8 max-w-xs mx-auto">Looks like you haven't added anything to your cart yet.</p>
                        <Link href="/" className="bg-brand text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all inline-block">
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* LEFT: Cart Items */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Delivery Banner */}
                            <div className="bg-indigo-50 p-6 rounded-2xl flex items-center gap-4 border border-indigo-100">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-xl shadow-sm">
                                    ⚡
                                </div>
                                <div>
                                    <h3 className="font-bold text-indigo-900 text-sm md:text-base">{deliveryMsg}</h3>
                                    <p className="text-xs text-indigo-700/80">Shipment of {items.length} items</p>
                                </div>
                            </div>

                            {/* Items List */}
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                {items.map((item, idx) => (
                                    <div key={item.id} className={`flex flex-col sm:flex-row items-center justify-between p-6 gap-6 ${idx !== items.length - 1 ? 'border-b border-slate-50' : ''}`}>
                                        <div className="flex items-center gap-6 w-full sm:w-auto">
                                            <div className="w-20 h-20 bg-slate-50 rounded-xl flex items-center justify-center text-3xl border border-slate-100 overflow-hidden shrink-0">
                                                {item.image?.startsWith('http') ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <span>{item.image || '🥗'}</span>}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-800 text-base mb-1">{item.name}</h3>
                                                <p className="text-sm text-slate-500 font-medium">₹{item.price} / {item.unit}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between w-full sm:w-auto gap-8">
                                            <div className="flex items-center bg-slate-100 rounded-lg h-10">
                                                <button
                                                    onClick={() => {
                                                        if (item.quantity <= 1 && item.unit !== 'kg') removeItem(item.id);
                                                        else if (item.quantity <= 0.5 && item.unit === 'kg') removeItem(item.id);
                                                        else updateQuantity(item.id, item.unit === 'kg' ? -0.5 : -1);
                                                    }}
                                                    className="w-10 h-full text-slate-600 font-bold hover:bg-slate-200 rounded-l-lg transition-colors"
                                                >-</button>
                                                <span className="text-sm font-bold min-w-[30px] text-center text-slate-800">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.unit === 'kg' ? 0.5 : 1)}
                                                    className="w-10 h-full text-slate-600 font-bold hover:bg-slate-200 rounded-r-lg transition-colors"
                                                >+</button>
                                            </div>
                                            <div className="text-right min-w-[80px]">
                                                <p className="font-bold text-slate-800 text-lg">₹{item.price * item.quantity}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* RIGHT: Summary (Sticky) */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm sticky top-24 space-y-6">
                                <h3 className="font-bold text-slate-800 text-lg">Order Summary</h3>

                                <div className="space-y-4 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Items Total</span>
                                        <span className="font-bold text-slate-800">₹{itemTotal}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Delivery Fee</span>
                                        {DELIVERY_CHARGE === 0 ? <span className="text-brand font-bold uppercase text-xs">Free</span> : <span>₹{DELIVERY_CHARGE}</span>}
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Handling Fee</span>
                                        <span>₹{platformFee}</span>
                                    </div>
                                    <div className="border-t border-slate-100 pt-4 flex justify-between text-lg font-extrabold text-slate-800">
                                        <span>Total Amount</span>
                                        <span>₹{GRAND_TOTAL}</span>
                                    </div>
                                </div>

                                <div className="bg-green-50 text-green-700 p-3 rounded-lg text-xs font-bold text-center border border-green-100">
                                    You will save ₹{SAVINGS} on this order!
                                </div>

                                {user ? (
                                    <Link href="/checkout" className="w-full bg-brand text-white py-4 rounded-xl font-bold text-center block hover:bg-brand-dark transition-all shadow-lg shadow-brand/20">
                                        Proceed to Checkout
                                    </Link>
                                ) : (
                                    <Link href="/login" className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-center block hover:bg-slate-800 transition-all shadow-lg">
                                        Login to Checkout
                                    </Link>
                                )}

                                <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                                    <ShieldCheck size={14} /> 100% Safe & Secure Payments
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile Bottom Bar (Hidden on Desktop) */}
            {items.length > 0 && (
                <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 shadow-[0_-5px_10px_rgba(0,0,0,0.02)] z-40">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex flex-col">
                            <span className="font-bold text-lg text-slate-800">₹{GRAND_TOTAL}</span>
                            <span className="text-[10px] text-brand font-bold uppercase tracking-wider">View Bill</span>
                        </div>
                        <Link href={user ? "/checkout" : "/login"} className="bg-brand text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-brand/20">
                            {user ? 'Checkout' : 'Login'}
                        </Link>
                    </div>
                </div>
            )}
        </main>
    );
}
