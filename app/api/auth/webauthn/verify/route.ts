import { NextResponse } from 'next/server';
import { 
    verifyRegistrationResponse,
} from '@simplewebauthn/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    // Dynamically determine RP_ID and ORIGIN from request headers
    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    
    const RP_ID = process.env.NEXT_PUBLIC_RP_ID || host.split(':')[0];
    const ORIGIN = process.env.NEXT_PUBLIC_ORIGIN || `${protocol}://${host}`;

    try {
        const body = await req.json();
        const expectedChallenge = (await cookies()).get('webauthn-challenge')?.value;

        if (!expectedChallenge) {
            return NextResponse.json({ error: 'Challenge expired or missing' }, { status: 400 });
        }

        const verification = await verifyRegistrationResponse({
            response: body.attestation,
            expectedChallenge,
            expectedOrigin: ORIGIN,
            expectedRPID: RP_ID,
        });

        if (verification.verified && verification.registrationInfo) {
            const { registrationInfo } = verification;
            const { credential, credentialDeviceType, credentialBackedUp } = registrationInfo as any;
            
            // In v10+, the identity info is nested in the credential object
            const credentialID = credential.id;
            const credentialPublicKey = credential.publicKey;
            const counter = credential.counter;

            // Clear the challenge cookie
            (await cookies()).delete('webauthn-challenge');

            // Return the necessary data for the final signup step
            return NextResponse.json({
                verified: true,
                authenticator: {
                    credentialID: Buffer.from(credentialID).toString('base64url'),
                    credentialPublicKey: Buffer.from(credentialPublicKey).toString('base64url'),
                    counter: Number(counter),
                    credentialDeviceType,
                    credentialBackedUp,
                    transports: body.attestation.response.transports?.join(',') || '',
                }
            });
        }

        return NextResponse.json({ error: 'Verification failed' }, { status: 400 });
    } catch (error: any) {
        console.error('[WebAuthn Verify] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
