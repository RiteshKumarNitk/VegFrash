'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Search, Users, TrendingUp, ShoppingBag, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

type Customer = {
    id: string;
    name: string;
    phone: string;
    email: string;
    total_orders: number;
    total_spent: number;
    created_at: string;
};

export default function CustomersPage() {
    const supabase = createClient();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('customers')
            .select('*')
            .order('total_spent', { ascending: false });

        if (data) setCustomers(data);
        setLoading(false);
    };

    const filtered = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone?.includes(searchTerm)
    );

    const metrics = {
        totalCount: customers.length,
        avgLTV: customers.length > 0
            ? Math.round(customers.reduce((sum, c) => sum + (c.total_spent || 0), 0) / customers.length)
            : 0,
        repeatRate: customers.length > 0
            ? Math.round((customers.filter(c => c.total_orders > 1).length / customers.length) * 100)
            : 0
    };

    return (
        <div className="max-w-[1200px] mx-auto space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Customer CRM</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage your regulars and track customer loyalty.</p>
                </div>
            </div>

            {/* CRM Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Total Customers</p>
                    <div className="flex items-center justify-between">
                        <h2 className="text-3xl font-black text-slate-900">{metrics.totalCount}</h2>
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Users size={24} /></div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Avg. Lifetime Value</p>
                    <div className="flex items-center justify-between">
                        <h2 className="text-3xl font-black text-slate-900">₹{metrics.avgLTV.toLocaleString()}</h2>
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><TrendingUp size={24} /></div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Repeat Rate</p>
                    <div className="flex items-center justify-between">
                        <h2 className="text-3xl font-black text-slate-900">{metrics.repeatRate}%</h2>
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><ShoppingBag size={24} /></div>
                    </div>
                </div>
            </div>

            {/* Search & List */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                    <Search className="text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name or phone..."
                        className="flex-1 bg-transparent outline-none text-sm font-medium text-slate-700"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Customer</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Orders</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Total Spent</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="p-12 text-center text-emerald-600">
                                        <Loader2 className="animate-spin mx-auto mb-2" />
                                        <span className="text-xs font-bold uppercase tracking-widest">Syncing CRM...</span>
                                    </td>
                                </tr>
                            ) : filtered.map(customer => (
                                <tr key={customer.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-900">{customer.name}</div>
                                        <div className="text-xs text-slate-500">{customer.phone || customer.email || 'No contact info'}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-bold text-slate-700">{customer.total_orders}</span>
                                        <span className="text-[10px] text-slate-400 ml-1">orders</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="font-black text-slate-900">₹{customer.total_spent.toLocaleString()}</div>
                                        <div className="text-[10px] text-emerald-500 font-bold uppercase">LTV</div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-slate-400 group-hover:text-emerald-600 transition-colors">
                                            <ArrowRight size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {!loading && filtered.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-12 text-center text-slate-400">
                                        <Users size={48} className="mx-auto mb-4 opacity-10" />
                                        <p className="text-sm font-medium">No customers found</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
