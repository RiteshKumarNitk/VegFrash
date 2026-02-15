'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import {
    Truck, MapPin, Phone, CheckCircle2,
    Navigation, Package, LogOut, Loader2,
    Calendar, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

type Order = {
    id: string;
    customer_name: string;
    status: string;
    total_amount: number;
    delivery_slot: string;
    delivery_address_snapshot: any;
    items: any[];
    rider_assigned_at: string;
};

export default function RiderDashboard() {
    const supabase = createClient();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [riderId, setRiderId] = useState<string | null>(null);
    const [availableRiders, setAvailableRiders] = useState<any[]>([]);

    useEffect(() => {
        fetchRiders();
    }, []);

    const fetchRiders = async () => {
        const { data } = await supabase.from('staff_profiles').select('*').eq('role', 'delivery');
        if (data) setAvailableRiders(data);
    };

    const fetchAssignedOrders = async (id: string) => {
        setLoading(true);
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('rider_id', id)
            .neq('status', 'delivered')
            .order('created_at', { ascending: false });

        if (data) {
            setOrders(data.map(o => ({
                ...o,
                delivery_address_snapshot: typeof o.delivery_address_snapshot === 'string'
                    ? JSON.parse(o.delivery_address_snapshot)
                    : o.delivery_address_snapshot
            })));
        }
        if (error) toast.error(error.message);
        setLoading(false);
    };

    useEffect(() => {
        if (riderId) {
            fetchAssignedOrders(riderId);

            // Subscribe to real-time changes
            const channel = supabase
                .channel('rider-orders')
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'orders',
                    filter: `rider_id=eq.${riderId}`
                }, () => fetchAssignedOrders(riderId))
                .subscribe();

            return () => { supabase.removeChannel(channel); };
        }
    }, [riderId]);

    const markDelivered = async (orderId: string) => {
        const { error } = await supabase
            .from('orders')
            .update({ status: 'delivered' })
            .eq('id', orderId);

        if (error) toast.error(error.message);
        else toast.success("Order marked as delivered!");
    };

    if (!riderId) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-white text-center">
                <Truck size={64} className="mb-6 text-emerald-500 animate-bounce" />
                <h1 className="text-3xl font-black mb-2">Rider Terminal</h1>
                <p className="text-slate-400 mb-8 max-w-xs">Select your profile to start your delivery session.</p>
                <div className="w-full max-w-sm space-y-3">
                    {availableRiders.map(rider => (
                        <button
                            key={rider.id}
                            onClick={() => setRiderId(rider.id)}
                            className="w-full p-5 bg-slate-800 hover:bg-slate-700 rounded-2xl border border-slate-700 flex items-center gap-4 transition-all active:scale-95"
                        >
                            <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 font-bold">
                                {rider.full_name.charAt(0)}
                            </div>
                            <div className="text-left">
                                <p className="font-bold">{rider.full_name}</p>
                                <p className="text-xs text-slate-500 uppercase tracking-widest font-black">Delivery Partner</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <header className="bg-slate-900 p-6 pt-12 text-white sticky top-0 z-30 shadow-xl">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-1">On Duty</h2>
                        <h1 className="text-2xl font-black tracking-tight">Active Deliveries</h1>
                    </div>
                    <button
                        onClick={() => setRiderId(null)}
                        className="p-3 bg-slate-800 rounded-2xl text-slate-400 hover:text-white transition-colors"
                    >
                        <LogOut size={20} />
                    </button>
                </div>

                <div className="flex gap-4">
                    <div className="flex-1 bg-slate-800/50 p-4 rounded-2xl border border-white/5">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Assigned</p>
                        <p className="text-2xl font-black">{orders.length}</p>
                    </div>
                    <div className="flex-1 bg-slate-800/50 p-4 rounded-2xl border border-white/5">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Earned Today</p>
                        <p className="text-2xl font-black text-emerald-500">₹0</p>
                    </div>
                </div>
            </header>

            {/* Order Feed */}
            <main className="p-4 space-y-4">
                {loading ? (
                    <div className="py-20 text-center">
                        <Loader2 className="animate-spin text-emerald-600 mx-auto" size={40} />
                        <p className="mt-4 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Fetching Assignments...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="py-20 text-center flex flex-col items-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-300 mb-4">
                            <Package size={32} />
                        </div>
                        <h3 className="font-bold text-slate-800">No Orders Assigned</h3>
                        <p className="text-sm text-slate-500 mt-2">Take a break! New orders will appear here automatically.</p>
                    </div>
                ) : (
                    orders.map(order => (
                        <div key={order.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-5 border-b border-gray-50 flex justify-between items-center">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order ID</p>
                                    <p className="font-black text-slate-900">#{order.id.slice(0, 8).toUpperCase()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Collect Cash</p>
                                    <p className="text-xl font-black text-emerald-600">₹{order.total_amount}</p>
                                </div>
                            </div>

                            <div className="p-5 space-y-6">
                                {/* Customer Info */}
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                                        <MapPin size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-black text-slate-900">{order.customer_name}</p>
                                        <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                                            {order.delivery_address_snapshot?.full_address_text || 'Address details in notes'}
                                        </p>
                                        <div className="flex gap-2 mt-4">
                                            <a
                                                href={`tel:${order.delivery_address_snapshot?.receiver_phone}`}
                                                className="flex-1 bg-slate-900 text-white p-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
                                            >
                                                <Phone size={14} /> Call Customer
                                            </a>
                                            <a
                                                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(order.delivery_address_snapshot?.full_address_text || '')}`}
                                                target="_blank"
                                                className="flex-1 bg-blue-600 text-white p-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
                                            >
                                                <Navigation size={14} /> Navigate
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                {/* Items Summary */}
                                <div className="bg-slate-50 p-4 rounded-2xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-white p-2 rounded-lg border border-slate-200">
                                            <Package size={16} className="text-slate-400" />
                                        </div>
                                        <span className="font-bold text-slate-700 text-sm">Package details ({order.items?.length || 0} items)</span>
                                    </div>
                                    <AlertCircle size={16} className="text-slate-300" />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="p-4 bg-gray-50 border-t border-gray-100">
                                <button
                                    onClick={() => markDelivered(order.id)}
                                    className="w-full bg-emerald-600 text-white p-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-[0.98]"
                                >
                                    <CheckCircle2 size={24} /> Mark Delivered
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </main>
        </div>
    );
}
