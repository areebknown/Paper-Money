import { NextResponse } from 'next/server';
import { verifyOTP } from '@/lib/otp-store';

export async function POST(req: Request) {
    try {
        const { phoneNumber, otp } = await req.json();

        if (!phoneNumber || !otp) {
            return NextResponse.json({ error: 'Phone number and OTP are required' }, { status: 400 });
        }

        const cleaned = phoneNumber.replace(/\D/g, '').slice(-10);
        const verification = verifyOTP(cleaned, otp);

        if (!verification.valid) {
            return NextResponse.json({ error: 'Invalid or expired OTP. Request a new one.' }, { status: 400 });
        }

        // Just verify — account creation happens at the final signup step
        return NextResponse.json({ success: true, verified: true });

    } catch (err) {
        console.error('[SMS Verify Error]', err);
        return NextResponse.json({ error: 'Verification failed. Try again.' }, { status: 500 });
    }
}
