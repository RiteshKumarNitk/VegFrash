'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Save, Search, RefreshCw, AlertTriangle, ArrowRight, Eye, EyeOff } from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function StockPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        const { data } = await supabase.from('products').select('*').order('name');
        if (data) setProducts(data);
        setLoading(false);
    };

    const handleUpdate = async (id: string, field: string, value: any) => {
        // Optimistic
        setProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));

        // DB Update
        await supabase.from('products').update({ [field]: value }).eq('id', id);
    };

    const handleStockUpdate = async (id: string, newTotal: string) => {
        const val = parseInt(newTotal);
        if (isNaN(val)) return;
        await handleUpdate(id, 'total_stock', val);
    };

    const filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    if (loading) return <div className="p-8 text-center text-slate-400">Loading stock...</div>;

    return (
        <div className="max-w-[1200px] mx-auto p-6 md:p-10">
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Real-time Stock Control</h1>
                    <p className="text-slate-500 text-sm mt-1">Directly manage availability and pricing for the Customer App.</p>
                </div>
                <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg text-sm font-bold border border-emerald-100 flex items-center gap-2">
                    <RefreshCw size={16} /> Live Sync Active
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex items-center gap-3">
                <Search className="text-slate-400" size={20} />
                <input
                    placeholder="Search by item name..."
                    className="flex-1 outline-none font-medium bg-transparent text-slate-700 placeholder:text-slate-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="bg-white rounded-xl shadow-2xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
                <div className="bg-slate-50/50 p-4 border-b border-slate-200 grid grid-cols-12 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <div className="col-span-5">Product</div>
                    <div className="col-span-2 text-right">Price (₹)</div>
                    <div className="col-span-2 text-center">Visibility</div>
                    <div className="col-span-3 text-right pr-4">Total Stock</div>
                </div>

                <div className="divide-y divide-slate-100">
                    {filtered.map(p => {
                        const available = (p.total_stock || 0) - (p.reserved_stock || 0);
                        const isLive = p.is_visible && available > 0;

                        return (
                            <div key={p.id} className="p-4 grid grid-cols-12 items-center hover:bg-slate-50/80 transition-colors group">

                                {/* Product Info */}
                                <div className="col-span-5 flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border transition-colors ${available > 0 ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100 opacity-50 grayscale'}`}>
                                        {p.image ? <img src={p.image} className="w-full h-full object-cover rounded-xl" /> : '📦'}
                                    </div>
                                    <div>
                                        <p className={`font-bold text-sm text-slate-900`}>{p.name}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-xs text-slate-500 font-medium">{p.weight}</span>
                                            {isLive ?
                                                <span className="text-[10px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded border border-green-200">LIVE</span>
                                                :
                                                <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">OFFLINE</span>
                                            }
                                        </div>
                                    </div>
                                </div>

                                {/* Price Input */}
                                <div className="col-span-2 flex justify-end">
                                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 focus-within:ring-2 focus-within:ring-slate-900/10 focus-within:border-slate-400 transition-all w-24">
                                        <span className="text-xs font-bold text-slate-400">₹</span>
                                        <input
                                            type="number"
                                            defaultValue={p.price}
                                            onBlur={(e) => handleUpdate(p.id, 'price', parseFloat(e.target.value))}
                                            className="w-full bg-transparent text-sm font-bold text-slate-700 outline-none text-right"
                                        />
                                    </div>
                                </div>

                                {/* Visibility Toggle */}
                                <div className="col-span-2 flex justify-center">
                                    <button
                                        onClick={() => handleUpdate(p.id, 'is_visible', !p.is_visible)}
                                        className={`p-2 rounded-lg transition-all ${p.is_visible ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                                        title={p.is_visible ? "Visible to customers" : "Hidden from app"}
                                    >
                                        {p.is_visible ? <Eye size={18} /> : <EyeOff size={18} />}
                                    </button>
                                </div>

                                {/* Stock Input */}
                                <div className="col-span-3 flex justify-end gap-3 items-center pr-4">
                                    <div className="text-right">
                                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Reserved</span>
                                        <span className="text-xs font-bold text-slate-600">{p.reserved_stock}</span>
                                    </div>
                                    <div className={`flex items-center gap-2 border rounded-lg px-2 py-1.5 focus-within:ring-2 w-28 transition-all ${available < 5 ? 'bg-red-50 border-red-200 focus-within:ring-red-200' : 'bg-white border-slate-200 focus-within:ring-slate-200'}`}>
                                        <input
                                            type="number"
                                            defaultValue={p.total_stock}
                                            onBlur={(e) => handleStockUpdate(p.id, e.target.value)}
                                            className={`w-full bg-transparent text-sm font-black outline-none text-right ${available < 5 ? 'text-red-700' : 'text-slate-800'}`}
                                        />
                                    </div>
                                </div>

                            </div>
                        );
                    })}
                    {filtered.length === 0 && (
                        <div className="p-12 text-center text-slate-400 flex flex-col items-center">
                            <AlertTriangle size={48} className="mb-4 opacity-20" />
                            <p>No items found matching "{searchTerm}"</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
