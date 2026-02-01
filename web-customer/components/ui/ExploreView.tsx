'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from './ProductCard';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';

type Category = {
    id: string;
    name: string;
    slug: string;
    image?: string;
    color?: string;
};

type Product = {
    id: string;
    name: string;
    category_id: string;
    price: number;
    old_price?: number;
    image?: string;
    weight: string;
    total_stock: number;
    reserved_stock: number;
    is_visible: boolean;
};

export default function ExploreView({ products, categories }: { products: Product[], categories: Category[] }) {
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Filter Logic
    const filteredProducts = useMemo(() => {
        let filtered = products;

        // 1. By Category
        if (selectedCategory !== 'all') {
            const cat = categories.find(c => c.slug === selectedCategory);
            if (cat) {
                filtered = filtered.filter(p => p.category_id === cat.id);
            }
        }

        // 2. By Search
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(q)
            );
        }

        return filtered;
    }, [selectedCategory, searchQuery, products, categories]);

    return (
        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)]">

            {/* SIDEBAR (Desktop) / TOPBAR (Mobile) */}
            <aside className="lg:w-64 shrink-0 bg-white lg:border-r border-gray-100 sticky top-[60px] lg:top-0 h-auto lg:h-screen z-40 overflow-hidden">
                <div className="p-4 lg:p-6 pb-2">
                    <h2 className="text-lg font-bold text-slate-800 hidden lg:block mb-4">Categories</h2>

                    {/* Horizontal Scroll on Mobile */}
                    <div className="flex lg:flex-col gap-2 overflow-x-auto no-scrollbar pb-2 lg:pb-0">
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={`
                                shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 border
                                ${selectedCategory === 'all'
                                    ? 'bg-[#0C831F] text-white border-[#0C831F] shadow-md shadow-emerald-100'
                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                }
                            `}
                        >
                            All Products
                        </button>

                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.slug)}
                                className={`
                                    shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 border whitespace-nowrap
                                    ${selectedCategory === cat.slug
                                        ? 'bg-[#0C831F] text-white border-[#0C831F] shadow-md shadow-emerald-100'
                                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                    }
                                `}
                            >
                                <span>{cat.image || '📦'}</span>
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 p-4 lg:p-8 bg-[#F8FAFC]">

                {/* Search & Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                            {selectedCategory === 'all' ? 'Explore Store' : categories.find(c => c.slug === selectedCategory)?.name || 'Products'}
                        </h1>
                        <p className="text-slate-500 font-medium text-sm mt-1">
                            {filteredProducts.length} items available
                        </p>
                    </div>

                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 shadow-sm focus:border-[#0C831F] focus:ring-1 focus:ring-[#0C831F] outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Grid */}
                {filteredProducts.length > 0 ? (
                    <motion.div
                        layout
                        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6"
                    >
                        <AnimatePresence>
                            {filteredProducts.map((product) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.2 }}
                                    key={product.id}
                                >
                                    <ProductCard
                                        {...product}
                                        oldPrice={product.old_price}
                                        inStock={(product.total_stock - product.reserved_stock) > 0}
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6 text-4xl">
                            🔍
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">No products found</h3>
                        <p className="text-slate-500 max-w-xs mx-auto mt-2">
                            Try adjusting your search or category filter to find what you're looking for.
                        </p>
                        <button
                            onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
                            className="mt-6 px-6 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-black transition-colors"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
