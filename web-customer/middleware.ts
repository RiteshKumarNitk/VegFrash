import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
// import { DEFAULT_THEME, FestivalConfig } from '@/types/theme' // Cannot import local files in middleware easily in Vercel/Edge sometimes without proper config, but here standard nextjs. 
// We will simply fetch logic here.

export async function middleware(request: NextRequest) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    console.log("Middleware Debug:", {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseAnonKey
    })

    // Early exit if env vars are missing
    if (!supabaseUrl || !supabaseAnonKey) {
        return NextResponse.next()
    }

    let response = NextResponse.next()

    try {
        const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
            cookies: {
                getAll() { return request.cookies.getAll() },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    response = NextResponse.next()
                    cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
                },
            },
        })

        // Simple check to ensure client works
        await supabase.auth.getSession()

    } catch (e) {
        console.error("Middleware crash caught:", e)
    }

    // Default theme headers for now
    response.headers.set('X-Theme-Primary', '#0C831F')
    response.headers.set('X-Theme-Gradient', 'from-orange-500 via-red-500 to-yellow-500')
    response.headers.set('X-Theme-Festival', 'false')

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
