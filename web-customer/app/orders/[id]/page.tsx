'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { notFound, useParams } from 'next/navigation';
import Header from '@/components/ui/Header';
import Link from 'next/link';

export default function OrderDetailPage() {
    const { id } = useParams(); // Get order ID from URL
    const [order, setOrder] = useState<any>(null);
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

    useEffect(() => {
        const fetchOrderDetails = async () => {
            setLoading(true);
            try {
                // 1. Fetch Order
                const { data: orderData, error: orderError } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (orderError) throw orderError;
                if (!orderData) return notFound();

                setOrder(orderData);

                // 2. Fetch Items
                const { data: itemsData, error: itemsError } = await supabase
                    .from('order_items')
                    .select('*')
                    .eq('order_id', id);

                if (itemsError) throw itemsError;
                setItems(itemsData || []);

            } catch (err: any) {
                console.error("Order fetch error:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchOrderDetails();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Header />
                <div className="max-w-3xl mx-auto px-4 pt-10 text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-brand border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-slate-500">Loading order details...</p>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Header />
                <div className="max-w-3xl mx-auto px-4 pt-20 text-center">
                    <h1 className="text-2xl font-bold text-slate-800 mb-2">Order Not Found</h1>
                    <p className="text-slate-600 mb-6">We couldn't find the order you're looking for.</p>
                    <Link href="/" className="text-brand font-bold hover:underline">Return Home</Link>
                </div>
            </div>
        );
    }

    // Parse Address Snapshot safely
    const address = typeof order.delivery_address_snapshot === 'string'
        ? JSON.parse(order.delivery_address_snapshot)
        : order.delivery_address_snapshot;

    return (
        <main className="min-h-screen bg-slate-50 pb-20">
            <Header />

            <div className="max-w-3xl mx-auto px-4 pt-6">

                {/* Header Section */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Order Summary</h1>
                        <p className="text-sm text-slate-500">
                            Placed on {new Date(order.created_at).toLocaleString()}
                        </p>
                    </div>
                    {/* Status Badge */}
                    <div className={`px-4 py-2 rounded-full font-bold uppercase tracking-wider text-sm ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                'bg-blue-100 text-blue-700'
                        }`}>
                        {order.status}
                    </div>
                </div>

                {/* Delivery Status Card */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-2xl">
                            {order.status === 'placed' ? '📦' : order.status === 'out_for_delivery' ? '🛵' : '✅'}
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-800">
                                {order.status === 'placed' ? 'Order Confirmed' :
                                    order.status === 'packed' ? 'Packed & Ready' :
                                        order.status === 'out_for_delivery' ? 'Out for Delivery' :
                                            'Delivered'}
                            </h3>
                            <p className="text-sm text-slate-500">
                                {order.status === 'placed' ? 'Your order is being prepared.' :
                                    'Arriving soon!'}
                            </p>
                        </div>
                    </div>

                    {/* Address Section */}
                    {address && (
                        <div className="border-t pt-4">
                            <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Delivering To</h4>
                            <p className="font-bold text-slate-800 text-sm">{address.address_label} - {address.receiver_name}</p>
                            <p className="text-sm text-slate-600">{address.full_address_text}</p>
                            <p className="text-xs text-slate-400 mt-1">Phone: {address.receiver_phone}</p>
                        </div>
                    )}
                </div>

                {/* Order Items */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
                    <div className="p-4 border-b bg-slate-50 font-bold text-slate-700 text-sm">
                        Items in Order
                    </div>
                    <div className="divide-y divide-slate-100">
                        {items.map(item => (
                            <div key={item.id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                                <div>
                                    <p className="font-bold text-slate-800 text-sm">Product Name</p>
                                    {/* Note: Ideally we join product name. If product_id is fake string from demo, we display it. 
                                        In real app, we fetch product table */}
                                    <p className="text-xs text-slate-500 font-mono">{item.product_id} (x{item.quantity})</p>
                                </div>
                                <span className="font-medium text-sm">₹{item.price_at_time * item.quantity}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bill Details */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="font-bold text-sm mb-4">Bill Details</h3>

                    <div className="space-y-2 text-sm mb-4">
                        <div className="flex justify-between">
                            <span className="text-slate-600">Item Total</span>
                            <span>₹{order.total_amount - (order.delivery_charge || 0) - (order.platform_fee || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-600">Delivery Charge</span>
                            <span>₹{order.delivery_charge || 0}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-600">Handling Charge</span>
                            <span>₹{order.platform_fee || 0}</span>
                        </div>
                    </div>

                    <div className="border-t pt-3 flex justify-between font-bold text-lg text-slate-800">
                        <span>Grand Total</span>
                        <span>₹{order.total_amount}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-400 mt-1">
                        <span>Payment Method</span>
                        <span>{order.payment_status === 'pending' ? 'Pay on Delivery' : order.payment_status}</span>
                    </div>
                </div>

            </div>
        </main>
    );
}
