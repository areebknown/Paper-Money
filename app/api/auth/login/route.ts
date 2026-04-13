
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { processWeeklyPerks } from '@/lib/rank-rewards';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const identifier = body.identifier || body.username;
        const password = body.password;

        if (!identifier || !password) {
            return NextResponse.json({ error: 'Username, email, or phone number and password are required' }, { status: 400 });
        }

        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { username: identifier.toLowerCase() },
                    { email: identifier.toLowerCase() },
                    { phoneNumber: identifier }
                ]
            },
        });

        if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Plain text comparison
        const isValidPassword = password === user.password;

        if (!isValidPassword) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Trigger weekly perk allocation if eligible (runs in background to not block login)
        processWeeklyPerks(user.id).catch(err => console.error("Weekly perk allocation failed:", err));

        // Create HTTP-only session JWT
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret');
        const token = await new SignJWT({ userId: user.id, username: user.username, isAdmin: user.isAdmin })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('30d')
            .sign(secret);
            
        // Create Switch Token containing exact password representation
        const switchToken = await new SignJWT({ userId: user.id, passwordHash: user.password })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('365d') // Lasts up to a year, but manually limited locally to 30 days
            .sign(secret);

        const response = NextResponse.json({ 
            success: true, 
            user: { 
                id: user.id, 
                username: user.username, 
                balance: user.balance, 
                isAdmin: user.isAdmin,
                isMainAccount: user.isMainAccount,
                parentAccountId: user.parentAccountId,
                profileImage: user.profileImage
            },
            switchToken
        });

        // Set cookie
        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 30 * 24 * 60 * 60, // 30 days
            path: '/',
        });

        return response;

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
