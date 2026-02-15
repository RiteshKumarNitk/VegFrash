'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
    const [step, setStep] = useState<'email' | 'verify'>('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const supabase = createClient();
    const router = useRouter();

    // Step 1: Send OTP to Email
    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg(null);

        try {
            // We use signInWithOtp with shouldCreateUser: true
            // This sends a code to the email
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: { shouldCreateUser: true }
            });

            if (error) throw error;
            setStep('verify');
        } catch (err: any) {
            setErrorMsg(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP and Set Password
    const handleVerifyAndCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg(null);

        try {
            // 1. Verify the OTP
            const { data, error: verifyError } = await supabase.auth.verifyOtp({
                email,
                token: otp,
                type: 'email',
            });

            if (verifyError) throw verifyError;
            if (!data.session) throw new Error('Verification failed. No session created.');

            // 2. OTP Verified & Logged In -> Now Set the Password
            const { error: updateError } = await supabase.auth.updateUser({
                password: password
            });

            if (updateError) throw updateError;

            // Success! Account fully setup with Password
            router.push('/');
            router.refresh();

        } catch (err: any) {
            setErrorMsg(err.message || 'Failed to verify and create account');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
                    Create Account
                </h2>
                <p className="mt-2 text-center text-sm text-slate-600">
                    Sign up to start ordering
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 border border-slate-100">

                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-slate-800">
                            {step === 'email' ? 'Enter Email' : 'Verify & Set Password'}
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">
                            {step === 'email'
                                ? 'We will send you a verification code'
                                : `Enter the code sent to ${email} and set your new password`
                            }
                        </p>
                    </div>

                    <form className="space-y-6" onSubmit={step === 'email' ? handleSendOtp : handleVerifyAndCreate}>
                        {errorMsg && (
                            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md border border-red-100 animate-in fade-in">
                                {errorMsg}
                            </div>
                        )}

                        {step === 'email' ? (
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                                    Email Address
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="email"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@gmail.com"
                                        className="appearance-none block w-full px-3 py-3 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="otp" className="block text-sm font-medium text-slate-700">
                                        OTP Code
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            id="otp"
                                            type="text"
                                            required
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            placeholder="123456"
                                            className="appearance-none block w-full px-3 py-3 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm tracking-widest font-bold text-center text-lg"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="pass" className="block text-sm font-medium text-slate-700">
                                        Create Password
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            id="pass"
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Min 6 characters"
                                            minLength={6}
                                            className="appearance-none block w-full px-3 py-3 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="text-right">
                                    <button
                                        type="button"
                                        onClick={() => setStep('email')}
                                        className="text-xs text-brand hover:underline"
                                    >
                                        Change Email
                                    </button>
                                </div>
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-brand hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand disabled:opacity-70 transition-colors"
                            >
                                {loading
                                    ? 'Processing...'
                                    : (step === 'email' ? 'Send OTP' : 'Create Account')
                                }
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 flex flex-col items-center justify-center gap-4">
                        <div className="text-sm">
                            <span className="text-slate-500">
                                Already have an account?
                            </span>
                            <Link href="/login" className="ml-2 font-medium text-brand hover:text-brand-dark">
                                Login
                            </Link>
                        </div>

                        <div className="w-full pt-4 border-t border-slate-100">
                            <p className="text-[10px] text-slate-400 uppercase font-black mb-2 text-center">Developer Tools</p>
                            <button
                                type="button"
                                onClick={() => {
                                    alert("Bypass: If you see 'Email not confirmed' error on login, you must manually confirm the user in Supabase Dashboard -> Auth -> Users.");
                                    setStep('verify');
                                }}
                                className="w-full text-brand/60 hover:text-brand text-xs font-bold underline"
                            >
                                I am stuck at verification / No email received
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
