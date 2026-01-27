import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Resend } from 'resend';
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            // Don't reveal if email exists for security
            return NextResponse.json({ message: 'If that email exists, a reset link has been sent' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

        // Save token to database
        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetToken,
                resetTokenExpiry,
            },
        });

        // Send email
        const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

        await resend.emails.send({
            from: process.env.FROM_EMAIL || 'onboarding@resend.dev',
            to: email,
            subject: 'Reset Your Password - PaperPay',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4F46E5;">Reset Your Password</h2>
                    <p>You requested a password reset for your PaperPay account.</p>
                    <p>Click the button below to reset your password:</p>
                    <a href="${resetUrl}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">Reset Password</a>
                    <p>Or copy and paste this link into your browser:</p>
                    <p style="color: #6B7280; word-break: break-all;">${resetUrl}</p>
                    <p style="color: #EF4444; margin-top: 24px;">This link will expire in 1 hour.</p>
                    <p style="color: #6B7280; font-size: 14px;">If you didn't request this, please ignore this email.</p>
                </div>
            `,
        });

        return NextResponse.json({ message: 'If that email exists, a reset link has been sent' });

    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
