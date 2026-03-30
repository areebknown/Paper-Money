/**
 * WhatsApp OTP Service (Meta Business API)
 * Handles sending verification codes to users.
 * Supports a "Dev Simulator" mode for local testing.
 */

const META_TOKEN = process.env.META_BUSINESS_TOKEN;
const PHONE_NUMBER_ID = process.env.META_PHONE_NUMBER_ID;
const IS_DEV = process.env.NODE_ENV === 'development';

export async function sendWhatsAppOTP(phoneNumber: string, otp: string) {
    if (IS_DEV || !META_TOKEN || !PHONE_NUMBER_ID) {
        console.log(`[WhatsApp Simulator] SENT TO ${phoneNumber}: Your verification code is ${otp}`);
        // Simulate a tiny network delay for realism
        await new Promise(resolve => setTimeout(resolve, 800));
        return { success: true, simulated: true };
    }

    try {
        const response = await fetch(`https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${META_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: phoneNumber,
                type: 'template',
                template: {
                    name: 'verification_code', // Meta requires a pre-approved template name
                    language: { code: 'en_US' },
                    components: [
                        {
                            type: 'body',
                            parameters: [
                                { type: 'text', text: otp }
                            ]
                        },
                        {
                            type: 'button',
                            sub_type: 'url',
                            index: 0,
                            parameters: [
                                { type: 'text', text: otp }
                            ]
                        }
                    ]
                }
            }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || 'Meta API failure');

        return { success: true, metaId: data.messages[0].id };
    } catch (error) {
        console.error('[WhatsApp Error]', error);
        return { success: false, error: (error as Error).message };
    }
}
