import { NextResponse } from 'next/server';
import { sendSMSOTP } from '@/lib/fast2sms';
import { setOTP } from '@/lib/otp-store';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
    try {
        const { phoneNumber, username } = await req.json();

        if (!phoneNumber) {
            return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
        }

        const cleaned = phoneNumber.replace(/\D/g, '').slice(-10); // ensure 10 digits

        if (cleaned.length !== 10) {
            return NextResponse.json({ error: 'Invalid phone number — must be 10 digits' }, { status: 400 });
        }

        // ⚠️ Gate: Check if phone is already registered — NO SMS if taken
        const existing = await prisma.user.findFirst({
            where: { phoneNumber: cleaned },
            select: { id: true },
        });

        if (existing) {
            return NextResponse.json({ error: 'This number is already linked to a Main Account', taken: true }, { status: 409 });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store OTP (10 min expiry)
        setOTP(cleaned, otp, username);

        // Send via Fast2SMS
        const result = await sendSMSOTP(cleaned, otp);

        if (!result.success) {
            return NextResponse.json({ error: result.error || 'Failed to send SMS' }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (err) {
        console.error('[SMS Send Error]', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
