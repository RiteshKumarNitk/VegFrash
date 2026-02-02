'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import {
    Plus, Search, Edit, Trash2,
    X, BarChart3, Tag, Package,
    AlertTriangle, TrendingUp, TrendingDown
} from 'lucide-react';

// --- TYPES ---
type Product = {
    id: string;
    name: string;
    image: string | null;
    price: number;
    old_price: number | null;
    weight: string;
    category_id: string;
    total_stock: number;
    reserved_stock: number;
    is_visible: boolean;
    service_availability: string[];
    discount_config: { type: string, value: number, label: string } | null;
    tags: string[];
    theme_color: string | null;
    sales_velocity: number;
    return_rate: number;
    customer_rating: number;
};

const DEFAULT_PRODUCT: Partial<Product> = {
    name: '', price: 0, weight: '', total_stock: 0, reserved_stock: 0,
    is_visible: true, service_availability: ['today', 'tomorrow'],
    discount_config: null, tags: [], sales_velocity: 0, return_rate: 0, customer_rating: 5
};

export default function ProductsPage() {
    const supabase = createClient();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Drawer State
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [drawerTab, setDrawerTab] = useState<'general' | 'offers' | 'analytics'>('general');

    // Controlled Form State
    const [drawerForm, setDrawerForm] = useState<Partial<Product>>(DEFAULT_PRODUCT);
    const [isSaving, setIsSaving] = useState(false);

    // Bulk Mode
    const [isBulkMode, setIsBulkMode] = useState(false);

    const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);

    // --- FETCH ---
    const fetchData = async () => {
        setLoading(true);
        const [productsRes, categoriesRes] = await Promise.all([
            supabase.from('products').select('*').order('created_at', { ascending: false }),
            supabase.from('categories').select('id, name').order('name')
        ]);

        if (productsRes.data) setProducts(productsRes.data);
        if (categoriesRes.data) setCategories(categoriesRes.data);
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    // --- DRAWER HANDLERS ---
    const openDrawer = (p: Product | null) => {
        setSelectedProduct(p);
        setDrawerForm(p ? { ...p } : { ...DEFAULT_PRODUCT });
        setDrawerTab('general');
        setIsDrawerOpen(true);
    };

    const closeDrawer = () => {
        setIsDrawerOpen(false);
        setTimeout(() => setSelectedProduct(null), 300);
    };

    const handleSave = async () => {
        setIsSaving(true);
        const payload = { ...drawerForm };

        // Remove derived/readonly fields if necessary, but Partial<Product> is fine for Supabase usually if columns match
        // Explicitly ensuring service_availability is array
        if (!Array.isArray(payload.service_availability)) payload.service_availability = [];

        if (!selectedProduct?.id) {
            // Create New
            const { error } = await supabase.from('products').insert([payload]);
            if (!error) fetchData();
        } else {
            // Update
            const { error } = await supabase
                .from('products')
                .update(payload)
                .eq('id', selectedProduct.id);

            if (!error) {
                setProducts(products.map(p => p.id === selectedProduct.id ? { ...p, ...payload } as Product : p));
            }
        }
        setIsSaving(false);
        closeDrawer();
    };

    // --- FORM HANDLERS ---
    const updateField = (key: keyof Product, value: any) => {
        setDrawerForm(prev => ({ ...prev, [key]: value }));
    };

    const toggleAvailability = (day: string) => {
        const current = drawerForm.service_availability || [];
        const updated = current.includes(day)
            ? current.filter(d => d !== day)
            : [...current, day];
        updateField('service_availability', updated);
    };

    const updateDiscount = (field: string, value: any) => {
        const current = drawerForm.discount_config || { type: 'Percentage Off (%)', value: 0, label: '' };
        updateField('discount_config', { ...current, [field]: value });
    };

    const toggleDiscount = (enable: boolean) => {
        updateField('discount_config', enable ? { type: 'percentage', value: 10, label: 'Sale' } : null);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;

        const file = e.target.files[0];
        const fileName = `${Math.random()}.${file.name.split('.').pop()}`;

        // Optimistic preview
        const objectUrl = URL.createObjectURL(file);
        updateField('image', objectUrl);

        try {
            const { error } = await supabase.storage.from('products').upload(fileName, file);
            if (error) throw error;

            const { data } = supabase.storage.from('products').getPublicUrl(fileName);
            updateField('image', data.publicUrl);
        } catch (err) {
            console.error('Upload failed:', err);
            alert('Image upload failed. Please try again.');
        }
    };

    // --- UI HELPERS ---
    const filtered = products.filter(p => p.name?.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="min-h-screen bg-white flex">

            {/* MAIN CONTENT */}
            <div className={`flex-1 transition-all duration-300 ${isDrawerOpen ? 'mr-[500px]' : ''}`}>
                <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100 px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Product Intelligence</h1>
                            <p className="text-sm text-gray-500 font-medium mt-1">Manage inventory, offers, and performance.</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsBulkMode(!isBulkMode)}
                                className={`px-4 py-2 text-sm font-bold rounded-lg border transition-all ${isBulkMode ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-600'}`}
                            >
                                {isBulkMode ? 'Done Editing' : 'Bulk Edit'}
                            </button>
                            <button
                                onClick={() => openDrawer(null)} // New Item
                                className="flex items-center gap-2 px-5 py-2 hover:shadow-lg bg-[#0c831f] text-white text-sm font-bold rounded-lg transition-all"
                            >
                                <Plus size={18} /> Add Product
                            </button>
                        </div>
                    </div>
                </header>

                <main className="p-8">
                    {/* Toolbar */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-[#0c831f]/20 font-medium text-gray-700"
                            />
                        </div>
                        {/* Filter Pills */}
                        <div className="flex gap-2">
                            <FilterPill label="Low Stock" count={products.filter(p => (p.total_stock - p.reserved_stock) < 10).length} color="amber" />
                            <FilterPill label="High Returns" count={products.filter(p => p.return_rate > 5).length} color="red" />
                            <FilterPill label="Top Sellers" count={products.filter(p => p.sales_velocity > 10).length} color="green" />
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filtered.map(p => (
                            <ProductCard
                                key={p.id}
                                product={p}
                                onClick={() => openDrawer(p)}
                                isBulkMode={isBulkMode}
                            />
                        ))}
                    </div>
                </main>
            </div>

            {/* SIDE DRAWER (SHEET) */}
            <div className={`fixed inset-y-0 right-0 w-[500px] bg-white shadow-2xl border-l border-gray-100 transform transition-transform duration-300 ease-in-out z-30 ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                {/* Note: Always render form if drawer is open (or logically always render but hide) to keep state. Here we condition on isDrawerOpen visually but state persists? No, better to render conditionally or careful with nulls. */}
                {isDrawerOpen && (
                    <div className="h-full flex flex-col">
                        {/* Drawer Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">{selectedProduct ? 'Edit Product' : 'New Product'}</h2>
                                <p className="text-xs text-gray-500 font-mono">{selectedProduct?.id || 'New Draft'}</p>
                            </div>
                            <button onClick={closeDrawer} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"><X size={20} /></button>
                        </div>

                        {/* Tabs */}
                        <div className="px-6 pt-4 flex gap-6 border-b border-gray-100">
                            <TabButton label="General" active={drawerTab === 'general'} onClick={() => setDrawerTab('general')} icon={Package} />
                            <TabButton label="Offers & Pricing" active={drawerTab === 'offers'} onClick={() => setDrawerTab('offers')} icon={Tag} />
                            <TabButton label="Analytics" active={drawerTab === 'analytics'} onClick={() => setDrawerTab('analytics')} icon={BarChart3} />
                        </div>

                        {/* Drawer Content */}
                        <div className="flex-1 overflow-y-auto p-6">

                            {/* TAB: GENERAL */}
                            {drawerTab === 'general' && (
                                <div className="space-y-6">
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex gap-4">
                                        <label className="w-20 h-20 bg-white rounded-lg border border-gray-200 flex items-center justify-center shrink-0 cursor-pointer relative overflow-hidden group hover:border-[#0c831f] transition-all">
                                            {drawerForm.image ? (
                                                <img src={drawerForm.image} className="w-full h-full object-cover rounded-lg group-hover:opacity-75 transition-opacity" />
                                            ) : (
                                                <span className="text-gray-300 group-hover:text-[#0c831f]">+</span>
                                            )}
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/10">
                                                <Edit size={16} className="text-white" />
                                            </div>
                                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                        </label>
                                        <div className="flex-1 space-y-3">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Product Name</label>
                                                <input
                                                    value={drawerForm.name}
                                                    onChange={e => updateField('name', e.target.value)}
                                                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold"
                                                    placeholder="e.g. Fresh Tomatoes"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                                                <select
                                                    value={drawerForm.category_id || ''}
                                                    onChange={e => updateField('category_id', e.target.value)}
                                                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-gray-700"
                                                >
                                                    <option value="">Select Category</option>
                                                    {categories.map(c => (
                                                        <option key={c.id} value={c.id}>{c.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Price (₹)</label>
                                            <input
                                                type="number"
                                                value={drawerForm.price}
                                                onChange={e => updateField('price', parseFloat(e.target.value))}
                                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Weight</label>
                                            <input
                                                value={drawerForm.weight}
                                                onChange={e => updateField('weight', e.target.value)}
                                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-4 border-t border-gray-100">
                                        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                            <div className="w-2 h-2 bg-emerald-500 rounded-full" /> Inventory Status
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Total Stock</label>
                                                <input
                                                    type="number"
                                                    value={drawerForm.total_stock}
                                                    onChange={e => updateField('total_stock', parseInt(e.target.value))}
                                                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Reserved</label>
                                                <input
                                                    value={drawerForm.reserved_stock}
                                                    disabled
                                                    className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-gray-400"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-2 mt-2">
                                            {['today', 'tomorrow'].map(day => (
                                                <label key={day} className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100">
                                                    <input
                                                        type="checkbox"
                                                        checked={drawerForm.service_availability?.includes(day)}
                                                        onChange={() => toggleAvailability(day)}
                                                        className="rounded text-emerald-600"
                                                    />
                                                    {day.charAt(0).toUpperCase() + day.slice(1)} Only
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB: OFFERS */}
                            {drawerTab === 'offers' && (
                                <div className="space-y-6">
                                    <div className="bg-[#FFF8E1] p-5 rounded-2xl border border-[#FFE082] space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-amber-800 font-bold flex items-center gap-2">
                                                <Tag size={18} /> Active Offer
                                            </h3>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-amber-800/60 uppercase tracking-wider">Enabled</span>
                                                <div
                                                    onClick={() => toggleDiscount(!drawerForm.discount_config)}
                                                    className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors relative ${!!drawerForm.discount_config ? 'bg-amber-500' : 'bg-gray-300'}`}
                                                >
                                                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${!!drawerForm.discount_config ? 'translate-x-4' : ''}`} />
                                                </div>
                                            </div>
                                        </div>

                                        {drawerForm.discount_config && (
                                            <>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-xs font-bold text-amber-800/70 mb-1 block">Discount Type</label>
                                                        <select
                                                            value={drawerForm.discount_config.type}
                                                            onChange={e => updateDiscount('type', e.target.value)}
                                                            className="w-full bg-white/50 border border-amber-200 rounded-lg px-3 py-2 text-sm font-bold text-amber-900"
                                                        >
                                                            <option value="percentage">Percentage Off (%)</option>
                                                            <option value="flat">Flat Off (₹)</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-bold text-amber-800/70 mb-1 block">Value</label>
                                                        <input
                                                            type="number"
                                                            value={drawerForm.discount_config.value}
                                                            onChange={e => updateDiscount('value', parseFloat(e.target.value))}
                                                            className="w-full bg-white/50 border border-amber-200 rounded-lg px-3 py-2 text-sm font-bold text-amber-900"
                                                        />
                                                    </div>
                                                </div>
                                                <input
                                                    type="text"
                                                    placeholder="Offer Label (e.g. Winter Sale)"
                                                    value={drawerForm.discount_config.label}
                                                    onChange={e => updateDiscount('label', e.target.value)}
                                                    className="w-full bg-white/50 border border-amber-200 rounded-lg px-3 py-2 text-sm"
                                                />
                                            </>
                                        )}
                                    </div>

                                    <div className="p-4 rounded-xl border border-gray-100">
                                        <h4 className="text-sm font-bold text-gray-700 mb-3">Bulk Pricing Rules</h4>
                                        <div className="flex items-center gap-2 text-sm text-gray-500 italic">
                                            <Plus size={16} /> Add logic for "Buy 2 Get 5% Off"
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB: ANALYTICS */}
                            {drawerTab === 'analytics' && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <StatBox label="Sales Velocity" value={`${drawerForm.sales_velocity || 0} / day`} trend="up" />
                                        <StatBox label="Return Rate" value={`${drawerForm.return_rate || 0}%`} trend={(drawerForm.return_rate || 0) > 5 ? 'down' : 'up'} />
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 h-40 flex items-center justify-center text-gray-400 text-sm">
                                        [Sales Trend Chart Placeholder]
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-bold text-gray-800 mb-2">Customer Satisfaction</h4>
                                        <div className="flex items-center gap-2">
                                            <div className="flex text-amber-400">{'★'.repeat(Math.round(drawerForm.customer_rating || 5))}</div>
                                            <span className="text-sm font-bold text-gray-600">{drawerForm.customer_rating || 5.0} / 5.0</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* Drawer Footer */}
                        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-4">
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex-1 py-3 bg-[#0c831f] text-white font-bold rounded-xl shadow-lg hover:bg-[#096b19] disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button onClick={closeDrawer} className="px-6 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50">Cancel</button>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
}

// --- SUB COMPONENTS ---

function FilterPill({ label, count, color }: any) {
    const colors: any = {
        amber: 'bg-amber-50 text-amber-700 border-amber-100',
        red: 'bg-red-50 text-red-700 border-red-100',
        green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    };
    return (
        <button className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-2 ${colors[color]}`}>
            {label}
            <span className="bg-white px-1.5 py-0.5 rounded-md text-[10px] shadow-sm">{count}</span>
        </button>
    )
}

