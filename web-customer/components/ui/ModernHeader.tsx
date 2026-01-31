'use client';
import { Search, User, MapPin, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ModernHeader({ deviceType }: { deviceType: string }) {
    const [placeholder, setPlaceholder] = useState('Search "milk"');
    const placeholders = ['Search "milk"', 'Search "bread"', 'Search "potato"', 'Search "paneer"'];

    useEffect(() => {
        let i = 0;
        const interval = setInterval(() => {
            i = (i + 1) % placeholders.length;
            setPlaceholder(placeholders[i]);
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-sm pb-2">
            {/* Top Row: Location & Profile */}
            <div className="flex justify-between items-center px-4 pt-3 pb-2">
                <div className="flex flex-col">
                    <div className="flex items-center gap-1 font-bold text-slate-800">
                        <MapPin size={16} className="text-brand-dark" />
                        <span className="text-sm">Home</span>
                        <ChevronDown size={14} className="text-slate-400" />
                    </div>
                    <p className="text-xs text-slate-500 pl-5 overflow-hidden text-ellipsis whitespace-nowrap max-w-[200px]">
                        12, Green Park, Civil Lines, New Delhi
                    </p>
                </div>
                <button className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                    <User size={20} />
                </button>
            </div>

            {/* Search Bar */}
            <div className="px-4">
                <div className="bg-slate-100 rounded-xl flex items-center px-3 py-3 border border-transparent focus-within:border-brand/30 focus-within:bg-white focus-within:shadow-sm transition-all">
                    <Search size={18} className="text-slate-400 mr-3" />
                    <input
                        type="text"
                        placeholder={placeholder}
                        className="bg-transparent border-none outline-none w-full text-slate-800 placeholder:text-slate-400 text-sm font-medium"
                    />
                </div>
            </div>
        </header>
    );
}
