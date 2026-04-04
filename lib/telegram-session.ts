/**
 * In-memory Telegram Auth Session Store
 * Maps sessionId → { status, telegramId, username, createdAt }
 * Sessions expire after 10 minutes. Same pattern as otp-store.ts.
 *
 * Note: In-memory, so a cold-start loses pending sessions.
 * That's acceptable at our scale — sessions expire anyway.
 */

export type TelegramSession = {
    status: 'pending' | 'verified';
    telegramId?: string;
    username: string;
    createdAt: number;
};

const sessionStore = new Map<string, TelegramSession>();

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

export function verifySession(sessionId: string, telegramId: string): boolean {
    const session = sessionStore.get(sessionId);
    if (!session || session.status === 'verified') return false;
    session.status = 'verified';
    session.telegramId = telegramId;
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
