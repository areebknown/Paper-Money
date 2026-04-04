import { NextResponse } from 'next/server';
import { setOTP } from '@/lib/otp-store';
import { prisma } from '@/lib/db';
import { sendMessage } from '@/lib/telegram';

/**
 * Sends a linking OTP to a Main Account holder via their Telegram.
 * Used during Finance Account → Main Account linking flow.
 */
export async function POST(req: Request) {
    try {
        const { mainUsername } = await req.json();

        if (!mainUsername) {
            return NextResponse.json({ error: 'Main account username is required' }, { status: 400 });
        }

        const mainUser = await prisma.user.findUnique({
            where: { username: mainUsername.toLowerCase() },
            select: { id: true, isMainAccount: true, telegramId: true },
        });

        if (!mainUser) {
            return NextResponse.json({ error: 'Main account not found' }, { status: 404 });
        }

        if (!mainUser.isMainAccount) {
            return NextResponse.json({ error: 'That username is not a Main Account' }, { status: 400 });
        }

        if (!mainUser.telegramId) {
            return NextResponse.json(
                { error: 'That Main Account has not completed Telegram verification. Ask them to re-verify.' },
                { status: 400 }
            );
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        setOTP(`link:${mainUser.id}`, otp);

        await sendMessage(
            mainUser.telegramId,
            `🔗 <b>Bid Wars — Account Linking Request</b>\n\nSomeone is trying to link a Finance Account to your Main Account (<b>${mainUsername}</b>).\n\n<b>Your verification code:</b>\n<code>${otp}</code>\n\n<i>Valid for 5 minutes. If this wasn't you, ignore this message.</i>`
        );

        return NextResponse.json({ success: true, mainUserId: mainUser.id });

    } catch (err) {
        console.error('[Link Account Send Error]', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
