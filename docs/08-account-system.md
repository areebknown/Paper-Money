# Account Hierarchy & Anti-Exploit System

This document outlines the dual-account architecture designed to prevent startup bonus exploits while allowing users to manage multiple "Finance" profiles under a single verified identity.

---

## 1. The Dual-Account Model

To ensure a high-trust environment, we distinguish between **Main** and **Secondary/Finance** accounts.

### A. The Main Account (The Root)
*   **Verification**: Strictly Mobile Number based. Verified via **Meta UPI / WhatsApp OTP**.
*   **Constraint**: One unique mobile number = One Main Account. This prevents infinite bot creation.
*   **Starter Bonus**: Receives **₹1 Lakh "Green Money"** upon first-time sign-up.
*   **Label**: Users see "Signing in" or "Identity Verified" for this tier.

### B. Secondary / Finance Accounts (The Branches)
*   **Verification**: Email/OAuth based (Google Auth, Gmail, or Resend API).
*   **Constraint**: Users can create multiple secondary accounts for different financial strategies.
*   **Starter Bonus**: **₹0**. These accounts do not receive the Green Money bonus to prevent funneling/sybil attacks.
*   **Role**: Used for specialized bidding or separate inventory management.

---

## 2. The "Green Money" Logic (Anti-Exploit)

**Green Money** is a restricted currency designed to keep the game's economy balanced.

*   **Non-Shareable**: It cannot be transferred to other users (P2P Transfers).
*   **Non-Investable**: It cannot be used to buy Assets/Resources in the Invest module.
*   **Bidding-Only**: Its sole purpose is to be used as starting capital for **Live Auctions**.
*   **Profit Conversion**: 
    *   When a user wins an item using Green Money and later resells it (via Pawn Shop or P2P), the revenue earned is paid out in **Paper Money** (Real Balance).
    *   This ensures users must actually "play" and "win" to turn their starter bonus into withdrawable/investable wealth.

---

## 3. Account Hierarchy ("The Tree")

To keep the platform transparent for Admins and organized for users, we are implementing a **Hierarchy Tree**.

### The "Join Accounts" Feature
*   **Location**: Settings > Security > Join Accounts.
*   **Function**: Allows a user to "claim" a Secondary account as a child of their Main account.
*   **Visual Structure**:
    ```text
    Main Account (+91 98XXX...)
    └── Finance Account (user1@gmail.com)
    └── Trading Account (user2@gmail.com)
    ```
*   **Admin Visibility**: Admins can see the entire tree to detect suspicious patterns or multi-account bidding within the same auction room.

---

## 4. Supabase Integration Strategy

We will integrate Supabase into the existing Neon-based architecture using a **Hybrid Secondary-Database** approach.

### Usage: Chat Only
*   Supabase will be used exclusively for high-volume, real-time chat data.
*   We will **NOT** use Supabase Auth.
*   **Bypassing Auth**: We will use the Supabase **Service Role Key** on our Next.js backend. Our existing Next.js API will act as the security gatekeeper, verifying our custom JWTs before writing/reading from the Supabase Postgres instance.

### Benefits
1.  **Zero Auth Friction**: Users don't need a "Supabase Login" to chat.
2.  **Scalability**: Real-time traffic is offloaded to Supabase's optimized engine.
3.  **Data Consistency**: The `userId` stored in Supabase messages will match the ID in our primary Neon `User` table.

---

## 5. Permanent Identity: The PMUID

To avoid identity confusion when users change their `username`, we are implementing a **source-of-truth ID**.

*   **Format**: `PM-XXXX-XXXX` (8-digit random numeric string).
*   **Generation**: Assigned automatically during **First-time Sign-up**.
*   **Immutability**: This ID **NEVER** changes, regardless of username updates.
*   **Usage**: 
    *   Adding friends or searching for a specific user.
    *   Identifying "Main" vs "Secondary" links in the Hierarchy Tree.
    *   Administrative auditing for support tickets.

