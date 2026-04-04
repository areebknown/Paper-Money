/**
 * Simple In-Memory OTP Store
 * Stores up to 2 OTPs per key (to handle resend gracefully).
 * In production with multiple serverless instances, use Redis instead.
 */

type OTPEntry = {
    otp: string;
    expiresAt: number;
    username?: string;
};

type OTPData = {
    current: OTPEntry;
    previous?: OTPEntry; // kept when user resends — so first OTP still works
};

const otpStore = new Map<string, OTPData>();

// Clean up expired OTPs every minute
if (typeof setInterval !== 'undefined') {
    setInterval(() => {
        const now = Date.now();
        for (const [key, data] of otpStore.entries()) {
            if (data.current.expiresAt < now && (!data.previous || data.previous.expiresAt < now)) {
                otpStore.delete(key);
            }
        }
    }, 60000);
}

const OTP_TTL = 5 * 60 * 1000; // 5 minutes

export function setOTP(key: string, otp: string, username?: string) {
    const existing = otpStore.get(key);
    const newEntry: OTPEntry = { otp, expiresAt: Date.now() + OTP_TTL, username };

    if (existing) {
        // On resend: keep the previous OTP so "late delivery" still works
        otpStore.set(key, { current: newEntry, previous: existing.current });
    } else {
        otpStore.set(key, { current: newEntry });
    }
}

export function verifyOTP(key: string, otp: string): { valid: boolean; username?: string } {
    const data = otpStore.get(key);
    if (!data) return { valid: false };

    const now = Date.now();

    // Check current OTP
    if (data.current.otp === otp && data.current.expiresAt >= now) {
        otpStore.delete(key);
        return { valid: true, username: data.current.username };
    }

    // Check previous OTP (handles late delivery after resend)
    if (data.previous && data.previous.otp === otp && data.previous.expiresAt >= now) {
        otpStore.delete(key);
        return { valid: true, username: data.previous.username };
    }

    return { valid: false };
}
