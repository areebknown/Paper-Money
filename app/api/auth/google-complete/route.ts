import { NextResponse } from 'next/server';
import { jwtVerify, SignJWT } from 'jose';
import { prisma } from '@/lib/db';

/**
 * Finalizes the Google signup flow.
 * Reads the pending_google_token cookie, updates the user with PFP and parent account,
 * issues a full JWT, and clears the pending cookie.
 */
export async function POST(req: Request) {
    try {
        const cookieHeader = req.headers.get('cookie') || '';
        const pendingMatch = cookieHeader.match(/pending_google_token=([^;]+)/);

        if (!pendingMatch) {
            return NextResponse.json({ error: 'Session expired. Please try signing up again.' }, { status: 401 });
        }

        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret');
        const { payload } = await jwtVerify(pendingMatch[1], secret);

        if (!payload.isPending || !payload.pendingUserId) {
            return NextResponse.json({ error: 'Invalid pending session' }, { status: 401 });
        }

        const pendingUserId = payload.pendingUserId as string;
        const { profileImage } = await req.json();

        // Update user with optional profile image
        const updatedUser = await prisma.user.update({
            where: { id: pendingUserId },
            data: {
                ...(profileImage ? { profileImage } : {}),
            },
        });

        // Issue full JWT
        const token = await new SignJWT({
            userId: updatedUser.id,
            username: updatedUser.username,
            isAdmin: updatedUser.isAdmin,
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('30d')
            .sign(secret);

        const response = NextResponse.json({ success: true });
        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 30 * 24 * 60 * 60,
        });
        // Clear the pending cookie
        response.cookies.set('pending_google_token', '', { maxAge: 0, path: '/' });

        return response;

    } catch (err) {
        console.error('[Google Complete Error]', err);
        return NextResponse.json({ error: 'Failed to complete signup' }, { status: 500 });
    }
}
