import { NextResponse } from 'next/server';
import { setOTP } from '@/lib/otp-store';

export async function POST(req: Request) {
    try {
        const { email, username } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Email address is required' }, { status: 400 });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store OTP (10 min expiry)
        setOTP(email, otp, username);

        const RESEND_API_KEY = process.env.RESEND_API_KEY;
        const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';

        if (!RESEND_API_KEY) {
            // Dev mode: log the OTP
            console.log(`[Email OTP Simulator] Sent to ${email}: ${otp}`);
            return NextResponse.json({ success: true, simulated: true, otp });
        }

        const resendRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: fromEmail,
                to: [email],
                subject: 'Your Bid Wars Verification Code',
                html: `
                    <div style="font-family: 'Inter', sans-serif; max-width: 500px; margin: 0 auto; background: #020617; color: #e2e8f0; padding: 40px; border-radius: 24px; border: 1px solid #1e293b;">
                        <div style="text-align: center; margin-bottom: 32px;">
                            <h1 style="color: #FBBF24; font-size: 28px; font-weight: 900; letter-spacing: -1px; margin: 0;">BID WARS</h1>
                            <p style="color: #475569; font-size: 11px; letter-spacing: 4px; text-transform: uppercase; margin-top: 4px;">Finance Account Verification</p>
                        </div>
                        <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 16px; padding: 32px; text-align: center; margin-bottom: 24px;">
                            <p style="color: #94a3b8; font-size: 13px; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 2px;">Your verification code</p>
                            <div style="font-size: 40px; font-weight: 900; letter-spacing: 12px; color: #FBBF24; font-family: monospace;">${otp}</div>
                            <p style="color: #475569; font-size: 11px; margin-top: 16px;">Expires in 10 minutes</p>
                        </div>
                        <p style="color: #334155; font-size: 11px; text-align: center;">If you didn't request this, ignore this email. No real money is involved. Bid Wars uses virtual Paper Money only.</p>
                    </div>
                `,
            }),
        });

        const resendData = await resendRes.json();

        if (!resendRes.ok) {
            console.error('[Email OTP] Resend error:', resendData);
            return NextResponse.json({ error: resendData.message || 'Failed to send email' }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (err) {
        console.error('[Email OTP Send Error]', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
