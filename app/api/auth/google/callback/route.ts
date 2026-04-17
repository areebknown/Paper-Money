import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { prisma } from '@/lib/db';
import { generatePMUID } from '@/lib/pmuid';
import { getOrigin } from '@/lib/auth';

/**
 * Google OAuth callback handler.
 *
 * KEY DESIGN: we do NOT set any cookies here. Browsers may silently discard
 * Set-Cookie headers on responses to cross-site redirects (the request arrives
 * from accounts.google.com, a different origin). Instead we:
 *
 *  1. Exchange the code for a Google access token
 *  2. Resolve / create the local user
 *  3. Mint a short-lived "relay" JWT containing the user info
 *  4. Redirect to /api/auth/google/set-cookie?relay=<token>&next=<path>
 *     — that route is same-origin, so its Set-Cookie is always honoured.
 */
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const rawState = searchParams.get('state') || '{}';
    const googleError = searchParams.get('error');

    const { rootDomain } = getOrigin(req);

    // Helper — redirect to login with a visible error message
    const loginError = (msg: string) =>
        NextResponse.redirect(
            `${rootDomain}/login?error=${encodeURIComponent(msg)}`
        );

    if (googleError) {
        return loginError('Google sign-in was cancelled or denied.');
    }
    if (!code) {
        return loginError('No authorisation code received from Google. Please try again.');
    }

    try {
        // ── Parse state (backwards-compatible with old plain-string format) ──────
        let username = '';
        let mode = 'login';
        try {
            const parsed = JSON.parse(rawState);
            username = parsed.username || '';
            mode = parsed.mode || 'login';
        } catch {
            username = rawState; // old format fallback
        }

        // ── Exchange code → access token ─────────────────────────────────────────
        const tokenParams = new URLSearchParams({
            code,
            client_id: process.env.GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
            redirect_uri: `${rootDomain}/api/auth/google/callback`,
            grant_type: 'authorization_code',
        });

        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: tokenParams.toString(),
        });
        const tokenData = await tokenRes.json();
        if (!tokenRes.ok) {
            throw new Error(
                tokenData.error_description || tokenData.error || 'Token exchange with Google failed'
            );
        }

        // ── Fetch Google profile ─────────────────────────────────────────────────
        const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });
        if (!userRes.ok) throw new Error('Failed to fetch Google profile');
        const googleUser = await userRes.json();

        if (!googleUser.email) throw new Error('Google account has no email address');

        // ── Look up existing user ────────────────────────────────────────────────
        const existingUser = await prisma.user.findUnique({
            where: { email: googleUser.email },
        });

        // ── Guard: login mode requires an existing account ───────────────────────
        // We must not silently create an account when the user expected to log in.
        if (!existingUser && mode === 'login') {
            return loginError(
                'No account found for this Google address. Please sign up first.'
            );
        }

        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret');

        // ── New user — signup path ───────────────────────────────────────────────
        if (!existingUser) {
            // Derive a username from the chosen name or the email prefix
            const base = username || googleUser.email.split('@')[0];
            let finalUsername = base;
            const taken = await prisma.user.findUnique({ where: { username: base } });
            if (taken) {
                finalUsername = `${googleUser.email.split('@')[0]}_${Math.floor(Math.random() * 9000) + 1000}`;
            }

            const newUser = await prisma.user.create({
                data: {
                    email: googleUser.email,
                    username: finalUsername,
                    realName: googleUser.name,
                    profileImage: googleUser.picture,
                    isMainAccount: false,
                    publicId: await generatePMUID(),
                    balance: 0,
                },
            });

            // Issue a short-lived pending relay token (no full session yet)
            const pendingRelay = await new SignJWT({
                pendingUserId: newUser.id,
                isPending: true,
            })
                .setProtectedHeader({ alg: 'HS256' })
                .setExpirationTime('30m')
                .sign(secret);

            const relayUrl = new URL(`${rootDomain}/api/auth/google/set-cookie`);
            relayUrl.searchParams.set('relay', pendingRelay);
            relayUrl.searchParams.set('next', '/signup/google-complete');
            return NextResponse.redirect(relayUrl.toString());
        }

        // ── Existing user — backfill any missing fields ──────────────────────────
        if (!existingUser.email || !existingUser.profileImage) {
            await prisma.user.update({
                where: { id: existingUser.id },
                data: {
                    email: existingUser.email ?? googleUser.email,
                    profileImage: existingUser.profileImage ?? googleUser.picture,
                },
            });
        }

        // ── Existing user — issue login relay token ──────────────────────────────
        // Short-lived (2 min) — only used to carry user info to the set-cookie route
        const loginRelay = await new SignJWT({
            userId: existingUser.id,
            username: existingUser.username,
            isAdmin: existingUser.isAdmin,
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('2m')
            .sign(secret);

        const relayUrl = new URL(`${rootDomain}/api/auth/google/set-cookie`);
        relayUrl.searchParams.set('relay', loginRelay);
        relayUrl.searchParams.set('next', existingUser.isAdmin ? '/admin' : '/home');
        return NextResponse.redirect(relayUrl.toString());

    } catch (err) {
        console.error('[Google Callback Error]', err);
        return loginError(
            `Google sign-in failed: ${(err as Error).message}`
        );
    }
}
