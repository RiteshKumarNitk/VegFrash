'use client';

// Placeholder for images - In production these would be high-res CDN links
// Mapped to resemble Blinkit's categories

export default function CategoryGrid({ categories }: { categories: any[] }) {
    return (
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 md:gap-4">
            {categories.map((cat, idx) => (
                <a key={idx} href={`/category/${cat.slug}`} className="cursor-pointer group flex flex-col gap-2 transition-transform hover:-translate-y-1 duration-300">
                    <div
                        className="aspect-[4/5] rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md border border-slate-100/50 group-hover:border-brand/30 transition-all relative overflow-hidden"
                        style={{ backgroundColor: cat.color }}
                    >
                        <div className="w-full h-full flex items-center justify-center p-2">
                            {cat.image?.startsWith('http') || cat.image?.startsWith('/') ? (
                                <img
                                    src={cat.image}
                                    alt={cat.name}
                                    className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                                />
                            ) : (
                                <span className="text-5xl scale-100 group-hover:scale-110 transition-transform duration-500 filter drop-shadow-sm">
                                    {cat.image}
                                </span>
                            )}
                        </div>

                        {/* Shine effect on hover */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    </div>
                    <span className="text-[13px] font-semibold text-center text-slate-700 leading-tight group-hover:text-brand transition-colors">
                        {cat.name}
                    </span>
                </a>
            ))}
        </div>
    );
}
