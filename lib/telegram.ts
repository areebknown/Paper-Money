/**
 * Telegram Bot API helper
 * Sends messages to users via the Bot API.
 */

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const BASE = `https://api.telegram.org/bot${TOKEN}`;

interface InlineButton {
    text: string;
    url: string;
}

export async function sendMessage(
    chatId: string | number,
    text: string,
    inlineButtons?: InlineButton[],
    replyMarkup?: Record<string, unknown>
): Promise<void> {
    const body: Record<string, unknown> = {
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
    };

    if (inlineButtons && inlineButtons.length > 0) {
        body.reply_markup = {
            inline_keyboard: [inlineButtons.map((btn) => ({ text: btn.text, url: btn.url }))],
        };
    } else if (replyMarkup) {
        body.reply_markup = replyMarkup;
    }

    await fetch(`${BASE}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
}
