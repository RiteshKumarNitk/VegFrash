'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Plus, Trash2, Ticket, Tag, Calendar, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type Coupon = {
    id: string;
    code: string;
    discount_type: 'percentage' | 'flat';
    discount_value: number;
    min_order: number;
    expiry_date: string;
    is_active: boolean;
};

export default function CouponsPage() {
    const supabase = createClient();
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        code: '',
        discount_type: 'flat',
        discount_value: 0,
        min_order: 0,
        expiry_date: '',
    });

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        setLoading(true);
        const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
        if (data) setCoupons(data as any);
        setLoading(false);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const { error } = await supabase.from('coupons').insert([
            { ...formData, code: formData.code.toUpperCase() }
        ]);

        if (error) {
            toast.error(error.message);
        } else {
            toast.success('Coupon created successfully');
            setIsAdding(false);
            fetchCoupons();
            setFormData({ code: '', discount_type: 'flat', discount_value: 0, min_order: 0, expiry_date: '' });
        }
    };

    const toggleStatus = async (id: string, current: boolean) => {
        const { error } = await supabase.from('coupons').update({ is_active: !current }).eq('id', id);
        if (error) toast.error(error.message);
        else fetchCoupons();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this coupon?')) return;
        const { error } = await supabase.from('coupons').delete().eq('id', id);
        if (error) toast.error(error.message);
        else fetchCoupons();
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Promo Codes</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage discounts and seasonal offers.</p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
                >
                    <Plus size={20} /> New Coupon
                </button>
            </div>

            {isAdding && (
                <div className="bg-white p-8 rounded-3xl border-2 border-emerald-100 shadow-xl animate-scale-in">
                    <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Coupon Code</label>
                            <input
                                type="text"
                                required
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 font-bold uppercase"
                                placeholder="E.G. FRESH50"
                                value={formData.code}
                                onChange={e => setFormData({ ...formData, code: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Discount Type</label>
                            <select
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 font-bold"
                                value={formData.discount_type}
                                onChange={e => setFormData({ ...formData, discount_type: e.target.value as any })}
                            >
                                <option value="flat">Flat Value (₹)</option>
                                <option value="percentage">Percentage (%)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Value</label>
                            <input
                                type="number"
                                required
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 font-bold"
                                value={formData.discount_value}
                                onChange={e => setFormData({ ...formData, discount_value: Number(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Min. Order Value</label>
                            <input
                                type="number"
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 font-bold"
                                value={formData.min_order}
                                onChange={e => setFormData({ ...formData, min_order: Number(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Expiry Date</label>
                            <input
                                type="date"
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 font-bold"
                                value={formData.expiry_date}
                                onChange={e => setFormData({ ...formData, expiry_date: e.target.value })}
                            />
                        </div>
                        <div className="flex items-end gap-3">
                            <button type="submit" className="flex-1 bg-slate-900 text-white rounded-2xl p-4 font-bold hover:bg-slate-800 transition-all">Create Coupon</button>
                            <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold">Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full p-20 text-center">
                        <Loader2 className="animate-spin text-emerald-600 mx-auto" size={40} />
                        <p className="mt-4 font-bold text-slate-400 uppercase tracking-widest text-xs">Syncing Coupons...</p>
                    </div>
                ) : coupons.map(coupon => (
                    <div key={coupon.id} className={`bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative group overflow-hidden ${!coupon.is_active && 'opacity-60 grayscale'}`}>
                        {/* Decorative Tag */}
                        <div className="absolute -top-6 -right-6 w-20 h-20 bg-emerald-50 rounded-full group-hover:scale-150 transition-transform duration-500 opacity-50" />

                        <div className="relative z-10 space-y-4">
                            <div className="flex justify-between items-start">
                                <div className="bg-emerald-100/50 p-3 rounded-2xl text-emerald-700">
                                    <Tag size={24} />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => toggleStatus(coupon.id, coupon.is_active)}
                                        className={`p-2 rounded-xl border transition-colors ${coupon.is_active ? 'bg-amber-50 border-amber-100 text-amber-600 hover:bg-amber-100' : 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100'}`}
                                        title={coupon.is_active ? 'Disable' : 'Enable'}
                                    >
                                        <AlertCircle size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(coupon.id)}
                                        className="p-2 bg-red-50 border border-red-100 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{coupon.code}</h3>
                                <p className="text-emerald-600 font-bold text-sm">
                                    {coupon.discount_type === 'flat' ? `₹${coupon.discount_value} Flat Off` : `${coupon.discount_value}% Discount`}
                                </p>
                            </div>

                            <div className="pt-4 border-t border-slate-100 space-y-2">
                                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                                    <Ticket size={14} /> Min. Order: ₹{coupon.min_order}
                                </div>
                                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                                    <Calendar size={14} /> {coupon.expiry_date ? `Expires: ${new Date(coupon.expiry_date).toLocaleDateString()}` : 'No Expiry'}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {!loading && coupons.length === 0 && (
                <div className="text-center p-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                    <Tag size={64} className="mx-auto text-slate-200 mb-4" />
                    <h3 className="text-xl font-bold text-slate-800">No active coupons</h3>
                    <p className="text-slate-400 max-w-xs mx-auto mt-2">Create your first promo code to boost sales during seasons.</p>
                </div>
            )}
        </div>
    );
}
