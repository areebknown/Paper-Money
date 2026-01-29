import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import crypto from 'crypto';

export async function POST(req: Request) {
    try {
        console.log('Forgot password request for:', email);

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Check env vars
        if (!process.env.RESEND_API_KEY) console.error('MISSING RESEND_API_KEY');
        if (!process.env.FROM_EMAIL) console.error('MISSING FROM_EMAIL');

        // Find user by email - using findFirst and casting to any to bypass Prisma build-time type lag
        const user = await (prisma.user as any).findFirst({
            where: { email },
        });

        if (!user) {
            console.log('User not found with email:', email);
            // In a real app we keep it vague, but for debugging let's be explicit if needed
            return NextResponse.json({ message: 'User with this email was not found. Please link your email in Profile first.' });
        }

        console.log('User found, generating token...');

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

        // Save token to database
        await (prisma.user as any).update({
            where: { id: user.id },
            data: {
                resetToken,
                resetTokenExpiry,
            },
        });

        // Send email using Resend REST API (No library needed!)
        const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

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

        if (!resendResponse.ok) {
            const errorData = await resendResponse.json();
            console.error('Resend API Error:', errorData);
            // We still return success to the user for security, but log the error
        }

        return NextResponse.json({ message: 'If that email exists, a reset link has been sent' });

    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
