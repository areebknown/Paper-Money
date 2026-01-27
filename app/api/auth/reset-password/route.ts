import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
    try {
        const { token, newPassword } = await req.json();

        if (!token || !newPassword) {
            return NextResponse.json({ error: 'Token and new password are required' }, { status: 400 });
        }

        // Find user with valid token - casting to any to bypass Prisma build-time type lag
        const user = await (prisma.user as any).findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: {
                    gt: new Date(), // Token not expired
                },
            },
        });

        if (!user) {
            return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 });
        }

        // Update password and clear token
        await (prisma.user as any).update({
            where: { id: user.id },
            data: {
                password: newPassword, // Plain text as requested
                resetToken: null,
                resetTokenExpiry: null,
            },
        });

        return NextResponse.json({ message: 'Password reset successful' });

    } catch (error) {
        console.error('Reset password error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
