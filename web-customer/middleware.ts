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

    // Fetch active theme
    // We use a simple select. caching effectively is important here but for MVP we fetch.
    // In production, we might want to use Vercel KV or Edge Config for this.
    try {
        const { data: theme } = await supabase
            .from('active_themes')
            .select('theme_id, festival_calendar(*)')
            .eq('is_active', true)
            .single()

        // Force cast to any to handle Supabase join return type (which can be array or object depending on inference)
        const themeData = theme as any;
        // Check if festival_calendar is an array (sometimes happens with joins) or object
        const festivalData = Array.isArray(themeData?.festival_calendar)
            ? themeData?.festival_calendar[0]
            : themeData?.festival_calendar;

        const themeConfig = festivalData?.config_json;

        if (themeConfig) {
            response.headers.set('X-Theme-Primary', themeConfig.colors?.primary || '#00BFA5')
            response.headers.set('X-Theme-Gradient', themeConfig.colors?.gradient || 'linear-gradient(135deg, #00BFA5, #00897B)')
            response.headers.set('X-Theme-Bg', themeConfig.colors?.background || '#FFFFFF')
        } else {
            // Fallback default
            response.headers.set('X-Theme-Primary', '#00BFA5')
            response.headers.set('X-Theme-Gradient', 'linear-gradient(135deg, #00BFA5, #00897B)')
            response.headers.set('X-Theme-Bg', '#FFFFFF')
        }

    } catch (e) {
        // console.error("Theme fetch error", e)
        // Fallback on error
        response.headers.set('X-Theme-Primary', '#00BFA5')
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
