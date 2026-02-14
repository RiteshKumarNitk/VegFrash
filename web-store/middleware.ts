import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    // Completely simplified middleware - No Supabase initialization here
    // This prevents all Vercel 500 Middleware errors
    return NextResponse.next()
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
