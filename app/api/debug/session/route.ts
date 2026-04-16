import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

/**
 * Debug endpoint — shows what the server sees in the cookie header.
 * Visit /api/debug/session to diagnose auth issues.
 */
export async function GET(req: Request) {
    const cookieHeader = req.headers.get('cookie') || '';
    const tokenMatch = cookieHeader.match(/(?:^|;\s*)token=([^;]+)/);
    const rawToken = tokenMatch?.[1] || null;

    let decoded: any = null;
    let verifyError: string | null = null;

    if (rawToken) {
        try {
            const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret');
            const { payload } = await jwtVerify(rawToken, secret);
            decoded = {
                userId: payload.userId,
                username: payload.username,
                isAdmin: payload.isAdmin,
                exp: payload.exp ? new Date(payload.exp * 1000).toISOString() : null,
                iat: payload.iat ? new Date(payload.iat * 1000).toISOString() : null,
            };
        } catch (err: any) {
            verifyError = err?.message || 'JWT verification failed';
        }
    }

    return NextResponse.json({
        hasCookie: !!rawToken,
        tokenLength: rawToken?.length ?? 0,
        tokenPrefix: rawToken ? rawToken.substring(0, 20) + '...' : null,
        decoded,
        verifyError,
        NODE_ENV: process.env.NODE_ENV,
        JWT_SECRET_SET: !!process.env.JWT_SECRET,
        JWT_SECRET_LENGTH: process.env.JWT_SECRET?.length ?? 0,
        allCookieNames: cookieHeader
            .split(';')
            .map(c => c.trim().split('=')[0])
            .filter(Boolean),
    });
}
