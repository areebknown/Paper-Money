import { NextResponse } from 'next/server';
import { sendWhatsAppOTP } from '@/lib/whatsapp';

export async function POST(req: Request) {
    try {
        const { phoneNumber, type } = await req.json();

        if (!phoneNumber) {
            return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
        }

        // Generate a random 6-digit verification code
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Send OTP via WhatsApp
        const result = await sendWhatsAppOTP(phoneNumber, otp);

        if (!result.success) {
            return NextResponse.json({ 
                error: `WhatsApp OTP Failed: ${result.error || 'Unknown Error'}`,
                debug: result
            }, { status: 500 });
        }

        // Return the OTP in DEV for testing (so user can skip Meta approval)
        // In PROD, we hide this.
        return NextResponse.json({ 
            success: true, 
            simulated: result.simulated,
            ...(process.env.NODE_ENV === 'development' ? { otp } : {})
        });

    } catch (error) {
        console.error('OTP Send error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
