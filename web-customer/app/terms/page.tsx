'use client';
import ModernHeader from '@/components/ui/ModernHeader';
import Footer from '@/components/ui/Footer';

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-white">
            <ModernHeader deviceType="mobile" />
            <div className="max-w-4xl mx-auto px-4 py-16 text-slate-700 leading-relaxed">
                <h1 className="text-3xl font-black mb-8 text-slate-800">Terms of Service</h1>
                <p className="mb-4">Welcome to VegFrash. By using our services, you agree to these terms.</p>

                <h2 className="text-xl font-bold mt-8 mb-4 text-slate-800">1. Service Eligibility</h2>
                <p>You must be at least 18 years old to use our delivery services.</p>

                <h2 className="text-xl font-bold mt-8 mb-4 text-slate-800">2. Ordering & Delivery</h2>
                <p>We aim for 10-minute delivery but times may vary based on location and demand. Minimum order values and delivery fees apply as shown at checkout.</p>

                <h2 className="text-xl font-bold mt-8 mb-4 text-slate-800">3. Cancellations & Returns</h2>
                <p>Fresh produce can only be returned at the time of delivery if quality is unsatisfied. Once delivered, fresh items are non-returnable due to hygiene reasons.</p>

                <h2 className="text-xl font-bold mt-8 mb-4 text-slate-800">4. Payments</h2>
                <p>We accept various online and cash-on-delivery payment methods. All prices are inclusive of taxes unless stated otherwise.</p>

                <p className="mt-12 text-sm text-slate-500 italic">Last updated: February 2026</p>
            </div>
            <Footer />
        </main>
    );
}
