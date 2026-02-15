import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key) {
        // Safe fallback for build server or local dev without env vars
        console.warn("Supabase environment variables are missing. Using mock client or returning null.");

        if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
            throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in production client-side.");
        }

        // Return a partially functional client or similar if possible, 
        // but for now, we minimize the throw to only critical runtime cases.
        // During build (server-side), we allow it to return createBrowserClient with empty strings 
        // to avoid crashing the build of dynamic-only pages.
        return createBrowserClient(url || '', key || '');
    }

    return createBrowserClient(url, key);
}
