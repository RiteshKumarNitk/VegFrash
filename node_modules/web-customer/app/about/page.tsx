'use client';
import ModernHeader from '@/components/ui/ModernHeader';
import Footer from '@/components/ui/Footer';
import { Leaf, Award, Truck, ShieldCheck } from 'lucide-react';

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-white">
            <ModernHeader deviceType="mobile" />

            {/* Hero Section */}
            <div className="relative bg-brand-light py-20 px-4 overflow-hidden">
                <div className="max-w-7xl mx-auto relative z-10 text-center">
                    <h1 className="text-4xl md:text-6xl font-black text-slate-800 mb-6 tracking-tight">
                        Freshness That <span className="text-brand">Matters.</span>
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        VegFrash is your neighborhood's most trusted source for farm-fresh vegetables and daily essentials, delivered to your doorstep in minutes.
                    </p>
                </div>
                <div className="absolute top-0 right-0 opacity-10 blur-2xl">
                    <div className="w-96 h-96 bg-brand rounded-full"></div>
                </div>
            </div>

            {/* Values */}
            <div className="max-w-7xl mx-auto px-4 py-24">
                <div className="grid md:grid-cols-4 gap-12">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-brand/10 rounded-2xl flex items-center justify-center text-brand mx-auto mb-6">
                            <Leaf size={32} />
                        </div>
                        <h3 className="font-bold text-slate-800 text-xl mb-3">100% Organic</h3>
                        <p className="text-sm text-slate-500">Carefully sourced from local farmers who prioritize quality over quantity.</p>
                    </div>
                    <div className="text-center">
                        <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto mb-6">
                            <Truck size={32} />
                        </div>
                        <h3 className="font-bold text-slate-800 text-xl mb-3">Instant Delivery</h3>
                        <p className="text-sm text-slate-500">Our hyperlocal network ensures your greens arrive as fresh as they were harvested.</p>
                    </div>
                    <div className="text-center">
                        <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mx-auto mb-6">
                            <Award size={32} />
                        </div>
                        <h3 className="font-bold text-slate-800 text-xl mb-3">Quality First</h3>
                        <p className="text-sm text-slate-500">Every single piece of produce undergoes a rigorous 3-step quality check.</p>
                    </div>
                    <div className="text-center">
                        <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mx-auto mb-6">
                            <ShieldCheck size={32} />
                        </div>
                        <h3 className="font-bold text-slate-800 text-xl mb-3">Safe & Secure</h3>
                        <p className="text-sm text-slate-500">Strict hygiene protocols and contact-less delivery for your peace of mind.</p>
                    </div>
                </div>
            </div>

            {/* Our Story */}
            <div className="bg-slate-50 py-24">
                <div className="max-w-4xl mx-auto px-4">
                    <h2 className="text-3xl font-bold text-slate-800 mb-8 border-l-4 border-brand pl-6">Our Journey</h2>
                    <div className="space-y-6 text-slate-600 leading-relaxed text-lg">
                        <p>
                            Founded in 2026, VegFrash started with a simple observation: finding truly fresh, chemical-free vegetables in the city was becoming a luxury. We wanted to change that.
                        </p>
                        <p>
                            What began as a small pilot in one neighborhood has now grown into a technology-driven fresh produce powerhouse. We leverage data and smart logistics to bridge the gap between rural farmers and urban kitchens.
                        </p>
                        <p>
                            Today, we serve thousands of families every morning, ensuring that "Fresh" isn't just a label—it's a promise we keep every single day.
                        </p>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
