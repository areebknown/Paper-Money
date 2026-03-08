# Server Load & Free Tier Impact Analysis

A major challenge with scaling real-time applications on free tiers is managing the frequency of database reads and Serverless Function executions. Here is the deep analysis of all polling loops, server-heavy tasks, and WebSocket channels currently implemented in the Bid Wars ecosystem, and how they stack up against the limits of the **Vercel Hobby Tier**, **Neon Database Free Tier**, and **Pusher Sandbox Tier**.

## Free Tier Limits Reference
- **Vercel (Hobby):** 100GB Bandwidth, unlimited API requests (subject to Fair Use), 1,000 Edge Middleware invocations/day, 10-second max function timeout.
- **Neon DB (Free):** 500 MB Storage, 100 hours of active compute/month (approx 3.3 hrs active computation per day), Serverless Driver connection pooling.
- **Pusher (Sandbox):** 100 concurrent websocket connections, 200,000 messages per day.

---

## 1. Neon DB & Vercel: The 5-Second Fallback Polling 

### The Implementation
Inside `app/bid/[id]/page.tsx`, there is a bulletproof fallback polling system. Every **5 seconds**, every active user in an auction room hits the `GET /api/auctions/[id]/poll` endpoint.
This endpoint makes two immediate database queries using Prisma:
1. `findUnique` (Auction status, currentPrice, endedAt)
2. `findMany` (Last 50 bids sorted by timestamp)

### The Impact (High Frequency, Low Volume)
This is the most compute-heavy process, but its total monthly cost depends entirely on the event frequency.

**Specific Volume Analysis:**
- 15 users max, ~9 users average per auction.
- ~17 auctions total per month.
- 1 auction duration (avg): ~10 minutes.

**Total Monthly Compute:**
- 17 auctions * 10 minutes = **170 minutes of total active polling time per month**.
- 170 minutes = **2.83 hours of active Neon compute time**.

**Will it break the Free Tier?**
- **Vercel:** ✅ **Safe.** 170 minutes of serverless execution time is well within the Hobby limits.
- **Neon DB:** ✅ **Extremely Safe.** We are given 100 compute hours per month. The current volume only consumes **~3%** of the total monthly budget. 

**Verdict:** 
With this schedule of 14-17 bids/month, we **keep the 5-second polling.** It provides a critical safety buffer for users with negligible impact on technical limits. We have enough headroom to grow traffic 10x before even needing to consider moving the interval to 10s or 15s.

---

## 2. Pusher Channels: Message & Connection Quotas

We currently use exactly 3 distinct active channel structures. 

### A. The `global-auctions` Channel
**Subscribers:** Every user on the Home Page.
**Signals fired:** Created, Waiting-Room, Started, Ended.
**Impact:** Extremely low. An entire lifecycle of a single auction only fires **4 messages in total**. 

### B. The `user-[id]` Channel
**Subscribers:** Every logged-in user.
**Signals fired:** `balance-update` (Triggered on artifact claim, or admin manual credit).
**Impact:** Microscopic. This fires a single message directly to a single user stringently.

### C. The `auction-[id]` Channel (The Heavy Hitter)
**Subscribers:** Users actively engaged inside an auction room.
**Signals fired:** `new-bid` (Triggered absolutely every single time *anyone* places a bid).
**Impact:** **High / Primary Message Consumer**. 
If humans place a combined total of **100 bids** before an auction ends, that auction consumes precisely **100 pusher messages**. To breach the 200,000 free-tier daily cap, users would need to place 200,000 individual bids in a single day.
**Verdict:** ✅ **Extremely Safe.**

### D. The Concurrent Connection Threat
A "connection" is consumed every time a user opens a tab on your website. 
Because the global `Header` automatically subscribes to the `user-[id]` channel to watch for balance updates, **every single user online on your website anywhere counts as 1 concurrent connection**. 
**Verdict:** ⚠️ **Keep an eye on this limit.** If 101 people open the website at the exact same moment, the 101st person will be silently blocked from receiving live updates and will strictly rely on our 5-second polling fallback.

---

## 3. Upstash QStash & Background Processes

### The Impact (Microscopic)
QStash limits on the free tier provide **500 messages per day**.
Because an auction strictly requires 2 hooks (Waiting Room + Start), you could mathematically schedule **249 unique auctions** in a single day plus the 1 daily Market Cron, before hitting the limit.

**Will it break the Free Tier? ✅ Extremely Safe.**
