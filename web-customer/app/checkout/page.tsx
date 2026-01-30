'use client';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Header from '@/components/ui/Header';
import AddressSelector from '@/components/features/AddressSelector';
import Link from 'next/link';

export default function CheckoutPage() {
    const { items, total, clearCart } = useCart();
    const [selectedAddress, setSelectedAddress] = useState<any>(null); // Store full object
    const [placing, setPlacing] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);
    const supabase = createClient();
    const router = useRouter();

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
            // Calculate fees again on server/checkout side to be safe
            // Ideally should come from a centralized calculator
            const PLATFORM_FEE = 2;
            const DELIVERY_CHARGE = total > 99 ? 0 : 25;
            const GRAND_TOTAL = total + PLATFORM_FEE + DELIVERY_CHARGE;

            const { data: order, error: orderError } = await supabase.from('orders').insert({
                user_id: user.id,
                total_amount: GRAND_TOTAL,
                platform_fee: PLATFORM_FEE,
                delivery_charge: DELIVERY_CHARGE,
                status: 'placed',
                delivery_address_snapshot: selectedAddress, // Use the stored object directly
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

            // Supabase insert does not throw by default, calls return { error }
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
            <main className="min-h-screen bg-slate-50 pb-20">
                <Header />
                <div className="max-w-md mx-auto px-4 pt-20 text-center">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in">
                        <span className="text-5xl">✅</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 mb-2">Order Placed!</h1>
                    <p className="text-slate-600 mb-8">Your fresh groceries will arrive in 10 minutes.</p>
                    <Link href="/" className="bg-brand text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-dark transition-colors">
                        Continue Shopping
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50 pb-24">
            <Header />

            <div className="max-w-4xl mx-auto px-4 pt-6 grid md:grid-cols-2 gap-6">

                {/* Left Column: Address & Payment */}
                <div className="space-y-6">
                    <AddressSelector
                        selectedId={selectedAddress?.id || null}
                        onSelect={(id, details) => setSelectedAddress(details)}
                    />

                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                        <h3 className="font-bold text-slate-800 mb-4">Payment Method</h3>
                        <div className="p-3 border border-brand bg-emerald-50 rounded-lg flex items-center gap-3">
                            <span className="text-xl">💵</span>
                            <div>
                                <h4 className="font-bold text-sm text-brand-dark">Cash on Delivery</h4>
                                <p className="text-xs text-slate-500">Pay when your order arrives</p>
                            </div>
                            <div className="ml-auto w-4 h-4 rounded-full border-4 border-brand"></div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Bill Summary */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-fit">
                    <h3 className="font-bold text-slate-800 mb-4 text-lg">Bill Summary</h3>

                    <div className="space-y-3 mb-6">
                        {items.map(item => (
                            <div key={item.id} className="flex justify-between text-sm">
                                <span className="text-slate-600">{item.name} <span className="text-xs">x{item.quantity}</span></span>
                                <span className="font-medium">₹{item.price * item.quantity}</span>
                            </div>
                        ))}
                    </div>

                    <div className="border-t pt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Item Total</span>
                            <span>₹{total}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Delivery Charge</span>
                            <span className="text-brand font-bold">FREE</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Grand Total</span>
                            <span className="font-bold text-lg">₹{total}</span>
                        </div>
                    </div>

                    <button
                        onClick={handlePlaceOrder}
                        disabled={placing || items.length === 0}
                        className="w-full mt-6 bg-brand text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {placing ? 'Placing Order...' : `Place Order • ₹${total}`}
                    </button>
                </div>

            </div>
        </main>
    );
}
