import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/user/check-main-account?username=X
 * Returns whether the username exists, is a Main Account, and has a linked Telegram.
 * Used for:
 *   - Forgot-password Telegram recovery field validation
 *   - Link-account username field validation
 */
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username')?.toLowerCase().trim();

    if (!username || username.length < 3) {
        return NextResponse.json({ exists: false, isMain: false, hasTelegram: false });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { username },
            select: { id: true, isMainAccount: true, telegramId: true },
        });

        return NextResponse.json({
            exists: !!user,
            isMain: !!(user?.isMainAccount),
            hasTelegram: !!(user?.telegramId),
        });
    } catch {
        return NextResponse.json({ exists: false, isMain: false, hasTelegram: false });
    }
}
