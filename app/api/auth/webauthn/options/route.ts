import { NextResponse } from 'next/server';
import { 
    generateRegistrationOptions,
} from '@simplewebauthn/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

const RP_NAME = 'Bid Wars';

export async function POST(req: Request) {
    // Dynamically determine RP_ID and ORIGIN from request headers
    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    
    const RP_ID = process.env.NEXT_PUBLIC_RP_ID || host.split(':')[0];
    const ORIGIN = process.env.NEXT_PUBLIC_ORIGIN || `${protocol}://${host}`;

    try {
        const { username } = await req.json();

        if (!username) {
            return NextResponse.json({ error: 'Username is required' }, { status: 400 });
        }

        // 1. Check if user already exists (optional, depends on your signup flow)
        // For our flow, we want to ensure the username is available
        const existingUser = await prisma.user.findUnique({ where: { username } });
        
        // 2. Get user's existing authenticators (none for new signup)
        const userAuthenticators: any[] = [];

        // 3. Generate registration options
        const options = await generateRegistrationOptions({
            rpName: RP_NAME,
            rpID: RP_ID,
            userID: Buffer.from(username), // Using username as ID for now
            userName: username,
            userDisplayName: username,
            // Don't prompt users for biometrics if they're already registered
            excludeCredentials: userAuthenticators.map(auth => ({
                id: auth.credentialID,
                type: 'public-key',
                transports: auth.transports?.split(','),
            })),
            authenticatorSelection: {
                residentKey: 'preferred',
                userVerification: 'preferred',
                authenticatorAttachment: 'platform', // Force FaceID/TouchID/Windows Hello
            },
        });

        // 4. Store the challenge in a cookie for the verify step
        // Expires in 5 minutes
        (await cookies()).set('webauthn-challenge', options.challenge, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 300,
        });

        return NextResponse.json(options);
    } catch (error: any) {
        console.error('[WebAuthn Options] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
