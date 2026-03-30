import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const username = searchParams.get('username');

        if (!username || username.length < 3) {
            return NextResponse.json({ available: false, error: 'Invalid username' });
        }

        const existingUser = await prisma.user.findUnique({
            where: { username: username.toLowerCase() },
            select: { id: true }
        });

        return NextResponse.json({ 
            available: !existingUser,
            username: username.toLowerCase()
        });

    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
