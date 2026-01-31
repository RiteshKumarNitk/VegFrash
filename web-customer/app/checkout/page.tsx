'use client';
import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import ModernHeader from '@/components/ui/ModernHeader';
import AddressSelector from '@/components/features/AddressSelector';
import Link from 'next/link';
import ReactConfetti from 'react-confetti';

export default function CheckoutPage() {
    const { items, total, clearCart } = useCart();
    const [selectedAddress, setSelectedAddress] = useState<any>(null); // Store full object
    const [placing, setPlacing] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    }, []);

    const handlePlaceOrder = async () => {
        if (!selectedAddress) return alert("Please select a delivery address");
        setPlacing(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert("Please login first");
                router.push('/login');
                return;
            }

            // 1. Create Order
            const PLATFORM_FEE = 2;
            const DELIVERY_CHARGE = total > 99 ? 0 : 25;
            const GRAND_TOTAL = total + PLATFORM_FEE + DELIVERY_CHARGE;

            const { data: order, error: orderError } = await supabase.from('orders').insert({
                user_id: user.id,
                total_amount: GRAND_TOTAL,
                platform_fee: PLATFORM_FEE,
                delivery_charge: DELIVERY_CHARGE,
                status: 'placed',
                delivery_address_snapshot: selectedAddress,
                payment_status: 'pending'
            }).select().single();

            if (orderError) throw orderError;

            // 2. Insert Order Items
            const orderItems = items.map(item => ({
                order_id: order.id,
                product_id: item.id,
                quantity: item.quantity,
                price_at_time: item.price,
                unit: item.unit
            }));

            const { error: itemsError } = await supabase.from('order_items').insert(orderItems);

            if (itemsError) {
                console.warn("Items insert failed:", itemsError);
            }

            // Success
            clearCart();
            setOrderComplete(true);

        } catch (err: any) {
            console.error(err);
            alert("Failed to place order: " + err.message);
        } finally {
            setPlacing(false);
        }
    };

    if (orderComplete) {
        return (
            <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
                <ReactConfetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={500} />

                <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-sm w-full animate-scale-in relative z-10">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                        <span className="text-5xl">🛵</span>
                    </div>
                    <h1 className="text-2xl font-extrabold text-slate-800 mb-2">Order Placed!</h1>
                    <p className="text-slate-500 mb-8 font-medium">Your items are being packed.<br />Arriving in 12 minutes.</p>
                    <Link href="/" className="block w-full bg-brand text-white py-3.5 rounded-xl font-bold hover:bg-brand-dark transition-all hover:scale-105 shadow-lg shadow-brand/20">
                        Continue Shopping
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-white pb-24">
            <ModernHeader deviceType="mobile" />

            <div className="max-w-4xl mx-auto px-4 pt-6 grid md:grid-cols-2 gap-8">

                {/* Left Column: Address & Payment */}
                <div className="space-y-6">
                    <AddressSelector
                        selectedId={selectedAddress?.id || null}
                        onSelect={(id, details) => setSelectedAddress(details)}
                    />

                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <span className="bg-brand/10 p-1.5 rounded-lg text-brand text-lg">💳</span> Payment Method
                        </h3>
                        <div className="p-4 border border-brand bg-emerald-50/50 rounded-xl flex items-center gap-4 relative overflow-hidden group cursor-pointer transition-all hover:border-brand-dark">
                            <span className="text-2xl relative z-10">💵</span>
                            <div className="relative z-10">
                                <h4 className="font-bold text-sm text-brand-dark">Cash on Delivery</h4>
                                <p className="text-xs text-slate-500">Pay cash or UPI upon delivery</p>
                            </div>
                            <div className="ml-auto w-5 h-5 rounded-full border-[5px] border-brand bg-white"></div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Bill Summary */}
                <div className="bg-slate-50 p-6 rounded-2xl h-fit border border-slate-100 sticky top-24">
                    <h3 className="font-bold text-slate-800 mb-4 text-lg">Order Summary</h3>

                    <div className="space-y-3 mb-6">
                        {items.map(item => (
                            <div key={item.id} className="flex justify-between text-sm items-center">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded bg-white flex items-center justify-center text-sm border border-slate-200">
                                        {item.image || '🥗'}
                                    </div>
                                    <span className="text-slate-600 font-medium">{item.name} <span className="text-xs text-slate-400">x{item.quantity}</span></span>
                                </div>
                                <span className="font-bold text-slate-700">₹{item.price * item.quantity}</span>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-dashed border-slate-300 pt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Item Total</span>
                            <span>₹{total}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Delivery Charge</span>
                            <span className="text-brand font-bold">FREE</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Handling Fee</span>
                            <span>₹2</span>
                        </div>
                        <div className="border-t pt-3 mt-2 flex justify-between font-extrabold text-lg text-slate-900">
                            <span>To Pay</span>
                            <span>₹{total + 2}</span>
                        </div>
                    </div>

                    <button
                        onClick={handlePlaceOrder}
                        disabled={placing || items.length === 0}
                        className="w-full mt-6 bg-brand text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-brand/20 hover:bg-brand-dark hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {placing ? (
                            <span className="animate-pulse">Placing Order...</span>
                        ) : (
                            <>PROCEED TO PAY <span className="text-brand-light">₹{total + 2}</span></>
                        )}
                    </button>

                    <div className="text-center mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
                        <span>🔒</span> Secure Payment
                    </div>
                </div>

            </div>
        </main>
    );
}
