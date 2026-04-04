import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { prisma } from '@/lib/db';
import { generatePMUID } from '@/lib/pmuid';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const rawState = searchParams.get('state') || '{}';
    const error = searchParams.get('error');

    const host = req.headers.get('host') || 'localhost:3000';
    const rootDomain = host.includes('localhost') ? `http://${host}` : 'https://bidwars.xyz';

    if (error) {
        return NextResponse.redirect(`${rootDomain}/login?error=Google auth failed: ${error}`);
    }
    if (!code) {
        return NextResponse.redirect(`${rootDomain}/login?error=No code provided`);
    }

    try {
        // Parse state — backwards compatible with old plain-string username state
        let username = '';
        let mode = 'login';
        try {
            const parsed = JSON.parse(rawState);
            username = parsed.username || '';
            mode = parsed.mode || 'login';
        } catch {
            username = rawState; // old format fallback
        }

        // Exchange code for token
        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                code,
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                redirect_uri: `${rootDomain}/api/auth/google/callback`,
                grant_type: 'authorization_code',
            }),
        });
        const tokenData = await tokenRes.json();
        if (!tokenRes.ok) throw new Error(tokenData.error_description || 'Token exchange failed');

        const { access_token } = tokenData;

        // Fetch Google user info
        const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${access_token}` },
        });
        const googleUser = await userRes.json();

        // Try to find existing user by email first
        let user = await prisma.user.findUnique({ where: { email: googleUser.email } });
        const isNewUser = !user;

        if (!user) {
            // New user — create with chosen username (or derive from email)
            const targetUsername = username || googleUser.email.split('@')[0];
            let finalUsername = targetUsername;
            const taken = await prisma.user.findUnique({ where: { username: targetUsername } });
            if (taken) finalUsername = `${googleUser.email.split('@')[0]}_${Math.floor(Math.random() * 9000) + 1000}`;

            user = await prisma.user.create({
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
        } else {
            // Existing user — backfill email / picture if missing
            if (!user.email || !user.profileImage) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        email: user.email ?? googleUser.email,
                        profileImage: user.profileImage ?? googleUser.picture,
                    },
                });
            }
        }

        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret');

        // --- ROUTING LOGIC ---
        // New user coming from signup flow → take them to google-complete (PFP + parent link)
        if (isNewUser && mode === 'signup') {
            // Issue a short-lived pending JWT (no full session yet)
            const pendingToken = await new SignJWT({ pendingUserId: user.id, isPending: true })
                .setProtectedHeader({ alg: 'HS256' })
                .setExpirationTime('30m')
                .sign(secret);

            const res = NextResponse.redirect(`${rootDomain}/signup/google-complete`);
            res.cookies.set('pending_google_token', pendingToken, {
                httpOnly: true,
                secure: !host.includes('localhost'),
                sameSite: 'lax',
                path: '/',
                maxAge: 30 * 60,
            });
            return res;
        }

        // Existing user or login mode → issue full JWT and go home
        const token = await new SignJWT({
            userId: user.id,
            username: user.username,
            isAdmin: user.isAdmin,
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('30d')
            .sign(secret);

        const res = NextResponse.redirect(`${rootDomain}/home`);
        res.cookies.set('token', token, {
            httpOnly: true,
            secure: !host.includes('localhost'),
            sameSite: 'lax',
            path: '/',
            maxAge: 30 * 24 * 60 * 60,
        });
        return res;

    } catch (err) {
        console.error('[Google Callback Error]', err);
        return NextResponse.redirect(`${rootDomain}/login?error=Google integration error: ${(err as Error).message}`);
    }
}
