import { NextResponse } from 'next/server';
import { verifyOTP } from '@/lib/otp-store';
import { prisma } from '@/lib/db';
import { jwtVerify } from 'jose';

/**
 * Verifies the OTP and links the Finance Account to the Main Account.
 * The Finance account must be the currently logged-in user (JWT cookie).
 */
export async function POST(req: Request) {
    try {
        const { mainUserId, otp } = await req.json();

        if (!mainUserId || !otp) {
            return NextResponse.json({ error: 'mainUserId and OTP are required' }, { status: 400 });
        }

        // Get the current user from JWT cookie
        const cookieHeader = req.headers.get('cookie') || '';
        const tokenMatch = cookieHeader.match(/token=([^;]+)/);
        const pendingTokenMatch = cookieHeader.match(/pending_google_token=([^;]+)/);
        
        const activeToken = tokenMatch?.[1] || pendingTokenMatch?.[1];

        if (!activeToken) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret');
        const { payload } = await jwtVerify(activeToken, secret);
        const financeUserId = payload.userId || payload.pendingUserId;
        
        if (!financeUserId || typeof financeUserId !== 'string') {
             return NextResponse.json({ error: 'Invalid token payload' }, { status: 400 });
        }

        // Verify OTP
        const verification = verifyOTP(`link:${mainUserId}`, otp);
        if (!verification.valid) {
            return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
        }

        // Link accounts
        await prisma.user.update({
            where: { id: financeUserId },
            data: { parentAccountId: mainUserId },
        });

        return NextResponse.json({ success: true, message: 'Accounts linked successfully' });

    } catch (err) {
        console.error('[Link Account Verify Error]', err);
        return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
    }
}
