'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);
import {
    Plus, Upload, Download, Search, Filter,
    MoreHorizontal, Edit, Trash2, Eye,
    Box, CheckCircle, AlertCircle, TrendingUp, X
} from 'lucide-react';

// --- Types ---
type Product = {
    id: string;
    name: string;
    image: string | null;
    price: number;
    old_price: number | null;
    weight: string;
    in_stock: boolean;
    category_id: string;
    is_ad: boolean;
    pricing_type: string;
    base_price: number;
    categories?: { name: string };
};

type Category = {
    id: string;
    name: string;
    slug: string;
};

// --- Mock Data for Skeletons ---
const SKELETON_ROWS = [1, 2, 3, 4, 5];

export default function ProductsPage() {


    // --- State ---
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'table' | 'cards'>('table'); // Responsive logic handled via CSS generally, but state useful

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [filterStock, setFilterStock] = useState<string>('all');

    // Form / Dialog State
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formLoading, setFormLoading] = useState(false);

    // Form Fields
    const [form, setForm] = useState({
        name: '',
        price: '',
        old_price: '',
        weight: '',
        image: '',
        category_id: '',
        in_stock: true,
        is_ad: false
    });
    const [weightUnit, setWeightUnit] = useState('kg');
    const [uploading, setUploading] = useState(false);

    // --- Fetch Data ---
    const fetchData = async () => {
        setLoading(true);
        const [prodRes, catRes] = await Promise.all([
            supabase.from('products').select('*').order('created_at', { ascending: false }),
            supabase.from('categories').select('*')
        ]);

        if (prodRes.error) {
            console.error('Error fetching products:', prodRes.error);
            alert('Error loading products: ' + prodRes.error.message);
        } else {
            setProducts(prodRes.data || []);
        }

        if (catRes.error) {
            console.error('Error fetching categories:', catRes.error);
        } else if (catRes.data) {
            setCategories(catRes.data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    // --- Computed Utils ---
    const stats = useMemo(() => {
        const total = products.length;
        const inStock = products.filter(p => p.in_stock).length;
        const outStock = total - inStock;
        const lowStock = 0; // Placeholder logic if we had quantity
        return { total, inStock, outStock, lowStock };
    }, [products]);

    const filteredProducts = useMemo(() => {
        let res = products;

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            res = res.filter(p => p.name.toLowerCase().includes(q));
        }

        if (filterCategory !== 'all') {
            res = res.filter(p => p.category_id === filterCategory);
        }

        if (filterStock !== 'all') {
            const isStock = filterStock === 'in_stock';
            res = res.filter(p => p.in_stock === isStock);
        }

        return res;
    }, [products, searchQuery, filterCategory, filterStock]);

    // --- Handlers ---

    // ... Copying form handlers from previous implementation but adapting for Dialog ...
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        setUploading(true);

        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage.from('products').upload(filePath, file);

        if (uploadError) {
            alert('Error uploading image');
            setUploading(false);
            return;
        }

        const { data } = supabase.storage.from('products').getPublicUrl(filePath);
        setForm(f => ({ ...f, image: data.publicUrl }));
        setUploading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);

        const finalImage = form.image;
        const finalWeight = `${form.weight} ${weightUnit}`;
        const pricingType = ['kg', 'g'].includes(weightUnit) ? 'per_kg' : 'per_piece';
        const priceVal = parseFloat(form.price);

        const payload = {
            name: form.name,
            price: priceVal,
            base_price: priceVal,
            old_price: form.old_price ? parseFloat(form.old_price) : null,
            weight: finalWeight,
            image: finalImage,
            pricing_type: pricingType,
            category_id: form.category_id || (categories[0]?.id),
            in_stock: form.in_stock,
            is_ad: form.is_ad
        };

        let error;
        if (isEditMode && editingProduct) {
            const { error: err } = await supabase.from('products').update(payload).eq('id', editingProduct.id);
            error = err;
        } else {
            const { error: err } = await supabase.from('products').insert([payload]);
            error = err;
        }

        if (error) {
            alert('Error saving product: ' + error.message);
        } else {
            setIsAddOpen(false);
            resetForm();
            fetchData();
        }
        setFormLoading(false);
    };

    const resetForm = () => {
        setForm({
            name: '', price: '', old_price: '', weight: '', image: '',
            category_id: categories[0]?.id || '', in_stock: true, is_ad: false
        });
        setWeightUnit('kg');
        setIsEditMode(false);
        setEditingProduct(null);
    };

    const handleEdit = (product: Product) => {
        const [val, unit] = product.weight.split(' ');
        setForm({
            name: product.name,
            price: product.price.toString(),
            old_price: product.old_price ? product.old_price.toString() : '',
            weight: val || '',
            image: product.image || '',
            category_id: product.category_id,
            in_stock: product.in_stock,
            is_ad: product.is_ad
        });
        setWeightUnit(unit || 'kg');
        setEditingProduct(product);
        setIsEditMode(true);
        setIsAddOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) alert('Error deleting product');
        else fetchData();
    };

    const handleToggleStock = async (product: Product) => {
        const { error } = await supabase.from('products').update({ in_stock: !product.in_stock }).eq('id', product.id);
        if (!error) fetchData();
    };


    // --- Render Helpers ---

    return (
        <div className="min-h-screen bg-white">
            {/* 1. Header */}
            <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Products</h1>
                        <p className="text-sm text-gray-500 font-medium mt-1">Manage catalog, pricing & availability</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors" title="Export">
                            <Download size={20} />
                        </button>
                        <button className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all shadow-sm">
                            <Upload size={16} />
                            Bulk Upload
                        </button>
                        <button
                            onClick={() => { resetForm(); setIsAddOpen(true); }}
                            className="flex items-center gap-2 px-5 py-2.5 bg-[#0c831f] text-white text-sm font-semibold rounded-lg hover:bg-[#096b19] transition-all shadow-md hover:shadow-lg active:scale-95"
                        >
                            <Plus size={18} />
                            Add Product
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">

                {/* 2. Stats Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <StatsCard label="Total Products" value={stats.total} icon={<Box size={20} className="text-blue-600" />} />
                    <StatsCard label="In Stock" value={stats.inStock} icon={<CheckCircle size={20} className="text-green-600" />} />
                    <StatsCard label="Out of Stock" value={stats.outStock} icon={<AlertCircle size={20} className="text-red-500" />} />
                    <StatsCard label="Categories" value={categories.length} icon={<Filter size={20} className="text-purple-600" />} />
                </div>

                {/* 3. Filter Bar */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 mb-6 flex flex-col md:flex-row gap-3 items-center sticky top-[80px] z-10">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-[#0c831f]/20 focus:bg-white transition-all outline-none text-gray-700 font-medium placeholder:text-gray-400"
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto no-scrollbar">
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="px-3 py-2 text-sm bg-gray-50 rounded-lg border-r-[8px] border-r-transparent outline-none focus:ring-2 focus:ring-[#0c831f]/20 font-medium text-gray-600 min-w-[140px]"
                        >
                            <option value="all">All Categories</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <select
                            value={filterStock}
                            onChange={(e) => setFilterStock(e.target.value)}
                            className="px-3 py-2 text-sm bg-gray-50 rounded-lg border-r-[8px] border-r-transparent outline-none focus:ring-2 focus:ring-[#0c831f]/20 font-medium text-gray-600 min-w-[130px]"
                        >
                            <option value="all">All Status</option>
                            <option value="in_stock">In Stock</option>
                            <option value="out_of_stock">Out of Stock</option>
                        </select>
                        {(searchQuery || filterCategory !== 'all' || filterStock !== 'all') && (
                            <button
                                onClick={() => { setSearchQuery(''); setFilterCategory('all'); setFilterStock('all'); }}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>
                </div>

                {/* 4. Product List (Table & Cards) */}
                {loading ? (
                    <div className="space-y-4">
                        {SKELETON_ROWS.map(i => (
                            <div key={i} className="h-20 bg-gray-50 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : filteredProducts.length === 0 ? (
                    // 6. Empty State
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                            <Box size={40} className="text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">No products found</h3>
                        <p className="text-gray-500 max-w-sm mb-8">
                            {searchQuery ? "Try adjusting your filters or search query." : "Add your first product to start selling."}
                        </p>
                        <button
                            onClick={() => { resetForm(); setIsAddOpen(true); }}
                            className="px-6 py-2.5 bg-[#0c831f] text-white font-semibold rounded-lg shadow-md hover:bg-[#096b19]"
                        >
                            Add New Product
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden md:block bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Product</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Price / Unit</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Stock</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredProducts.map(product => (
                                        <tr key={product.id} className="group hover:bg-gray-50/80 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-xl shadow-sm border border-gray-100 overflow-hidden relative">
                                                        {product.image ? (
                                                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span>📦</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-800">{product.name}</h4>
                                                        <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded-full">{product.weight}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-medium text-gray-600">
                                                    {categories.find(c => c.id === product.category_id)?.name || 'Uncategorized'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-900">₹{product.price}</span>
                                                    {product.old_price && (
                                                        <span className="text-xs text-gray-400 line-through">₹{product.old_price}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleToggleStock(product)}
                                                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${product.in_stock
                                                        ? 'bg-green-50 text-green-700 border-green-100 hover:bg-green-100'
                                                        : 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100'
                                                        }`}
                                                >
                                                    {product.in_stock ? 'In Stock' : 'Out of Stock'}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => handleEdit(product)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                                                        <Edit size={16} />
                                                    </button>
                                                    <button onClick={() => handleDelete(product.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden grid grid-cols-1 gap-4">
                            {filteredProducts.map(product => (
                                <div key={product.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-lg bg-gray-50 flex items-center justify-center text-2xl shadow-inner overflow-hidden">
                                            {product.image ? (
                                                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span>📦</span>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">{product.name}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-sm font-semibold text-gray-700">₹{product.price}</span>
                                                <span className="text-xs text-gray-400">/ {product.weight}</span>
                                            </div>
                                            <div className="mt-2 flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full ${product.in_stock ? 'bg-green-500' : 'bg-red-500'}`} />
                                                <span className="text-xs font-medium text-gray-500">{product.in_stock ? 'In Stock' : 'Out of Stock'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <button onClick={() => handleEdit(product)} className="p-2 bg-gray-50 text-gray-600 rounded-lg">
                                            <Edit size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </main>

            {/* Modal for Add/Edit Product (Custom Simple Implementation) */}
            {isAddOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <h2 className="text-lg font-bold text-gray-800">{isEditMode ? 'Edit Product' : 'Add New Product'}</h2>
                            <button onClick={() => setIsAddOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">

                            {/* Image Upload */}
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 rounded-xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center text-2xl relative overflow-hidden group hover:border-[#0c831f] transition-colors cursor-pointer">
                                    {form.image ? <img src={form.image} className="w-full h-full object-cover" /> : (uploading ? '...' : '📷')}
                                    <input type="file" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Product Name</label>
                                    <input required type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 bg-gray-50 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-[#0c831f]/20" placeholder="e.g. Fresh Tomato" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                                    <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} className="w-full px-3 py-2 bg-gray-50 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-[#0c831f]/20">
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Weight / Qty</label>
                                    <div className="flex gap-2">
                                        <input required type="text" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} className="w-full px-3 py-2 bg-gray-50 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-[#0c831f]/20" placeholder="1" />
                                        <select value={weightUnit} onChange={e => setWeightUnit(e.target.value)} className="bg-gray-100 rounded-lg text-xs font-bold px-2 outline-none">
                                            <option value="kg">kg</option>
                                            <option value="g">g</option>
                                            <option value="pc">pc</option>
                                            <option value="bunch">bunch</option>
                                            <option value="dozen">dozen</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Selling Price (₹)</label>
                                    <input required type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="w-full px-3 py-2 bg-gray-50 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-[#0c831f]/20" placeholder="40" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">MRP (Optional)</label>
                                    <input type="number" value={form.old_price} onChange={e => setForm({ ...form, old_price: e.target.value })} className="w-full px-3 py-2 bg-gray-50 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-[#0c831f]/20" placeholder="50" />
                                </div>
                            </div>

                            <div className="flex items-center gap-4 pt-2">
                                <label className="flex items-center gap-2 cursor-pointer bg-gray-50 px-3 py-2 rounded-lg border border-gray-100 flex-1">
                                    <input type="checkbox" checked={form.in_stock} onChange={e => setForm({ ...form, in_stock: e.target.checked })} className="rounded text-[#0c831f] focus:ring-[#0c831f]" />
                                    <span className="text-sm font-medium text-gray-700">In Stock</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer bg-gray-50 px-3 py-2 rounded-lg border border-gray-100 flex-1">
                                    <input type="checkbox" checked={form.is_ad} onChange={e => setForm({ ...form, is_ad: e.target.checked })} className="rounded text-[#0c831f] focus:ring-[#0c831f]" />
                                    <span className="text-sm font-medium text-gray-700">Ad / Featured</span>
                                </label>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setIsAddOpen(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
                                <button type="submit" disabled={formLoading} className="flex-1 py-3 bg-[#0c831f] text-white font-bold rounded-xl hover:bg-[#096b19] transition-colors shadow-lg shadow-green-900/10">
                                    {formLoading ? 'Saving...' : (isEditMode ? 'Update Product' : 'Add Product')}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatsCard({ label, value, icon }: { label: string, value: number, icon: React.ReactNode }) {
    return (
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
                <div className="text-2xl font-extrabold text-gray-900">{value}</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
                {icon}
            </div>
        </div>
    );
}
