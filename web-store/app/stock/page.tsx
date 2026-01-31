'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Save, Search, RefreshCw, AlertTriangle } from 'lucide-react';

export default function StockPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const supabase = createClient();

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        const { data } = await supabase.from('products').select('*').order('name');
        if (data) setProducts(data);
        setLoading(false);
    };

    const handleToggleStock = async (id: string, currentStatus: boolean) => {
        // Optimistic
        setProducts(products.map(p => p.id === id ? { ...p, in_stock: !currentStatus } : p));
        await supabase.from('products').update({ in_stock: !currentStatus }).eq('id', id);
    };

    const handlePriceUpdate = async (id: string, newPrice: string) => {
        const price = parseFloat(newPrice);
        if (isNaN(price)) return;
        setProducts(products.map(p => p.id === id ? { ...p, price } : p));
        await supabase.from('products').update({ price }).eq('id', id);
    };

    const filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    if (loading) return <div className="p-8 text-center text-slate-400">Loading stock...</div>;

    return (
        <div className="max-w-[1000px] mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Stock & Pricing</h1>
                <p className="text-slate-500 text-sm mt-1">Real-time control over visibility and daily rates.</p>
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

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50/50 p-4 border-b border-slate-200 grid grid-cols-12 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <div className="col-span-6">Product Item</div>
                    <div className="col-span-3 text-right pr-8">Daily Price</div>
                    <div className="col-span-3 text-right">Availability</div>
                </div>

                <div className="divide-y divide-slate-100">
                    {filtered.map(p => (
                        <div key={p.id} className="p-4 grid grid-cols-12 items-center hover:bg-slate-50/80 transition-colors group">

                            {/* Product Info */}
                            <div className="col-span-6 flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border transition-colors ${p.in_stock ? 'bg-slate-100 border-slate-200' : 'bg-slate-50 border-slate-100 opacity-50 grayscale'}`}>
                                    {p.image}
                                </div>
                                <div>
                                    <p className={`font-bold text-sm text-slate-900 ${!p.in_stock && 'text-slate-400 line-through'}`}>{p.name}</p>
                                    <p className="text-xs text-slate-500 font-medium">{p.weight}</p>
                                </div>
                            </div>

                            {/* Price Input */}
                            <div className="col-span-3 flex justify-end pr-6">
                                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 focus-within:ring-2 focus-within:ring-slate-900/10 focus-within:border-slate-400 transition-all">
                                    <span className="text-xs font-bold text-slate-400">₹</span>
                                    <input
                                        type="number"
                                        defaultValue={p.price}
                                        onBlur={(e) => handlePriceUpdate(p.id, e.target.value)}
                                        className="w-16 bg-transparent text-sm font-bold text-slate-700 outline-none text-right"
                                    />
                                </div>
                            </div>

                            {/* Stock Toggle */}
                            <div className="col-span-3 flex justify-end">
                                <button
                                    onClick={() => handleToggleStock(p.id, p.in_stock)}
                                    className={`
                                        relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:ring-offset-2
                                        ${p.in_stock ? 'bg-emerald-500' : 'bg-slate-200'}
                                    `}
                                >
                                    <span
                                        className={`
                                            inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out
                                            ${p.in_stock ? 'translate-x-8' : 'translate-x-1'}
                                        `}
                                    />
                                </button>
                            </div>
                        </div>
                    ))}
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
