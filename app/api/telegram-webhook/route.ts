import { NextResponse } from 'next/server';
import { awaitContact, verifySession, getSession, getSessionIdByChatId } from '@/lib/telegram-session';
import { sendMessage } from '@/lib/telegram';
import { prisma } from '@/lib/db';

// Production URL — hardcoded so env-var misconfig can never corrupt bot links
const APP_URL = 'https://bidwars.xyz';

export async function POST(req: Request) {
    try {
        const update = await req.json();
        const message = update.message;

        if (!message) {
            return NextResponse.json({ ok: true });
        }

        const chatId: number = message.chat.id;
        const text: string = message.text || '';

        // ── STEP 2: Handle contact share ──────────────────────────────────────────
        if (message.contact) {
            const contact = message.contact;

            // Security: ensure the contact shared is actually the sender's own number
            // Telegram sets contact.user_id when the user taps "Share My Phone Number"
            // A forwarded contact won't have user_id matching message.from.id
            if (!contact.user_id || contact.user_id !== message.from?.id) {
                await sendMessage(
                    chatId,
                    '⚠️ <b>Invalid Contact</b>\n\nPlease share <b>your own</b> phone number using the button below, not a forwarded contact.',
                    undefined,
                    {
                        keyboard: [[{ text: '📱 Share My Phone Number', request_contact: true }]],
                        resize_keyboard: true,
                        one_time_keyboard: true,
                    }
                );
                return NextResponse.json({ ok: true });
            }

            // Look up which session this chatId is waiting for
            const sessionId = getSessionIdByChatId(String(chatId));
            if (!sessionId) {
                await sendMessage(
                    chatId,
                    '⚠️ <b>Session not found.</b>\n\nThis verification link may have expired. Please go back to the Bid Wars website and start again.',
                    undefined,
                    { remove_keyboard: true }
                );
                return NextResponse.json({ ok: true });
            }

            const session = getSession(sessionId);
            if (!session) {
                await sendMessage(
                    chatId,
                    '⚠️ <b>Verification link expired.</b>\n\nThis link is only valid for 10 minutes. Please go back to the Bid Wars website and start again.',
                    undefined,
                    { remove_keyboard: true }
                );
                return NextResponse.json({ ok: true });
            }

            // Normalise phone: Telegram sometimes includes/omits the leading +
            const rawPhone = (contact.phone_number as string).replace(/\D/g, '');
            const phoneNumber = rawPhone.startsWith('91') && rawPhone.length === 12
                ? rawPhone.slice(2)  // strip country code for Indian numbers (store as 10-digit)
                : rawPhone;

            // Mark session as fully verified with telegramId + phoneNumber
            verifySession(sessionId, String(chatId), phoneNumber);

            // Build the return URL (callback page)
            const returnUrl = `${APP_URL}/auth/telegram-callback?s=${sessionId}`;

            // Remove the contact keyboard and send the callback button
            await sendMessage(
                chatId,
                `✅ <b>Identity Confirmed!</b>\n\nYour phone number has been verified and your Telegram linked to your <b>Bid Wars</b> account.\n\nTap the button below to finish creating your account.\n\n<i>This link is valid for 10 minutes.</i>`,
                [{ text: '🎮  Continue to Bid Wars  →', url: returnUrl }],
                { remove_keyboard: true }
            );

            return NextResponse.json({ ok: true });
        }

        // ── STEP 1: Handle /start command ─────────────────────────────────────────
        if (!text.startsWith('/start')) {
            await sendMessage(
                chatId,
                '👾 <b>Bid Wars Login Bot</b>\n\nThis bot verifies your identity for <b>bidwars.xyz</b>.\n\nPlease start verification from the website by creating a Main Account.'
            );
            return NextResponse.json({ ok: true });
        }

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

        // Session already verified
        if (session.status === 'verified') {
            await sendMessage(chatId, '✅ This session has already been verified!');
            return NextResponse.json({ ok: true });
        }

        // Session already awaiting contact from someone else — prevent session hijacking
        if (session.status === 'pending_contact' && session.chatId && session.chatId !== String(chatId)) {
            await sendMessage(chatId, '⚠️ This verification link is already in use by another account.');
            return NextResponse.json({ ok: true });
        }

        // ── DUPLICATE CHECK: reject if this Telegram account is already registered ──
        const existingUser = await prisma.user.findUnique({
            where: { telegramId: String(chatId) },
            select: { username: true },
        });

        if (existingUser) {
            await sendMessage(
                chatId,
                `⚠️ <b>Telegram Already Registered</b>\n\nThis Telegram account is already linked to the Bid Wars Main Account <b>@${existingUser.username}</b>.\n\nEach Telegram account can only be used for <b>one Main Account</b>.\n\n<i>If you believe this is an error, please contact support.</i>`
            );
            return NextResponse.json({ ok: true });
        }

        // ── Transition to pending_contact — ask for phone number ─────────────────
        awaitContact(sessionId, String(chatId));

        await sendMessage(
            chatId,
            `👋 <b>Almost there, ${session.username}!</b>\n\n` +
            `To complete your <b>Bid Wars</b> Main Account verification, we need your phone number.\n\n` +
            `Tap the button below — Telegram will securely share your registered number with us.\n\n` +
            `<i>We only use this to link your account. It is never shared or sold.</i>`,
            undefined,
            {
                keyboard: [[{ text: '📱 Share My Phone Number', request_contact: true }]],
                resize_keyboard: true,
                one_time_keyboard: true,
            }
        );

        return NextResponse.json({ ok: true });

    } catch (err) {
        console.error('[telegram-webhook] error:', err);
        // Must always return 200 to Telegram to avoid retries
        return NextResponse.json({ ok: true });
    }
}
