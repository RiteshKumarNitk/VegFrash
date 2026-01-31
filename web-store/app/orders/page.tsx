'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
    Clock, RefreshCw, CheckCircle2, Circle, AlertTriangle,
    Package, Truck, MapPin, Phone, User, ChevronRight,
    ShoppingBag, AlertOctagon, Volume2, VolumeX, PauseCircle
} from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- Types ---
type OrderItem = {
    name: string;
    quantity: string | number;
    price: number;
    image?: string;
    checked?: boolean; // Local state
};

type Order = {
    id: string;
    customer_name: string;
    total: number;
    status: 'pending' | 'packed' | 'out_for_delivery' | 'delivered';
    created_at: string;
    items: OrderItem[];
    address_type?: string; // Mock
    distance?: string; // Mock
    note?: string; // Mock
};

// --- Mock Data Helpers ---
const ORDER_SLA_MINS = 15;

export default function OrdersPage() {
    // --- State ---
    const [orders, setOrders] = useState<Order[]>([]);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<'pending' | 'packed' | 'out_for_delivery' | 'delivered'>('pending');
    const [currentTime, setCurrentTime] = useState(new Date());
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [autoSelect, setAutoSelect] = useState(true);

    // Packing State
    const [packingItems, setPackingItems] = useState<OrderItem[]>([]);
    const [packingStarted, setPackingStarted] = useState(false);

    // --- Effects ---
    useEffect(() => {
        fetchOrders();
        const timer = setInterval(() => setCurrentTime(new Date()), 1000 * 60); // Update time every min
        const poller = setInterval(fetchOrders, 30000); // Poll every 30s
        return () => { clearInterval(timer); clearInterval(poller); };
    }, []);

    // Auto-select first order when list changes if enabled
    useEffect(() => {
        if (autoSelect && orders.length > 0 && !selectedOrderId) {
            const pending = orders.find(o => o.status === statusFilter);
            if (pending) handleSelectOrder(pending.id);
        }
    }, [orders, statusFilter, autoSelect]);

    const fetchOrders = async () => {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: true }); // FIFO

        if (error) console.error('Error:', error);
        else {
            // Parse items if string
            const parsed = (data || []).map(o => ({
                ...o,
                items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items
            }));
            setOrders(parsed);
            setLoading(false);
        }
    };

    // --- Computed ---
    const filteredOrders = useMemo(() => orders.filter(o => o.status === statusFilter), [orders, statusFilter]);

    const selectedOrder = useMemo(() => orders.find(o => o.id === selectedOrderId), [orders, selectedOrderId]);

    const stats = useMemo(() => ({
        pending: orders.filter(o => o.status === 'pending').length,
        packed: orders.filter(o => o.status === 'packed').length,
        delivery: orders.filter(o => o.status === 'out_for_delivery').length,
    }), [orders]);

    // --- Actions ---
    const handleSelectOrder = (id: string) => {
        setSelectedOrderId(id);
        const order = orders.find(o => o.id === id);
        if (order) {
            setPackingItems(order.items.map(i => ({ ...i, checked: false })));
            setPackingStarted(false);
        }
    };

    const handleCheckItem = (index: number) => {
        const newItems = [...packingItems];
        newItems[index].checked = !newItems[index].checked;
        setPackingItems(newItems);
    };

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        // Optimistic update
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus as any } : o));

        // Use standard Supabase client
        await supabase.from('orders').update({ status: newStatus }).eq('id', id);

        // Feedback
        // toast.success(`Order ${newStatus.replace('_', ' ')}`); 

        // Auto advance
        if (autoSelect) {
            const next = filteredOrders.find(o => o.id !== id);
            if (next) handleSelectOrder(next.id);
            else setSelectedOrderId(null);
        }
    };

    const allPacked = packingItems.length > 0 && packingItems.every(i => i.checked);
    const progress = Math.round((packingItems.filter(i => i.checked).length / packingItems.length) * 100) || 0;

    return (
        <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">

            {/* 1. OPERATIONS HEADER */}
            <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm z-30">
                <div className="flex items-center gap-6">
                    <h1 className="text-xl font-black text-gray-800 tracking-tight flex items-center gap-2">
                        <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                        LIVE OPS
                    </h1>
                    <div className="hidden md:flex items-center gap-4 text-sm font-medium text-gray-500">
                        <span className="flex items-center gap-1"><Clock size={14} /> {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="flex items-center gap-1 text-green-700 bg-green-50 px-2 py-0.5 rounded-full text-xs font-bold border border-green-100">STORE OPEN</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <LaneTab label="Placed" count={stats.pending} active={statusFilter === 'pending'} onClick={() => setStatusFilter('pending')} color="red" />
                        <LaneTab label="Packed" count={stats.packed} active={statusFilter === 'packed'} onClick={() => setStatusFilter('packed')} color="blue" />
                        <LaneTab label="Delivery" count={stats.delivery} active={statusFilter === 'out_for_delivery'} onClick={() => setStatusFilter('out_for_delivery')} color="green" />
                    </div>
                    <div className="h-6 w-px bg-gray-300 mx-2 hidden md:block" />
                    <button onClick={() => setSoundEnabled(!soundEnabled)} className="text-gray-400 hover:text-gray-600">
                        {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                    </button>
                    <button disabled className="text-gray-400 hover:text-gray-600 animate-spin-slow" title="Auto-refreshing">
                        <RefreshCw size={18} />
                    </button>
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold text-xs border border-purple-200">
                        JS
                    </div>
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden">

                {/* 2. ORDER LIST (LEFT PANEL) */}
                <div className={`${selectedOrderId ? 'hidden md:flex' : 'flex'} w-full md:w-[400px] flex-col border-r border-gray-200 bg-white overflow-y-auto`}>
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center sticky top-0 z-10 backdrop-blur-sm">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{filteredOrders.length} Orders</span>
                        <div className="flex gap-2">
                            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-600">
                                <input type="checkbox" checked={autoSelect} onChange={e => setAutoSelect(e.target.checked)} className="rounded text-green-600 focus:ring-green-500" />
                                Auto-Next
                            </label>
                        </div>
                    </div>

                    <div className="divide-y divide-gray-50">
                        {loading && <div className="p-8 text-center text-gray-400 animate-pulse">Loading orders...</div>}
                        {!loading && filteredOrders.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                                <Package size={40} className="mb-4 opacity-50" />
                                <p>No orders in {statusFilter}</p>
                            </div>
                        )}
                        {filteredOrders.map(order => (
                            <OrderCard
                                key={order.id}
                                order={order}
                                selected={selectedOrderId === order.id}
                                onClick={() => handleSelectOrder(order.id)}
                            />
                        ))}
                    </div>
                </div>

                {/* 3. PACKING WORKSTATION (RIGHT PANEL) */}
                <div className={`${!selectedOrderId ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-gray-50 relative`}>
                    {selectedOrder ? (
                        <>
                            {/* Sticky Header */}
                            <div className="bg-white border-b border-gray-200 p-6 shadow-sm flex flex-col md:flex-row md:items-start justify-between gap-4 sticky top-0 z-20">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <button onClick={() => setSelectedOrderId(null)} className="md:hidden p-1 -ml-2 text-gray-400"><ChevronRight className="rotate-180" /></button>
                                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">#{selectedOrder.id.slice(0, 8)}</h2>
                                        <StatusBadge status={selectedOrder.status} />
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                        <span className="flex items-center gap-1.5"><User size={16} className="text-gray-400" /> {selectedOrder.customer_name || 'Guest'}</span>
                                        <span className="flex items-center gap-1.5"><MapPin size={16} className="text-gray-400" /> Home • 1.2km</span>
                                    </div>
                                    {selectedOrder.note && (
                                        <div className="mt-3 bg-yellow-50 text-yellow-800 text-xs font-medium px-3 py-2 rounded-lg border border-yellow-100 flex items-start gap-2">
                                            <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                                            "{selectedOrder.note}"
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                    <Timer created_at={selectedOrder.created_at} />
                                    <div className="text-lg font-bold text-gray-900">₹{selectedOrder.total}</div>
                                </div>
                            </div>

                            {/* Scrollable Content */}
                            <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-4xl mx-auto w-full space-y-6">

                                {/* Packing List */}
                                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                    <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                            <ShoppingBag size={18} /> Items to Pack
                                        </h3>
                                        <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-md">{progress}% Ready</span>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="h-1 w-full bg-gray-100">
                                        <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${progress}%` }} />
                                    </div>

                                    <div className="divide-y divide-gray-50">
                                        {packingItems.map((item, idx) => (
                                            <div
                                                key={idx}
                                                onClick={() => handleCheckItem(idx)}
                                                className={`p-4 flex items-center gap-4 cursor-pointer transition-all hover:bg-gray-50 group select-none ${item.checked ? 'bg-gray-50/50' : ''}`}
                                            >
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${item.checked ? 'bg-green-500 border-green-500' : 'border-gray-300 group-hover:border-blue-400'}`}>
                                                    {item.checked && <CheckCircle2 size={16} className="text-white" />}
                                                </div>
                                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xl shrink-0 border border-gray-200">
                                                    {item.image ? <img src={item.image} className="w-full h-full object-cover rounded-lg" /> : '🥬'}
                                                </div>
                                                <div className="flex-1">
                                                    <p className={`font-bold text-gray-800 ${item.checked ? 'line-through text-gray-400' : ''}`}>{item.name}</p>
                                                    <p className="text-sm text-gray-500">Qty: <span className="font-semibold text-gray-900">{item.quantity}</span></p>
                                                </div>
                                                <div className="font-medium text-gray-900">₹{item.price}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="bg-white border-t border-gray-200 p-4 sticky bottom-0 z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                                <div className="max-w-4xl mx-auto flex gap-4">
                                    {statusFilter === 'pending' && (
                                        allPacked ? (
                                            <button
                                                onClick={() => handleUpdateStatus(selectedOrder.id, 'packed')}
                                                className="w-full py-4 bg-green-600 text-white font-bold text-lg rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-900/20 active:scale-[0.99] flex items-center justify-center gap-2 animate-pulse"
                                            >
                                                <Package /> Mark as Packed
                                            </button>
                                        ) : (
                                            <div className="flex gap-3 w-full">
                                                <button className="flex-1 py-4 bg-gray-100 text-gray-500 font-bold text-lg rounded-xl cursor-not-allowed">
                                                    Verify Items ({packingItems.filter(i => i.checked).length}/{packingItems.length})
                                                </button>
                                            </div>
                                        )
                                    )}

                                    {statusFilter === 'packed' && (
                                        <button
                                            onClick={() => handleUpdateStatus(selectedOrder.id, 'out_for_delivery')}
                                            className="w-full py-4 bg-blue-600 text-white font-bold text-lg rounded-xl hover:bg-blue-700 transition-all shadow-lg flex items-center justify-center gap-2"
                                        >
                                            <Truck /> Dispatch Driver
                                        </button>
                                    )}

                                    {statusFilter === 'out_for_delivery' && (
                                        <button
                                            onClick={() => handleUpdateStatus(selectedOrder.id, 'delivered')}
                                            className="w-full py-4 bg-purple-600 text-white font-bold text-lg rounded-xl hover:bg-purple-700 transition-all shadow-lg flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle2 /> Confirm Delivery
                                        </button>
                                    )}
                                </div>
                            </div>

                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
                                <ShoppingBag size={40} className="text-gray-300" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">No Order Selected</h3>
                            <p className="max-w-xs text-center mt-2">Select an order from the list to start packing.</p>
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
}

// --- Sub-components ---

function LaneTab({ label, count, active, onClick, color }: any) {
    const colorStyles = {
        red: active ? 'bg-red-50 text-red-700 border-red-200' : 'text-gray-500 hover:bg-gray-50',
        blue: active ? 'bg-blue-50 text-blue-700 border-blue-200' : 'text-gray-500 hover:bg-gray-50',
        green: active ? 'bg-green-50 text-green-700 border-green-200' : 'text-gray-500 hover:bg-gray-50'
    }[color as 'red' | 'blue' | 'green'];

    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${colorStyles} ${active ? 'shadow-sm border' : ''}`}
        >
            {label}
            {count > 0 && <span className={`px-1.5 py-0.5 rounded text-[10px] ${active ? 'bg-white/50' : 'bg-gray-200 text-gray-600'}`}>{count}</span>}
        </button>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles = {
        pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        packed: 'bg-blue-100 text-blue-700 border-blue-200',
        out_for_delivery: 'bg-orange-100 text-orange-700 border-orange-200',
        delivered: 'bg-green-100 text-green-700 border-green-200'
    }[status] || 'bg-gray-100 text-gray-600';

    const label = status.replace(/_/g, ' ').toUpperCase();

    return (
        <span className={`px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider border ${styles}`}>
            {label}
        </span>
    );
}

function OrderCard({ order, selected, onClick }: { order: Order, selected: boolean, onClick: () => void }) {
    // Calculat urgency
    const diffMins = Math.floor((new Date().getTime() - new Date(order.created_at).getTime()) / 60000);
    const urgencyColor = diffMins > 10 ? 'border-l-red-500' : (diffMins > 5 ? 'border-l-yellow-500' : 'border-l-green-500');

    return (
        <div
            onClick={onClick}
            className={`p-4 border-l-[4px] border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-all ${urgencyColor} ${selected ? 'bg-blue-50/50 border-l-blue-600' : 'bg-white'}`}
        >
            <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-gray-900">#{order.id.slice(0, 6)}</span>
                <span className={`text-xs font-bold ${diffMins > 10 ? 'text-red-600 animate-pulse' : 'text-gray-500'}`}>
                    {diffMins}m ago
                </span>
            </div>
            <div className="flex justify-between items-end">
                <div>
                    <p className="text-sm font-medium text-gray-700">{order.items.length} Items</p>
                    <p className="text-xs text-gray-400 font-medium">To: {order.customer_name || 'Guest'}</p>
                </div>
                <div className="font-bold text-gray-900">₹{order.total}</div>
            </div>
        </div>
    );
}

function Timer({ created_at }: { created_at: string }) {
    const [elapsed, setElapsed] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            const diff = Math.max(0, new Date().getTime() - new Date(created_at).getTime());
            const mins = Math.floor(diff / 60000);
            const secs = Math.floor((diff % 60000) / 1000);
            setElapsed(`${mins}m ${secs}s`);
        }, 1000);
        return () => clearInterval(interval);
    }, [created_at]);

    return (
        <div className="flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100 animate-pulse">
            <Clock size={12} /> {elapsed}
        </div>
    );
}
