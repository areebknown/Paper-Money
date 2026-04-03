import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { prisma } from '@/lib/db';
import { generatePMUID } from '@/lib/pmuid';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state') || ''; // This is our picked username
    const error = searchParams.get('error');

    if (error) {
        const host = req.headers.get('host') || 'localhost:3000';
        const rootDomain = host.includes('localhost') ? `http://${host}` : 'https://wars-bid.vercel.app';
        return NextResponse.redirect(`${rootDomain}/login?error=Google auth failed: ${error}`);
    }

    if (!code) {
        const host = req.headers.get('host') || 'localhost:3000';
        const rootDomain = host.includes('localhost') ? `http://${host}` : 'https://wars-bid.vercel.app';
        return NextResponse.redirect(`${rootDomain}/login?error=No code provided`);
    }

    try {
        const host = req.headers.get('host') || 'localhost:3000';
        const rootDomain = host.includes('localhost') ? `http://${host}` : 'https://wars-bid.vercel.app';

        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
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

        // Fetch user info
        const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${access_token}` },
        });
        const googleUser = await userRes.json();

        // Use the picked username from state if available, otherwise fallback to email prefix
        const targetUsername = state || googleUser.email.split('@')[0];

        // Find or create user — prioritise email match to avoid wrong-user collisions
        let user = await prisma.user.findUnique({ where: { email: googleUser.email } })
            ?? await prisma.user.findUnique({ where: { username: targetUsername } });

        if (!user) {
            // Safe username: if targetUsername is taken by someone else, fall back to email prefix
            let finalUsername = targetUsername;
            const taken = await prisma.user.findUnique({ where: { username: targetUsername } });
            if (taken) finalUsername = googleUser.email.split('@')[0];

            user = await prisma.user.create({
                data: {
                    email: googleUser.email,
                    username: finalUsername,
                    realName: googleUser.name,
                    profileImage: googleUser.picture,
                    isMainAccount: false,
                    publicId: await generatePMUID(),
                    balance: 0,
                }
            });
        } else if (!user.email) {
            // Backfill email if user was found by username but has no email
            await prisma.user.update({ where: { id: user.id }, data: { email: googleUser.email, profileImage: user.profileImage ?? googleUser.picture } });
        }

        // Generate JWT
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret');
        const token = await new SignJWT({ 
            userId: user.id, 
            username: user.username, 
            isAdmin: user.isAdmin 
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('30d')
            .sign(secret);

        const finalRedirectUrl = host.includes('localhost') ? `http://${host}/home` : 'https://wars-bid.vercel.app/home';
        const response = NextResponse.redirect(finalRedirectUrl);

        // Set cookie DIRECTLY on the response object — path is required for middleware to read it
        response.cookies.set('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            path: '/',
            maxAge: 30 * 24 * 60 * 60,
        });

        return response;

    } catch (err) {
        console.error('[Google Callback Error]', err);
        const host = req.headers.get('host') || 'localhost:3000';
        const rootDomain = host.includes('localhost') ? `http://${host}` : 'https://wars-bid.vercel.app';
        return NextResponse.redirect(`${rootDomain}/login?error=Google integration error: ${(err as Error).message}`);
    }
}
