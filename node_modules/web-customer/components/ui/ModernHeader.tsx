'use client';
import { Search, User, MapPin, ChevronDown, ShoppingCart, Package, LogOut, Loader2, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function ModernHeader({ deviceType }: { deviceType: string }) {
    const { items: cartItems } = useCart();
    const router = useRouter();
    const supabase = createClient();
    const searchRef = useRef<HTMLDivElement>(null);

    const [placeholder, setPlaceholder] = useState('Search "milk"');
    const [user, setUser] = useState<any>(null);
    const placeholders = ['Search "fresh veggies"', 'Search "fruits"', 'Search "dairy"', 'Search "snacks"'];

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);

    // Location State
    const [location, setLocation] = useState<{ text: string, loaded: boolean }>({ text: 'Select Location', loaded: false });
    const [locLoading, setLocLoading] = useState(false);

    // Theme State
    const [festivalTheme, setFestivalTheme] = useState<any>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            setPlaceholder(prev => {
                const idx = placeholders.indexOf(prev);
                return placeholders[(idx + 1) % placeholders.length];
            });
        }, 3000);

        const init = async () => {
            // Get User
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            if (user) setLocation({ text: 'Saved Address', loaded: true });

            // Get Theme
            const { data: themeData } = await supabase
                .from('site_settings')
                .select('value')
                .eq('key', 'theme_config')
                .single();

            if (themeData?.value) {
                let parsed = themeData.value;
                if (typeof themeData.value === 'string') {
                    try {
                        parsed = JSON.parse(themeData.value);
                    } catch (e) {
                        console.error('Failed to parse theme_config:', e);
                        parsed = {};
                    }
                }
                setFestivalTheme(parsed);
            }
        };
        init();

        // Click outside to close search
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            clearInterval(interval);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    // --- SEARCH LOGIC ---
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.trim().length > 1) {
                setIsSearching(true);
                setShowResults(true);
                try {
                    const { data } = await supabase
                        .from('products')
                        .select('id, name, image, price, weight, category_id')
                        .ilike('name', `%${searchQuery}%`)
                        .eq('is_visible', true)
                        .limit(5);
                    setSearchResults(data || []);
                } catch (error) {
                    console.error('Search error', error);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
                setShowResults(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);


    // --- LOCATION LOGIC ---
    const detectLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        setLocLoading(true);
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                // Using OpenStreetMap Nominatim for free reverse geocoding
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                const data = await res.json();

                const city = data.address.city || data.address.town || data.address.village || data.address.suburb || 'Unknown Location';
                const area = data.address.road || data.address.neighbourhood || '';

                setLocation({
                    text: `${area}, ${city}`,
                    loaded: true
                });
            } catch (err) {
                console.error("Loc error", err);
                setLocation({ text: 'Lat: ' + latitude.toFixed(2), loaded: true });
            } finally {
                setLocLoading(false);
            }
        }, () => {
            alert('Unable to retrieve your location');
            setLocLoading(false);
        });
    };

    return (
        <>
            {/* Announcement Marquee */}
            {festivalTheme?.announcement && (
                <div className="bg-brand-dark/5 text-brand-dark text-[10px] md:text-xs font-bold py-2 overflow-hidden border-b border-brand/5">
                    <div className="animate-marquee whitespace-nowrap inline-block">
                        <span className="px-4">📢 {festivalTheme.announcement}</span>
                        <span className="px-4">📢 {festivalTheme.announcement}</span>
                        <span className="px-4">📢 {festivalTheme.announcement}</span>
                        <span className="px-4">📢 {festivalTheme.announcement}</span>
                    </div>
                </div>
            )}

            {/* Festival Top Bar */}
            {festivalTheme?.festival_mode && (
                <div className={`bg-gradient-to-r ${festivalTheme.gradient || 'from-orange-500 via-red-500 to-yellow-500'} text-white text-xs font-bold text-center py-2 px-4 shadow-sm relative overflow-hidden`}>
                    <div className="animate-pulse absolute top-0 bottom-0 left-0 right-0 bg-white/10 skew-x-12 translate-x-[-100%]"></div>
                    🎉 {festivalTheme.banner_text} {festivalTheme.promo_code && `use code: ${festivalTheme.promo_code}`}
                </div>
            )}

            <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)]">
                <div className="max-w-7xl mx-auto px-4 lg:px-8">

                    {/* Desktop Header */}
                    <div className="hidden lg:flex items-center justify-between h-20 gap-8">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 shrink-0 group">
                            <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center text-white text-2xl shadow-lg shadow-brand/20 group-hover:scale-105 transition-transform">
                                🍃
                            </div>
                            <div>
                                <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Veg<span className="text-brand">Frash</span></h1>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest -mt-1">Fresh & Daily</p>
                            </div>
                        </Link>

                        {/* Search Bar Container */}
                        <div className="flex-1 max-w-2xl relative group" ref={searchRef}>
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400 group-focus-within:text-brand transition-colors" />
                            </div>
                            <input
                                type="text"
                                className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-full text-sm font-medium focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all outline-none"
                                placeholder={placeholder}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => searchQuery.length > 1 && setShowResults(true)}
                            />
                            {searchQuery && (
                                <button onClick={() => { setSearchQuery(''); setShowResults(false); }} className="absolute right-3 top-3 text-slate-400 hover:text-red-500"><X size={16} /></button>
                            )}

                            {/* DROPDOWN RESULTS */}
                            {showResults && (
                                <div className="absolute top-14 left-0 right-0 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden max-h-[400px] overflow-y-auto animate-in fade-in slide-in-from-top-2">
                                    {isSearching ? (
                                        <div className="p-8 text-center text-slate-400 flex flex-col items-center">
                                            <Loader2 className="animate-spin mb-2" size={24} />
                                            <span className="text-xs">Finding fresh items...</span>
                                        </div>
                                    ) : searchResults.length > 0 ? (
                                        <div className="py-2">
                                            <p className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Top Results</p>
                                            {searchResults.map(product => (
                                                <Link
                                                    href={`/product/${product.id}`}
                                                    key={product.id}
                                                    onClick={() => setShowResults(false)}
                                                    className="flex items-center gap-4 px-4 py-3 hover:bg-slate-50 transition-colors border-b border-dashed border-slate-50 last:border-0"
                                                >
                                                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-lg shrink-0">
                                                        {product.image?.startsWith('http') ? <img src={product.image} className="w-full h-full object-cover rounded-lg" /> : '🥗'}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="text-sm font-bold text-slate-800">{product.name}</h4>
                                                        <p className="text-xs text-slate-500">{product.weight} • ₹{product.price}</p>
                                                    </div>
                                                </Link>
                                            ))}
                                            <Link href={`/search?q=${searchQuery}`} className="block text-center py-3 text-sm font-bold text-brand hover:bg-brand/5 transition-colors border-t border-slate-100">
                                                See all results for "{searchQuery}"
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center text-slate-400">
                                            <p className="text-sm">No items found matching "{searchQuery}"</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Nav Actions */}
                        <div className="flex items-center gap-6 shrink-0">

                            <Link href="/cart" className="relative p-2 text-slate-600 hover:text-brand transition-colors">
                                <ShoppingCart size={24} />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                                        {cartCount}
                                    </span>
                                )}
                                <span className="text-xs font-bold block mt-1">Cart</span>
                            </Link>

                            {/* User Menu logic unchanged, simplified for brevity here since replaced fully in previous step */}
                            <UserMenu user={user} supabase={supabase} />
                        </div>
                    </div>


                    {/* Mobile Header */}
                    <div className="lg:hidden flex flex-col pb-3">
                        <div className="flex items-center justify-between h-14">
                            <Link href="/" className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center shadow-md">
                                    <Package className="text-white" size={18} />
                                </div>
                                <span className="text-lg font-black text-slate-900 tracking-tight">VegFrash</span>
                            </Link>
                            <Link href="/account" className="p-2 bg-slate-50 rounded-full text-slate-600">
                                <User size={20} />
                            </Link>
                        </div>

                        {/* Mobile Search */}
                        <div className="relative" ref={searchRef}>
                            <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                            <input
                                type="text"
                                className="w-full bg-slate-100 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-brand/20 placeholder:text-slate-400"
                                placeholder={placeholder}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => searchQuery.length > 1 && setShowResults(true)}
                            />
                            {/* Mobile Dropdown (Same Logic) */}
                            {showResults && (
                                <div className="absolute top-12 left-0 right-0 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden max-h-[300px] overflow-y-auto">
                                    {isSearching ? (
                                        <div className="p-4 text-center"><Loader2 className="animate-spin inline" size={16} /></div>
                                    ) : searchResults.length > 0 ? (
                                        <div className="divide-y divide-slate-100">
                                            {searchResults.map(p => (
                                                <Link href={`/product/${p.id}`} key={p.id} className="flex gap-3 p-3 active:bg-slate-50">
                                                    <div className="w-8 h-8 bg-slate-100 rounded"><img src={p.image} className="w-full h-full object-cover rounded" /></div>
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-800">{p.name}</p>
                                                        <p className="text-[10px] text-slate-500">₹{p.price}</p>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-4 text-center text-xs text-slate-400">No matches</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
}

// Helper Comp for User Menu to keep code clean
function UserMenu({ user, supabase }: any) {
    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/login';
    };

    const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Guest';
    const avatarUrl = user?.user_metadata?.avatar_url;

    return (
        <div className="relative group">
            <button className="flex items-center gap-3 p-1 rounded-full hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 bg-gradient-to-br from-brand to-teal-600 rounded-full flex items-center justify-center text-white shadow-md overflow-hidden border-2 border-white">
                    {avatarUrl ? (
                        <img src={avatarUrl} className="w-full h-full object-cover" alt="User" />
                    ) : (
                        <User size={20} />
                    )}
                </div>
                <div className="text-left hidden xl:block">
                    <p className="text-xs text-slate-500">Welcome</p>
                    <p className="text-sm font-bold text-slate-800 line-clamp-1 max-w-[100px] capitalize">{displayName}</p>
                </div>
                <ChevronDown size={14} className="text-slate-400" />
            </button>
            <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 p-2 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all transform origin-top-right z-50">
                {user ? (
                    <>
                        <div className="px-3 py-2 border-b border-slate-50 mb-1">
                            <p className="text-xs text-slate-400">Signed in as</p>
                            <p className="text-sm font-bold text-slate-800 truncate">{user.email}</p>
                        </div>
                        <Link href="/account" className="flex items-center gap-3 px-3 py-2.5 hover:bg-brand/5 text-sm font-medium text-slate-700 rounded-lg transition-colors">
                            <User size={16} className="text-brand" /> My Account
                        </Link>
                        <Link href="/orders" className="flex items-center gap-3 px-3 py-2.5 hover:bg-brand/5 text-sm font-medium text-slate-700 rounded-lg transition-colors">
                            <Package size={16} className="text-brand" /> My Orders
                        </Link>
                        <button onClick={handleLogout} className="w-full text-left flex items-center gap-3 px-3 py-2.5 hover:bg-red-50 text-sm font-medium text-red-600 rounded-lg transition-colors mt-1">
                            <LogOut size={16} /> Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link href="/login" className="flex items-center justify-center w-full bg-brand text-white font-bold text-sm py-2.5 rounded-lg hover:bg-brand-dark transition-colors mb-2">
                            Login / Signup
                        </Link>
                        <p className="text-[10px] text-center text-slate-400">Access orders & offers!</p>
                    </>
                )}
            </div>
        </div>
    )
}
