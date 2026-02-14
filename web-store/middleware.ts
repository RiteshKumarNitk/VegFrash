import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    console.log("Middleware check:", {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseAnonKey,
        keyStart: supabaseAnonKey?.substring(0, 10)
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

        const { data: { user } } = await supabase.auth.getUser()

        const isLoginPage = request.nextUrl.pathname.startsWith('/login')
        const isSignupPage = request.nextUrl.pathname.startsWith('/signup')

        if (!user && !isLoginPage && !isSignupPage) {
            return NextResponse.redirect(new URL('/login', request.url))
        }

        if (user && isLoginPage) {
            return NextResponse.redirect(new URL('/', request.url))
        }
    } catch (e) {
        console.error("Middleware crash caught:", e)
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
