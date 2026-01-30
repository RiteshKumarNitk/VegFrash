'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProfileSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [user, setUser] = useState<any>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        if (!isOpen) return;

        // Reset state on open
        setLoading(true);
        setError(null);

        let channel: any = null;

        const fetchUserData = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                setUser(user);

                if (user) {
                    console.log("Fetching orders for user:", user.id);
                    // Fetch initial orders
                    const { data, error: fetchError } = await supabase
                        .from('orders')
                        .select('*')
                        .eq('user_id', user.id)
                        .order('created_at', { ascending: false });

                    if (fetchError) {
                        console.error('Error fetching orders:', fetchError);
                        setError(fetchError.message);
                    } else {
                        console.log("Orders fetched:", data);
                        setOrders(data || []);
                    }

                    // Subscribe to Realtime Updates
                    channel = supabase
                        .channel('realtime-orders')
                        .on('postgres_changes', {
                            event: '*',
                            schema: 'public',
                            table: 'orders',
                            filter: `user_id=eq.${user.id}`
                        }, (payload) => {
                            console.log('Realtime Update:', payload);
                            if (payload.eventType === 'INSERT') {
                                setOrders(prev => [payload.new, ...prev]);
                            } else if (payload.eventType === 'UPDATE') {
                                setOrders(prev => prev.map(o => o.id === payload.new.id ? payload.new : o));
                            }
                        })
                        .subscribe();
                } else {
                    console.log("No user found in session");
                }
            } catch (err: any) {
                console.error("Profile Sidebar Unexpected Error:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();

        return () => {
            if (channel) supabase.removeChannel(channel);
        };
    }, [isOpen]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.reload(); // Refresh to clear state
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60]"
                onClick={onClose}
            ></div>

            {/* Sidebar Drawer */}
            <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[70] transform flex flex-col">

                {/* Header */}
                <div className="p-4 border-b flex items-center justify-between bg-slate-50">
                    <div>
                        <h2 className="text-xl font-extrabold text-slate-800">My Profile</h2>
                        <p className="text-xs text-slate-500">{user?.email}</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 hover:bg-slate-300">
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">

                    {/* Active Orders Section */}
                    <div>
                        <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                            <span>📦</span> Your Orders
                        </h3>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
                                Error loading orders: {error}
                            </div>
                        )}

                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse"></div>
                                ))}
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed text-slate-400 text-sm">
                                No orders found
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {orders.map(order => (
                                    <div key={order.id} className="p-4 rounded-xl border border-slate-100 shadow-sm bg-white hover:border-brand-light transition-all">

                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${order.status === 'delivered'
                                                        ? 'bg-slate-100 text-slate-600'
                                                        : 'bg-green-100 text-green-700'
                                                        }`}>
                                                        {order.status}
                                                    </span>
                                                    <span className="text-xs text-slate-400">
                                                        {new Date(order.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500 font-mono">#{order.id.slice(0, 8)}</p>
                                            </div>
                                            <span className="font-bold text-slate-800">₹{order.total_amount}</span>
                                        </div>

                                        {/* Action */}
                                        <div className="flex justify-between items-center text-xs mt-3 pt-3 border-t border-slate-50">
                                            <span className="text-slate-500">
                                                {order.status === 'placed' ? 'Processing...' : order.status}
                                            </span>
                                            <Link href={`/orders/${order.id}`} className="text-brand font-bold hover:underline" onClick={onClose}>
                                                View Details →
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t bg-slate-50">
                    <button
                        onClick={handleLogout}
                        className="w-full py-3 rounded-xl border border-red-200 text-red-500 font-bold hover:bg-red-50 transition-colors"
                    >
                        Log Out
                    </button>
                </div>
            </div>
        </>
    );
}
