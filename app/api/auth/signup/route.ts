import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { SignJWT } from 'jose';
import { getUniquePMUID } from '@/lib/pmuid';

export async function POST(req: Request) {
    try {
        const {
            username,
            password,
            isMainAccount,
            telegramId,   // Replaces phoneNumber for Main accounts
            phoneNumber,  // Kept for backward compat / legacy data
            email,
            realName,
            profileImage,
        } = await req.json();

        if (!username || !password) {
            return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
        }

        // Username uniqueness
        const existingUser = await prisma.user.findUnique({
            where: { username: username.toLowerCase() },
        });
        if (existingUser) {
            return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
        }

        // For Main Accounts — enforce one human one account via telegramId
        if (isMainAccount && telegramId) {
            const existingTelegram = await prisma.user.findUnique({
                where: { telegramId: String(telegramId) },
            });
            if (existingTelegram) {
                return NextResponse.json(
                    { error: 'A Main Account is already linked to your Telegram. Each person can only have one Main Account.' },
                    { status: 409 }
                );
            }
        }

        const publicId = await getUniquePMUID();
        const starterBalance = isMainAccount ? 100000 : 0;

        const user = await prisma.user.create({
            data: {
                username: username.toLowerCase(),
                password,
                publicId,
                isMainAccount: !!isMainAccount,
                telegramId: isMainAccount && telegramId ? String(telegramId) : null,
                phoneNumber: phoneNumber || null,
                email: email || null,
                realName: realName || null,
                profileImage: profileImage || null,
                balance: starterBalance,
                greenMoney: starterBalance,
                isAdmin: username === 'admin',
            } as any,
        });

        // Issue JWT
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret');
        const token = await new SignJWT({
            userId: user.id,
            username: user.username,
            isAdmin: user.isAdmin,
            isMainAccount: user.isMainAccount,
            publicId: user.publicId,
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('30d')
            .sign(secret);

        // Issue Switch Token
        const switchToken = await new SignJWT({ userId: user.id, passwordHash: user.password })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('365d')
            .sign(secret);

        const response = NextResponse.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                publicId: user.publicId,
                isMainAccount: user.isMainAccount,
                balance: user.balance,
            },
            switchToken
        });

        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60,
            path: '/',
        });

        return response;

    } catch (error: any) {
        console.error('[signup] error:', error);
        if (error?.code === 'P2002') {
            return NextResponse.json({ error: 'An account with this information already exists.' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
