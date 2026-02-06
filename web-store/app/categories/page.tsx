'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Trash2, Plus, Edit2, Upload, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CategoriesPage() {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: '', slug: '', image: '', color: '#dcfce7' });
    const [uploading, setUploading] = useState(false);

    const supabase = createClient();

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        const { data, error } = await supabase.from('categories').select('*').order('created_at', { ascending: false });
        if (data) setCategories(data);
        setLoading(false);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        setUploading(true);
        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage.from('categories').upload(filePath, file);

        if (uploadError) {
            alert('Error uploading image: ' + uploadError.message);
            setUploading(false);
            return;
        }

        const { data } = supabase.storage.from('categories').getPublicUrl(filePath);
        setFormData({ ...formData, image: data.publicUrl });
        setUploading(false);
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.slug) return alert('Name and Slug required');

        if (editingId) {
            // Update
            const { error } = await supabase.from('categories').update(formData).eq('id', editingId);
            if (error) alert('Error updating: ' + error.message);
        } else {
            // Create
            const { error } = await supabase.from('categories').insert([formData]);
            if (error) alert('Error creating: ' + error.message);
        }

        resetForm();
        fetchCategories();
    };

    const handleEdit = (cat: any) => {
        setEditingId(cat.id);
        setFormData({ name: cat.name, slug: cat.slug, image: cat.image, color: cat.color || '#dcfce7' });
        setIsFormOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure? This might break products linked to this category.')) return;
        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (!error) fetchCategories();
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({ name: '', slug: '', image: '', color: '#dcfce7' });
        setIsFormOpen(false);
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="max-w-5xl mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Categories</h1>
                    <p className="text-slate-500">Manage product categories and their appearance.</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsFormOpen(true); }}
                    className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all"
                >
                    <Plus size={18} /> Add Category
                </button>
            </div>

            {/* FORM MODAL / PANEL */}
            {isFormOpen && (
                <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 mb-8 animate-in fade-in slide-in-from-top-4 relative">
                    <button onClick={resetForm} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={20} /></button>
                    <h3 className="font-bold text-lg mb-4 text-slate-800">{editingId ? 'Edit Category' : 'New Category'}</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Name</label>
                                <input
                                    placeholder="e.g. Fresh Vegetables"
                                    className="w-full border border-slate-200 p-2.5 rounded-lg font-medium focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Slug</label>
                                <input
                                    placeholder="e.g. vegetables"
                                    className="w-full border border-slate-200 p-2.5 rounded-lg font-mono text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Card Background Color</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        className="h-10 w-16 p-1 rounded border border-slate-200 cursor-pointer"
                                        value={formData.color}
                                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                    />
                                    <span className="text-sm font-mono text-slate-600">{formData.color}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category Image</label>

                            <div className="flex gap-4 items-start">
                                {/* Preview */}
                                <div
                                    className="w-24 h-24 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-300 bg-slate-50 overflow-hidden relative"
                                    style={{ backgroundColor: formData.image ? 'white' : formData.color }}
                                >
                                    {formData.image
                                        ? <img src={formData.image} className="w-full h-full object-cover" />
                                        : <span className="text-2xl">📦</span>
                                    }
                                    {uploading && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><Loader2 className="animate-spin text-emerald-600" /></div>}
                                </div>

                                <div className="flex-1">
                                    <label className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors w-full justify-center text-sm font-bold text-slate-700">
                                        <Upload size={16} /> Upload Image
                                        <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                                    </label>
                                    <p className="text-xs text-slate-400 mt-2">Recommended: PNG or JPG, transparent background preferred.</p>

                                    {formData.image && (
                                        <input
                                            value={formData.image}
                                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                            className="w-full text-xs text-slate-400 mt-2 bg-slate-50 p-1 rounded border-none"
                                            placeholder="Image URL"
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button onClick={resetForm} className="px-5 py-2.5 font-bold text-slate-500 hover:text-slate-800">Cancel</button>
                        <button
                            onClick={handleSubmit}
                            disabled={uploading}
                            className="bg-slate-900 text-white px-6 py-2.5 rounded-lg font-bold shadow-lg hover:bg-black transition-all disabled:opacity-50"
                        >
                            {editingId ? 'Update Category' : 'Create Category'}
                        </button>
                    </div>
                </div>
            )}

            {/* LIST */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {categories.map((cat) => (
                    <div key={cat.id} className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow p-5 group relative">
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEdit(cat)} className="p-1.5 bg-slate-100 hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded">
                                <Edit2 size={14} />
                            </button>
                            <button onClick={() => handleDelete(cat.id)} className="p-1.5 bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded">
                                <Trash2 size={14} />
                            </button>
                        </div>

                        <div className="flex items-center gap-4">
                            <div
                                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-inner"
                                style={{ backgroundColor: cat.color }}
                            >
                                {cat.image?.startsWith('http')
                                    ? <img src={cat.image} className="w-full h-full object-cover rounded-2xl" />
                                    : cat.image
                                }
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg">{cat.name}</h3>
                                <p className="text-xs text-slate-400 font-mono bg-slate-50 px-1.5 py-0.5 rounded inline-block mt-1">{cat.slug}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
