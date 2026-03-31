import { NextResponse } from 'next/server';
import { sendWhatsAppOTP } from '@/lib/whatsapp';
import { setOTP } from '@/lib/otp-store';

export async function POST(req: Request) {
    try {
        const { phoneNumber, username } = await req.json();

        if (!phoneNumber) {
            return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
        }

        // Clean phone number (remove non-digits, ensuring it starts with country code)
        // e.g. +91XXXXXXXXXX -> 91XXXXXXXXXX
        const cleanPhone = phoneNumber.replace(/\D/g, '');
        
        // Generate a random 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Send via Meta API
        const result = await sendWhatsAppOTP(cleanPhone, otp);

        if (!result.success) {
            return NextResponse.json({ error: result.error || 'Failed to send OTP' }, { status: 500 });
        }

        // Store OTP for verification (10 min expiry)
        setOTP(cleanPhone, otp, username);

        return NextResponse.json({ 
            success: true, 
            message: result.simulated ? '[SIMULATED] OTP Sent' : 'OTP Sent via WhatsApp'
        });

    } catch (err) {
        console.error('[WhatsApp Send Error]', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
