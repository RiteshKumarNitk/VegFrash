'use client';

import { useEffect, useState } from 'react';
import { createClient } from "@supabase/supabase-js";

export default function FestivalBanner() {
    const [title, setTitle] = useState('Freshness Delivered Fast.');
    const [gradient, setGradient] = useState('linear-gradient(135deg, #0C831F 0%, #15803d 100%)');

    useEffect(() => {
        const fetchSettings = async () => {
            // We can use the simple client since it's public data
            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );
            const { data } = await supabase.from('site_settings').select('*');
            if (data) {
                const map: any = {};
                data.forEach((item: any) => map[item.key] = item.value);

                if (map['banner_title']) setTitle(map['banner_title']);
                if (map['banner_gradient']) setGradient(map['banner_gradient']);
            }
        };
        fetchSettings();
    }, []);

    return (
        <div className="w-full relative overflow-hidden rounded-2xl shadow-lg my-6 min-h-[180px] lg:min-h-[240px] flex items-center px-6 lg:px-12">
            <div
                className="absolute inset-0 z-0"
                style={{ background: gradient }}
            />

            {/* Decorative Elements - Modern Abstract Shapes */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400 opacity-20 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full blur-2xl transform -translate-x-1/3 translate-y-1/3" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />

            <div className="relative z-10 text-white max-w-2xl flex flex-col items-start text-left">
                <span className="inline-block px-3 py-1 bg-white/20 text-white text-[10px] font-bold tracking-widest uppercase rounded-full mb-3 backdrop-blur-sm">
                    Limited Time Offer
                </span>
                <h2 className="text-3xl lg:text-5xl font-extrabold mb-3 tracking-tight leading-tight drop-shadow-sm">
                    {title.split(' ').map((word, i) =>
                        i % 2 !== 0 ? <span key={i} className="text-yellow-300">{word} </span> : <span key={i}>{word} </span>
                    )}
                </h2>
                <p className="text-lg text-brand-light mb-6 font-medium max-w-md leading-relaxed hidden sm:block">
                    Get farm-fresh vegetables and daily essentials delivered to your doorstep in 10 minutes.
                </p>
                <button
                    className="px-8 py-3 bg-white text-brand-dark font-bold text-sm lg:text-base rounded-lg shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 transform"
                >
                    Shop Now
                </button>
            </div>

            {/* Right side illustration (Concept) */}
            <div className="absolute right-[-20px] bottom-[-20px] lg:right-10 lg:bottom-0 text-9xl lg:text-[12rem] opacity-90 drop-shadow-2xl grayscale-[0.2] hover:grayscale-0 transition-all duration-500 hidden sm:block rotate-12">
                🥦
            </div>
        </div>
    );
}
