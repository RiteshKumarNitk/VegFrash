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
    const bannerUrl = config?.banner_url;

    const gradient = isFestival
        ? `bg-gradient-to-r ${config.gradient || 'from-purple-600 via-pink-600 to-rose-600'}`
        : 'bg-gradient-to-r from-[#0C831F] to-[#15803d]';


    return (
        <div
            className={`w-full relative overflow-hidden rounded-2xl shadow-xl my-6 min-h-[220px] lg:min-h-[320px] flex items-center px-6 lg:px-12 transition-all duration-500 ${!bannerUrl ? gradient : 'bg-slate-100'}`}
            style={bannerUrl ? {
                backgroundImage: `url(${bannerUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            } : {}}
        >

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
            <div className={`relative z-10 p-2 w-full flex flex-col items-start text-left ${isFestival ? 'items-center text-center' : ''}`}>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] lg:text-xs font-black tracking-[0.2em] uppercase rounded-full px-4 py-1.5 mb-6 shadow-xl inline-flex items-center gap-2 group cursor-default">
                    {isFestival ? (
                        <>
                            <Sparkles size={14} className="text-yellow-300 animate-pulse" />
                            <span className="bg-gradient-to-r from-yellow-200 to-white bg-clip-text text-transparent">FESTIVAL MEGA SALE</span>
                        </>
                    ) : (
                        'EXCLUSIVELY FOR YOU'
                    )}
                </div>

                <h2 className={`text-4xl lg:text-7xl font-black mb-6 tracking-tighter leading-[0.9] text-white drop-shadow-[0_10px_10px_rgba(0,0,0,0.3)] ${isFestival ? 'animate-float' : ''}`}>
                    {isFestival ? (
                        <>
                            <span className="block">{config.banner_text || 'GRAND FESTIVAL SALE'}</span>
                            <div className="text-yellow-400 text-3xl lg:text-5xl mt-3 font-extrabold italic font-serif flex items-center justify-center gap-3">
                                <span className="opacity-50 tracking-[-0.1em]">-----</span>
                                <span className="drop-shadow-glow">FLAT 50% OFF</span>
                                <span className="opacity-50 tracking-[-0.1em]">-----</span>
                            </div>
                        </>
                    ) : (
                        <>
                            {(config?.standard_title || 'Freshness Delivered Fast.').split(' ').map((word: string, i: number) =>
                                i === 1 ? <span key={i} className="text-yellow-300 mx-2">{word}</span> : <span key={i} className="inline-block">{word}&nbsp;</span>
                            )}
                        </>
                    )}
                </h2>

                <p className="text-lg lg:text-xl text-white/80 mb-10 font-bold max-w-2xl leading-snug hidden sm:block drop-shadow-md">
                    {isFestival
                        ? 'Celebrate with legendary savings! Stock up on farm-fresh essentials, sweets, and gift hampers with our biggest offer yet.'
                        : (config?.standard_subtitle || 'Get farm-fresh vegetables and daily essentials delivered to your doorstep in 10 minutes.')
                    }
                </p>

                {isFestival ? (
                    <div className="flex flex-col sm:flex-row items-center gap-6 bg-black/20 hover:bg-black/30 p-3 rounded-[2rem] backdrop-blur-xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-300 group">
                        <div className="flex -space-x-2 px-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-white/20 bg-gradient-to-tr from-yellow-400 to-orange-500 flex items-center justify-center text-[10px] shadow-lg">🎁</div>
                            ))}
                        </div>
                        <div className="text-[10px] text-white/60 font-black uppercase tracking-[0.2em] px-2 border-l border-white/10 hidden lg:block">Use Secret Code:</div>
                        <div className="flex items-center gap-4 bg-white text-slate-900 px-8 py-3 rounded-2xl font-mono font-black text-2xl border-2 border-dashed border-slate-200 cursor-copy active:scale-95 transition-all shadow-inner group-hover:border-brand group-hover:shadow-brand/20"
                            onClick={() => {
                                navigator.clipboard.writeText(config.promo_code || 'FEST50');
                                alert('Promo Code Copied! 🎉');
                            }}
                        >
                            {config.promo_code || 'FEST50'} <Copy size={20} className="text-slate-300 group-hover:text-brand" />
                        </div>
                    </div>
                ) : (
                    <button className="px-10 py-4 bg-white text-[#0C831F] font-black text-lg rounded-2xl shadow-[0_15px_30px_rgba(0,0,0,0.2)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:scale-105 active:scale-95 transition-all duration-300">
                        Shop Collection
                    </button>
                )}
            </div>

            {/* Illustration */}
            <div className={`absolute right-4 lg:right-24 bottom-0 transition-all duration-1000 hidden md:block ${isFestival ? 'scale-150 -rotate-12 translate-y-4' : 'rotate-12 translate-y-8'}`}>
                <div className="text-[10rem] lg:text-[14rem] drop-shadow-[0_20px_50px_rgba(0,0,0,0.4)] filter hover:brightness-125 transition-all animate-float-slow">
                    {isFestival ? '🎉' : '🍉'}
                </div>
            </div>

            <style jsx global>{`
                @keyframes fall {
                    0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
                    100% { transform: translateY(300px) rotate(360deg); opacity: 0; }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes float-slow {
                    0%, 100% { transform: translateY(0) rotate(-12deg); }
                    50% { transform: translateY(-20px) rotate(-5deg); }
                }
                .animate-fall { animation-name: fall; }
                .animate-float { animation: float 3s ease-in-out infinite; }
                .animate-float-slow { animation: float-slow 6s ease-in-out infinite; }
                .drop-shadow-glow { filter: drop-shadow(0 0 10px rgba(255, 234, 0, 0.5)); }
            `}</style>
        </div>
    );
}
