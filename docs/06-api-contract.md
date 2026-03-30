# Master API Contract

This document lists the critical backend API routes and their expected behaviors.

## Core Auction Routes

### `POST /api/bid/place`
The heart of the application. Uses Postgres row-level locking.
- **Payload:** `{ auctionId: string, amount: number }`
- **Behavior:** Verifies the user's balance, checks if the auction is LIVE, locks the Auction row, verifies the new amount > current highest bid + 100, creates the `AuctionBid`, updates the `Auction` currentPrice, extends the 10s timer, and fires the `new-bid` Pusher event.
- **Returns:** `{ success: true, bid: {...}, newPrice: number, ... }` or `400` if the bid is too low.

### `POST /api/auctions/[id]/end`
Fired by the client when their local 10s countdown hits zero.
- **Payload:** None.
- **Behavior:** The server checks `lastBidAt`. If `< 12` seconds have passed, it REJECTS the call (Sniper protection). Otherwise, it finds the highest bidder, sets the winner, changes status to `COMPLETED`, sets the 24hr `claimExpiresAt`, fires `auction-ended` via Pusher, and schedules a QStash expiry check.
- **Returns:** `{ success: true, auction: {...}, winnerId: string, ... }` or `{ success: false, remainingSeconds: number }` if rejected.

### `GET /api/auctions/[id]/poll`
The 5-second fallback for users with dropping WebSocket connections.
- **Behavior:** Fetches the current exact status of the auction and the last 50 bids.
- **Returns:** `{ status: string, currentPrice: number, endedAt: Date, bids: [...] }`

### `POST /api/auctions/[id]/claim`
Fired when a user clicks "Pay & Claim" in the 24hr won window.
- **Behavior:** Verifies caller is the `winnerId`, checks balance, deducts balance, sets `isClaimed = true`, creates a `UserItem` transferring ownership, and fires `balance-update` via Pusher. MUST be idempotent to prevent double-charging.

## Webhooks

### `POST /api/webhooks/qstash`
The universal receiver for all delayed tasks (from Upstash).
- **Behavior:** Receives a payload indicating an action (`start_auction`, `waiting_room`, `check_claim_expiry`). Before executing, it heavily queries the database to ensure the state hasn't been manually overridden (Idempotency check).

## Admin Routes (Protected)
- `POST /api/admin/auctions/create`: Schedules a new auction and creates QStash schedules.
- `POST /api/admin/auctions/[id]/start`: Force-starts an auction early.
- `POST /api/admin/market/cron`: Schedules the everyday midnight market refresh.

---

## Data & State Syncing

### `GET /api/market/sync`
Used to fetch fresh market data for the /invest page.
- **Behavior**: Returns all assets and their current prices. Used by Pusher listeners to re-validate local state.
- **Returns**: `{ assets: [...] }`

### `GET /api/inventory`
The unified source of truth for the /inventory page.
- **Behavior**: Consolidates user balance, rank, portfolios (with current assets), artifact list, and coupons into a single query. Highly optimized for concurrent app starts.
- **Returns**: `{ user: {...}, rank: {...}, portfolios: [...], ownedArtifacts: [...] }`