function ProductCard({ product, onClick, isBulkMode }: { product: Product, onClick: () => void, isBulkMode: boolean }) {
    return (
        <div onClick={!isBulkMode ? onClick : undefined} className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden cursor-pointer select-none">
            {/* Image */}
            <div className="aspect-[4/3] bg-gray-50 relative">
                {product.image ? <img src={product.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><Package size={32} /></div>}

                {/* Overlay Badges */}
                <div className="absolute top-2 left-2 flex gap-1">
                    {(product.total_stock - product.reserved_stock) < 10 && (
                        <span className="px-2 py-1 bg-amber-500/90 backdrop-blur-sm text-white text-[10px] font-bold rounded-md flex items-center gap-1">
                            <AlertTriangle size={10} /> Low Stock
                        </span>
                    )}
                    {product.discount_config && (
                        <span className="px-2 py-1 bg-rose-500/90 backdrop-blur-sm text-white text-[10px] font-bold rounded-md">
                            Offer Active
                        </span>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-gray-800 text-sm line-clamp-1">{product.name}</h3>
                    {isBulkMode && (
                        <div className="w-5 h-5 rounded border border-gray-300 bg-white" />
                    )}
                </div>
                <p className="text-xs text-gray-400 mb-3">{product.weight}</p>

                <div className="flex justify-between items-end">
                    <div>
                        {product.old_price && <span className="text-xs text-gray-400 line-through block">₹{product.old_price}</span>}
                        <span className="font-bold text-gray-900">₹{product.price}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TabButton({ label, active, onClick, icon: Icon }: any) {
    return (
        <button
            onClick={onClick}
            className={`pb-3 flex items-center gap-2 text-sm font-bold border-b-2 transition-all ${active ? 'text-[#0c831f] border-[#0c831f]' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
        >
            <Icon size={16} /> {label}
        </button>
    );
}

function StatBox({ label, value, trend }: any) {
    return (
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-xs font-bold text-gray-500 uppercase">{label}</p>
            <div className="flex items-center gap-2 mt-1">
                <span className="text-xl font-black text-gray-900">{value}</span>
                {trend === 'up' ? <TrendingUp size={16} className="text-emerald-500" /> : <TrendingDown size={16} className="text-rose-500" />}
            </div>
        </div>
    )
}
