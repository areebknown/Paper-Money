import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { SignJWT, jwtVerify } from 'jose';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { switchToken, password, userId } = body;

        let finalUserId = userId;
        let requiresPasswordCheck = false;

        if (switchToken) {
            // Verify and decode the switch token
            const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret');
            try {
                const { payload } = await jwtVerify(switchToken, secret);
                finalUserId = payload.userId as string;

                // Check string password hash match
                const user = await prisma.user.findUnique({ where: { id: finalUserId } });
                if (!user || user.password !== payload.passwordHash) {
                    return NextResponse.json({ error: 'Password has changed. Re-authentication required.' }, { status: 401 });
                }
            } catch (err) {
                return NextResponse.json({ error: 'Invalid or expired switch token.' }, { status: 401 });
            }
        } else if (password && userId) {
            requiresPasswordCheck = true;
            finalUserId = userId;
        } else {
            return NextResponse.json({ error: 'Missing authentication parameters.' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { id: finalUserId } });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        if (requiresPasswordCheck) {
            if (password !== user.password) {
                return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 });
            }
        }

        // Authentication successful. Issue new tokens
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret');
        const sessionToken = await new SignJWT({ userId: user.id, username: user.username, isAdmin: user.isAdmin })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('30d')
            .sign(secret);

        const newSwitchToken = await new SignJWT({ userId: user.id, passwordHash: user.password })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('365d')
            .sign(secret);

        const response = NextResponse.json({ 
            success: true, 
            user: { 
                id: user.id, 
                username: user.username, 
                balance: user.balance, 
                isAdmin: user.isAdmin,
                isMainAccount: user.isMainAccount,
            },
            switchToken: newSwitchToken
        });

        // Set session HttpOnly cookie
        response.cookies.set('token', sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 30 * 24 * 60 * 60,
            path: '/',
        });

        return response;

    } catch (error) {
        console.error('[auth/switch] error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
