'use client';
import { useCart } from '@/context/CartContext';
import ModernHeader from '@/components/ui/ModernHeader';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck, Clock, Minus, Plus, ChevronLeft, Ticket } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartPage() {
    const { items, updateQuantity, removeItem, total: itemTotal } = useCart();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    const [deliveryMsg, setDeliveryMsg] = useState('Early morning delivery with fresh vegetables');

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

    if (loading) return null;

    return (
        <main className="min-h-screen bg-[#F8F9FA] pb-40">
            <ModernHeader deviceType="desktop" />

            <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 md:py-10">
                {/* Header Section */}
                <div className="flex items-center justify-between mb-8 md:mb-12">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-brand font-bold text-sm uppercase tracking-widest mb-1">
                            <span className="w-8 h-[2px] bg-brand/30"></span>
                            Checkout Progress
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                            Your Basket
                            <span className="bg-slate-100 text-slate-500 text-sm px-3 py-1 rounded-full font-bold">
                                {items.length} {items.length === 1 ? 'Item' : 'Items'}
                            </span>
                        </h1>
                    </div>

                    <Link href="/" className="hidden md:flex items-center gap-2 text-slate-500 hover:text-brand font-bold transition-colors group">
                        <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        Continue Shopping
                    </Link>
                </div>

                {items.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-20 md:py-32 bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 max-w-4xl mx-auto px-6 relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand to-emerald-400"></div>
                        <div className="w-48 h-48 mx-auto bg-slate-50 rounded-full flex items-center justify-center mb-8 relative">
                            <ShoppingBag size={80} className="text-slate-200" strokeWidth={1} />
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 3 }}
                                className="absolute -top-2 -right-2 text-6xl"
                            >
                                🥗
                            </motion.div>
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Your basket is quite empty!</h2>
                        <p className="text-slate-500 mb-10 max-w-sm mx-auto font-medium leading-relaxed">
                            Treat yourself to some fresh greens and daily essentials. We'll have them at your door in no time.
                        </p>
                        <Link href="/" className="bg-[#0C831F] text-white px-12 py-4 rounded-2xl font-black shadow-lg shadow-brand/25 hover:shadow-xl hover:bg-brand-dark transition-all inline-flex items-center gap-3 active:scale-95 group">
                            Start Filling It <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                        {/* LEFT: Cart Items */}
                        <div className="lg:col-span-8 space-y-8">
                            {/* Delivery Assurance */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-emerald-50/50 border border-emerald-100 p-5 rounded-3xl flex items-center gap-5 group hover:bg-emerald-50 transition-colors"
                            >
                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-emerald-50 relative overflow-hidden shrink-0 group-hover:scale-110 transition-transform">
                                    <div className="absolute inset-0 bg-brand/5 animate-pulse"></div>
                                    <Clock size={24} className="text-brand relative z-10" />
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-[#064E3B] text-base md:text-lg tracking-tight">{deliveryMsg}</h3>
                                    <p className="text-xs md:text-sm text-emerald-700/70 font-bold flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-brand rounded-full"></span>
                                        Flash Delivery • {items.length} items to be packed
                                    </p>
                                </div>
                            </motion.div>

                            {/* Items List */}
                            <div className="space-y-4">
                                <AnimatePresence mode='popLayout'>
                                    {items.map((item, idx) => (
                                        <motion.div
                                            key={item.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, x: -50, scale: 0.95 }}
                                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                            className="bg-white p-5 md:p-6 rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-center gap-6 group relative overflow-hidden"
                                        >
                                            <div className="flex items-center gap-6 flex-1 w-full">
                                                <div className="w-24 h-24 bg-slate-50 rounded-2xl flex items-center justify-center text-4xl border border-slate-100 overflow-hidden shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-500">
                                                    {item.image?.startsWith('http') ? (
                                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover mix-blend-multiply" />
                                                    ) : (
                                                        <span>{item.image || '🥗'}</span>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-extrabold text-slate-900 text-lg mb-1 tracking-tight group-hover:text-brand transition-colors">{item.name}</h3>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-sm text-slate-400 font-bold">₹{item.price} / {item.unit}</span>
                                                        <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                                                        <span className="text-xs font-black text-brand uppercase tracking-tighter">In Stock</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between w-full sm:w-auto gap-10">
                                                {/* Advanced Quantity Controller */}
                                                <div className="flex items-center bg-slate-50 p-1.5 rounded-2xl border border-slate-100 shadow-inner">
                                                    <button
                                                        onClick={() => {
                                                            if (item.quantity <= 1 && item.unit !== 'kg') removeItem(item.id);
                                                            else if (item.quantity <= 0.5 && item.unit === 'kg') removeItem(item.id);
                                                            else updateQuantity(item.id, item.unit === 'kg' ? -0.5 : -1);
                                                        }}
                                                        className="w-10 h-10 flex items-center justify-center bg-white text-slate-400 hover:text-red-500 rounded-xl transition-all shadow-sm hover:shadow active:scale-90"
                                                    >
                                                        {item.quantity <= 1 && item.unit !== 'kg' ? <Trash2 size={16} /> : <Minus size={16} />}
                                                    </button>

                                                    <div className="px-5 flex flex-col items-center min-w-[50px]">
                                                        <span className="text-sm font-black text-slate-900">{item.quantity}</span>
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.unit === 'kg' ? 'Kgs' : 'Units'}</span>
                                                    </div>

                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.unit === 'kg' ? 0.5 : 1)}
                                                        className="w-10 h-10 flex items-center justify-center bg-brand text-white rounded-xl transition-all shadow-lg shadow-brand/20 hover:bg-brand-dark active:scale-90"
                                                    >
                                                        <Plus size={16} />
                                                    </button>
                                                </div>

                                                <div className="text-right min-w-[100px]">
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Subtotal</p>
                                                    <p className="font-black text-slate-900 text-xl tracking-tight">₹{item.price * item.quantity}</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                            {/* Trust Badge */}
                            <div className="flex flex-wrap items-center justify-center gap-8 py-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-500"><ShieldCheck size={16} /> Professional Packing</div>
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-500"><Clock size={16} /> Express Delivery</div>
                                <div className="w-10 h-6 bg-slate-200 rounded shrink-0"></div> {/* Visa Mock */}
                                <div className="w-10 h-6 bg-slate-200 rounded shrink-0"></div> {/* MC Mock */}
                            </div>
                        </div>

                        {/* RIGHT: Advanced Order Summary */}
                        <div className="lg:col-span-4 sticky top-28">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-xl shadow-slate-200/40 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full blur-3xl -mr-16 -mt-16"></div>

                                <h3 className="font-black text-slate-900 text-xl mb-8 flex items-center justify-between">
                                    Bill Details
                                    <ShoppingBag size={20} className="text-slate-300" />
                                </h3>

                                <div className="space-y-5 mb-8">
                                    <div className="flex justify-between items-center group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-hover:text-brand transition-colors">
                                                <ShoppingBag size={14} />
                                            </div>
                                            <span className="text-slate-500 font-bold text-sm">Item Total</span>
                                        </div>
                                        <span className="font-black text-slate-900">₹{itemTotal}</span>
                                    </div>

                                    <div className="flex justify-between items-center group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors">
                                                <Truck size={14} />
                                            </div>
                                            <span className="text-slate-500 font-bold text-sm">Delivery Fee</span>
                                        </div>
                                        {DELIVERY_CHARGE === 0 ? (
                                            <div className="flex flex-col items-end">
                                                <span className="text-xs text-slate-300 line-through">₹{deliveryFee}</span>
                                                <span className="text-brand font-black uppercase text-[10px] bg-brand/10 px-2 py-0.5 rounded-full">Free Delivery</span>
                                            </div>
                                        ) : (
                                            <span className="font-extrabold text-slate-800 tracking-tight">₹{DELIVERY_CHARGE}</span>
                                        )}
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500 font-bold text-sm ml-11">Handling Fee</span>
                                        <span className="font-extrabold text-slate-800 tracking-tight">₹{platformFee}</span>
                                    </div>
                                </div>

                                <div className="bg-emerald-50 rounded-2xl p-4 mb-8 border border-emerald-100 flex items-center gap-3 group overflow-hidden relative">
                                    <div className="absolute -right-4 -top-4 w-12 h-12 bg-emerald-500/10 rounded-full blur-xl group-hover:scale-150 transition-transform"></div>
                                    <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200 shrink-0">
                                        <Ticket size={20} className="animate-pulse" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[#065F46] font-black text-xs uppercase tracking-wider mb-0.5">Exclusive Savings</p>
                                        <p className="text-emerald-700/80 text-[10px] font-bold">You've saved extra ₹{SAVINGS} on MRP</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-end mb-4 px-1">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-slate-400 font-black uppercase tracking-widest">Grand Total</span>
                                            <span className="text-4xl font-black text-slate-900 tracking-tighter">₹{GRAND_TOTAL}</span>
                                        </div>
                                        <div className="mb-1">
                                            <span className="text-[10px] text-slate-300 font-bold">Inc. all taxes</span>
                                        </div>
                                    </div>

                                    {user ? (
                                        <Link href="/checkout" className="group w-full bg-[#0C831F] text-white py-5 rounded-2xl font-black text-lg text-center flex items-center justify-center gap-3 transition-all shadow-xl shadow-brand/25 hover:shadow-2xl hover:bg-brand-dark active:scale-[0.98]">
                                            Proceed to Checkout
                                            <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    ) : (
                                        <Link href="/login" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg text-center block transition-all shadow-xl shadow-slate-900/20 hover:bg-slate-800 active:scale-[0.98]">
                                            Login to Buy
                                        </Link>
                                    )}
                                </div>
                            </motion.div>

                            <p className="mt-6 text-center text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                                <ShieldCheck size={14} /> Encrypted Payment Process
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile Bottom Fixed Bar (Native Feel) */}
            {items.length > 0 && (
                <div className="lg:hidden fixed bottom-16 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-100 p-5 px-6 pb-8 shadow-[0_-20px_40px_rgba(0,0,0,0.05)] z-[60] animate-in slide-in-from-bottom flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2 text-brand font-black text-[10px] uppercase tracking-widest leading-none mb-1.5">
                                <span className="w-4 h-[2px] bg-brand/30"></span> Total Billing
                            </div>
                            <div className="flex items-end gap-2">
                                <span className="font-black text-2xl text-slate-900 tracking-tighter">₹{GRAND_TOTAL}</span>
                                <span className="text-[10px] text-emerald-600 font-black translate-y-[-4px]">SAVE ₹{SAVINGS}</span>
                            </div>
                        </div>
                        <button className="text-slate-300 hover:text-brand font-bold flex items-center gap-1 text-[10px] uppercase tracking-wider">
                            Bill Details <ChevronDown size={14} />
                        </button>
                    </div>

                    <Link href={user ? "/checkout" : "/login"} className="w-full bg-[#0C831F] text-white py-4 rounded-2xl font-black text-center flex items-center justify-center gap-3 shadow-xl shadow-brand/20 active:scale-95 transition-all">
                        {user ? 'Proceed to Checkout' : 'Login to Order'}
                        <ArrowRight size={20} />
                    </Link>
                </div>
            )}
        </main>
    );
}

// Missing icon used
function Truck({ size, className }: { size: number, className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" /><circle cx="7" cy="18" r="2" /><path d="M9 18h6" /><circle cx="17" cy="18" r="2" /><path d="M19 18h1a1 1 0 0 0 1-1v-5.14a1 1 0 0 0-.29-.71l-4.4-4.41a1 1 0 0 0-.71-.29H13" />
        </svg>
    );
}

function ChevronDown({ size, className }: { size: number, className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="m6 9 6 6 6-6" />
        </svg>
    );
}
