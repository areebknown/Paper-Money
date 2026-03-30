# API Setup Guide: Google & Meta Business

To implement the "Main" and "Side" account flows, you will need to obtain specific API credentials from Google and Meta.

---

## 1. Google OAuth (For Side Accounts & PFP Linking)
This allows users to sign in with their Gmail and fetch their Google profile picture.

1.  Go to the **[Google Cloud Console](https://console.cloud.google.com/)**.
2.  Create a **New Project** (Title: "Paper Money Bid Wars").
3.  Navigate to **APIs & Services > Credentials**.
4.  Click **Create Credentials > OAuth client ID**.
5.  Select **Web Application** as the Application Type.
6.  **Authorized Redirect URIs**: Add `http://localhost:3000/api/auth/callback/google` (for local dev) and your production Vercel URL later.
7.  Copy the **Client ID** and **Client Secret**.
8.  **Env Variables**: 
    ```env
    GOOGLE_CLIENT_ID="xxx"
    GOOGLE_CLIENT_SECRET="xxx"
    ```

---

## 2. Meta Business API (For WhatsApp OTP)
This is for the "Main Account" mobile verification.

1.  Go to the **[Meta for Developers](https://developers.facebook.com/)** portal.
2.  **Create App**: Select "Business" as the type.
3.  Add the **WhatsApp** product to your app.
4.  **Phone Number Setup**: You will need to verify your business phone number to send official OTPs.
5.  **Token Generation**: Generate a **Permanent Access Token** in your Business Manager settings.
6.  **Env Variables**:
    ```env
    META_BUSINESS_TOKEN="xxx"
    META_PHONE_NUMBER_ID="xxx"
    ```

> [!NOTE]
> I have already confirmed that your **Resend Key** is present in the `.env`. You do **not** need a separate one for the Side Account OTPs; one key works for all transactional emails/OTPs.

---

## 3. Cloudinary (Server-Side Admin)
For the automated "Old PFP Cleanup" logic to work, I need the Admin API Secret.

1.  Log in to your **[Cloudinary Dashboard](https://cloudinary.com/console/)**.
2.  Under **Account Details**, copy the `API Secret`.
3.  **Env Variables**:
    ```env
    CLOUDINARY_API_SECRET="xxx"
    ```
