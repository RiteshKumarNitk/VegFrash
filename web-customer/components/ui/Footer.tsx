'use client';

import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 hidden lg:block">
            <div className="max-w-7xl mx-auto px-4 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

                    {/* Brand Column */}
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center text-white text-2xl">
                                🍃
                            </div>
                            <div>
                                <h1 className="text-2xl font-extrabold text-white tracking-tight">Veg<span className="text-brand">Frash</span></h1>
                            </div>
                        </div>
                        <p className="text-sm leading-relaxed mb-6 text-slate-400">
                            Freshness you can taste, quality you can trust. Use code FEST50 for 50% off your first order!
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-brand transition-colors text-white">
                                <Facebook size={16} />
                            </a>
                            <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-brand transition-colors text-white">
                                <Instagram size={16} />
                            </a>
                            <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-brand transition-colors text-white">
                                <Twitter size={16} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-6">Quick Links</h3>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="/" className="hover:text-brand transition-colors">Home</Link></li>
                            <li><Link href="/about" className="hover:text-brand transition-colors">About VegFrash</Link></li>
                            <li><Link href="/contact" className="hover:text-brand transition-colors">Help & Support</Link></li>
                            <li><Link href="/account" className="hover:text-brand transition-colors">My Account</Link></li>
                        </ul>
                    </div>

                    {/* Categories */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-6">Popular Categories</h3>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="/category/vegetables" className="hover:text-brand transition-colors">Fresh Vegetables</Link></li>
                            <li><Link href="/category/fruits" className="hover:text-brand transition-colors">Seasonal Fruits</Link></li>
                            <li><Link href="/category/dairy-bread-eggs" className="hover:text-brand transition-colors">Dairy & Eggs</Link></li>
                            <li><Link href="/category/snacks-munchies" className="hover:text-brand transition-colors">Snacks & Munchies</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-6">Download Our App</h3>
                        <p className="text-sm text-slate-400 mb-6">Experience the fastest delivery. Coming soon to Play Store & App Store.</p>
                        <div className="flex gap-3">
                            <div className="bg-slate-800 px-4 py-2 rounded-xl flex items-center gap-3 border border-slate-700">
                                <span className="text-xl">🤖</span>
                                <div className="text-left">
                                    <p className="text-[10px] uppercase font-bold text-slate-500">Get it on</p>
                                    <p className="text-xs font-bold text-white">Google Play</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
                    <p>&copy; 2026 VegFrash Powered by Freshness. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link href="/privacy" className="hover:text-white transition-colors underline-offset-4 hover:underline">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-white transition-colors underline-offset-4 hover:underline">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
