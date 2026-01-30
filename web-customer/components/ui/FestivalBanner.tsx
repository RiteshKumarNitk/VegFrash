'use client';

import { useEffect, useState } from 'react';

export default function FestivalBanner() {
    const [theme, setTheme] = useState<any>(null);

    // In a real app, we might pass this as a prop from server component
    // or read from a context. For MVP, we'll read from CSS variables or HEADERS if possible,
    // but CSS vars are easiest for client components in this specific setup.

    // Actually, for a pure server component approach, we should fetch in page.tsx and pass down.
    // But let's make this cosmetic for now.

    return (
        <div className="w-full relative overflow-hidden rounded-xl shadow-lg my-6 min-h-[160px] flex items-center justify-center text-center">
            <div
                className="absolute inset-0 z-0 opacity-90"
                style={{
                    background: 'var(--theme-gradient)',
                }}
            />

            {/* Decorative Elements (Particles) - Simplified */}
            <div className="absolute top-0 left-0 w-20 h-20 bg-white opacity-10 rounded-full blur-xl transform -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-yellow-300 opacity-20 rounded-full blur-2xl transform translate-x-1/3 translate-y-1/3" />

            <div className="relative z-10 p-6 text-white max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold mb-2 font-serif tracking-wide drop-shadow-md">
                    Fast, Fresh & Featve
                </h2>
                <p className="text-lg opacity-90 mb-4 font-medium">
                    Fresh produce delivered in 10 minutes.
                </p>
                <button
                    className="px-6 py-2 bg-white text-black font-bold rounded-full shadow-md hover:scale-105 transition-transform"
                    style={{ color: 'var(--theme-primary)' }}
                >
                    Shop Now
                </button>
            </div>
        </div>
    );
}
