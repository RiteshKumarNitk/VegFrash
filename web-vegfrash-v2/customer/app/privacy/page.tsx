'use client';
import ModernHeader from '@/components/ui/ModernHeader';
import Footer from '@/components/ui/Footer';

export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-white">
            <ModernHeader deviceType="mobile" />
            <div className="max-w-4xl mx-auto px-4 py-16 text-slate-700 leading-relaxed">
                <h1 className="text-3xl font-black mb-8 text-slate-800">Privacy Policy</h1>
                <p className="mb-4">Your privacy is important to us. This policy explains how we handle your data.</p>

                <h2 className="text-xl font-bold mt-8 mb-4 text-slate-800">1. Data Collection</h2>
                <p>We collect your phone number, name, and address to process your orders. We also collect location data to provide hyperlocal delivery services.</p>

                <h2 className="text-xl font-bold mt-8 mb-4 text-slate-800">2. Usage of Data</h2>
                <p>Your data is used only for fulfilling orders, improving our service, and sending you relevant updates about your deliveries.</p>

                <h2 className="text-xl font-bold mt-8 mb-4 text-slate-800">3. Third Parties</h2>
                <p>We do not sell your personal information. Data is only shared with delivery partners and secure payment gateways necessary to process your request.</p>

                <h2 className="text-xl font-bold mt-8 mb-4 text-slate-800">4. Security</h2>
                <p>We use industry-standard encryption to protect your account information and transaction details.</p>

                <p className="mt-12 text-sm text-slate-500 italic">Last updated: February 2026</p>
            </div>
            <Footer />
        </main>
    );
}
