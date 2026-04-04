import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone');

    if (!phone || phone.length !== 10) {
        return NextResponse.json({ available: false });
    }

    const { prisma } = await import('@/lib/db');
    const existing = await prisma.user.findFirst({
        where: { phoneNumber: phone },
        select: { id: true },
    });

    return NextResponse.json({ available: !existing });
}
