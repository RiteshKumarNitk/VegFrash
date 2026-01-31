'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Trash2, Plus } from 'lucide-react';

export default function CategoriesPage() {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newCat, setNewCat] = useState({ name: '', slug: '', image: '🥬', color: '#dcfce7' });
    const supabase = createClient();

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        const { data, error } = await supabase.from('categories').select('*').order('created_at', { ascending: false });
        if (data) setCategories(data);
        setLoading(false);
    };

    const handleCreate = async () => {
        if (!newCat.name || !newCat.slug) return alert('Name and Slug required');

        const { error } = await supabase.from('categories').insert([newCat]);
        if (error) {
            alert('Error creating category: ' + error.message);
        } else {
            setIsCreating(false);
            setNewCat({ name: '', slug: '', image: '🥬', color: '#dcfce7' });
            fetchCategories();
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure? This might break products linked to this category.')) return;
        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (!error) fetchCategories();
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Categories</h1>
                <button
                    onClick={() => setIsCreating(!isCreating)}
                    className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
                >
                    <Plus size={18} /> {isCreating ? 'Cancel' : 'Add Category'}
                </button>
            </div>

            {isCreating && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6 animate-in fade-in slide-in-from-top-4">
                    <h3 className="font-bold mb-4">New Category</h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <input
                            placeholder="Name (e.g. Vegetables)"
                            className="border p-2 rounded"
                            value={newCat.name}
                            onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
                        />
                        <input
                            placeholder="Slug (e.g. vegetables)"
                            className="border p-2 rounded"
                            value={newCat.slug}
                            onChange={(e) => setNewCat({ ...newCat, slug: e.target.value })}
                        />
                        <input
                            placeholder="Emoji Icon (e.g. 🥕)"
                            className="border p-2 rounded"
                            value={newCat.image}
                            onChange={(e) => setNewCat({ ...newCat, image: e.target.value })}
                        />
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                className="h-10 w-20 p-1 rounded cursor-pointer"
                                value={newCat.color}
                                onChange={(e) => setNewCat({ ...newCat, color: e.target.value })}
                            />
                            <span className="text-sm text-slate-500">Pick Card Color</span>
                        </div>
                    </div>
                    <button onClick={handleCreate} className="bg-slate-900 text-white px-6 py-2 rounded-lg font-bold">Save Category</button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((cat) => (
                    <div key={cat.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div
                                className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                                style={{ backgroundColor: cat.color }}
                            >
                                {cat.image}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-700">{cat.name}</h3>
                                <p className="text-xs text-slate-400 font-mono">{cat.slug}</p>
                            </div>
                        </div>
                        <button onClick={() => handleDelete(cat.id)} className="text-rose-400 hover:text-rose-600 p-2">
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
