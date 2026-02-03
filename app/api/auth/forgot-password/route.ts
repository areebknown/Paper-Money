import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import crypto from 'crypto';

export async function POST(req: Request) {
    try {
        const { email } = await req.json();
        console.log('[FORGOT PASSWORD] Request received for email:', email);

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Validate environment variables FIRST
        if (!process.env.RESEND_API_KEY) {
            console.error('[FORGOT PASSWORD] CRITICAL: RESEND_API_KEY is not set!');
            return NextResponse.json({
                error: 'EMAIL_NOT_CONFIGURED',
                message: 'Email service is not configured. Please contact support.'
            }, { status: 500 });
        }

        if (!process.env.FROM_EMAIL) {
            console.warn('[FORGOT PASSWORD] WARNING: FROM_EMAIL not set, using default onboarding@resend.dev');
        }

        console.log('[FORGOT PASSWORD] Environment variables validated');

        // Find user by email
        const user = await (prisma.user as any).findFirst({
            where: { email },
        });

        if (!user) {
            console.log('[FORGOT PASSWORD] User not found with email:', email);
            return NextResponse.json({
                error: 'USER_NOT_FOUND',
                message: 'No account found with this email. Have you linked your email in the Profile page?'
            }, { status: 404 });
        }

        console.log('[FORGOT PASSWORD] User found:', user.username);

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

        console.log('[FORGOT PASSWORD] Generated reset token, expiry:', resetTokenExpiry.toISOString());

        // Save token to database
        await (prisma.user as any).update({
            where: { id: user.id },
            data: {
                resetToken,
                resetTokenExpiry,
            },
        });

        console.log('[FORGOT PASSWORD] Token saved to database');

        // Send email using Resend REST API
        const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

        console.log('[FORGOT PASSWORD] Attempting to send email to:', email);
        console.log('[FORGOT PASSWORD] From address:', process.env.FROM_EMAIL || 'onboarding@resend.dev');

        const resendResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: process.env.FROM_EMAIL || 'onboarding@resend.dev',
                to: [email],
                subject: 'Reset Your Password - PaperPay',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
                        <h2 style="color: #4F46E5;">Reset Your Password</h2>
                        <p>You requested a password reset for your PaperPay account.</p>
                        <p>Click the button below to reset your password:</p>
                        <a href="${resetUrl}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0; font-weight: bold;">Reset Password</a>
                        <p>Or copy and paste this link into your browser:</p>
                        <p style="color: #6B7280; word-break: break-all; font-size: 14px;">${resetUrl}</p>
                        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0;">
                        <p style="color: #EF4444; font-size: 14px;">This link will expire in 1 hour.</p>
                        <p style="color: #6B7280; font-size: 12px;">If you didn't request this, please ignore this email.</p>
                    </div>
                `,
            }),
        });

        const resendData = await resendResponse.json();

        if (!resendResponse.ok) {
            console.error('[FORGOT PASSWORD] Resend API Error:');
            console.error('[FORGOT PASSWORD] Status:', resendResponse.status);
            console.error('[FORGOT PASSWORD] Response:', JSON.stringify(resendData, null, 2));

            // Provide user-friendly error messages based on the error type
            let userMessage = 'Failed to send reset email. ';

            if (resendData.message?.toLowerCase().includes('domain')) {
                userMessage += 'Email domain not configured. Please contact support.';
            } else if (resendData.message?.toLowerCase().includes('api key') || resendData.message?.toLowerCase().includes('unauthorized')) {
                userMessage += 'Email service authentication error. Please contact support.';
            } else if (resendData.message?.toLowerCase().includes('rate limit')) {
                userMessage += 'Too many requests. Please try again in a few minutes.';
            } else {
                userMessage += 'Please try again or contact support.';
            }

            return NextResponse.json({
                error: 'RESEND_ERROR',
                message: userMessage,
                details: resendData.message // Include technical details for debugging
            }, { status: 500 });
        }

        console.log('[FORGOT PASSWORD] ✅ Email sent successfully!');
        console.log('[FORGOT PASSWORD] Resend response:', JSON.stringify(resendData, null, 2));

        return NextResponse.json({
            message: 'Success! Please check your email inbox (and spam folder).'
        });

    } catch (error) {
        console.error('[FORGOT PASSWORD] Unexpected error:', error);
        console.error('[FORGOT PASSWORD] Error stack:', error instanceof Error ? error.stack : 'No stack');
        return NextResponse.json({
            error: 'Internal server error',
            message: 'Something went wrong. Please try again later.'
        }, { status: 500 });
    }
}
