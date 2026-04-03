import { NextResponse } from 'next/server';
import { verifyOTP } from '@/lib/otp-store';
import { prisma } from '@/lib/db';
import { generatePMUID } from '@/lib/pmuid';
import { SignJWT } from 'jose';

export async function POST(req: Request) {
    try {
        const { email, otp, username, password } = await req.json();

        if (!email || !otp) {
            return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
        }

        const verification = verifyOTP(email, otp);
        if (!verification.valid) {
            return NextResponse.json({ error: 'Invalid or expired code. Please request a new one.' }, { status: 400 });
        }

        // OTP is valid — signal to the frontend to proceed to next step
        // (account creation for Finance accounts happens via the regular /api/auth/signup route)
        return NextResponse.json({ success: true, verified: true });

    } catch (err) {
        console.error('[Email OTP Verify Error]', err);
        return NextResponse.json({ error: 'Verification failed. Try again.' }, { status: 500 });
    }
}
