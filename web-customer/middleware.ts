import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
// import { DEFAULT_THEME, FestivalConfig } from '@/types/theme' // Cannot import local files in middleware easily in Vercel/Edge sometimes without proper config, but here standard nextjs. 
// We will simply fetch logic here.

export async function middleware(request: NextRequest) {
    const response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Verify if the key is a valid JWT (Supabase keys always are)
    const isJwt = supabaseAnonKey?.startsWith('eyJ') && supabaseAnonKey?.split('.').length === 3;

    // Fail-safe: if variables are missing or not a JWT, don't crash, just serve default theme
    if (!supabaseUrl || !supabaseAnonKey || !isJwt) {
        if (supabaseAnonKey && !isJwt) {
            console.warn("Middleware: Non-JWT key detected (likely InsForge). Skipping Supabase initialization to prevent crash.");
        } else {
            console.warn("Middleware: Missing Supabase environment variables. Serving default theme.")
        }
        response.headers.set('X-Theme-Primary', '#0C831F')
        response.headers.set('X-Theme-Gradient', 'from-orange-500 via-red-500 to-yellow-500')
        response.headers.set('X-Theme-Festival', 'false')
        return response
    }

    try {
        const supabase = createServerClient(
            supabaseUrl,
            supabaseAnonKey,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll()
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                        const freshResponse = NextResponse.next({
                            request: {
                                headers: request.headers,
                            },
                        })
                        cookiesToSet.forEach(({ name, value, options }) =>
                            freshResponse.cookies.set(name, value, options)
                        )
                    },
                },
            }
        )

        // Fetch active theme from site_settings
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
            response.headers.set('X-Theme-Primary', '#0C831F')
            response.headers.set('X-Theme-Gradient', 'from-orange-500 via-red-500 to-yellow-500')
            response.headers.set('X-Theme-Festival', 'false')
        }

    } catch (e) {
        console.error("Middleware Supabase Error:", e);
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
