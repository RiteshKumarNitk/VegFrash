'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase'; // Access shared or local supabase lib
import { useRouter } from 'next/navigation';

// Hardcoded for demo or use Real Auth
export default function StoreLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // For Phase 2 Demo: We can simulate login or use Supabase
        // If using Supabase, we need to have created a user with role 'store_manager'
        // Let's assume there is one.

        // For now, simple client-side check to unblock
        if (email.includes('@vegfrash.com') && password.length > 5) {
            // Mock Success
            document.cookie = "store_auth=true; path=/";
            router.push('/orders');
        } else {
            alert("Invalid Store Credentials");
        }
        setLoading(false);
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
                        className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded transition-colors"
                    >
                        {loading ? 'Verifying...' : 'ACCESS DASHBOARD'}
                    </button>
                </form>
            </div>
        </div>
    )
}
