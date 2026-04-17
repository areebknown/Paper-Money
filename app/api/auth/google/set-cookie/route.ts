import { NextResponse } from 'next/server';
import { jwtVerify, SignJWT } from 'jose';
import { getOrigin, buildCookieOpts } from '@/lib/auth';

/**
 * Same-origin cookie relay for Google OAuth.
 *
 * WHY THIS EXISTS:
 * Browsers (Safari in particular, and modern Chrome) may silently drop
 * Set-Cookie headers on responses to cross-site redirects. The Google OAuth
 * callback arrives from accounts.google.com — a foreign origin — so any
 * cookies set in that response can be discarded before the browser even
 * follows the Location header.
 *
 * This route is requested directly from the browser's address bar after the
 * callback redirects here. Because the request is now same-origin
 * (bidwars.xyz → bidwars.xyz), Set-Cookie is always honoured.
 *
 * SECURITY:
 * - The relay JWT is short-lived (2 min for login, 30 min for pending signup)
 * - It carries no sensitive credentials on its own; the real JWT is issued here
 * - The `next` path is validated to be a relative URL (no open-redirect)
 */
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const relay = searchParams.get('relay');
    const rawNext = searchParams.get('next') || '/home';

    const { rootDomain, isSecure } = getOrigin(req);

    // Sanitise the destination — only allow relative paths on this origin
    const next = rawNext.startsWith('/') ? rawNext : '/home';

    const loginError = (msg: string) =>
        NextResponse.redirect(
            `${rootDomain}/login?error=${encodeURIComponent(msg)}`
        );

    if (!relay) {
        return loginError('Missing session relay. Please try signing in again.');
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret');

    try {
        const { payload } = await jwtVerify(relay, secret);

        // ── Signup path: relay carries a pending user ID ─────────────────────────
        if (payload.isPending && payload.pendingUserId) {
            const res = NextResponse.redirect(`${rootDomain}${next}`);
            res.cookies.set(
                'pending_google_token',
                relay, // the verified relay token IS the pending token
                buildCookieOpts(isSecure, 30 * 60) // 30 minutes
            );
            return res;
        }

        // ── Login path: relay carries user identity → issue full JWT ─────────────
        if (payload.userId && payload.username !== undefined) {
            const fullToken = await new SignJWT({
                userId: payload.userId,
                username: payload.username,
                isAdmin: payload.isAdmin ?? false,
            })
                .setProtectedHeader({ alg: 'HS256' })
                .setExpirationTime('30d')
                .sign(secret);

            const res = NextResponse.redirect(`${rootDomain}${next}`);
            res.cookies.set(
                'token',
                fullToken,
                buildCookieOpts(isSecure, 30 * 24 * 60 * 60) // 30 days
            );
            return res;
        }

        // Relay token had an unexpected shape
        return loginError('Invalid session token. Please try again.');

    } catch {
        return loginError('Session expired. Please sign in again.');
    }
}
