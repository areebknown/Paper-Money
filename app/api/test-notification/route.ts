import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth';
import { beams } from '@/lib/pusher-beams';

/**
 * GET /api/test-notification
 * Tests the full Pusher Beams server-side push notification flow.
 * Sends a test notification to the calling user's interest.
 */
export async function GET(req: NextRequest) {
    const instanceId = process.env.PUSHER_BEAMS_INSTANCE_ID;
    const secretKey = process.env.PUSHER_BEAMS_SECRET_KEY;
    const publicInstanceId = process.env.NEXT_PUBLIC_PUSHER_BEAMS_INSTANCE_ID;

    // Check env vars
    const envCheck = {
        PUSHER_BEAMS_INSTANCE_ID: instanceId ? `set (${instanceId})` : 'MISSING',
        PUSHER_BEAMS_SECRET_KEY: secretKey ? `set (${secretKey!.substring(0, 8)}...)` : 'MISSING',
        NEXT_PUBLIC_PUSHER_BEAMS_INSTANCE_ID: publicInstanceId ? `set (${publicInstanceId})` : 'MISSING',
    };

    if (!instanceId || !secretKey) {
        return NextResponse.json({ error: 'Env vars missing', envCheck }, { status: 500 });
    }

    // Get the calling user's ID
    const userId = await getUserIdFromRequest();
    if (!userId) {
        return NextResponse.json({ error: 'Not authenticated', envCheck }, { status: 401 });
    }

    const interest = `user-${userId}`;

    try {
        await beams.publishToInterests([interest], {
            web: {
                notification: {
                    title: '🔔 Test Notification',
                    body: `This is a test push from Beams to interest: ${interest}`,
                    icon: '/icon-192.png',
                },
            },
        });
        return NextResponse.json({
            success: true,
            message: `Notification sent to interest: ${interest}`,
            userId,
            envCheck,
        });
    } catch (err: any) {
        return NextResponse.json({
            error: 'publishToInterests failed',
            details: err.message || String(err),
            interest,
            userId,
            envCheck,
        }, { status: 500 });
    }
}
