'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { ChevronRight, Clock, MapPin, Package, Check, AlertTriangle } from 'lucide-react';
import PickingInterface from '@/components/PickingInterface';

// Types
type Order = {
    id: string;
    created_at: string;
    status: string;
    user_id: string;
    order_items: OrderItem[];
};

type OrderItem = {
    id: string;
    requested_qty_kg: number;
    actual_qty_kg: number | null;
    products: {
        name: string;
        images: string[];
    };
};

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [pickingItem, setPickingItem] = useState<OrderItem | null>(null);

    const supabase = createClient();

    useEffect(() => {
        fetchOrders();

        // Realtime subscription
        const channel = supabase
            .channel('store-orders')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchOrders)
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchOrders = async () => {
        const { data } = await supabase
            .from('orders')
            .select(`
        *,
        order_items (
          id,
          requested_qty_kg,
          actual_qty_kg,
          products (
             name,
             images
          )
        )
      `)
            .order('created_at', { ascending: false });

        if (data) {
            // Cast or map data if needed, simplified here
            setOrders(data as any);
            if (!selectedId && data.length > 0) setSelectedId(data[0].id);
        }
        setLoading(false);
    };

    const selectedOrder = orders.find(o => o.id === selectedId);

    const handleWeightConfirm = async (weight: number) => {
        if (!pickingItem || !selectedId) return;

        // Update DB
        await supabase
            .from('order_items')
            .update({ actual_qty_kg: weight })
            .eq('id', pickingItem.id);

        // Refresh local state (simplified)
        fetchOrders();
        setPickingItem(null);
    };

    const updateStatus = async (status: string) => {
        if (!selectedId) return;
        await supabase.from('orders').update({ status }).eq('id', selectedId);
        fetchOrders();
    };

    if (loading) return <div className="p-8">Loading orders...</div>;

    return (
        <div className="flex h-screen overflow-hidden">
            {pickingItem && (
                <PickingInterface
                    item={pickingItem.products}
                    onConfirm={handleWeightConfirm}
                    onCancel={() => setPickingItem(null)}
                />
            )}

            {/* Left: Order List */}
            <div className="w-1/3 border-r border-slate-200 bg-white flex flex-col h-full">
                <div className="p-4 border-b border-slate-200">
                    <h2 className="font-bold text-lg text-slate-800">Active Orders</h2>
                    <div className="flex gap-2 mt-2">
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold">
                            Picking ({orders.filter(o => o.status === 'picking').length})
                        </span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {orders.map(order => (
                        <div
                            key={order.id}
                            onClick={() => setSelectedId(order.id)}
                            className={`p-4 border-b border-slate-100 cursor-pointer transition-colors group ${selectedId === order.id ? 'bg-emerald-50 border-emerald-200' : 'hover:bg-slate-50'}`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-bold text-slate-800">#{order.id.slice(0, 8)}</span>
                                <span className="text-xs text-slate-400 font-mono">
                                    {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                                <span className="bg-slate-100 px-2 py-0.5 rounded text-xs">{order.order_items?.length || 0} items</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className={`px-2 py-1 rounded font-bold uppercase ${getStatusColor(order.status)}`}>
                                    {order.status}
                                </span>
                                <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right: Order Detail */}
            <div className="flex-1 bg-slate-50 p-8 h-full overflow-y-auto">
                {selectedOrder ? (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 max-w-2xl mx-auto overflow-hidden">
                        <div className={`border-b p-6 flex justify-between items-center ${getStatusHeaderColor(selectedOrder.status)}`}>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800">#{selectedOrder.id.slice(0, 8)}</h2>
                                <p className="text-sm mt-1 flex items-center gap-2 opacity-80">
                                    <Clock size={14} /> Status: {selectedOrder.status.toUpperCase()}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                {selectedOrder.status === 'placed' && (
                                    <button onClick={() => updateStatus('picking')} className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold shadow-sm hover:bg-emerald-700">
                                        Start Picking
                                    </button>
                                )}
                                {selectedOrder.status === 'picking' && (
                                    <button onClick={() => updateStatus('packed')} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold shadow-sm hover:bg-blue-700">
                                        Mark Packed
                                    </button>
                                )}
                                {selectedOrder.status === 'packed' && (
                                    <button onClick={() => updateStatus('out_for_delivery')} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold shadow-sm hover:bg-indigo-700">
                                        Mark Out
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="p-6">
                            <h3 className="font-bold text-slate-700 mb-4 uppercase text-sm tracking-wide">Picking List</h3>
                            <ul className="space-y-4">
                                {selectedOrder.order_items?.map(item => (
                                    <li
                                        key={item.id}
                                        onClick={() => selectedOrder.status === 'picking' && setPickingItem(item)}
                                        className={`flex items-center gap-4 p-4 border rounded-lg transition-colors cursor-pointer ${item.actual_qty_kg ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200 hover:border-emerald-400'
                                            }`}
                                    >
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${item.actual_qty_kg ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300'}`}>
                                            {item.actual_qty_kg && <Check size={14} />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center">
                                                <span className={`font-bold text-lg ${item.actual_qty_kg ? 'text-emerald-900' : 'text-slate-800'}`}>
                                                    {item.products?.name || 'Unknown Item'}
                                                </span>
                                                {item.actual_qty_kg ? (
                                                    <div className="text-right">
                                                        <span className="block font-mono text-lg font-bold text-emerald-600">{item.actual_qty_kg} kg</span>
                                                        <span className="text-xs text-slate-400 line-through">est {item.requested_qty_kg} kg</span>
                                                    </div>
                                                ) : (
                                                    <span className="font-mono text-lg font-bold text-slate-600">
                                                        {item.requested_qty_kg} kg
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-slate-400">Select an order</div>
                )}
            </div>
        </div>
    );
}

function getStatusColor(status: string) {
    switch (status) {
        case 'placed': return 'text-orange-700 bg-orange-50';
        case 'picking': return 'text-yellow-700 bg-yellow-50';
        case 'packed': return 'text-blue-700 bg-blue-50';
        case 'out_for_delivery': return 'text-indigo-700 bg-indigo-50';
        case 'delivered': return 'text-emerald-700 bg-emerald-50';
        default: return 'text-slate-700 bg-slate-50';
    }
}

function getStatusHeaderColor(status: string) {
    switch (status) {
        case 'picking': return 'bg-yellow-50 border-yellow-100';
        case 'packed': return 'bg-blue-50 border-blue-100';
        case 'out_for_delivery': return 'bg-indigo-50 border-indigo-100';
        case 'delivered': return 'bg-emerald-50 border-emerald-100';
        default: return 'bg-slate-50 border-slate-200';
    }
}
