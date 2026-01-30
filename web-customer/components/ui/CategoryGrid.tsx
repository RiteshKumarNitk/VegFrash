'use client';

// Placeholder for images - In production these would be high-res CDN links
// Mapped to resemble Blinkit's categories
const CATEGORIES = [
    { name: 'Paan Corner', image: '🍃', color: '#dcfce7' },
    { name: 'Dairy, Bread & Eggs', image: '🥛', color: '#f3e8ff' },
    { name: 'Fruits & Vegetables', image: '🥕', color: '#dcfce7' },
    { name: 'Cold Drinks & Juices', image: '🥤', color: '#e0f2fe' },
    { name: 'Snacks & Munchies', image: '🍟', color: '#fef3c7' },
    { name: 'Breakfast & Instant Food', image: '🥣', color: '#ffedd5' },
    { name: 'Sweet Tooth', image: '🍫', color: '#fce7f3' },
    { name: 'Bakery & Biscuits', image: '🍪', color: '#f1f5f9' },
    { name: 'Tea, Coffee & Health Drinks', image: '☕', color: '#fee2e2' },
    { name: 'Atta, Rice & Dal', image: '🍚', color: '#fae8ff' },
];

export default function CategoryGrid() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {CATEGORIES.map((cat, idx) => (
                <a key={idx} href={`/category/${cat.name.split(',')[0].toLowerCase().trim()}`} className="cursor-pointer group flex flex-col gap-2">
                    <div
                        className="aspect-[4/5] rounded-xl flex items-center justify-center text-5xl shadow-sm border border-transparent group-hover:border-brand transition-all relative overflow-hidden"
                        style={{ backgroundColor: cat.color }}
                    >
                        {/* <Image /> would go here */}
                        <span className="scale-100 group-hover:scale-110 transition-transform duration-300">
                            {cat.image}
                        </span>
                    </div>
                    <span className="text-[13px] font-semibold text-center text-slate-700 leading-tight">
                        {cat.name}
                    </span>
                </a>
            ))}
        </div>
    );
}
