import { NextResponse } from 'next/server';
import { triggerPusherEvent } from '@/lib/pusher-server';
import { getUserFromToken } from '@/lib/auth';

/**
 * GET /api/pusher/test?channel=auction-XXX
 * Fires a test-event on the given channel so we can verify
 * server → Pusher → browser delivery in the console.
 */
export async function GET(req: Request) {
    const user = await getUserFromToken();
    if (!user?.isAdmin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const channel = searchParams.get('channel') || 'global-auctions';

    console.log(`[Pusher Test] Firing test-event on channel: ${channel}`);

    await triggerPusherEvent(channel, 'test-event', {
        message: `Test fired at ${new Date().toISOString()}`,
        channel,
    });

    return NextResponse.json({
        ok: true,
        channel,
        message: 'test-event fired — check browser console for arrival',
    });
}
