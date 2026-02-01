'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function StoreSignup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'signup' | 'verify'>('signup');
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMsg(null);

        const supabase = createClient();

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            setMsg("Error: " + error.message);
        } else {
            if (data.user && !data.session) {
                setMsg("Confirmation code sent to email.");
                setStep('verify');
            } else {
                setMsg("Account created! Logging you in...");
                router.refresh();
                router.push('/');
            }
        }
        setLoading(false);
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMsg(null);

        const supabase = createClient();

        const { data, error } = await supabase.auth.verifyOtp({
            email,
            token: otp,
            type: 'signup'
        });

        if (error) {
            setMsg("Verification Error: " + error.message);
        } else {
            setMsg("Verified! Logging in...");
            router.refresh();
            router.push('/');
        }
        setLoading(false);
    };

    return (
        <div className="bg-slate-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-slate-700">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Create Admin Account</h1>
                <p className="text-slate-400">Register new store operator</p>
            </div>

            {msg && (
                <div className={`mb-4 p-3 rounded text-sm ${msg.startsWith('Error') || msg.includes('Error') ? 'bg-red-500/20 text-red-200 border border-red-500/50' : 'bg-green-500/20 text-green-200 border border-green-500/50'}`}>
                    {msg}
                </div>
            )}

            {step === 'signup' ? (
                <form onSubmit={handleSignup} className="space-y-6">
                    <div>
                        <label className="block text-slate-300 mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white focus:border-green-500 outline-none"
                            placeholder="admin@vegfrash.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-slate-300 mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white focus:border-green-500 outline-none"
                            placeholder="Min 6 characters"
                            required
                            minLength={6}
                        />
                    </div>

                    <button
                        disabled={loading}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Creating Account...' : 'REGISTER'}
                    </button>

                    <div className="text-center pt-4">
                        <Link href="/login" className="text-slate-400 hover:text-white text-sm">
                            Already have an account? Login
                        </Link>
                        <button type="button" onClick={() => setStep('verify')} className="block w-full text-slate-500 hover:text-white text-xs mt-4 underline">
                            I already have a code
                        </button>
                    </div>
                </form>
            ) : (
                <form onSubmit={handleVerify} className="space-y-6">
                    <div>
                        <label className="block text-slate-300 mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            readOnly
                            className="w-full bg-slate-900/50 border border-slate-700 rounded p-3 text-slate-400 outline-none cursor-not-allowed"
                        />
                    </div>
                    <div>
                        <label className="block text-slate-300 mb-2">Verification Code</label>
                        <input
                            type="text"
                            value={otp}
                            onChange={e => setOtp(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white focus:border-green-500 outline-none tracking-widest text-center text-xl font-mono"
                            placeholder="123456"
                            required
                        />
                    </div>

                    <button
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Verifying...' : 'VERIFY & LOGIN'}
                    </button>

                    <div className="text-center pt-4">
                        <button type="button" onClick={() => setStep('signup')} className="text-slate-400 hover:text-white text-sm">
                            Back to Signup
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
