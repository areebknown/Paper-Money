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

        // ── STEP 1: Handle Commands ───────────────────────────────────────────────
        let existingUser: any = null;
        if (text.startsWith('/mybalance') || text.startsWith('/myresource') || text.startsWith('/postquery')) {
            existingUser = await prisma.user.findUnique({
                where: { telegramId: String(chatId) },
                include: { portfolios: { include: { asset: true } } }
            });
            if (!existingUser) {
                await sendMessage(chatId, '⚠️ You must link your Telegram account to a Bid Wars Main Account first.');
                return NextResponse.json({ ok: true });
            }
        }

        if (text.startsWith('/mybalance')) {
            const balance = Number(existingUser.balance);
            const greenMoney = Number(existingUser.greenMoney);
            const loanTokens = existingUser.loanTokens;
            const investedMoney = existingUser.portfolios.reduce((sum: number, p: any) => sum + (Number(p.units) * Number(p.asset.currentPrice)), 0);
            const netWorth = balance + investedMoney;

            const fmt = (n: number) => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

            await sendMessage(chatId, 
                `💰 <b>Your Balance Summary</b>\n\n` +
                `🔹 <b>Available Balance:</b> ${fmt(balance)}\n` +
                `🔹 <b>Invested Money:</b> ${fmt(investedMoney)}\n` +
                `🔹 <b>Green Money:</b> ${fmt(greenMoney)}\n` +
                `🔹 <b>Loan Tokens Available:</b> ${loanTokens}\n\n` +
                `💎 <b>Total Net Worth:</b> ${fmt(netWorth)}`
            );
            return NextResponse.json({ ok: true });
        }

        if (text.startsWith('/myresource')) {
            if (existingUser.portfolios.length === 0) {
                await sendMessage(chatId, `📦 <b>Your Resources</b>\n\nYou do not own any resources yet.`);
                return NextResponse.json({ ok: true });
            }

            let resText = `📦 <b>Your Resources</b>\n\n`;
            existingUser.portfolios.forEach((p: any) => {
                const units = Number(p.units);
                const displayUnits = units >= 1000 ? `${(units/1000).toFixed(1)}k` : units.toFixed(units < 10 ? 2 : 0);
                resText += `• <b>${p.asset.name}:</b> ${displayUnits} ${p.asset.unit}\n`;
            });

            await sendMessage(chatId, resText);
            return NextResponse.json({ ok: true });
        }

        if (text.startsWith('/postquery')) {
            const queryText = text.replace('/postquery', '').trim();
            if (!queryText) {
                await sendMessage(chatId, `📝 <b>Post a Query</b>\n\nPlease include your message after the command.\n\nExample:\n<code>/postquery How do I sell my artifacts?</code>`);
                return NextResponse.json({ ok: true });
            }

            // Support formatting contact string
            const contactString = existingUser.phoneNumber ? `Phone: +91${existingUser.phoneNumber}` : 
                                 (existingUser.email ? `Email: ${existingUser.email}` : `TG: ${chatId}`);

            await prisma.playerQuery.create({
                data: {
                    userId: existingUser.id,
                    username: existingUser.username,
                    contact: contactString,
                    text: queryText
                }
            });

            await sendMessage(chatId, `✅ <b>Query Submitted!</b>\n\nYour message has been sent directly to the admins. We will look into it shortly.`);
            return NextResponse.json({ ok: true });
        }

        if (!text.startsWith('/start')) {
            await sendMessage(
                chatId,
                '👾 <b>Bid Wars Login Bot</b>\n\nCommands:\n/mybalance - Display your balances\n/myresource - View owned resources\n/postquery [text] - Send a message to admins\n\n<i>To start verification, use the link from the website.</i>'
            );
            return NextResponse.json({ ok: true });
        }

        const parts = text.trim().split(' ');
        const sessionId = parts[1];

        // No session ID — user opened the bot directly
        if (!sessionId) {
            await sendMessage(
                chatId,
                '👾 <b>Bid Wars Login Bot</b>\n\nCommands:\n/mybalance - Display your balances\n/myresource - View owned resources\n/postquery [text] - Send a message to admins\n\n<i>To start verification, use the link from the website.</i>'
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
        const existingLoginUser = await prisma.user.findUnique({
            where: { telegramId: String(chatId) },
            select: { username: true },
        });

        if (existingLoginUser) {
            await sendMessage(
                chatId,
                `⚠️ <b>Telegram Already Registered</b>\n\nThis Telegram account is already linked to the Bid Wars Main Account <b>@${existingLoginUser.username}</b>.\n\nEach Telegram account can only be used for <b>one Main Account</b>.\n\n<i>If you believe this is an error, please contact support.</i>`
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
