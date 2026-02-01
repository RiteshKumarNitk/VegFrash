'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase';
import {
    Calendar, Package, Truck, CheckCircle2,
    ChevronRight, MapPin, User, Search,
    Filter, ArrowRight, Printer, AlertCircle, FolderSearch, Share2
} from 'lucide-react';

// REMOVE: const supabaseUrl = ...
// REMOVE: const supabaseAnonKey = ...
// const supabase = createClient(supabaseUrl, supabaseAnonKey);

type Order = {
    id: string;
    customer_name: string;
    total: number;
    status: string; // legacy status fallback
    order_stage: 'new_request' | 'confirmed' | 'processing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
    created_at: string;
    scheduled_date: string; // YYYY-MM-DD
    delivery_slot: string;  // "Morning", "Evening"
    items: any[];
    address_type: string;
    delivery_address?: any;
    note?: string;
};

export default function OrdersPage() {
    // --- State ---
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

    // Filters
    const [dateFilter, setDateFilter] = useState<'today' | 'tomorrow' | 'upcoming' | 'this_month' | 'past_month' | 'all'>('all');
    const [statusFilter, setStatusFilter] = useState<'active' | 'completed' | 'all_status'>('all_status');
    const [searchQuery, setSearchQuery] = useState('');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [printDate, setPrintDate] = useState('');

    useEffect(() => {
        setPrintDate(new Date().toLocaleString());
    }, []);

    // --- Fetch ---
    const fetchOrders = async () => {
        // ... (existing fetch logic remains same)
        setLoading(true);
        setErrorMsg(null);

        const supabase = createClient();

        // Fetch orders with items and product details
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                order_items (
                    *,
                    products (*)
                )
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching orders:", JSON.stringify(error, null, 2));
            setErrorMsg(error.message || "Unknown error occurred");
        }

        if (data) {
            const parsed = data.map((o: any) => {
                // Parse address if string
                const address = typeof o.delivery_address_snapshot === 'string'
                    ? JSON.parse(o.delivery_address_snapshot)
                    : o.delivery_address_snapshot;

                // Flatten items (with JSONB fallback)
                let validItems = o.order_items?.map((oi: any) => ({
                    name: oi.products?.name || 'Unknown Item',
                    image: oi.products?.image,
                    weight: oi.unit || oi.products?.weight || '1 unit',
                    quantity: oi.quantity,
                    price: oi.price || oi.price_at_time || oi.products?.price || 0
                })) || [];

                if (validItems.length === 0 && o.items && Array.isArray(o.items)) {
                    validItems = o.items.map((i: any) => ({
                        name: i.name || i.products?.name || 'Item',
                        image: i.image || i.products?.image,
                        weight: i.weight || i.unit || '1 unit',
                        quantity: i.quantity,
                        price: i.price || i.price_at_time
                    }));
                }

                // Date Parsing (Local Time)
                const createdDate = new Date(o.created_at);
                const localDateStr = createdDate.toLocaleDateString('en-CA'); // YYYY-MM-DD

                return {
                    id: o.id,
                    customer_name: address?.receiver_name || o.customer_name || 'Guest User',
                    total: o.total_amount || 0,
                    status: o.status,
                    order_stage: transformStatusToStage(o.status),
                    created_at: o.created_at,
                    scheduled_date: localDateStr,
                    delivery_slot: 'Morning (8am - 11am)',
                    items: validItems,
                    address_type: address?.address_label || 'Home',
                    note: '',
                    delivery_address: address
                };
            });
            setOrders(parsed);
        }
        setLoading(false);
    };

    const transformStatusToStage = (status: string) => {
        const s = status?.toLowerCase() || '';
        if (s === 'placed' || s === 'pending') return 'new_request';
        if (s === 'confirmed' || s === 'picking') return 'confirmed';
        if (s === 'packed' || s === 'processing') return 'processing';
        if (s === 'out_for_delivery') return 'out_for_delivery';
        if (s === 'delivered') return 'delivered';
        if (s === 'cancelled') return 'cancelled';
        return 'new_request';
    };

    useEffect(() => { fetchOrders(); }, []);

    // --- Logic ---
    const filteredOrders = useMemo(() => {
        const now = new Date();
        const todayStr = now.toLocaleDateString('en-CA');

        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toLocaleDateString('en-CA');

        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        let list = orders;

        // Date Filter
        if (dateFilter === 'today') list = list.filter(o => o.scheduled_date === todayStr);
        else if (dateFilter === 'tomorrow') list = list.filter(o => o.scheduled_date === tomorrowStr);
        else if (dateFilter === 'upcoming') list = list.filter(o => o.scheduled_date > tomorrowStr);
        else if (dateFilter === 'this_month') {
            list = list.filter(o => {
                const d = new Date(o.created_at);
                return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
            });
        }
        else if (dateFilter === 'past_month') {
            list = list.filter(o => {
                const d = new Date(o.created_at);
                const pastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                return d.getMonth() === pastMonthDate.getMonth() && d.getFullYear() === pastMonthDate.getFullYear();
            });
        }

        // Status Filter
        if (statusFilter === 'active') list = list.filter(o => o.order_stage !== 'delivered' && o.order_stage !== 'cancelled');
        if (statusFilter === 'completed') list = list.filter(o => o.order_stage === 'delivered' || o.order_stage === 'cancelled');

        // Search
        if (searchQuery) list = list.filter(o => o.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) || o.id.includes(searchQuery));

        return list;
    }, [orders, dateFilter, statusFilter, searchQuery]);

    // Derived Stats
    const stats = useMemo(() => {
        const totalRevenue = filteredOrders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.total : 0), 0);
        const totalOrders = filteredOrders.length;
        const deliveredOrders = filteredOrders.filter(o => o.order_stage === 'delivered').length;
        return { totalRevenue, totalOrders, deliveredOrders };
    }, [filteredOrders]);

    const selectedOrder = useMemo(() => orders.find(o => o.id === selectedOrderId), [orders, selectedOrderId]);

    // --- Actions ---
    const updateStage = async (id: string, stage: string, legacyStatus: string) => {
        const supabase = createClient();

        // Optimistic update
        setOrders(prev => prev.map(o => o.id === id ? { ...o, order_stage: stage as any, status: legacyStatus } : o));

        // Update DB
        const { error } = await supabase.from('orders').update({
            status: legacyStatus
        }).eq('id', id).select();

        if (error) {
            console.error("Failed to update status:", error);
            alert(`Update Failed: ${error.message || JSON.stringify(error)}`);
            fetchOrders(); // Revert on error
        }
    };

    return (
        <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">

            {/* HEADER */}
            <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm z-30">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 tracking-tight">Order Fulfillment</h1>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <div className="flex items-center gap-1.5">
                            <span className="font-bold text-gray-900">{stats.totalOrders}</span> Orders
                        </div>
                        <div className="w-px h-3 bg-gray-300"></div>
                        <div className="flex items-center gap-1.5">
                            <span className="font-bold text-gray-900">₹{stats.totalRevenue.toLocaleString()}</span> Revenue
                        </div>
                    </div>
                    {errorMsg && (
                        <div className="mt-2 bg-red-50 text-red-600 text-xs px-2 py-1 rounded border border-red-100">
                            Debug Error: {errorMsg}
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={fetchOrders} className="p-2 hover:bg-gray-100 rounded-full text-gray-500" title="Refresh">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    </button>

                    {/* Status Filter */}
                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="appearance-none bg-white border border-gray-200 text-gray-700 py-2 pl-3 pr-8 rounded-lg text-xs font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-gray-100 cursor-pointer"
                        >
                            <option value="all_status">All Status</option>
                            <option value="active">Active (Pending)</option>
                            <option value="completed">Completed / Past</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                            <svg className="fill-current h-4 w-4" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                        </div>
                    </div>

                    {/* Date Filter */}
                    <div className="relative">
                        <select
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value as any)}
                            className="appearance-none bg-gray-100 border-transparent text-gray-900 py-2 pl-3 pr-8 rounded-lg text-xs font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-gray-200 cursor-pointer"
                        >
                            <option value="today">Today</option>
                            <option value="tomorrow">Tomorrow</option>
                            <option value="upcoming">Upcoming</option>
                            <option value="this_month">This Month</option>
                            <option value="past_month">Last Month</option>
                            <option value="all">All Time</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                            <svg className="fill-current h-4 w-4" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                        </div>
                    </div>

                    {/* Batch Print Button */}
                    <button
                        onClick={() => {
                            setSelectedOrderId(null); // Clear selection to print full list
                            setTimeout(() => window.print(), 100);
                        }}
                        className="bg-black text-white p-2 rounded-lg flex items-center gap-2 text-xs font-bold shadow-lg hover:bg-gray-800"
                        title="Print Daily Run Sheet"
                    >
                        <Printer size={16} /> <span className="hidden lg:inline">Run Sheet</span>
                    </button>
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden">

                {/* LIST PANEL */}
                <div className={`${selectedOrderId ? 'hidden md:flex' : 'flex'} w-full md:w-[450px] flex-col border-r border-gray-200 bg-white`}>
                    {/* Search Bar */}
                    <div className="p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search by name or ID..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-lg border-none text-sm font-medium focus:ring-2 focus:ring-[#0c831f]/20 outline-none"
                            />
                        </div>
                    </div>

                    {/* Order List */}
                    <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
                        {filteredOrders.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-gray-400 p-8 text-center">
                                <div className="bg-gray-50 p-4 rounded-full mb-4">
                                    <FolderSearch size={48} className="text-gray-300" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">No Orders Found</h3>
                                <p className="text-sm text-gray-500 max-w-xs mb-6">
                                    We couldn't fetch any orders. This usually happens if the database policies (RLS) are hiding them.
                                </p>

                                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-left w-full max-w-sm">
                                    <h4 className="font-bold text-blue-800 text-xs uppercase mb-2 flex items-center gap-2">
                                        <AlertCircle size={14} /> Quick Fix
                                    </h4>
                                    <p className="text-xs text-blue-700 mb-3">
                                        Run the provided SQL script in your Supabase Dashboard to unblock Admin access.
                                    </p>
                                    <code className="block bg-white border border-blue-200 rounded p-2 text-[10px] font-mono text-blue-900 overflow-x-auto">
                                        web-store/supabase_fix_rls.sql
                                    </code>
                                </div>

                                <button onClick={fetchOrders} className="mt-8 text-sm font-bold text-gray-600 hover:text-gray-900 underline">
                                    Try Refreshing Again
                                </button>
                            </div>
                        )}
                        {filteredOrders.map(order => (
                            <div
                                key={order.id}
                                onClick={() => setSelectedOrderId(order.id)}
                                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors border-l-4 ${selectedOrderId === order.id ? 'bg-blue-50 border-blue-500' : getBorderColor(order.order_stage)}`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-bold text-gray-900 text-sm">#{order.id.slice(0, 8)}</span>
                                    <div className="flex items-center gap-1.5 bg-gray-100 px-2 py-0.5 rounded text-[10px] font-bold text-gray-600">
                                        <Calendar size={10} /> {order.delivery_slot.split('(')[0]}
                                    </div>
                                </div>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-sm font-bold text-gray-800">{order.customer_name}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{order.items.length} Items • {order.order_stage.replace('_', ' ').toUpperCase()}</p>
                                    </div>
                                    <div className="font-bold text-gray-900">₹{order.total}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* DETAIL PANEL */}
                <div className={`${!selectedOrderId ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-gray-50 relative overflow-hidden print:hidden`}>
                    {selectedOrder ? (
                        <div className="flex-1 flex flex-col h-full">
                            {/* Detail Header */}
                            <div className="bg-white border-b border-gray-200 p-6 flex flex-col md:flex-row justify-between items-start gap-4 shadow-sm z-20">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <button onClick={() => setSelectedOrderId(null)} className="md:hidden p-1 -ml-2 text-gray-400"><ChevronRight className="rotate-180" /></button>
                                        <h2 className="text-2xl font-black text-gray-900">#{selectedOrder.id.slice(0, 6)}</h2>
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${getBadgeColor(selectedOrder.order_stage)}`}>
                                            {selectedOrder.order_stage.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <div className="flex gap-6 text-sm text-gray-600 mb-4">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={16} className="text-gray-400" />
                                            <span className="font-bold">{selectedOrder.scheduled_date}</span>
                                            <span className="text-gray-400">|</span>
                                            <span>{selectedOrder.delivery_slot}</span>
                                        </div>
                                    </div>

                                    {/* Customer & Address Details */}
                                    <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 text-sm">
                                        <div className="flex items-start gap-3">
                                            <MapPin size={18} className="text-gray-400 mt-0.5 shrink-0" />
                                            <div>
                                                <p className="font-bold text-gray-900">{selectedOrder.customer_name}</p>
                                                {selectedOrder.delivery_address && (
                                                    <>
                                                        <p className="text-gray-600 mt-1 whitespace-pre-wrap">
                                                            {selectedOrder.delivery_address.full_address_text ||
                                                                `${selectedOrder.delivery_address.flat || ''}, ${selectedOrder.delivery_address.area || ''}`
                                                            }
                                                        </p>
                                                        {selectedOrder.delivery_address.landmark && (
                                                            <p className="text-gray-500 text-xs mt-0.5">Landmark: {selectedOrder.delivery_address.landmark}</p>
                                                        )}
                                                        <p className="font-medium text-gray-900 mt-2">
                                                            📞 {selectedOrder.delivery_address.receiver_phone || selectedOrder.delivery_address.phone || 'No Phone'}
                                                        </p>
                                                    </>
                                                )}
                                                {!selectedOrder.delivery_address && (
                                                    <p className="text-gray-400 italic">Address details not captured.</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {selectedOrder.note && (
                                        <div className="mt-3 bg-amber-50 text-amber-800 text-xs font-bold px-3 py-2 rounded-lg border border-amber-100 flex items-center gap-2 inline-flex">
                                            <AlertCircle size={14} /> Note: "{selectedOrder.note}"
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={() => window.print()}
                                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 w-full justify-center"
                                    >
                                        <Printer size={16} /> Print Packing List
                                    </button>

                                    <button
                                        onClick={() => {
                                            const message = `📦 *Delivery Order #${selectedOrder.id.slice(0, 6).toUpperCase()}*
👤 ${selectedOrder.customer_name}
📍 ${selectedOrder.delivery_address?.full_address_text || 'Address not found'}
📞 ${selectedOrder.delivery_address?.receiver_phone}
💰 Collect: ₹${selectedOrder.total}

*Items:*
${selectedOrder.items.map((i: any) => `- ${i.name} (${i.weight}) x${i.quantity}`).join('\n')}
`;
                                            window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white border border-[#25D366] rounded-lg text-sm font-bold hover:bg-[#128C7E] w-full justify-center"
                                    >
                                        <Share2 size={16} /> Send to Driver (WA)
                                    </button>
                                </div>
                            </div>

                            {/* Scrollable Content */}
                            <div className="flex-1 overflow-y-auto p-6 md:p-8">
                                <div className="max-w-4xl mx-auto space-y-6">

                                    {/* Item List */}
                                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                        <div className="bg-gray-50/50 border-b border-gray-100 px-6 py-3">
                                            <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Items Requested</h3>
                                        </div>
                                        <div className="divide-y divide-gray-50">
                                            {selectedOrder.items.map((item, i) => (
                                                <div key={i} className="px-6 py-4 flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                                                        {item.image ? <img src={item.image} className="w-full h-full object-cover rounded-lg" /> : '📦'}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-bold text-gray-900">{item.name}</p>
                                                        <p className="text-xs text-gray-500">{item.weight || '1 unit'}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-black text-lg text-gray-900">x{item.quantity}</p>
                                                        <p className="text-xs text-gray-500 font-medium">₹{item.price * item.quantity}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t border-gray-100">
                                            <span className="text-sm font-bold text-gray-500 uppercase">Total Amount</span>
                                            <span className="text-xl font-black text-gray-900">₹{selectedOrder.total}</span>
                                        </div>
                                    </div>

                                </div>
                            </div>

                            {/* Action Footer */}
                            <div className="bg-white border-t border-gray-200 p-6 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                                <div className="max-w-4xl mx-auto flex gap-4">
                                    {selectedOrder.order_stage === 'new_request' && (
                                        <button
                                            onClick={() => updateStage(selectedOrder.id, 'confirmed', 'picking')}
                                            className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                                        >
                                            Confirm Schedule & Reserve Stock <ArrowRight size={18} />
                                        </button>
                                    )}
                                    {selectedOrder.order_stage === 'confirmed' && (
                                        <button
                                            onClick={() => updateStage(selectedOrder.id, 'processing', 'packed')}
                                            className="flex-1 py-3 bg-[#0c831f] text-white font-bold rounded-xl shadow-lg hover:bg-[#096b19] flex items-center justify-center gap-2"
                                        >
                                            <Package size={18} /> Mark as Packed
                                        </button>
                                    )}
                                    {selectedOrder.order_stage === 'processing' && (
                                        <button
                                            onClick={() => updateStage(selectedOrder.id, 'out_for_delivery', 'out_for_delivery')}
                                            className="flex-1 py-3 bg-orange-600 text-white font-bold rounded-xl shadow-lg hover:bg-orange-700 flex items-center justify-center gap-2"
                                        >
                                            <Truck size={18} /> Dispatch Driver
                                        </button>
                                    )}
                                    {selectedOrder.order_stage === 'out_for_delivery' && (
                                        <button
                                            onClick={() => updateStage(selectedOrder.id, 'delivered', 'delivered')}
                                            className="flex-1 py-3 bg-gray-900 text-white font-bold rounded-xl shadow-lg hover:bg-black flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle2 size={18} /> Mark Delivered
                                        </button>
                                    )}
                                    {selectedOrder.order_stage === 'delivered' && (
                                        <div className="flex-1 py-3 bg-gray-100 text-gray-500 font-bold rounded-xl text-center">
                                            Order Completed
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                            <Package size={48} className="mb-4 opacity-50" />
                            <p className="font-medium">Select an order to manage fulfillment.</p>
                        </div>
                    )}
                </div>

                {/* PRINT-ONLY MANIFEST (BATCH LIST) */}
                <div className="hidden print:block fixed inset-0 bg-white z-[9999] p-8 overflow-y-auto w-full h-full">
                    {/* If selectedOrder is present, print Packing List */}
                    {selectedOrder ? (
                        <div className="max-w-3xl mx-auto border border-black p-8">
                            <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-6">
                                <div>
                                    <h1 className="text-2xl font-black uppercase tracking-tighter">VegFrash Delivery</h1>
                                    <p className="text-sm font-bold mt-1">Order #{selectedOrder.id.slice(0, 8).toUpperCase()}</p>
                                </div>
                                <div className="text-right">
                                    <h2 className="text-xl font-bold">{selectedOrder.delivery_slot}</h2>
                                    <p className="text-sm">{selectedOrder.scheduled_date}</p>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h3 className="font-bold border-b border-black mb-2 uppercase text-sm">Customer</h3>
                                <p className="text-lg font-bold">{selectedOrder.customer_name}</p>
                                <p className="text-sm whitespace-pre-wrap">{selectedOrder.delivery_address?.full_address_text}</p>
                                <p className="text-sm font-bold mt-2">Ph: {selectedOrder.delivery_address?.receiver_phone}</p>
                            </div>

                            <table className="w-full mb-8">
                                <thead>
                                    <tr className="border-b-2 border-black">
                                        <th className="text-left py-2">Item</th>
                                        <th className="text-right py-2 w-16">Qty</th>
                                        <th className="text-right py-2 w-4">Check</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedOrder.items.map((item, i) => (
                                        <tr key={i} className="border-b border-gray-300">
                                            <td className="py-2 text-sm font-medium">{item.name} <span className="text-xs text-gray-500">({item.weight})</span></td>
                                            <td className="py-2 text-right font-bold">x{item.quantity}</td>
                                            <td className="py-2 text-right"><div className="w-4 h-4 border border-black inline-block"></div></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="flex justify-between items-center text-xl font-black border-t-2 border-black pt-4">
                                <span>COLLECT CASH</span>
                                <span>₹{selectedOrder.total}</span>
                            </div>
                        </div>
                    ) : (
                        // If NO selectedOrder, print the BATCH RUN SHEET of all filtered orders
                        <div className="w-full">
                            <h1 className="text-2xl font-black mb-4 uppercase">Delivery Run Sheet ({filteredOrders.length} Orders)</h1>
                            <p className="text-sm mb-6">Generated on {printDate}</p>

                            <table className="w-full border-collapse border border-black text-xs">
                                <thead>
                                    <tr className="bg-gray-200">
                                        <th className="border border-black p-2 w-10">#</th>
                                        <th className="border border-black p-2 w-24">Order ID</th>
                                        <th className="border border-black p-2">Customer & Address</th>
                                        <th className="border border-black p-2 w-24">Phone</th>
                                        <th className="border border-black p-2 w-16 text-right">Amnt</th>
                                        <th className="border border-black p-2 w-16">Sig</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOrders.map((o, idx) => (
                                        <tr key={o.id}>
                                            <td className="border border-black p-2 text-center">{idx + 1}</td>
                                            <td className="border border-black p-2 font-mono">{o.id.slice(0, 6)}</td>
                                            <td className="border border-black p-2">
                                                <div className="font-bold">{o.customer_name}</div>
                                                <div className="text-[10px]">{typeof o.delivery_address_snapshot === 'string' ? JSON.parse(o.delivery_address_snapshot)?.full_address_text : o.delivery_address?.full_address_text}</div>
                                            </td>
                                            <td className="border border-black p-2 font-mono">{typeof o.delivery_address_snapshot === 'string' ? JSON.parse(o.delivery_address_snapshot)?.receiver_phone : o.delivery_address?.receiver_phone}</td>
                                            <td className="border border-black p-2 text-right font-bold">₹{o.total}</td>
                                            <td className="border border-black p-2"></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>


            </main>
        </div>
    );
}

// --- Helpers ---

function getBorderColor(stage: string) {
    if (stage === 'new_request') return 'border-l-blue-500';
    if (stage === 'confirmed') return 'border-l-yellow-500';
    if (stage === 'processing') return 'border-l-orange-500';
    if (stage === 'out_for_delivery') return 'border-l-purple-500';
    if (stage === 'delivered') return 'border-l-green-500';
    return 'border-l-gray-300';
}

function getBadgeColor(stage: string) {
    if (stage === 'new_request') return 'bg-blue-100 text-blue-700 border border-blue-200';
    if (stage === 'confirmed') return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
    if (stage === 'processing') return 'bg-orange-100 text-orange-700 border border-orange-200';
    if (stage === 'out_for_delivery') return 'bg-purple-100 text-purple-700 border border-purple-200';
    if (stage === 'delivered') return 'bg-green-100 text-green-700 border border-green-200';
    return 'bg-gray-100 text-gray-600';
}
