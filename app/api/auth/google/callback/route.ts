import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';
import { generatePMUID } from '@/lib/pmuid';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login?error=Google auth failed: ${error}`);
    }

    if (!code) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login?error=No code provided`);
    }

    try {
        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            body: JSON.stringify({
                code,
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/google/callback`,
                grant_type: 'authorization_code',
            }),
        });

        const tokenData = await tokenRes.json();
        if (!tokenRes.ok) throw new Error(tokenData.error_description || 'Token exchange failed');

        const { access_token, id_token } = tokenData;

        // Fetch user info
        const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${access_token}` },
        });
        const googleUser = await userRes.json();

        // Find or create user
        let user = await prisma.user.findFirst({
            where: { 
                OR: [
                    { email: googleUser.email },
                    { username: googleUser.email.split('@')[0] } 
                ]
            }
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    email: googleUser.email,
                    username: googleUser.email.split('@')[0],
                    realName: googleUser.name,
                    profileImage: googleUser.picture,
                    isMainAccount: false, // Default to side for Google-only unless linked
                    publicId: await generatePMUID(),
                    balance: 0, // Side accounts get 0 starter bonus
                }
            });
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

        const response = NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/home`);
        (await cookies()).set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60,
        });

        return response;

    } catch (err) {
        console.error('[Google Callback Error]', err);
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login?error=Google integration error: ${(err as Error).message}`);
    }
}
