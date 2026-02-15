'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { notFound, useParams } from 'next/navigation';
import ModernHeader from '@/components/ui/ModernHeader';
import Link from 'next/link';
import { Printer, Download, Share2, ArrowLeft, CheckCircle2, Package, MapPin, Truck, HelpCircle, FileText, Phone, Home, ShoppingBag, AlertTriangle } from 'lucide-react';

export default function OrderInvoicePage() {
    const { id } = useParams();
    const [order, setOrder] = useState<any>(null);
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [dynamicFees, setDynamicFees] = useState({ platform: 2, delivery: 25, freeAbove: 99 });
    const supabase = createClient();

    useEffect(() => {
        const fetchOrderDetails = async () => {
            setLoading(true);
            setErrorMsg(null);
            try {
                // 1. Fetch Order
                const { data: orderData, error: orderError } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (orderError) throw orderError;
                if (!orderData) throw new Error("Order not found");
                setOrder(orderData);

                // 2. Fetch Items with Product Details
                const { data: itemsData, error: itemsError } = await supabase
                    .from('order_items')
                    .select('*, products(name, image, price)') // Join products table with price fallback
                    .eq('order_id', id);

                if (itemsError) console.warn("Relational fetch failed, using backup", itemsError);

                let finalItems = itemsData || [];

                // FALLBACK: Use JSONB items if relational data is missing
                if (finalItems.length === 0 && orderData.items && Array.isArray(orderData.items)) {
                    console.log("Using JSONB backup items");
                    finalItems = orderData.items.map((i: any) => ({
                        id: 'json-' + Math.random(),
                        quantity: i.quantity,
                        price_at_time: i.price || i.price_at_time,
                        products: {
                            name: i.name || i.products?.name || 'Item',
                            image: i.image || i.products?.image || ''
                        },
                        unit: i.weight || i.unit
                    }));
                }

                setItems(finalItems);

                // 3. Fetch Order Rules for Fallback
                const { data: rulesData } = await supabase.from('site_settings').select('*').eq('key', 'order_rules').single();
                if (rulesData?.value) {
                    setDynamicFees({
                        platform: rulesData.value.handling_fee ?? 2,
                        delivery: rulesData.value.delivery_fee ?? 25,
                        freeAbove: rulesData.value.free_delivery_above ?? 99
                    });
                }

            } catch (err: any) {
                console.error("Order load error:", err);
                setErrorMsg(err.message || "Failed to load order conversation");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchOrderDetails();
    }, [id]);

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-400 gap-4">
            <div className="w-10 h-10 border-4 border-brand/30 border-t-brand rounded-full animate-spin"></div>
            <p className="text-sm font-medium animate-pulse">Retrieving your order...</p>
        </div>
    );

    if (errorMsg) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm text-center">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="font-bold text-slate-800 mb-2">Something went wrong</h3>
                <p className="text-sm text-slate-500 mb-6">{errorMsg}</p>
                <Link href="/orders" className="block w-full bg-slate-900 text-white font-bold py-3 rounded-xl">Go Back</Link>
            </div>
        </div>
    );

    if (!order) return <div className="p-10 text-center">Order not found</div>;

    // Parse Address
    let address: any = {};
    try {
        address = typeof order.delivery_address_snapshot === 'string'
            ? JSON.parse(order.delivery_address_snapshot)
            : order.delivery_address_snapshot;
    } catch (e) { console.warn("Address parse fail", e); }


    // Full detailed tracking steps
    const steps = [
        { key: 'placed', label: 'Received', icon: FileText },
        { key: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
        { key: 'packed', label: 'Packed', icon: Package },
        { key: 'out_for_delivery', label: 'On Way', icon: Truck },
        { key: 'delivered', label: 'Delivered', icon: MapPin },
    ];

    const currentStepIndex = getCurrentStepIndex(order.status);

    return (
        <main className="min-h-screen bg-[#F8F9FA] pb-24 print:bg-white print:pb-0 font-sans">
            <div className="print:hidden sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
                <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/orders" className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors hidden md:block">
                        <ArrowLeft size={20} className="text-slate-600" />
                    </Link>
                    <div className="flex flex-col items-center md:items-start">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest hidden md:block">Order Details</span>
                        <h1 className="text-base md:text-lg font-extrabold text-slate-800">#{order.id.slice(0, 8)}</h1>
                    </div>
                    <button className="flex items-center gap-2 text-brand font-bold text-xs bg-brand/10 px-4 py-2 rounded-full hover:bg-brand/20 transition-colors">
                        <HelpCircle size={14} /> <span className="hidden md:inline">Need Help?</span>
                    </button>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 pt-6 md:pt-8 print:px-0 print:pt-0 print:max-w-none">

                {/* Status Card */}
                <div className="bg-white rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] p-6 md:p-8 mb-6 print:hidden relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Package size={120} className="text-brand rotate-12" />
                    </div>

                    <div className="relative z-10">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <p className="text-sm font-medium text-slate-500 mb-1">Estimated Delivery</p>
                                <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
                                    {order.status === 'delivered' ? 'Delivered' : 'Today, by 8 PM'}
                                </h2>
                            </div>
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${order.status === 'delivered' ? 'bg-green-100 text-green-600' : 'bg-brand/10 text-brand'}`}>
                                {order.status === 'delivered' ? <CheckCircle2 size={24} /> : <Truck size={24} />}
                            </div>
                        </div>

                        {/* Stepper */}
                        <div className="relative">
                            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-slate-100">
                                <div style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-brand transition-all duration-1000 ease-out"></div>
                            </div>
                            <div className="flex justify-between w-full text-[10px] md:text-xs font-bold uppercase tracking-wider">
                                {steps.map((step, idx) => (
                                    <span
                                        key={step.key}
                                        className={idx <= currentStepIndex ? 'text-brand' : 'text-slate-400'}
                                    >
                                        {step.label}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6 print:block">
                    {/* LEFT COL: Items & Bill */}
                    <div className="md:col-span-2 space-y-6">

                        {/* ITEMS LIST */}
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    <ShoppingBag size={18} className="text-slate-400" />
                                    Items in Order
                                </h3>
                                <span className="text-xs font-bold bg-white border border-slate-200 px-2 py-1 rounded text-slate-500">
                                    {items.length} Items
                                </span>
                            </div>

                            {items.length > 0 ? (
                                <div className="divide-y divide-slate-50">
                                    {items.map((item) => (
                                        <div key={item.id} className="p-4 flex gap-4 hover:bg-slate-50/50 transition-colors group">
                                            <div className="w-16 h-16 bg-white rounded-xl shrink-0 overflow-hidden border border-slate-100 shadow-sm group-hover:shadow-md transition-all flex items-center justify-center text-2xl">
                                                {item.products?.image ? <img src={item.products.image} className="w-full h-full object-cover" /> : '🥦'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-slate-800 text-sm truncate">{item.products?.name || 'Unknown Item'}</p>
                                                <p className="text-xs text-slate-500 mt-1 font-medium bg-slate-100 inline-block px-2 py-0.5 rounded">
                                                    {item.quantity} x {item.unit || item.products?.weight || 'Unit'}
                                                </p>
                                            </div>
                                            <div className="text-right pl-2">
                                                <p className="font-bold text-slate-800 text-sm">₹{(item.price || item.price_at_time || item.products?.price || 0) * item.quantity}</p>
                                                {item.quantity > 1 && <p className="text-[10px] text-slate-400 mt-1">₹{(item.price || item.price_at_time || item.products?.price || 0)} ea</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                // EMPTY STATE FALLBACK
                                <div className="p-8 text-center bg-slate-50/30">
                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300">
                                        <FileText size={24} />
                                    </div>
                                    <p className="text-sm font-bold text-slate-600">Order Summary Only</p>
                                    <p className="text-xs text-slate-400 mt-1 max-w-[200px] mx-auto">
                                        Detailed item list is unavailable for this order. Usually happens with older orders.
                                    </p>
                                </div>
                            )}

                            {/* BILL DETAILS */}
                            <div className="bg-slate-50 p-6 space-y-3">
                                {(() => {
                                    const itemTotal = items.reduce((sum, item) => sum + ((item.price_at_time || 0) * item.quantity), 0);

                                    const dbPlatform = order.platform_fee;
                                    const dbDelivery = order.delivery_charge;

                                    // Use DB value if exists, else use dynamic setting as fallback
                                    const displayPlatform = dbPlatform !== undefined && dbPlatform !== null ? dbPlatform : dynamicFees.platform;
                                    const displayDelivery = dbDelivery !== undefined && dbDelivery !== null ? dbDelivery : (itemTotal > dynamicFees.freeAbove ? 0 : dynamicFees.delivery);

                                    return (
                                        <>
                                            <div className="flex justify-between text-sm text-slate-600">
                                                <span>Item Total</span>
                                                <span className="font-medium">₹{itemTotal}</span>
                                            </div>
                                            <div className="flex justify-between text-sm text-slate-600">
                                                <span>Delivery Fee</span>
                                                <span className={displayDelivery <= 0 ? "text-green-600 font-bold" : "font-medium"}>
                                                    {displayDelivery <= 0 ? 'FREE' : `₹${displayDelivery}`}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm text-slate-600">
                                                <span>Packaging Fee</span>
                                                <span className="font-medium">₹{displayPlatform}</span>
                                            </div>
                                        </>
                                    );
                                })()}
                                <div className="border-t border-slate-200 mt-2"></div>
                                <div className="flex justify-between items-center text-lg font-black text-slate-800 pt-1">
                                    <span>Grand Total</span>
                                    <span>₹{order.total_amount}</span>
                                </div>
                            </div>
                        </div>

                    </div>


                    {/* RIGHT COL: Address & Support */}
                    <div className="space-y-6">

                        {/* DELIVERY ADDRESS */}
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 print:hidden">
                            <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
                                <MapPin size={18} className="text-brand" /> Delivery Details
                            </h3>
                            <div className="pl-6 border-l-2 border-slate-100 ml-2">
                                <p className="font-bold text-slate-800 text-sm">{address?.receiver_name || order.customer_name || 'Valued Customer'}</p>
                                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                                    {address?.full_address_text || `${address?.flat || ''} ${address?.area || ''} ${address?.landmark || ''}`}
                                </p>
                                <p className="text-xs font-bold text-slate-600 mt-3 flex items-center gap-1.5">
                                    <Phone size={12} /> {address?.receiver_phone || 'No Phone provided'}
                                </p>
                            </div>
                        </div>

                        {/* ACTIONS */}
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 print:hidden space-y-3">
                            <button onClick={() => window.print()} className="w-full flex items-center justify-center gap-3 border border-slate-200 bg-white text-slate-700 px-4 py-3 rounded-xl font-bold hover:bg-slate-50 transition-colors text-sm">
                                <Printer size={16} /> Download Invoice
                            </button>
                            <button className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white px-4 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors text-sm shadow-lg shadow-slate-200">
                                <Share2 size={16} /> Share Order Status
                            </button>
                        </div>

                    </div>
                </div>

                {/* PRINTABLE INVOICE (Professional Layout) */}
                <div className="hidden print:block bg-white p-8 max-w-[210mm] mx-auto text-black border border-slate-200 mt-8 rounded-none">
                    {/* Invoice Header */}
                    <div className="flex justify-between items-start mb-8 border-b-2 border-slate-800 pb-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center font-bold text-lg">V</div>
                                <h1 className="text-2xl font-black text-slate-900 tracking-tight">VegFrash</h1>
                            </div>

                            <p className="text-sm font-bold text-slate-500 mt-1">Invoice #{order.id.slice(0, 8).toUpperCase()}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-bold uppercase text-slate-400 mb-1">Status</p>
                            <h2 className="text-lg font-bold text-slate-900 uppercase">{order.status}</h2>
                        </div>
                    </div>

                    {/* Meta Details */}
                    <div className="flex justify-between mb-8">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Bill To</p>
                            <p className="font-bold text-slate-900">{address?.receiver_name}</p>
                            <p className="text-sm text-slate-600 max-w-[250px]">{address?.full_address_text}</p>
                            <p className="text-sm text-slate-600">Ph: {address?.receiver_phone}</p>
                        </div>
                        <div className="text-right">
                            <div className="mb-2">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-4">Date</span>
                                <span className="font-mono font-bold text-slate-900 text-sm">
                                    {new Date(order.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Invoice Table */}
                    <table className="w-full mb-8 border-collapse">
                        <thead>
                            <tr className="border-b-2 border-slate-800">
                                <th className="py-2 text-left text-xs font-bold uppercase tracking-widest text-slate-800 w-12">#</th>
                                <th className="py-2 text-left text-xs font-bold uppercase tracking-widest text-slate-800">Item Description</th>
                                <th className="py-2 text-right text-xs font-bold uppercase tracking-widest text-slate-800 w-24">Qty</th>
                                <th className="py-2 text-right text-xs font-bold uppercase tracking-widest text-slate-800 w-24">Price</th>
                                <th className="py-2 text-right text-xs font-bold uppercase tracking-widest text-slate-800 w-24">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.length > 0 ? items.map((item, idx) => (
                                <tr key={item.id} className="border-b border-slate-200">
                                    <td className="py-3 text-sm text-slate-600">{idx + 1}</td>
                                    <td className="py-3 text-sm font-bold text-slate-900">
                                        {item.products?.name || 'Item'}
                                        {item.weight && <span className="font-normal text-slate-500 text-xs ml-1">({item.weight})</span>}
                                    </td>
                                    <td className="py-3 text-right text-sm text-slate-600">{item.quantity}</td>
                                    <td className="py-3 text-right text-sm text-slate-600">₹{item.price_at_time}</td>
                                    <td className="py-3 text-right text-sm font-bold text-slate-900">₹{item.price_at_time * item.quantity}</td>
                                </tr>
                            )) : (
                                <tr className="border-b border-slate-200">
                                    <td className="py-3 text-sm text-slate-600">1</td>
                                    <td className="py-3 text-sm font-bold text-slate-900">Order Summary (Details Unavailable)</td>
                                    <td className="py-3 text-right text-sm text-slate-600">1</td>
                                    <td className="py-3 text-right text-sm text-slate-600">₹{order.total_amount}</td>
                                    <td className="py-3 text-right text-sm font-bold text-slate-900">₹{order.total_amount}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Totals */}
                    <div className="flex justify-end mb-12">
                        <div className="w-64 space-y-2">
                            <div className="flex justify-between text-lg font-black text-slate-900 border-t-2 border-slate-800 pt-2 mt-2">
                                <span>TOTAL</span>
                                <span>₹{order.total_amount}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="text-center text-xs text-slate-400 mt-auto pt-8 border-t border-slate-100">
                        <p>Thank you for shopping with VegFrash. Visit us again!</p>
                        <p className="mt-1">12, Market Road, New Delhi • contact@vegfrash.com</p>
                    </div>
                </div>

            </div>
        </main>
    );
}

function getCurrentStepIndex(status: string) {
    if (!status) return 0;
    const s = status.toLowerCase();

    if (s === 'delivered') return 4;
    if (s === 'out_for_delivery') return 3;
    if (s === 'packed' || s === 'processing') return 2;
    if (s === 'confirmed' || s === 'picking') return 1;

    // Placed / Pending / New Request
    return 0;
}
