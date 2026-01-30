'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Search, Filter, Loader2 } from 'lucide-react';

type Batch = {
    id: string;
    batch_code: string;
    received_at: string;
    expiry_grade: 'A' | 'B' | 'C';
    quantity_kg: number;
    products: {
        name: string;
    };
};

export default function InventoryPage() {
    const [batches, setBatches] = useState<Batch[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('inventory_batches')
            .select(`
        id,
        batch_code,
        received_at,
        expiry_grade,
        quantity_kg,
        products (
          name
        )
      `)
            .order('received_at', { ascending: false });

        if (data) {
            setBatches(data as any);
        }
        setLoading(false);
    };

    const updateGrade = async (id: string, grade: 'A' | 'B' | 'C') => {
        await supabase.from('inventory_batches').update({ expiry_grade: grade }).eq('id', id);
        fetchInventory();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-800">Inventory Management</h1>
                <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors">
                    + Ingest New Batch
                </button>
            </div>

            {/* Filters & Search - Visual only for now */}
            <div className="flex gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search products or batch codes..."
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg outline-none focus:border-emerald-500"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700 font-medium">
                    <Filter size={18} />
                    Filters
                </button>
            </div>

            {/* Inventory Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {loading ? (
                    <div className="p-12 flex justify-center text-emerald-600"><Loader2 className="animate-spin" /></div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-600">Product / Batch</th>
                                <th className="px-6 py-4 font-semibold text-slate-600">Received</th>
                                <th className="px-6 py-4 font-semibold text-slate-600">Grade</th>
                                <th className="px-6 py-4 font-semibold text-slate-600">Quantity</th>
                                <th className="px-6 py-4 font-semibold text-slate-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {batches.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-800">{item.products?.name}</div>
                                        <div className="text-xs text-slate-400 font-mono">{item.batch_code}</div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        {new Date(item.received_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-1">
                                            {(['A', 'B', 'C'] as const).map(g => (
                                                <button
                                                    key={g}
                                                    onClick={() => updateGrade(item.id, g)}
                                                    className={`px-2 py-1 text-xs font-bold border rounded ${item.expiry_grade === g ?
                                                        (g === 'A' ? 'bg-green-100 text-green-700 border-green-200' :
                                                            g === 'B' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 'bg-red-100 text-red-700 border-red-200')
                                                        : 'bg-white text-slate-400 border-slate-200'}`}
                                                >
                                                    {g}
                                                </button>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-mono font-medium text-slate-700">{item.quantity_kg} kg</td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <button className="text-xs font-bold text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Audit</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {batches.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-400">No inventory found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
