# 🐞 Historical Bug Log & Resolutions

This log documents the most difficult and insidious bugs we discovered during the development of Bid Wars. 

**DO NOT RE-INTRODUCE THESE PATTERNS.** When modifying real-time logic, countdown hooks, or database queries, heavily review how these issues were solved.

---

### 1. The React `VERIFYING` State Infinite Freeze
**The Bug:**
When the 10-second timer hit 0 on the client, the UI switched to `VERIFYING BIDS` and absolutely froze. The client successfully fired the `fetch('/api/auctions/[id]/end')` request, but completely stopped listening for the response. No error was thrown. Just a permanent `VERIFYING` screen until the user refreshed the page.

**The Cause:**
A cyclic React dependency. In the `useEffect` that handled the 1s countdown tick, we included `isVerifying` in the dependency array. 
When the timer hit 0, the code did `setIsVerifying(true)` AND fired the `endAuction` async fetch. 
Because `isVerifying` changed, React instantly unmounted the `useEffect` block, running its `return () => clearTimeout()` cleanup function. Because the function unmounted, the `endAuction` Promise handler was orphaned and destroyed inside the component's brain *while the network request was actually in-flight to the server*.

**The Fix:**
Decoupled the UI state from the timer's logical brain. We created a `useRef` boolean (`isVerifyingRef.current`) to strictly track whether the network request was operating without triggering a React re-render. We then updated the literal `isVerifying` state variable purely for visual purposes.

---

### 2. The Twin-Bubble "Simultaneous Bid" Race Condition
**The Bug:**
Two users click the "Bid" button at the exact same physical millisecond. Both clients ping the database, ask "is my 100rs bigger than the current 0rs starting price?", the database answers "Yes!" to both, and both users successfully place a 100rs bid. The chat shows two identical 100rs bubbles side-by-side.

**The Fix:**
Implemented PostgreSQL Row-Level Locking via Prisma `$queryRaw` running standard `SELECT ... FOR UPDATE`.
Hitting the database to read the `currentPrice` outside of a lock is completely unsafe. Any validation logic regarding "is this bid high enough" absolutely MUST occur strictly bound inside the `$transaction` lock, right before the `.create` command.

---

### 3. The "Ghost" QStash Manual Start Override
**The Bug:**
An Admin creates a scheduled auction (e.g., for 5:00 PM) which schedules two QStash webhooks (Waiting Room at 4:55, Start at 5:00). At 2:00 PM, the Admin clicks the "Start Now" override button. The auction goes LIVE, people bid, someone wins, it is marked COMPLETED. 
Three hours later at 5:00 PM, the auction physically resurrected itself in the DB back to `LIVE` because the QStash webhook blindly fired and updated the status.

**The Fix:**
You cannot easily delete a QStash schedule without saving its specific QStash ID to your database. Instead of trying to hunt down and delete the hook, we made the Webhook Receiver "Idempotent / State-Aware". Before the receiver honors any `auction-waiting-room` or `auction-start` command from QStash, it checks the database. If the auction is NOT in `SCHEDULED` status, the server simply ignores QStash and returns a 200 OK dropping the execution in the garbage.

---

### 4. The Home Page Silent Balance Desync
**The Bug:**
When a user paid for a won artifact inside the `SoldDialog` on the Home Page, the `BidsContent` component dispatched a hidden browser `window.dispatchEvent(new CustomEvent('balance-update-local'))` to try and secretly tell the root Sidebar Header to update the user's balance text. It regularly failed silently resulting in the user's header displaying stale balance data.

**The Fix:**
Standardized the React Top-Down data flow. We passed a literal `onBalanceUpdate={(newBal) => setUserData(...)}` prop directly from the uppermost Page parent down into the child components. When the payment successful `fetch` resolves, it calls the prop function, strictly enforcing a unified React state recalculation.

---

*(Append new major architectural bugs below as they occur)*

---

### 5. The Sequential Fetching "Stack" (8-Second Page Loads)
**The Bug:**
The Invest and Asset Specific pages were taking upwards of 8 seconds to load on specialized Serverless SQL (Neon). The screen remained completely white/blank during this "Time to First Byte" (TTFB) window.

**The Cause:**
The server-side code was awaiting queries one-by-one: 
1. `await user` (2s) 
2. `await asset` (2s) 
3. `await portfolio` (2s)
Cumulative wait time: 6+ seconds. Because Next.js waits for all `await` calls in a Server Component before sending *any* HTML to the browser, the user saw a frozen white screen.

**The Fix:**
1. **Parallel Fetching**: We wrapped all independent data calls in `Promise.all([user, asset, portfolio])`. This reduced the wait from the *sum* of all queries to just the single slowest query.
2. **Suspense Streaming**: We added `loading.tsx` skeletons. Now, Next.js instantly sends the page layout/skeleton to the browser while the database queries are still running in the background.

