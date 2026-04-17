import { NextResponse } from 'next/server';
import { jwtVerify, SignJWT } from 'jose';
import { prisma } from '@/lib/db';
import { getOrigin, buildCookieOpts } from '@/lib/auth';

/**
 * Finalizes the Google signup flow.
 *
 * Reads the pending_google_token cookie set by /api/auth/google/set-cookie,
 * optionally updates the user's profile image, issues a full 30-day JWT,
 * and clears the pending cookie.
 */
export async function POST(req: Request) {
    const { isSecure } = getOrigin(req);

    try {
        const cookieHeader = req.headers.get('cookie') || '';
        const pendingMatch = cookieHeader.match(/pending_google_token=([^;]+)/);

        if (!pendingMatch) {
            return NextResponse.json(
                { error: 'Session expired. Please try signing up again.' },
                { status: 401 }
            );
        }

        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret');
        const { payload } = await jwtVerify(pendingMatch[1], secret);

        if (!payload.isPending || !payload.pendingUserId) {
            return NextResponse.json(
                { error: 'Invalid pending session.' },
                { status: 401 }
            );
        }

        const pendingUserId = payload.pendingUserId as string;
        const { profileImage } = await req.json();

        // Optionally update the user's profile image
        const updatedUser = await prisma.user.update({
            where: { id: pendingUserId },
            data: {
                ...(profileImage ? { profileImage } : {}),
            },
        });

        // Issue full 30-day session JWT
        const token = await new SignJWT({
            userId: updatedUser.id,
            username: updatedUser.username,
            isAdmin: updatedUser.isAdmin,
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('30d')
            .sign(secret);

        const response = NextResponse.json({ success: true });
        response.cookies.set('token', token, buildCookieOpts(isSecure, 30 * 24 * 60 * 60));

        // Clear the now-consumed pending cookie
        response.cookies.set('pending_google_token', '', {
            ...buildCookieOpts(isSecure, 0),
            maxAge: 0,
        });

        return response;

    } catch (err) {
        console.error('[Google Complete Error]', err);
        return NextResponse.json(
            { error: 'Failed to complete signup. Please try again.' },
            { status: 500 }
        );
    }
}
