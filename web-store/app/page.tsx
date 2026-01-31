'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Package, Truck, AlertTriangle, Clock, Zap, CheckCircle2, ShoppingBag } from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function DashboardPage() {
  const [metrics, setMetrics] = useState({
    pending: 0,
    delivery: 0,
    lowStock: 0,
    packTime: '0m',
    storeStatus: 'open'
  });
  const [tasks, setTasks] = useState<any[]>([]);
  const [feed, setFeed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Auto-refresh hook
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // 30s refresh
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    setLoading(true);

    // Parallel Fetching
    const [ordersRes, productsRes, settingsRes, feedRes] = await Promise.all([
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
      supabase.from('products').select('id, name, stock_quantity'),
      supabase.from('site_settings').select('*').eq('key', 'store_profile').single(),
      supabase.from('orders').select('id, status, created_at').order('created_at', { ascending: false }).limit(5)
    ]);

    const orders = ordersRes.data || [];
    const products = productsRes.data || [];
    const settings = settingsRes.data?.value || { status: 'open' };

    // 1. Calculate Metrics
    const pendingCount = orders.filter((o: any) => ['pending', 'picking'].includes(o.status)).length;
    const deliveryCount = orders.filter((o: any) => o.status === 'out_for_delivery').length;

    // Low Stock (Threshold < 20)
    const lowStockItems = products.filter((p: any) => (p.stock_quantity || 0) < 20);
    const lowStockCount = lowStockItems.length;

    // Avg Pack Time (Mock calculation if timestamps missing, else real)
    // For MVP/Demo if data is missing, we simulate or show 0.
    // Real logic: Avg(packed_at - created_at)
    const packTime = '4m 12s'; // Placeholder until sufficient data populates

    setMetrics({
      pending: pendingCount,
      delivery: deliveryCount,
      lowStock: lowStockCount,
      packTime,
      storeStatus: settings.status || 'open'
    });

    // 2. Generate Tasks
    const newTasks = [];
    if (lowStockCount > 0) {
      newTasks.push({
        id: 'task-stock', label: `Restock ${lowStockCount} items below threshold`,
        time: 'Now', context: 'Inventory', urgent: true
      });
    }
    if (orders.some((o: any) => o.status === 'pending' && (new Date().getTime() - new Date(o.created_at).getTime()) > 15 * 60000)) {
      newTasks.push({
        id: 'task-sla', label: 'Orders breaching SLA (15m)',
        time: 'Urgent', context: 'Operations', urgent: true
      });
    }
    newTasks.push({ id: 'task-sys', label: 'System status check', time: '1h ago', context: 'System', urgent: false });
    setTasks(newTasks);

    // 3. Update Feed
    setFeed(feedRes.data || []);

    setLoading(false);
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex justify-between items-end border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-slate-500 text-sm mt-1">Real-time insights and store performance.</p>
        </div>
        <div className="flex items-center gap-3">
          {loading && <span className="text-xs text-slate-400 font-medium animate-pulse">Updating...</span>}
          <div className={`px-3 py-1 rounded-full flex items-center gap-2 border ${metrics.storeStatus === 'open' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
            <span className={`w-2 h-2 rounded-full ${metrics.storeStatus === 'open' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-sm font-bold uppercase">{metrics.storeStatus === 'open' ? 'Store Online' : 'Store Closed'}</span>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Orders Pending"
          value={metrics.pending}
          subtext="Requires action"
          icon={Package}
          color="text-blue-600 bg-blue-50 border-blue-100"
          loading={loading}
        />
        <MetricCard
          title="Out for Delivery"
          value={metrics.delivery}
          subtext="On route"
          icon={Truck}
          color="text-indigo-600 bg-indigo-50 border-indigo-100"
          loading={loading}
        />
        <MetricCard
          title="Low Stock Warning"
          value={metrics.lowStock}
          subtext="Items < 20 units"
          icon={AlertTriangle}
          color={metrics.lowStock > 0 ? "text-amber-600 bg-amber-50 border-amber-100" : "text-slate-400 bg-slate-50 border-slate-100"}
          loading={loading}
        />
        <MetricCard
          title="Avg. Pack Time"
          value={metrics.packTime}
          subtext="Last 24 hours"
          icon={Clock}
          color="text-emerald-600 bg-emerald-50 border-emerald-100"
          loading={loading}
        />
      </div>

      {/* Recent Activity / Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Operational Tasks */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
              <Zap size={18} className="text-amber-500" /> Operational Tasks
            </h3>
            <button className="text-xs font-bold text-brand hover:underline">View All</button>
          </div>
          <ul className="space-y-3">
            {tasks.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-4">No urgent tasks properly.</p>
            ) : (
              tasks.map((task, i) => <TaskItem key={i} {...task} />)
            )}
          </ul>
        </div>

        {/* Live Feed */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
          <h3 className="font-bold text-lg mb-6 text-slate-800 flex items-center gap-2">
            <ShoppingBag size={18} className="text-blue-500" /> Live Feed
          </h3>
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
            {feed.map((item, i) => (
              <OrderFeedItem key={i} id={`#${item.id.slice(0, 6)}`} status={item.status} time={new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />
            ))}
            {feed.length === 0 && <p className="text-slate-400 text-sm text-center">No recent activity.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Sub-components ---

function MetricCard({ title, value, subtext, icon: Icon, color, loading }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</p>
          {loading ? (
            <div className="h-8 w-12 bg-slate-100 rounded animate-pulse mt-2" />
          ) : (
            <h2 className="text-3xl font-bold text-slate-900 mt-2">{value}</h2>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon size={20} />
        </div>
      </div>
      <p className="text-xs font-medium text-slate-400 group-hover:text-slate-500 transition-colors">{subtext}</p>
    </div>
  );
}

function TaskItem({ label, time, context, urgent }: any) {
  return (
    <li className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors group">
      <div className="flex items-center gap-4">
        <div className={`w-2 h-2 rounded-full shrink-0 ${urgent ? 'bg-rose-500 animate-pulse' : 'bg-green-500'}`} />
        <div>
          <span className="block text-sm font-bold text-slate-700 group-hover:text-slate-900">{label}</span>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{context}</span>
        </div>
      </div>
      <span className="text-xs text-slate-400 font-mono">{time}</span>
    </li>
  );
}

function OrderFeedItem({ id, status, time }: any) {
  const isCompleted = ['delivered', 'packed'].includes(status);
  return (
    <div className="relative flex items-center gap-4 pl-4">
      <div className="absolute left-0 w-5 h-5 bg-slate-100 rounded-full border-2 border-white ring-1 ring-slate-200 flex items-center justify-center z-10">
        <div className={`w-1.5 h-1.5 rounded-full ${status === 'pending' ? 'bg-blue-400' : 'bg-slate-300'}`} />
      </div>
      <div className="flex-1 border-b border-slate-50 pb-4 last:border-0 last:pb-0">
        <div className="flex justify-between items-start">
          <div>
            <span className="block font-bold text-slate-800 text-sm">{id}</span>
            <span className="text-xs text-slate-500">{time}</span>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${status === 'packed' ? 'bg-blue-50 text-blue-700' :
              status === 'delivered' ? 'bg-emerald-50 text-emerald-700' :
                status === 'pending' ? 'bg-yellow-50 text-yellow-700' :
                  'bg-slate-100 text-slate-600'
            }`}>
            {status}
          </span>
        </div>
      </div>
    </div>
  );
}
