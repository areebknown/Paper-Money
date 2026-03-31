import { NextResponse } from 'next/server';
import { verifyOTP } from '@/lib/otp-store';
import { prisma } from '@/lib/db';
import { generatePMUID } from '@/lib/pmuid';
import { SignJWT } from 'jose';

export async function POST(req: Request) {
    try {
        const { phoneNumber, otp, username } = await req.json();

        if (!phoneNumber || !otp) {
            return NextResponse.json({ error: 'Phone number and OTP are required' }, { status: 400 });
        }

        const cleanPhone = phoneNumber.replace(/\D/g, '');
        const verification = verifyOTP(cleanPhone, otp);

        if (!verification.valid) {
            return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
        }

        // Final target username (priority from client-side state, fallback from OTP store)
        const targetUsername = username || verification.username;

        if (!targetUsername) {
            return NextResponse.json({ error: 'No associated username' }, { status: 400 });
        }

        // Check if username is taken
        const existingUser = await prisma.user.findUnique({
            where: { username: targetUsername }
        });

        if (existingUser) {
            return NextResponse.json({ error: 'This username has already been claimed by another Trader during your verification time. Please restart with a new handle.' }, { status: 400 });
        }

        // Create the Elite Trader account (Main Account)
        const user = await prisma.user.create({
            data: {
                username: targetUsername,
                phoneNumber: cleanPhone,
                isMainAccount: true, // This is an Elite account
                publicId: await generatePMUID(),
                balance: 100000, // 1 Lakh Starter Bonus for Elite/Main accounts
                rankPoints: 100, // Starting bonus points
            }
        });

        // Generate JWT
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret');
        const token = await new SignJWT({ 
            userId: user.id, 
            username: user.username, 
            isAdmin: false 
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('30d')
            .sign(secret);

        const response = NextResponse.json({ 
            success: true, 
            message: 'Account Created Successfully!',
            user: {
                username: user.username,
                publicId: user.publicId
            }
        });

        // Set persistent cookie
        response.cookies.set('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60,
        });

        return response;

    } catch (err) {
        console.error('[WhatsApp Verify Error]', err);
        return NextResponse.json({ error: 'Verification failed. Try again.' }, { status: 500 });
    }
}
