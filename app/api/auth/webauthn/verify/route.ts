import { NextResponse } from 'next/server';
import { 
    verifyRegistrationResponse,
} from '@simplewebauthn/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

const RP_ID = process.env.NEXT_PUBLIC_RP_ID || 'localhost';
const ORIGIN = process.env.NEXT_PUBLIC_ORIGIN || `http://${RP_ID}:3000`;

export async function POST(req: Request) {
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
            const registrationInfo = verification.registrationInfo as any;
            const credentialID = registrationInfo.credentialID;
            const credentialPublicKey = registrationInfo.credentialPublicKey;
            const counter = registrationInfo.counter;
            const credentialDeviceType = registrationInfo.credentialDeviceType;
            const credentialBackedUp = registrationInfo.credentialBackedUp;

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
