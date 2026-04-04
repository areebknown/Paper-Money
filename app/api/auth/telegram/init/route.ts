import { NextResponse } from 'next/server';
import { createSession } from '@/lib/telegram-session';

function generateSessionId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    for (let i = 0; i < 20; i++) {
        id += chars[Math.floor(Math.random() * chars.length)];
    }
    return id;
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username') || '';

    const sessionId = generateSessionId();
    createSession(sessionId, username);

    const botLink = `https://t.me/bidwars_login_bot?start=${sessionId}`;

    return NextResponse.json({ sessionId, botLink });
}
