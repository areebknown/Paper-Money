
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
            console.log(`[middleware] NO TOKEN on ${request.nextUrl.pathname} — redirecting to /login`);
            return NextResponse.redirect(new URL('/login', request.url));
        }

        try {
            const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret');
            await jwtVerify(token, secret);
            console.log(`[middleware] VALID TOKEN on ${request.nextUrl.pathname}`);
            return NextResponse.next();
        } catch (error: any) {
            console.log(`[middleware] INVALID TOKEN on ${request.nextUrl.pathname}: ${error?.message}`);
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // Redirect to dashboard if already logged in and visiting login/signup
    // EXCEPTION: ?bypass=1 allows reaching login even with a valid session (used by switch-account shadow flow)
    const isBypass = request.nextUrl.searchParams.get('bypass') === '1';
    if (
        !isBypass &&
        (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup') &&
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

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
