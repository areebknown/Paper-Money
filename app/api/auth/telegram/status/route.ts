import { NextResponse } from 'next/server';
import { getSession } from '@/lib/telegram-session';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('s');

    if (!sessionId) {
        return NextResponse.json({ error: 'Missing session ID' }, { status: 400 });
    }

    const session = getSession(sessionId);

    if (!session) {
        return NextResponse.json({ status: 'expired' });
    }

    return NextResponse.json({
        status: session.status,
        telegramId: session.status === 'verified' ? session.telegramId : undefined,
        phoneNumber: session.status === 'verified' ? session.phoneNumber : undefined,
        username: session.status === 'verified' ? session.username : undefined,
    });
}
