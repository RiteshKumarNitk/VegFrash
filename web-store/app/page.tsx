import { Package, Truck, AlertTriangle, Clock } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold border border-green-200">
          ● Store Online
        </span>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Orders to Pack"
          value="12"
          subtext="4 Priority"
          icon={Package}
          color="bg-blue-500"
        />
        <MetricCard
          title="Out for Delivery"
          value="8"
          subtext="Avg 8m delivery"
          icon={Truck}
          color="bg-indigo-500"
        />
        <MetricCard
          title="Low Stock Items"
          value="3"
          subtext="Urgent Restock"
          icon={AlertTriangle}
          color="bg-red-500"
        />
        <MetricCard
          title="Avg. Pack Time"
          value="1m 30s"
          subtext="-15s from yesterday"
          icon={Clock}
          color="bg-emerald-500"
        />
      </div>

      {/* Recent Activity / Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-lg mb-4 text-slate-700">Urgent Tasks</h3>
          <ul className="space-y-3">
            <TaskItem label="Restock Coriander (Batch COR-001)" time="10 mins ago" urgent />
            <TaskItem label="Verify Waste Bin for Spinach" time="25 mins ago" />
            <TaskItem label="System Sync Check" time="1 hr ago" />
          </ul>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-lg mb-4 text-slate-700">Live Feed</h3>
          <div className="space-y-4">
            <OrderFeedItem id="#ORD-9923" status="Packed" time="2m ago" />
            <OrderFeedItem id="#ORD-9922" status="Picked" time="4m ago" />
            <OrderFeedItem id="#ORD-9921" status="Delivered" time="12m ago" />
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, subtext, icon: Icon, color }: any) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">{title}</p>
          <h2 className="text-3xl font-bold text-slate-800 mt-1">{value}</h2>
        </div>
        <div className={`p-3 rounded-lg ${color} text-white`}>
          <Icon size={24} />
        </div>
      </div>
      <p className="text-xs font-medium text-slate-400">{subtext}</p>
    </div>
  );
}

function TaskItem({ label, time, urgent }: any) {
  return (
    <li className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${urgent ? 'bg-red-500' : 'bg-slate-300'}`} />
        <span className="text-sm font-medium text-slate-700">{label}</span>
      </div>
      <span className="text-xs text-slate-400">{time}</span>
    </li>
  );
}

function OrderFeedItem({ id, status, time }: any) {
  return (
    <div className="flex justify-between items-center border-b border-slate-100 last:border-0 pb-2 last:pb-0">
      <div>
        <span className="block font-medium text-slate-800 text-sm">{id}</span>
        <span className="text-xs text-slate-500">{time}</span>
      </div>
      <span className="text-xs font-bold px-2 py-1 bg-slate-100 rounded text-slate-600 uppercase">{status}</span>
    </div>
  );
}
