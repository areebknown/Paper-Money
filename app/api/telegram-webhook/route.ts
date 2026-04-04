import { NextResponse } from 'next/server';
import { verifySession, getSession } from '@/lib/telegram-session';
import { sendMessage } from '@/lib/telegram';

// Resolve the production app URL — strip any accidental path suffix (e.g. /login)
function getAppUrl(): string {
    const raw =
        process.env.NEXT_PUBLIC_APP_URL ||
        (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '') ||
        'https://bidwars.xyz';
    // Keep only the origin (scheme + host), discard any path
    try { return new URL(raw).origin; } catch { return 'https://bidwars.xyz'; }
}

export async function POST(req: Request) {
    try {
        const update = await req.json();

        // We only care about regular messages (from the /start command)
        const message = update.message;
        if (!message) {
            return NextResponse.json({ ok: true });
        }

        const chatId: number = message.chat.id;
        const text: string = message.text || '';

        if (!text.startsWith('/start')) {
            // Respond to random messages gracefully
            await sendMessage(
                chatId,
                '👾 <b>Bid Wars Login Bot</b>\n\nThis bot verifies your identity for <b>bidwars.xyz</b>.\n\nPlease start verification from the website by creating a Main Account.'
            );
            return NextResponse.json({ ok: true });
        }

        // Extract session ID from "/start SESSION_ID"
        const parts = text.trim().split(' ');
        const sessionId = parts[1];

        // No session ID — user opened the bot directly
        if (!sessionId) {
            await sendMessage(
                chatId,
                '👾 <b>Bid Wars Login Bot</b>\n\nThis bot verifies your identity for <b>bidwars.xyz</b>.\n\nPlease start verification from the website by creating a Main Account.'
            );
            return NextResponse.json({ ok: true });
        }

        const session = getSession(sessionId);

        // Session expired or not found
        if (!session) {
            await sendMessage(
                chatId,
                '⚠️ <b>Verification link expired.</b>\n\nThis link is only valid for 10 minutes. Please go back to the Bid Wars website and start again.'
            );
            return NextResponse.json({ ok: true });
        }

        // Already verified
        if (session.status === 'verified') {
            await sendMessage(chatId, '✅ This session has already been verified!');
            return NextResponse.json({ ok: true });
        }

        // Mark as verified
        verifySession(sessionId, String(chatId));

        // Build the return URL (callback page)
        const returnUrl = `${getAppUrl()}/auth/telegram-callback?s=${sessionId}`;

        // Send confirmation + return button
        await sendMessage(
            chatId,
            `✅ <b>Identity Confirmed!</b>\n\nYour Telegram account has been linked to your <b>Bid Wars</b> sign-up.\n\nTap the button below to continue creating your account.\n\n<i>This link is valid for 10 minutes.</i>`,
            [{ text: '🎮  Continue to Bid Wars  →', url: returnUrl }]
        );

        return NextResponse.json({ ok: true });

    } catch (err) {
        console.error('[telegram-webhook] error:', err);
        // Must always return 200 to Telegram to avoid retries
        return NextResponse.json({ ok: true });
    }
}
