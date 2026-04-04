/**
 * Fast2SMS Quick SMS Utility
 * Route: q (Quick SMS) — transactional OTPs
 * Cost: ~₹5 per message — only call after DB uniqueness check
 */
export async function sendSMSOTP(phoneNumber: string, otp: string): Promise<{ success: boolean; error?: string }> {
    const apiKey = process.env.FAST2SMS_API_KEY;

    if (!apiKey) {
        // Dev mode: log and simulate
        console.log(`[Fast2SMS SIMULATED] OTP for ${phoneNumber}: ${otp}`);
        return { success: true };
    }

    const message = `Your Bid Wars OTP is ${otp}. Valid for 10 minutes. Do not share this with anyone.`;

    const url = new URL('https://www.fast2sms.com/dev/bulkV2');
    url.searchParams.set('authorization', apiKey);
    url.searchParams.set('route', 'q');
    url.searchParams.set('message', message);
    url.searchParams.set('numbers', phoneNumber); // 10-digit Indian number, no country code
    url.searchParams.set('flash', '0');

    try {
        const res = await fetch(url.toString(), {
            method: 'GET',
            headers: { 'cache-control': 'no-cache' },
        });

        const data = await res.json();

        if (data.return === true) {
            return { success: true };
        } else {
            console.error('[Fast2SMS Error]', data);
            return { success: false, error: data.message?.[0] || 'SMS delivery failed' };
        }
    } catch (err) {
        console.error('[Fast2SMS Network Error]', err);
        return { success: false, error: 'SMS service unreachable' };
    }
}
