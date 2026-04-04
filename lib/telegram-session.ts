/**
 * In-memory Telegram Auth Session Store
 * Maps sessionId → { status, telegramId, username, createdAt }
 * Sessions expire after 10 minutes. Same pattern as otp-store.ts.
 *
 * Note: In-memory, so a cold-start loses pending sessions.
 * That's acceptable at our scale — sessions expire anyway.
 */

export type TelegramSession = {
    status: 'pending' | 'pending_contact' | 'verified';
    telegramId?: string;
    phoneNumber?: string;
    chatId?: string;     // chatId of the user who opened the bot
    username: string;
    createdAt: number;
};

const sessionStore = new Map<string, TelegramSession>();

// Maps chatId → sessionId for the pending_contact step
const contactStore = new Map<string, string>();

const SESSION_TTL = 10 * 60 * 1000; // 10 minutes

// Cleanup every minute
if (typeof setInterval !== 'undefined') {
    setInterval(() => {
        const now = Date.now();
        for (const [key, session] of sessionStore.entries()) {
            if (now - session.createdAt > SESSION_TTL) {
                sessionStore.delete(key);
            }
        }
    }, 60_000);
}

export function createSession(sessionId: string, username: string): void {
    sessionStore.set(sessionId, {
        status: 'pending',
        username,
        createdAt: Date.now(),
    });
}

/** Called when the user opens the bot — locks the session to that chatId and requests contact */
export function awaitContact(sessionId: string, chatId: string): boolean {
    const session = sessionStore.get(sessionId);
    if (!session || session.status !== 'pending') return false;
    session.status = 'pending_contact';
    session.chatId = chatId;
    contactStore.set(chatId, sessionId);
    return true;
}

/** Look up which sessionId a chatId is pending for */
export function getSessionIdByChatId(chatId: string): string | null {
    return contactStore.get(chatId) ?? null;
}

export function verifySession(sessionId: string, telegramId: string, phoneNumber: string): boolean {
    const session = sessionStore.get(sessionId);
    if (!session || session.status === 'verified') return false;
    session.status = 'verified';
    session.telegramId = telegramId;
    session.phoneNumber = phoneNumber;
    // Clean up the contact store entry
    if (session.chatId) contactStore.delete(session.chatId);
    return true;
}

export function getSession(sessionId: string): TelegramSession | null {
    const session = sessionStore.get(sessionId);
    if (!session) return null;

    // Check if expired
    if (Date.now() - session.createdAt > SESSION_TTL) {
        sessionStore.delete(sessionId);
        return null;
    }

    return session;
}

export function deleteSession(sessionId: string): void {
    sessionStore.delete(sessionId);
}
