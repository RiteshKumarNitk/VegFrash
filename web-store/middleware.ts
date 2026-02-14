import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Verify if the key is a valid JWT (Supabase keys always are)
    const isJwt = supabaseAnonKey?.startsWith('eyJ') && supabaseAnonKey?.split('.').length === 3;

    let user = null;

    if (supabaseUrl && supabaseAnonKey && isJwt) {
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
                            response = NextResponse.next({
                                request,
                            })
                            cookiesToSet.forEach(({ name, value, options }) =>
                                response.cookies.set(name, value, options)
                            )
                        },
                    },
                }
            )

            // Get User with safety
            const { data } = await supabase.auth.getUser()
            user = data?.user

        } catch (e) {
            console.error("Middleware Supabase Error:", e)
        }
    } else {
        console.warn("Middleware: Missing Supabase environment variables.")
    }

    // Guard Routes
    if (!user && !request.nextUrl.pathname.startsWith('/login') && !request.nextUrl.pathname.startsWith('/signup')) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Redirect logged-in users away from login
    if (user && request.nextUrl.pathname.startsWith('/login')) {
        return NextResponse.redirect(new URL('/', request.url))
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
