
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

// ---------------------------------------------------------------------------
// Origin helper — resolves host/protocol correctly for any deployment.
// Handles Vercel proxy headers, localhost dev, preview URLs, and production.
// ---------------------------------------------------------------------------
export function getOrigin(req: Request): {
    host: string;
    rootDomain: string;
    isSecure: boolean;
} {
    // Vercel (and most reverse-proxies) forward the real public host here
    const host =
        req.headers.get('x-forwarded-host') ||
        req.headers.get('host') ||
        'localhost:3000';
    const proto =
        req.headers.get('x-forwarded-proto') ||
        (host.includes('localhost') ? 'http' : 'https');
    return {
        host,
        rootDomain: `${proto}://${host}`,
        isSecure: !host.includes('localhost'),
    };
}

// Shared cookie-options factory — keeps httpOnly/secure/sameSite consistent
export function buildCookieOpts(
    isSecure: boolean,
    maxAge: number
): {
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'lax';
    path: string;
    maxAge: number;
} {
    return { httpOnly: true, secure: isSecure, sameSite: 'lax', path: '/', maxAge };
}

export async function getUserIdFromRequest() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return null;

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret');
        const { payload } = await jwtVerify(token, secret);
        return payload.userId as string;
    } catch (error) {
        return null;
    }
}

export async function getUserFromToken() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return null;

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret');
        const { payload } = await jwtVerify(token, secret);
        return {
            userId: payload.userId as string,
            username: payload.username as string,
            isAdmin: payload.isAdmin as boolean,
        };
    } catch (error) {
        return null;
    }
}
