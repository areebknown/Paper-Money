import { NextResponse } from 'next/server';
import { sendSMSOTP } from '@/lib/fast2sms';
import { setOTP } from '@/lib/otp-store';
import { prisma } from '@/lib/db';

/**
 * Sends an OTP to a Main Account's registered phone number.
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
            select: { id: true, isMainAccount: true, phoneNumber: true },
        });

        if (!mainUser) {
            return NextResponse.json({ error: 'Main account not found' }, { status: 404 });
        }

        if (!mainUser.isMainAccount) {
            return NextResponse.json({ error: 'That username is not a Main Account' }, { status: 400 });
        }

        if (!mainUser.phoneNumber) {
            return NextResponse.json({ error: 'Main account has no linked phone number' }, { status: 400 });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        setOTP(`link:${mainUser.id}`, otp);

        const result = await sendSMSOTP(mainUser.phoneNumber, otp);

        if (!result.success) {
            return NextResponse.json({ error: result.error || 'Failed to send SMS' }, { status: 500 });
        }

        return NextResponse.json({ success: true, mainUserId: mainUser.id });

    } catch (err) {
        console.error('[Link Account Send Error]', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
