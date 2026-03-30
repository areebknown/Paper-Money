# API Setup: Final Steps & FAQs

I've received your keys! Before we start the code, please ensure the following configurations are set in your Google and Meta dashboards.

---

## 1. Google OAuth (Action Required)
You mentioned leaving the Redirect URIs blank—**you must go back and fill them in**, otherwise Google will block the login.

1.  Go to **APIs & Services > Credentials** in the Google Console.
2.  Edit your OAuth Client.
3.  **Authorized JavaScript Origins**: `http://localhost:3000`
4.  **Authorized Redirect URIs**: `http://localhost:3000/api/auth/google/callback`
5.  **Save changes**.

---

## 2. Meta Business API (Updating to 2024/25 Standards)
The "newer options" you see are because Meta has unified everything under "Business Manager."

*   **What you need**: A **Permanent System User Access Token**. Regular "User Tokens" expire every 60 days, which would break your login system.
*   **How to get it**: 
    1. In Business Settings, go to **Users > System Users**.
    2. Add one (Admin role).
    3. Click **Generate New Token**.
    4. Select your App and the `whatsapp_business_messaging` permission.
*   **What is the 'App'?**: The "App" is just your project's identity in Meta's database. It's how they know who is requesting permission to send WhatsApp messages.

---

## 3. App Status & Publishing
*   **"Not Published"**: This is perfectly fine for now! In "Testing" mode, only you and users you manually add as "Test Users" in the Google/Meta consoles can log in. 
*   **Going Live**: When the app is ready for everyone, you just click "Publish" in both dashboards. Google will review it, and then it becomes public.

---

## 4. Environment Variables
I'll be using these keys in our `.env`. Note that I'm using the **Cloudinary identifier** (`dzsr4olmn`) I found in your code for the "Cloud Name."

```env
# Google
GOOGLE_CLIENT_ID="[CLIENT_ID].apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="[REDACTED_SECRET]"

# Cloudinary
CLOUDINARY_API_SECRET="[REDACTED_SECRET]"
CLOUDINARY_CLOUD_NAME="dzsr4olmn"
```
