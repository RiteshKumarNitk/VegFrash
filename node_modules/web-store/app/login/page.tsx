'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase'; // Access shared or local supabase lib
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Hardcoded for demo or use Real Auth
export default function StoreLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const supabase = createClient();
            const { error, data } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                // Better error messages
                if (error.message.includes("Email not confirmed")) {
                    alert("Account exists but email is not confirmed. Please check your inbox or use Supabase dashboard to auto-confirm.");
                } else {
                    alert("Login Failed: " + error.message);
                }
                console.error("Auth Error:", error);
            } else if (data.session) {
                // Successful login
                console.log("Login Success, redirecting...");
                // Force a full reload to ensure middleware sees the new session cookie immediately
                window.location.href = '/';
            }
        } catch (err: any) {
            alert("An unexpected error occurred: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDemoLogin = async () => {
        setEmail('admin@vegfrash.com');
        setPassword('admin123');
        // Let them click the button themselves so they see the credentials
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-slate-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-slate-700">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Dark Store Login</h1>
                    <p className="text-slate-400">Restricted Access only</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-slate-300 mb-2">Store ID / Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white focus:border-green-500 outline-none"
                            placeholder="store1@vegfrash.com"
                        />
                    </div>
                    <div>
                        <label className="block text-slate-300 mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white focus:border-green-500 outline-none"
                            placeholder="••••••"
                        />
                    </div>

                    <button
                        disabled={loading}
                        className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded transition-colors active:scale-95 disabled:opacity-50"
                    >
                        {loading ? 'Verifying...' : 'ACCESS DASHBOARD'}
                    </button>

                    <div className="flex flex-col gap-4 text-center pt-4">
                        <button
                            type="button"
                            onClick={handleDemoLogin}
                            className="text-emerald-500 hover:text-emerald-400 text-xs font-bold border border-emerald-500/30 py-2 rounded-lg"
                        >
                            Fill Demo Admin Credentials
                        </button>
                        <Link href="/signup" className="text-slate-400 hover:text-white text-sm">
                            Need an account? Register
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    )
}
