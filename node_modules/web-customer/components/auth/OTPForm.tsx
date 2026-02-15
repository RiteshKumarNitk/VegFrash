'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';

export default function OTPForm() {
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Validate phone (Simple check for India +91)
        const formattedPhone = phone.startsWith('+91') ? phone : `+91${phone}`;

        const { error } = await supabase.auth.signInWithOtp({
            phone: formattedPhone,
        });

        if (error) {
            alert(error.message);
        } else {
            setStep('OTP');
        }
        setLoading(false);
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const formattedPhone = phone.startsWith('+91') ? phone : `+91${phone}`;

        const { error } = await supabase.auth.verifyOtp({
            phone: formattedPhone,
            token: otp,
            type: 'sms',
        });

        if (error) {
            alert(error.message);
        } else {
            // Redirect or update state
            window.location.href = '/';
        }
        setLoading(false);
    };

    return (
        <div className="w-full max-w-sm mx-auto p-6 bg-white rounded-xl shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                {step === 'PHONE' ? 'Login' : 'Verify OTP'}
            </h2>

            {step === 'PHONE' ? (
                <form onSubmit={handleSendOTP} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="98765 43210"
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[color:var(--color-primary)] outline-none"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-[color:var(--color-primary)] text-white font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {loading ? 'Sending...' : 'Send OTP'}
                    </button>
                </form>
            ) : (
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                    <div className="text-sm text-center text-gray-500 mb-4">
                        Sent to {phone} <button type="button" onClick={() => setStep('PHONE')} className="text-[color:var(--color-primary)] font-bold">Change</button>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Enter OTP</label>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="123456"
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[color:var(--color-primary)] outline-none text-center tracking-widest text-xl"
                            maxLength={6}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-[color:var(--color-primary)] text-white font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {loading ? 'Verifying...' : 'Verify & Login'}
                    </button>
                </form>
            )}
        </div>
    );
}
