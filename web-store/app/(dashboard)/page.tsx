'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  Package, Calendar, CheckCircle2, TrendingUp,
  AlertTriangle, ShoppingBag, Truck
} from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function DashboardPage() {
  const [metrics, setMetrics] = useState({
    newRequests: 0,
    scheduled: 0,
    completed: 0,
    totalStock: 0,
    reservedStock: 0,
    totalSales: 0,
    storeStatus: 'open'
  });
  const [feed, setFeed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // 1 min refresh (less urgent)
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    setLoading(true);

    // Fetch Data
    const [ordersRes, productsRes, settingsRes] = await Promise.all([
      supabase.from('orders').select('id, status, total, created_at, scheduled_date, order_stage'),
      supabase.from('products').select('total_stock, reserved_stock'),
      supabase.from('site_settings').select('*').eq('key', 'store_profile').single()
    ]);

    const orders = ordersRes.data || [];
    const products = productsRes.data || [];
    const settings = settingsRes.data?.value || { status: 'open' };

    // 1. Order Metrics (Funnel)
    const newRequests = orders.filter((o: any) => !o.order_stage || o.order_stage === 'new_request' || o.status === 'pending').length;
    const scheduled = orders.filter((o: any) => o.order_stage === 'scheduled' || o.status === 'packed').length; // Mapping fallback
    const completed = orders.filter((o: any) => o.order_stage === 'delivered' || o.status === 'delivered').length;

    // 2. Inventory Metrics
    const totalStock = products.reduce((sum, p) => sum + (p.total_stock || 0), 0);
    const reservedStock = products.reduce((sum, p) => sum + (p.reserved_stock || 0), 0);

    // 3. Sales Metrics
    const totalSales = orders.reduce((sum, o) => sum + (o.total || 0), 0);

    setMetrics({
      newRequests,
      scheduled,
      completed,
      totalStock,
      reservedStock,
      totalSales,
      storeStatus: settings.status || 'open'
    });

    // 4. Feed (Recent Orders)
    setFeed(orders.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5));

    setLoading(false);
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex justify-between items-end border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Store Overview</h1>
          <p className="text-slate-500 text-sm mt-1">Service health and inventory status.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1 rounded-full flex items-center gap-2 border ${metrics.storeStatus === 'open' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
            <span className={`w-2 h-2 rounded-full ${metrics.storeStatus === 'open' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            <span className="text-sm font-bold uppercase">{metrics.storeStatus === 'open' ? 'Accepting Orders' : 'Store Closed'}</span>
          </div>
        </div>
      </div>

      {/* 1. Inventory Health Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Total Inventory"
          value={metrics.totalStock.toLocaleString()}
          subtext="Total units available"
          icon={Package}
          color="text-slate-600 bg-slate-50 border-slate-100"
          loading={loading}
        />
        <MetricCard
          title="Reserved Stock"
          value={metrics.reservedStock.toLocaleString()}
          subtext="Committed to active orders"
          icon={ShoppingBag}
          color="text-amber-600 bg-amber-50 border-amber-100"
          loading={loading}
        />
        <MetricCard
          title="Available to Sell"
          value={(metrics.totalStock - metrics.reservedStock).toLocaleString()}
          subtext="Net availability"
          icon={CheckCircle2}
          color="text-emerald-600 bg-emerald-50 border-emerald-100"
          loading={loading}
        />
      </div>

      {/* 2. Order Status Row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <StatusCard label="New Requests" count={metrics.newRequests} icon={AlertTriangle} color="blue" loading={loading} />
        <StatusCard label="Scheduled" count={metrics.scheduled} icon={Calendar} color="purple" loading={loading} />
        <StatusCard label="Out / Delivering" count={0} icon={Truck} color="orange" loading={loading} />
        <StatusCard label="Completed" count={metrics.completed} icon={CheckCircle2} color="green" loading={loading} />
      </div>

      {/* 3. Recent Requests Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-slate-800">Recent Requests</h3>
            <button className="text-xs font-bold text-brand hover:underline">View All Orders</button>
          </div>
          <div className="space-y-4">
            {feed.map((order, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-slate-200 font-bold text-xs text-slate-600">
                    {order.id.slice(0, 3)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">Order #{order.id.slice(0, 8)}</p>
                    <p className="text-xs text-slate-500">{new Date(order.created_at).toLocaleDateString()} • ₹{order.total}</p>
                  </div>
                </div>
                <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded border ${order.status === 'pending' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                  {order.order_stage?.replace('_', ' ') || order.status}
                </span>
              </div>
            ))}
            {feed.length === 0 && <p className="text-slate-400 text-sm">No recent requests.</p>}
          </div>
        </div>

        {/* Business Stat */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
          <h3 className="font-bold text-lg mb-2 text-slate-800 flex items-center gap-2">
            <TrendingUp size={18} className="text-emerald-500" /> Business Health
          </h3>
          <div className="mt-6 space-y-6">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Sales</p>
              <h2 className="text-3xl font-black text-slate-900">₹{metrics.totalSales.toLocaleString()}</h2>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Avg Order Value</p>
              <h2 className="text-xl font-bold text-slate-700">₹{metrics.completed > 0 ? Math.round(metrics.totalSales / metrics.completed) : 0}</h2>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

// --- Sub-components ---

function MetricCard({ title, value, subtext, icon: Icon, color, loading }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</p>
        {loading ? (
          <div className="h-8 w-20 bg-slate-100 rounded animate-pulse mt-2" />
        ) : (
          <h2 className="text-2xl font-bold text-slate-900 mt-2">{value}</h2>
        )}
        <p className="text-xs font-medium text-slate-400 mt-1">{subtext}</p>
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={24} />
      </div>
    </div>
  );
}

function StatusCard({ label, count, icon: Icon, color, loading }: any) {
  const colorStyles = {
    blue: 'text-blue-600 bg-blue-50 border-blue-100',
    purple: 'text-purple-600 bg-purple-50 border-purple-100',
    orange: 'text-orange-600 bg-orange-50 border-orange-100',
    green: 'text-emerald-600 bg-emerald-50 border-emerald-100',
  }[color as string];

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
      <div className={`p-3 rounded-xl border ${colorStyles}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase">{label}</p>
        {loading ? <div className="h-6 w-10 bg-slate-100 rounded animate-pulse" /> : <p className="text-xl font-bold text-slate-900">{count}</p>}
      </div>
    </div>
  )
}
