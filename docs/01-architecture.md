# Bid Wars: Complete Architecture Blueprint

## Application Overview
"Bid Wars" is a highly interactive, real-time multiplayer bidding application inspired by games like GTA Online, but dealing with real-world or digital "Artifacts". Users log in, deposit imaginary currency, wait for scheduled auctions in a real-time waiting room, and then fiercely bid against each other in 10-second sniper-style live auctions. Winners receive artifacts in their Vault/Inventory, which they can either hoard or sell back to a Pawn Shop.

The app uses **Next.js (App Router)** for both frontend and backend API.

## Core Tech Stack
- **Database:** PostgreSQL hosted on Neon DB, accessed via **Prisma ORM**.
- **Real-Time WebSockets:** **Pusher** (Channels for live bids/status, Beams for push notifications).
- **Background Jobs / Crons:** **Upstash QStash** (used to bypass Vercel's 10-second timeout limits and run scheduled tasks reliably).
- **Image Hosting:** **Cloudinary** (Stores artifact images uploaded via the Admin panel).
- **Styling:** Tailwind CSS with heavy usage of complex gradients, CSS animations, and faux-3D box shadows for a premium, gaming-inspired aesthetic.
- **Authentication:** Custom JWT-based cookie authentication.

---

## 1. Game Logic & The Auction Lifecycle

An Auction moves strictly through these states, enforced by Prisma queries and state machine logic:
1. `SCHEDULED`: Auction exists in the future. Users can "Subscribe" via Pusher Beams to receive a push notification when it's about to open.
2. `WAITING_ROOM`: 5 minutes before the start time. The UI shows a countdown lock.
3. `LIVE`: The auction is actively receiving bids.
4. `COMPLETED`: The auction is over, a winner is decided. The winner has 24 hours to "Pay & Claim" the item.
5. `CLAIMED`: The winner successfully paid. The item moves to their inventory, balance is deducted.
6. `VOID`: The winner failed to pay within 24 hours, or an Admin cancelled the auction.

---

## 2. Frontend Architecture (Real-Time Dynamics)

### The Home Page (`/app/home/page.tsx`)
- Displays Scheduled Bids, live Waiting Rooms, the User's Balance, and their recent "Won Shutters" (COMPLETED but unclaimed bids).
- Connects to the `global-auctions` Pusher channel to instantly hear if an Admin created a new auction, or if an auction went LIVE or COMPLETED.
- Avoids intensive polling. Instead, it securely refetches data locally when the user returns to the tab using a `visibilitychange` window listener.

### The Live Bid Room (`/app/bid/[id]/page.tsx`)
- The most complex component in the app. Contains a 2.5D visual staging ground with a descending "Shutter".
- Shows live chat bubbles for incoming bids.
- **The Countdown Mechanic:** Every time a new bid is placed, the timer strictly resets to exactly **10 seconds**.
- **The Server Fallback:** The page inherently trusts Pusher channels for absolute up-to-the-millisecond data. However, as an ironclad safety net for bad network connections, every user in the room pings `GET /api/auctions/[id]/poll` every **5 seconds** to fetch their exact status directly from Neon DB.

---

## 3. Backend Architecture & Concurrency Locks

### Placing a Bid (`/api/bid/place`)
This is the most critical endpoint. If two users click "Bid" at the exact same millisecond, we cannot double-count them.
- **Row-Level Locking:** It uses Prisma's `$queryRaw` to execute a `SELECT ... FOR UPDATE` lock directly on the PostgreSQL `Auction` row.
- Whichever request hits the DB first locks the row exclusively. The second request is forced to wait.
- The first request creates the bid, updates the `currentPrice`, updates `lastBidAt` to `now()`, and unlocks the row.
- The second request enters the lock, sees the price is already higher than its payload, and rejects the user gracefully with "BID_TOO_LOW".

### Ending an Auction (`/api/auctions/[id]/end`)
When a client's 10-second timer hits 0, it calls this endpoint to declare the auction over.
- **The Server Guard (Last-Second Sniper Protection):** Clients and networks lag. A user might place a bid at 9.9 seconds. Their client sends it to the server, but before the server can broadcast the new 10s timer via Pusher, another user's timer hits 0 and they try to end the auction.
- The Server protects against this. When the `/end` route is called, the server asks the DB: *"How many milliseconds has it actually been since `lastBidAt`?"*
- If it hasn't been at least **12 full seconds** (10s + 2s latency buffer), the server REJECTS the end request, telling the eager client "Wait, a sniper just fired, resume your countdown!"

---

## 4. Upstash QStash & Background Processes

Vercel Serverless Functions die after 10-15 seconds. Making a `setTimeout` for 10 minutes on a Vercel server will simply crash. We fully utilize **QStash** for all background cron-work.

1. **Auction Webhooks:** When an Admin creates an auction scheduled for Tomorrow at 5:00 PM, the server fires two schedules to QStash.
   - One scheduled message delivered at Tomorrow 4:55 PM (Hits `/api/webhooks/qstash` to transition auction to `WAITING_ROOM`).
   - One scheduled message delivered at Tomorrow 5:00 PM (Hits the webhook to transition to `LIVE`).
2. **Claim Expiry:** When an auction ends, the server tells QStash to ping back in exactly 24 hours. If the auction is still `COMPLETED` and not `CLAIMED`, the webhook flips it to `VOID`.
3. **Daily Market Cron:** QStash pings `/api/admin/market/cron` exactly at Server Midnight to update the global randomized market prices for Pawn Shop artifacts.

**Idempotency / Override Protection:**
What happens if QStash is scheduled to start an auction at 5:00 PM, but the Admin gets impatient and clicks "Start Now" at 4:30 PM?
Our internal Webhook receiver checks the DB first: *"Is this auction already LIVE or COMPLETED?"* If yes, the receiver drops the QStash hook in the garbage. QStash cannot accidentally rollback an auction state.
