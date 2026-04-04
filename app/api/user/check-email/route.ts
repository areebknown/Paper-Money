import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email || !email.includes('@')) {
        return NextResponse.json({ available: false });
    }

    const { prisma } = await import('@/lib/db');
    const existing = await prisma.user.findFirst({
        where: { email: email.toLowerCase() },
        select: { id: true },
    });

    return NextResponse.json({ available: !existing });
}
