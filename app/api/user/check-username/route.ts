import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const username = searchParams.get('username');

        if (!username || username.length < 3) {
            return NextResponse.json({ available: false, error: 'Invalid username' });
        }

        const checkUsername = username.toLowerCase();

        const existingUser = await prisma.user.findUnique({
            where: { username: checkUsername },
            select: { id: true }
        });

        const reservedUser = await prisma.reservedUsername.findFirst({
            where: {
                username: checkUsername,
                expiresAt: { gt: new Date() }
            }
        });

        return NextResponse.json({ 
            available: !existingUser && !reservedUser,
            username: checkUsername
        });

    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
