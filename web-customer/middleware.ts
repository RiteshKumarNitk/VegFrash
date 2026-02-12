import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
// import { DEFAULT_THEME, FestivalConfig } from '@/types/theme' // Cannot import local files in middleware easily in Vercel/Edge sometimes without proper config, but here standard nextjs. 
// We will simply fetch logic here.

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // Create a simple Supabase client for the server (Middleware context)
    // Note: Middleware runs on Edge, so ensure Supabase client is compatible
    // Create a simple Supabase client for the server (Middleware context)
    // Note: Middleware runs on Edge, so ensure Supabase client is compatible
    try {
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll()
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                        response = NextResponse.next({
                            request: {
                                headers: request.headers,
                            },
                        })
                        cookiesToSet.forEach(({ name, value, options }) =>
                            response.cookies.set(name, value, options)
                        )
                    },
                },
            }
        )

        // Fetch active theme from site_settings (Unified Settings System)
        const { data: themeSetting } = await supabase
            .from('site_settings')
            .select('value')
            .eq('key', 'theme_config')
            .single()

        const themeConfig = themeSetting?.value;

        if (themeConfig) {
            response.headers.set('X-Theme-Primary', themeConfig.brand_color || '#0C831F')
            response.headers.set('X-Theme-Gradient', themeConfig.gradient || 'from-orange-500 via-red-500 to-yellow-500')
            response.headers.set('X-Theme-Festival', themeConfig.festival_mode ? 'true' : 'false')
        } else {
            // Fallback default (VegFrash Green)
            response.headers.set('X-Theme-Primary', '#0C831F')
            response.headers.set('X-Theme-Gradient', 'from-orange-500 via-red-500 to-yellow-500')
            response.headers.set('X-Theme-Festival', 'false')
        }

    } catch (e) {
        // Fallback on error (or missing env vars)
        console.error("Middleware Supabase Error (Check Env Vars):", e);
        response.headers.set('X-Theme-Primary', '#0C831F')
    }

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
