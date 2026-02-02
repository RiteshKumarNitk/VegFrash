'use client';
import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import ModernHeader from '@/components/ui/ModernHeader';
import AddressSelector from '@/components/features/AddressSelector';
import Link from 'next/link';
import ReactConfetti from 'react-confetti';
import { ShieldCheck, Truck, CreditCard, ChevronRight, ShoppingBag } from 'lucide-react';

export default function CheckoutPage() {
    const { items, total, clearCart } = useCart();
    const [selectedAddress, setSelectedAddress] = useState<any>(null);
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [placing, setPlacing] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

    // Dynamic Fee States
    const [platformFee, setPlatformFee] = useState(2);
    const [deliveryFee, setDeliveryFee] = useState(25);
    const [freeDeliveryAbove, setFreeDeliveryAbove] = useState(99);

    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });

        const fetchSettings = async () => {
            const { data } = await supabase.from('site_settings').select('*').eq('key', 'order_rules').single();
            if (data?.value) {
                if (data.value.handling_fee !== undefined) setPlatformFee(data.value.handling_fee);
                if (data.value.delivery_fee !== undefined) setDeliveryFee(data.value.delivery_fee);
                if (data.value.free_delivery_above !== undefined) setFreeDeliveryAbove(data.value.free_delivery_above);
            }
        };
        fetchSettings();
    }, []);

    // Derived Calculations
    const deliveryCharge = total > freeDeliveryAbove ? 0 : deliveryFee;
    const finalTotal = total + platformFee + deliveryCharge;

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
            const { data: order, error: orderError } = await supabase.from('orders').insert({
                user_id: user.id,
                total_amount: finalTotal,
                platform_fee: platformFee,
                delivery_charge: deliveryCharge,
                status: 'placed',
                delivery_address_snapshot: selectedAddress,
                payment_status: 'pending',
                items: items
            }).select().single();

            if (orderError) throw orderError;

            // 2. Insert Order Items
            const orderItems = items.map(item => ({
                order_id: order.id,
                product_id: item.id,
                quantity: item.quantity,
                price_at_time: item.price,
                unit: item.weight || item.unit
            }));

            const { error: itemsError } = await supabase.from('order_items').insert(orderItems);

            if (itemsError) {
                console.warn("Items insert failed:", itemsError);
                throw itemsError; // Throw to catch block to alert user
            }

            // Success
            clearCart();
            setOrderComplete(true);

        } catch (err: any) {
            console.error(err);
            alert("Order Error: " + (err.message || JSON.stringify(err)));
        } finally {
            setPlacing(false);
        }
    };

    if (orderComplete) {
        return (
            <main className="min-h-screen bg-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
                <ReactConfetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={500} />

                <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-brand/10 text-center max-w-sm w-full animate-scale-in relative z-10 border border-slate-100">
                    <div className="w-24 h-24 bg-gradient-to-tr from-green-100 to-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner animate-video">
                        <span className="text-5xl drop-shadow-sm">🛵</span>
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-800 mb-3 tracking-tight">Order Placed!</h1>
                    <p className="text-slate-500 mb-8 font-medium leading-relaxed">Your fresh veggies are being packed.<br />Arriving at your doorstep shortly.</p>
                    <Link href="/" className="block w-full bg-brand text-white py-4 rounded-2xl font-bold hover:bg-brand-dark transition-all hover:scale-[1.02] shadow-xl shadow-brand/20 active:scale-95 text-lg">
                        Continue Shopping
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50/50 pb-32">
            <ModernHeader deviceType="mobile" />

            <div className="max-w-6xl mx-auto px-4 pt-8 grid lg:grid-cols-12 gap-8">

                {/* HEADLINE (Mobile Only) */}
                <div className="lg:hidden col-span-full mb-2">
                    <h1 className="text-2xl font-extrabold text-slate-800">Checkout</h1>
                    <p className="text-slate-500 text-sm">{items.length} Items in your cart</p>
                </div>

                {/* LEFT CONTENT */}
                <div className="lg:col-span-8 space-y-6">

                    {/* 1. Address Section */}
                    <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100/60">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-brand/10 w-10 h-10 rounded-full flex items-center justify-center text-brand">
                                <Truck size={20} />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800">Delivery Address</h2>
                        </div>
                        <AddressSelector
                            selectedId={selectedAddress?.id || null}
                            onSelect={(id, details) => setSelectedAddress(details)}
                        />
                    </div>

                    {/* 2. Payment Section */}
                    <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100/60 transition-all">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-indigo-50 w-10 h-10 rounded-full flex items-center justify-center text-indigo-600">
                                <CreditCard size={20} />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800">Payment Method</h2>
                        </div>

                        <div className="space-y-4">
                            {/* Option 1: Cash on Delivery */}
                            <label className={`block relative cursor-pointer group transition-all`}>
                                <input
                                    type="radio"
                                    name="payment"
                                    value="cod"
                                    checked={paymentMethod === 'cod'}
                                    onChange={() => setPaymentMethod('cod')}
                                    className="peer sr-only"
                                />
                                <div className="p-5 rounded-2xl border-2 border-slate-100 peer-checked:border-brand peer-checked:bg-emerald-50/30 flex items-center gap-4 transition-all hover:border-slate-200">
                                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-2xl border border-slate-100">
                                        💵
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-slate-800">Cash on Delivery</h4>
                                        <p className="text-xs text-slate-500 font-medium">Pay cash or UPI to the delivery partner</p>
                                    </div>
                                    <div className={`w-6 h-6 rounded-full border-[6px] ${paymentMethod === 'cod' ? 'border-brand' : 'border-slate-200'} bg-white shadow-sm transition-all`}></div>
                                </div>
                            </label>

                            {/* Option 2: UPI / QR Code */}
                            <label className={`block relative cursor-pointer group transition-all`}>
                                <input
                                    type="radio"
                                    name="payment"
                                    value="upi"
                                    checked={paymentMethod === 'upi'}
                                    onChange={() => setPaymentMethod('upi')}
                                    className="peer sr-only"
                                />
                                <div className="p-5 rounded-2xl border-2 border-slate-100 peer-checked:border-brand peer-checked:bg-emerald-50/30 transition-all hover:border-slate-200">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-2xl border border-slate-100">
                                            📱
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-slate-800">UPI / QR Code</h4>
                                            <p className="text-xs text-slate-500 font-medium">Google Pay, PhonePe, Paytm</p>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full border-[6px] ${paymentMethod === 'upi' ? 'border-brand' : 'border-slate-200'} bg-white shadow-sm transition-all`}></div>
                                    </div>

                                    {paymentMethod === 'upi' && (
                                        <div className="mt-6 pt-6 border-t border-brand/10 animate-fade-in text-center">
                                            <p className="text-sm font-bold text-slate-700 mb-4">Scan to Pay</p>
                                            <div className="w-48 h-48 bg-white border-2 border-slate-900 rounded-xl mx-auto p-2 flex items-center justify-center relative shadow-sm">
                                                {/* Dummy QR Pattern */}
                                                <div className="w-full h-full bg-slate-900 flex flex-wrap gap-1 content-center justify-center p-2 rounded-lg opacity-90">
                                                    <div className="w-full text-white text-[8px] font-mono text-center flex items-center justify-center h-full">DUMMY QR<br />VEGFRASH STORE</div>
                                                </div>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="bg-white p-2 rounded-full shadow-md">
                                                        <span className="text-xl">⚡</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-xs text-slate-400 mt-4">Keep your app open while paying</p>
                                        </div>
                                    )}
                                </div>
                            </label>

                            {/* Option 3: Credit / Debit Card */}
                            <label className={`block relative cursor-pointer group transition-all`}>
                                <input
                                    type="radio"
                                    name="payment"
                                    value="card"
                                    checked={paymentMethod === 'card'}
                                    onChange={() => setPaymentMethod('card')}
                                    className="peer sr-only"
                                />
                                <div className="p-5 rounded-2xl border-2 border-slate-100 peer-checked:border-brand peer-checked:bg-emerald-50/30 transition-all hover:border-slate-200">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-2xl border border-slate-100">
                                            💳
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-slate-800">Credit / Debit Card</h4>
                                            <p className="text-xs text-slate-500 font-medium">Visa, Mastercard, RuPay</p>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full border-[6px] ${paymentMethod === 'card' ? 'border-brand' : 'border-slate-200'} bg-white shadow-sm transition-all`}></div>
                                    </div>

                                    {paymentMethod === 'card' && (
                                        <div className="mt-6 pt-6 border-t border-brand/10 animate-fade-in space-y-4">
                                            <input type="text" placeholder="Card Number" className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand" />
                                            <div className="flex gap-4">
                                                <input type="text" placeholder="MM/YY" className="w-1/2 p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand" />
                                                <input type="text" placeholder="CVV" className="w-1/2 p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand" />
                                            </div>
                                            <input type="text" placeholder="Card Holder Name" className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand" />
                                        </div>
                                    )}
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* 3. Items Review (Mobile only - hidden on desktop as it's repetitive with right rail) */}
                    <div className="block lg:hidden bg-white p-6 rounded-3xl shadow-sm border border-slate-100/60">
                        <h3 className="font-bold text-slate-800 mb-4 text-base">Order Items</h3>
                        <div className="space-y-4">
                            {items.map(item => (
                                <div key={item.id} className="flex gap-4">
                                    <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center text-2xl border border-slate-100 shrink-0 overflow-hidden">
                                        {item.image?.startsWith('http') ? (
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span>{item.image || '🥗'}</span>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-slate-700 text-sm line-clamp-1">{item.name}</h4>
                                        <p className="text-xs text-slate-500">{item.quantity} x {item.unit} • <span className="font-semibold text-slate-700">₹{item.price}</span></p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT RAIL (Order Summary) */}
                <div className="lg:col-span-4">
                    <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 sticky top-28">
                        <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2 text-lg">
                            <ShoppingBag size={20} className="text-slate-400" />
                            Order Summary
                        </h3>

                        {/* Items List (Desktop) */}
                        <div className="hidden lg:block space-y-3 mb-8 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            {items.map(item => (
                                <div key={item.id} className="flex justify-between text-sm items-center py-2 border-b border-dashed border-slate-50 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-sm border border-slate-100 overflow-hidden">
                                            {item.image?.startsWith('http') ? (
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span>{item.image || '🥗'}</span>
                                            )}
                                        </div>
                                        <span className="text-slate-600 font-medium line-clamp-1">{item.name} <span className="text-xs text-slate-400">x{item.quantity}</span></span>
                                    </div>
                                    <span className="font-bold text-slate-700">₹{item.price * item.quantity}</span>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-3 pt-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500 font-medium">Item Total</span>
                                <span className="text-slate-800 font-semibold">₹{total}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500 font-medium">Delivery Charge</span>
                                {deliveryCharge === 0 ? (
                                    <span className="text-brand font-bold uppercase text-xs bg-brand/10 px-2 py-0.5 rounded">Free</span>
                                ) : (
                                    <span className="text-slate-800 font-semibold">₹{deliveryCharge}</span>
                                )}
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500 font-medium">Handling Fee</span>
                                <span className="text-slate-800 font-semibold">₹{platformFee}</span>
                            </div>

                            <div className="border-t-2 border-dashed border-slate-100 my-4"></div>

                            <div className="flex justify-between items-end">
                                <span className="text-slate-600 font-bold">To Pay</span>
                                <span className="text-2xl font-extrabold text-slate-900">₹{finalTotal}</span>
                            </div>
                        </div>

                        <button
                            onClick={handlePlaceOrder}
                            disabled={placing || items.length === 0}
                            className="w-full mt-8 bg-brand text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-brand/25 hover:bg-brand-dark hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {placing ? 'Placing Order...' : 'Place Order'}
                                {!placing && <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                            </span>
                        </button>

                        <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <ShieldCheck size={14} /> Secure Checkout
                        </div>
                    </div>
                </div>

            </div>
        </main>
    );
}
