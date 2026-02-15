import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key) {
        console.warn("Supabase environment variables are missing during build/server execution.");
        if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
            throw new Error('Supabase URL and Anon Key must be provided as environment variables in production.');
        }
        return createBrowserClient(url || '', key || '');
    }

    return createBrowserClient(url, key)
}
