# Database Schema & Data Models

This document explains the core database architecture built with Prisma ORM and hosted on PostgreSQL (Neon DB).

## Core Models

### 1. `User`
Manages authentication, balances, and permissions.
- `id`: String (UUID) - Primary key.
- `username`: String (Unique) - Display name.
- `balance`: Decimal - Stored safely as Decimal to avoid floating-point math issues during bids.
- `isAdmin`: Boolean - Crucial for protecting admin API routes.
- `inventory`: Relation - Artifacts won by this user.
- `bids`: Relation - All bids placed by the user across auctions.

### 2. `Item` (Artifacts)
The actual items being auctioned or held in inventory.
- `id`: String (UUID) - Primary key.
- `name`: String - Name of the artifact.
- `description`: String - Optional details.
- `imageUrl`: String - Hosted on Cloudinary.
- `type`: String - e.g., 'BRONZE', 'SILVER', 'GOLD'.
- `basePrice`: Decimal - The underlying market value.

### 3. `Auction`
The core state machine for the bidding process.
- `id`: String (UUID) - Primary key.
- `itemId`: String - Relation to the `Item` being auctioned.
- `status`: Enum - `SCHEDULED`, `WAITING_ROOM`, `LIVE`, `COMPLETED`, `VOID`.
- `startingPrice`: Decimal - The initial ask.
- `currentPrice`: Decimal - The active highest bid amount.
- `scheduledAt`: DateTime - When it's meant to start.
- `startedAt`: DateTime (Nullable) - When it actually went LIVE.
- `endedAt`: DateTime (Nullable) - The deadline (constantly extended by 10s upon new bids).
- `lastBidAt`: DateTime (Nullable) - Used by the server to enforce the 12s Last-Second Sniper guard before allowing an auction to end.
- `winnerId`: String (Nullable) - Filled only when status hits `COMPLETED`.
- `isClaimed`: Boolean - Whether the winner has paid.
- `claimExpiresAt`: DateTime (Nullable) - 24hr window for payment.

### 4. `AuctionBid`
The ledger of every bid placed.
- `id`: String (UUID) - Primary key.
- `auctionId`: String - Refers to the `Auction`.
- `bidderId`: String - Refers to the `User`.
- `amount`: Decimal - The bid amount.
- `timestamp`: DateTime - The precise time the bid was locked in the DB.

## Important Note on Prisma `$transaction`
Whenever a user places a bid or claims an item, we rely on PostgreSQL row-level locking via Prisma's `$queryRaw` to prevent race conditions. Do not rely on Prisma's standard `update` for concurrent math unless explicitly placed inside a locked transaction.
