'use client';
import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import ModernHeader from '@/components/ui/ModernHeader';
import AddressSelector from '@/components/features/AddressSelector';
import Link from 'next/link';
import ReactConfetti from 'react-confetti';
import { ShieldCheck, Truck, CreditCard, ChevronRight, ShoppingBag, Ticket, Tag, Clock } from 'lucide-react';

export default function CheckoutPage() {
    const { items, total, clearCart } = useCart();
    const [selectedAddress, setSelectedAddress] = useState<any>(null);
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [placing, setPlacing] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
    const [deliverySlots, setDeliverySlots] = useState<any[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<any>(null);

    // Dynamic Fee States
    const [platformFee, setPlatformFee] = useState(2);
    const [deliveryFee, setDeliveryFee] = useState(25);
    const [freeDeliveryAbove, setFreeDeliveryAbove] = useState(99);
    const [shopStatus, setShopStatus] = useState('open');

    // Coupon States
    const [couponInput, setCouponInput] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
    const [couponError, setCouponError] = useState('');
    const [couponSuccess, setCouponSuccess] = useState('');

    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });

        const fetchSettings = async () => {
            // Fetch Rules
            const { data: rulesData } = await supabase.from('site_settings').select('*').eq('key', 'order_rules').single();
            if (rulesData?.value) {
                const val = rulesData.value;
                if (val.handling_fee !== undefined) setPlatformFee(val.handling_fee);
                if (val.delivery_fee !== undefined) setDeliveryFee(val.delivery_fee);
                if (val.free_delivery_above !== undefined) setFreeDeliveryAbove(val.free_delivery_above);
            }

            // Fetch Shop Status
            const { data: profileData } = await supabase.from('site_settings').select('*').eq('key', 'store_profile').single();
            if (profileData?.value) {
                setShopStatus(profileData.value.status || 'open');
            }

            // Fetch Slots
            const { data: slotsData } = await supabase.from('site_settings').select('*').eq('key', 'delivery_slots').single();
            if (slotsData?.value) {
                const active = slotsData.value.filter((s: any) => s.active);
                setDeliverySlots(active);
                if (active.length > 0) setSelectedSlot(active[0]);
            }
        };
        fetchSettings();
    }, []);

    // Derived Calculations
    const deliveryCharge = total > freeDeliveryAbove ? 0 : deliveryFee;
    const couponDiscount = appliedCoupon ? appliedCoupon.discount : 0;
    const finalTotal = total + platformFee + deliveryCharge - couponDiscount;

    const handleApplyCoupon = async () => {
        setCouponError('');
        setCouponSuccess('');
        const code = couponInput.trim().toUpperCase();

        if (!code) {
            setCouponError('Please enter a code');
            return;
        }

        // Fetch from Supabase
        const { data: coupon, error } = await supabase
            .from('coupons')
            .select('*')
            .eq('code', code)
            .eq('is_active', true)
            .single();

        if (error || !coupon) {
            setCouponError('Invalid or expired code');
            return;
        }

        // Validate Expiry
        if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) {
            setCouponError('This coupon has expired');
            return;
        }

        // Validate Min Order
        if (total < (coupon.min_order || 0)) {
            setCouponError(`Minimum order of ₹${coupon.min_order} required`);
            return;
        }

        // Calculate Discount
        let discount = 0;
        if (coupon.discount_type === 'percentage') {
            discount = (total * coupon.discount_value) / 100;
            if (coupon.max_discount) discount = Math.min(discount, coupon.max_discount);
        } else {
            discount = coupon.discount_value;
        }

        setAppliedCoupon({
            code: coupon.code,
            discount,
            type: coupon.discount_type
        });
        setCouponSuccess(`Success! ₹${discount} discount applied`);
        setCouponInput('');
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponSuccess('');
    };

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
                status: 'pending',
                delivery_address_snapshot: selectedAddress,
                items: items,
                discount_amount: couponDiscount,
                applied_coupon: appliedCoupon?.code || null,
                delivery_slot: selectedSlot ? `${selectedSlot.label} (${selectedSlot.time})` : 'Standard'
            }).select().single();

            if (orderError) {
                console.error("Supabase Order Insert Error:", orderError);
                throw new Error(`Order Creation Failed: ${orderError.message} (${orderError.details || 'No details'})`);
            }

            if (!order) {
                throw new Error("Order creation failed: No data returned from database.");
            }

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
                console.error("Order Items Insert Error:", itemsError);
                throw new Error(`Item Insertion Failed: ${itemsError.message}`);
            }

            // Success
            clearCart();
            setOrderComplete(true);

        } catch (err: any) {
            console.error("Checkout Process Error:", err);
            // Handle standard Error objects properly
            const msg = err instanceof Error ? err.message : (err.message || JSON.stringify(err));
            alert("Order Error: " + msg);
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

                    {/* 2. Delivery Slot Section */}
                    <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100/60">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-amber-50 w-10 h-10 rounded-full flex items-center justify-center text-amber-600">
                                <Clock size={20} />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800">Select Delivery Time</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {deliverySlots.length > 0 ? (
                                deliverySlots.map(slot => (
                                    <button
                                        key={slot.id}
                                        onClick={() => setSelectedSlot(slot)}
                                        className={`p-4 rounded-2xl border-2 text-left transition-all ${selectedSlot?.id === slot.id ? 'border-brand bg-emerald-50/50' : 'border-slate-50 hover:border-slate-200 bg-slate-50/30'}`}
                                    >
                                        <p className={`text-xs font-black uppercase tracking-widest mb-1 ${selectedSlot?.id === slot.id ? 'text-brand' : 'text-slate-400'}`}>{slot.label}</p>
                                        <p className="text-sm font-bold text-slate-800">{slot.time}</p>
                                    </button>
                                ))
                            ) : (
                                <div className="col-span-full p-4 bg-slate-50 rounded-xl text-center">
                                    <p className="text-sm text-slate-500 font-medium italic">Standard delivery timing will be applied.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 3. Payment Section */}
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
                        {/* Coupon Section */}
                        <div className="mb-6">
                            {!appliedCoupon ? (
                                <div className="space-y-2">
                                    <div className="flex gap-2">
                                        <div className="relative flex-1 group">
                                            <Ticket size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand transition-colors" />
                                            <input
                                                type="text"
                                                placeholder="Enter Promo Code"
                                                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all placeholder:text-slate-400 uppercase"
                                                value={couponInput}
                                                onChange={(e) => {
                                                    setCouponInput(e.target.value);
                                                    setCouponError('');
                                                }}
                                                onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                                            />
                                        </div>
                                        <button
                                            onClick={handleApplyCoupon}
                                            className="px-4 py-2.5 bg-brand text-white font-bold text-sm rounded-xl hover:bg-brand-dark transition-all active:scale-95 shadow-sm"
                                        >
                                            Apply
                                        </button>
                                    </div>
                                    {couponError && <p className="text-[10px] font-bold text-red-500 ml-1 animate-shake">⚠️ {couponError}</p>}
                                </div>
                            ) : (
                                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-center justify-between animate-scale-in">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-emerald-500 text-white rounded-lg flex items-center justify-center shadow-sm">
                                            <Tag size={14} fill="currentColor" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider leading-none">Coupon Applied</p>
                                            <p className="text-xs font-extrabold text-slate-800 tracking-tight">{appliedCoupon.code}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleRemoveCoupon}
                                        className="text-[10px] font-bold text-red-500 hover:text-red-600 transition-colors uppercase tracking-tight"
                                    >
                                        Remove
                                    </button>
                                </div>
                            )}
                            {couponSuccess && !appliedCoupon && <p className="text-[10px] font-bold text-emerald-600 ml-1 mt-1">🎉 {couponSuccess}</p>}
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
                                <span className="text-slate-500 font-medium">Packaging Fee</span>
                                <span className="text-slate-800 font-semibold">₹{platformFee}</span>
                            </div>

                            {appliedCoupon && (
                                <div className="flex justify-between text-sm text-emerald-600 animate-in fade-in slide-in-from-right-1">
                                    <span className="font-bold flex items-center gap-1">
                                        <Tag size={12} fill="currentColor" /> Promo Discount
                                    </span>
                                    <span className="font-bold">-₹{couponDiscount}</span>
                                </div>
                            )}

                            <div className="border-t-2 border-dashed border-slate-100 my-4"></div>

                            <div className="flex justify-between items-end">
                                <span className="text-slate-600 font-bold">To Pay</span>
                                <span className="text-2xl font-extrabold text-slate-900">₹{finalTotal}</span>
                            </div>
                        </div>

                        <button
                            onClick={handlePlaceOrder}
                            disabled={placing || items.length === 0 || shopStatus === 'closed'}
                            className={`w-full mt-8 py-4 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden ${shopStatus === 'closed' ? 'bg-slate-400 text-white' : 'bg-brand text-white shadow-brand/25 hover:bg-brand-dark hover:scale-[1.02]'}`}
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {shopStatus === 'closed' ? (
                                    <>⏳ Store is Closed</>
                                ) : placing ? (
                                    <>Placing Order...</>
                                ) : (
                                    <>Place Order</>
                                )}
                                {!placing && shopStatus !== 'closed' && <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />}
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
