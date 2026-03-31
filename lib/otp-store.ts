/**
 * Simple In-Memory OTP Store
 * In production with multiple instances, use Redis or a Database table.
 * For this app, a global Map will suffice for the signup flow duration.
 */

type OTPData = {
    otp: string;
    expiresAt: number;
    username?: string;
};

const otpStore = new Map<string, OTPData>();

// Clean up expired OTPs every minute
if (typeof setInterval !== 'undefined') {
    setInterval(() => {
        const now = Date.now();
        for (const [key, data] of otpStore.entries()) {
            if (data.expiresAt < now) {
                otpStore.delete(key);
            }
        }
    }, 60000);
}

export function setOTP(phoneNumber: string, otp: string, username?: string) {
    // Expires in 10 minutes
    otpStore.set(phoneNumber, {
        otp,
        expiresAt: Date.now() + 10 * 60 * 1000,
        username,
    });
}

export function verifyOTP(phoneNumber: string, otp: string): { valid: boolean; username?: string } {
    const data = otpStore.get(phoneNumber);
    if (!data) return { valid: false };

    if (data.expiresAt < Date.now()) {
        otpStore.delete(phoneNumber);
        return { valid: false };
    }

    if (data.otp === otp) {
        otpStore.delete(phoneNumber);
        return { valid: true, username: data.username };
    }

    return { valid: false };
}
