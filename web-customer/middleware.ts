import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    // Simplified middleware - serving static headers for themes
    const response = NextResponse.next()

    // Default theme headers (Safe for Vercel)
    response.headers.set('X-Theme-Primary', '#0C831F')
    response.headers.set('X-Theme-Gradient', 'from-orange-500 via-red-500 to-yellow-500')
    response.headers.set('X-Theme-Festival', 'false')

    return response
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
