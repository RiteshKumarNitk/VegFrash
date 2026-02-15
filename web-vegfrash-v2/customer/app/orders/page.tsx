'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import ModernHeader from '@/components/ui/ModernHeader';
import Link from 'next/link';
import { Package, ChevronRight, Clock, Calendar, ArrowRight, Truck, CheckCircle2 } from 'lucide-react';

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const supabase = createClient();
    const PAGE_SIZE = 5;

    const fetchOrders = async (pageIndex: number, isNew: boolean = false) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            if (isNew) setLoading(true);
            else setLoadingMore(true);

            const from = pageIndex * PAGE_SIZE;
            const to = from + PAGE_SIZE - 1;

            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    order_items (
                        *,
                        products (image, name)
                    )
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .range(from, to);

            if (data) {
                setOrders(prev => isNew ? data : [...prev, ...data]);
                if (data.length < PAGE_SIZE) setHasMore(false);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        fetchOrders(0, true);
    }, []);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchOrders(nextPage);
    };

    return (
        <main className="min-h-screen bg-slate-50 pb-20">
            <ModernHeader deviceType="desktop" />

            <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
                <div className="flex items-center gap-3 mb-8">
                    <Link href="/account" className="md:hidden p-2 -ml-2 text-slate-400 hover:text-slate-800"><ArrowRight className="rotate-180" /></Link>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 flex items-center gap-3">
                        <Package className="text-brand hidden md:block" size={32} /> My Orders
                    </h1>
                </div>

                {loading ? (
                    <div className="space-y-4 max-w-3xl">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-40 bg-white rounded-xl shadow-sm animate-pulse border border-slate-100"></div>
                        ))}
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-slate-100 max-w-3xl mx-auto">
                        <div className="w-40 h-40 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-6xl">
                            🛍️
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">No past orders</h2>
                        <p className="text-slate-400 mb-8">You haven't placed any orders yet.</p>
                        <Link href="/" className="bg-brand text-white px-8 py-3 rounded-full font-bold hover:bg-brand-dark transition-colors shadow-lg shadow-brand/20">Start Shopping</Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Orders List */}
                        <div className="lg:col-span-2 space-y-4">
                            {orders.map(order => (
                                <Link href={`/orders/${order.id}`} key={order.id} className="block bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden hover:shadow-md transition-all hover:border-brand/30 group">
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${order.status === 'delivered' ? 'bg-green-100 text-green-600' : 'bg-sky-100 text-sky-600'}`}>
                                                    {order.status === 'delivered' ? <CheckCircle2 size={24} /> : <Truck size={24} />}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-800 text-lg">Order #{order.id.slice(0, 6).toUpperCase()}</h3>
                                                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 font-medium">
                                                        <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(order.created_at).toLocaleDateString()}</span>
                                                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                        <span className="flex items-center gap-1"><Clock size={12} /> {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${order.status === 'delivered' ? 'bg-green-50 text-green-700 border border-green-100' :
                                                    order.status === 'cancelled' ? 'bg-red-50 text-red-700 border border-red-100' :
                                                        'bg-sky-50 text-sky-700 border border-sky-100'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Preview Items (First 3) */}
                                        <div className="flex items-center gap-2 mb-6 overflow-hidden">
                                            {order.order_items?.slice(0, 4).map((item: any) => (
                                                <div key={item.id} className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-xs overflow-hidden" title={item.products?.name}>
                                                    {item.products?.image ? <img src={item.products.image} className="w-full h-full object-cover" /> : '🥗'}
                                                </div>
                                            ))}
                                            {(order.order_items?.length || 0) > 4 && (
                                                <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                                                    +{order.order_items.length - 4}
                                                </div>
                                            )}
                                        </div>

                                        <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">Total Bill</p>
                                                <p className="text-xl font-extrabold text-slate-800">₹{order.total_amount}</p>
                                            </div>
                                            <div className="flex items-center gap-1 text-brand font-bold text-sm bg-brand/5 px-4 py-2 rounded-lg group-hover:bg-brand group-hover:text-white transition-all">
                                                See Details <ArrowRight size={16} />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}

                            {/* LOAD MORE BUTTON */}
                            {hasMore && (
                                <div className="pt-4 text-center">
                                    <button
                                        onClick={handleLoadMore}
                                        disabled={loadingMore}
                                        className="bg-white border border-slate-200 text-slate-600 font-bold px-8 py-3 rounded-full hover:bg-slate-50 disabled:opacity-50 transition-colors shadow-sm"
                                    >
                                        {loadingMore ? 'Loading remaining orders...' : 'Load More Orders'}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Recent Activity / Promo Sidebar (Desktop) */}
                        <div className="hidden lg:block space-y-6">
                            <div className="bg-gradient-to-br from-brand to-emerald-800 rounded-3xl p-6 text-white shadow-lg">
                                <h3 className="font-bold text-xl mb-2">Need Help?</h3>
                                <p className="text-brand-100 text-sm mb-6">Have an issue with your recent order? Our support team is here to help you.</p>
                                <button className="bg-white text-brand font-bold w-full py-3 rounded-xl hover:bg-brand-50 transition-colors">Contact Support</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
