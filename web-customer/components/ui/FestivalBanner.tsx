'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Copy, Gift, Sparkles } from 'lucide-react';

export default function FestivalBanner() {
    const [config, setConfig] = useState<any>(null);
    const [confetti, setConfetti] = useState<any[]>([]);

    useEffect(() => {
        const fetchSettings = async () => {
            const supabase = createClient();
            const { data } = await supabase.from('site_settings').select('value').eq('key', 'theme_config').single();
            if (data?.value) {
                let parsed = data.value;
                if (typeof data.value === 'string') {
                    try {
                        parsed = JSON.parse(data.value);
                    } catch (e) {
                        console.error('Failed to parse theme_config in banner:', e);
                        parsed = {};
                    }
                }
                setConfig(parsed);
            }
        };
        fetchSettings();

        // Generate confetti particles
        const particles = Array.from({ length: 50 }).map((_, i) => ({
            id: i,
            left: Math.random() * 100 + '%',
            animationDuration: Math.random() * 3 + 2 + 's',
            animationDelay: Math.random() * 2 + 's',
            color: ['#FFD700', '#FF0000', '#00FF00', '#0000FF', '#FF00FF'][Math.floor(Math.random() * 5)]
        }));
        setConfetti(particles);
    }, []);

    const isFestival = config?.festival_mode;
    const gradient = isFestival
        ? `bg-gradient-to-r ${config.gradient || 'from-purple-600 via-pink-600 to-rose-600'}`
        : 'bg-gradient-to-r from-[#0C831F] to-[#15803d]';


    return (
        <div className={`w-full relative overflow-hidden rounded-2xl shadow-xl my-6 min-h-[220px] lg:min-h-[280px] flex items-center px-6 lg:px-12 transition-all duration-500 ${gradient}`}>

            {/* Confetti / Sparkles Layer */}
            {isFestival && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {confetti.map((particle) => (
                        <div
                            key={particle.id}
                            className="absolute top-0 w-2 h-2 rounded-full opacity-80 animate-fall"
                            style={{
                                left: particle.left,
                                backgroundColor: particle.color,
                                animation: `fall ${particle.animationDuration} linear infinite`,
                                animationDelay: particle.animationDelay
                            }}
                        />
                    ))}
                    <style jsx>{`
                        @keyframes fall {
                            0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
                            100% { transform: translateY(300px) rotate(360deg); opacity: 0; }
                        }
                        .animate-fall { animation-name: fall; }
                    `}</style>
                </div>
            )}

            {/* Background Decoration */}
            <div className="absolute inset-0 z-0">
                {isFestival ? (
                    <>
                        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20" />
                        <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-yellow-400 blur-[80px] opacity-40 rounded-full mix-blend-overlay animate-pulse" />
                        <div className="absolute bottom-[-50px] left-[-50px] w-64 h-64 bg-pink-400 blur-[80px] opacity-40 rounded-full mix-blend-overlay" />
                    </>
                ) : (
                    <>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400 opacity-20 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full blur-2xl transform -translate-x-1/3 translate-y-1/3" />
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
                    </>
                )}
            </div>

            {/* Content Layer */}
            <div className={`relative z-10 w-full flex flex-col items-start text-left ${isFestival ? 'items-center text-center' : ''}`}>
                <div className=" bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-bold tracking-widest uppercase rounded-full px-3 py-1 mb-4 shadow-sm inline-flex items-center gap-2">
                    {isFestival ? <><Sparkles size={12} className="text-yellow-300" /> FESTIVAL OFFER</> : 'LIMITED TIME OFFER'}
                </div>

                <h2 className={`text-3xl lg:text-5xl font-black mb-4 tracking-tight leading-tight text-white drop-shadow-lg ${isFestival ? 'scale-105' : ''}`}>
                    {isFestival ? (
                        <>
                            {config.banner_text || 'Festival Sale'}
                            <div className="text-yellow-300 text-2xl lg:text-3xl mt-2 font-extrabold font-serif italic">
                                ✨ Flat 50% OFF ✨
                            </div>
                        </>
                    ) : (
                        <>
                            {(config?.standard_title || 'Freshness Delivered Fast.').split(' ').map((word: string, i: number) =>
                                i === 1 ? <span key={i} className="text-yellow-300 mx-2">{word}</span> : <span key={i}>{word} </span>
                            )}
                        </>
                    )}
                </h2>

                <p className="text-lg text-white/90 mb-8 font-medium max-w-lg leading-relaxed hidden sm:block drop-shadow-md">
                    {isFestival
                        ? 'Celebrate with joy and huge savings! Get exclusive discounts on fresh fruits, sweets, and gift packs.'
                        : (config?.standard_subtitle || 'Get farm-fresh vegetables and daily essentials delivered to your doorstep in 10 minutes.')
                    }
                </p>

                {isFestival ? (
                    <div className="flex flex-col sm:flex-row items-center gap-4 bg-white/10 p-2 rounded-xl backdrop-blur-sm border border-white/20 shadow-2xl transform hover:scale-105 transition-transform duration-300">
                        <div className="text-xs text-white/70 font-bold uppercase tracking-wider px-2">Use Code:</div>
                        <div className="flex items-center gap-3 bg-white text-brand-dark px-4 py-2 rounded-lg font-mono font-bold text-lg border-2 border-dashed border-gray-300 cursor-copy active:scale-95 transition-transform"
                            onClick={() => {
                                navigator.clipboard.writeText(config.promo_code);
                                alert('Code Copied!');
                            }}
                        >
                            {config.promo_code || 'FEST50'} <Copy size={16} className="text-gray-400" />
                        </div>
                    </div>
                ) : (
                    <button className="px-8 py-3 bg-white text-green-700 font-bold text-sm lg:text-base rounded-lg shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300">
                        Shop Now
                    </button>
                )}
            </div>

            {/* Illustration */}
            <div className={`absolute right-4 lg:right-16 bottom-0 transition-all duration-700 hidden md:block ${isFestival ? 'scale-125 rotate-6' : 'rotate-12'}`}>
                <div className="text-[8rem] lg:text-[10rem] drop-shadow-2xl filter hover:brightness-110 transition-all">
                    {isFestival ? '🎁' : '🥦'}
                </div>
            </div>
        </div>
    );
}
