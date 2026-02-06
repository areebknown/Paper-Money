
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;

    // Paths that require authentication
    if (
        request.nextUrl.pathname.startsWith('/home') ||
        request.nextUrl.pathname.startsWith('/send') ||
        request.nextUrl.pathname.startsWith('/history') ||
        request.nextUrl.pathname.startsWith('/profile')
    ) {
        if (!token) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        try {
            const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret');
            await jwtVerify(token, secret);
            return NextResponse.next();
        } catch (error) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // Redirect to dashboard if already logged in and visiting login/signup
    if (
        (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup' || request.nextUrl.pathname === '/') &&
        token
    ) {
        try {
            const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret');
            await jwtVerify(token, secret);
            return NextResponse.redirect(new URL('/home', request.url));
        } catch (error) {
            // Token invalid, allow access to login/signup
        }
    }

    // If at root and not logged in, redirect to login
    if (request.nextUrl.pathname === '/' && !token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
