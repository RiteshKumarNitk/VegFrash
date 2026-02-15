import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware for web-customer
 * Optimized for Vercel Edge Runtime compatibility.
 * 
 * Rules followed:
 * 1. No Supabase client or heavy libraries imported.
 * 2. No non-null assertions (!) for process.env.
 * 3. Added safe guards for missing environment variables.
 * 4. Only uses Edge-compatible APIs.
 * 6. No Node.js-specific APIs.
 * 7. Minimal logic, returns NextResponse.next() correctly.
 * 8. No Supabase initialization.
 */
export async function proxy(request: NextRequest) {
    try {
        // Safe access to environment variables without non-null assertions
        // Requirement 2 & 3
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        // Check if environment variables are configured (Requirement 5/3)
        // We log a warning if they are missing but don't crash the middleware
        if (!supabaseUrl || !supabaseAnonKey) {
            if (process.env.NODE_ENV === 'production') {
                console.warn('Middleware: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing in production environment.')
            }
        }

        // Keep logic minimal (Requirement 7)
        const response = NextResponse.next()

        // Setting theme-related headers (Edge-compatible)
        response.headers.set('X-Theme-Primary', '#0C831F')
        response.headers.set('X-Theme-Gradient', 'from-orange-500 via-red-500 to-yellow-500')
        response.headers.set('X-Theme-Festival', 'false')

        return response
    } catch (error) {
        // Fallback for unexpected errors to prevent 500: MIDDLEWARE_INVOCATION_FAILED
        console.error('Middleware execution error:', error)
        return NextResponse.next()
    }
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
