# 🚀 Future Scaling & Optimization Roadmap

This document outlines the planned technical improvements to keep Bid Wars fast, lean, and free-tier friendly as the user base grows.

---

## 💎 1. API Efficiency (JSON Bandwidth)
**Target:** Reduce the amount of data transferred in polling loops.
- **Current Issue:** `/api/auctions/[id]/poll` sends the full bid history every 3 seconds.
- **Optimization:** Modify the API to only send the **latest bid ID and timestamp**. 
- **Action:** If the client already has that bid, don't re-download the whole list. Only request full data when a mismatch is detected.

## 🔡 2. Font Optimization
**Target:** Eliminate external network requests and font flickering.
- **Current Issue:** Google Fonts are loaded via external CSS links.
- **Optimization:** Use `next/font`.
- **Action:** Download the fonts into the project and use Next.js's built-in font loader. This hosts them locally and eliminates "Flash of Unstyled Text" (FOUT).

## 🚰 3. Hydration Leakage (Server Components)
**Target:** Reduce the "hidden" JSON data sent from the server.
- **Current Issue:** Heavy client components sometimes send their entire state as JSON in the HTML.
- **Optimization:** Move static UI (Headers, Footers, Static text) into **Server Components**.
- **Action:** Audit `page.tsx` files and use the `"use client"` directive only where interactivity is strictly required.

## 🔌 4. Intelligent Pusher Connections
**Target:** Reduce WebSocket usage and device battery drain.
- **Current Issue:** Active connections might persist even when a user is on a static page.
- **Optimization:** Strict channel management.
- **Action:** Use `useEffect` cleanup to `unsubscribe` from auction channels the second a user leaves the bid page.

## 🦴 5. Skeleton Screens
**Target:** Improve "Perceived Performance."
- **Current Issue:** Users see "Loading..." spinners while waiting for data.
- **Optimization:** Add Skeleton markup.
- **Action:** Create grey placeholder boxes that match the layout of auction cards. This makes the app feel instant, as users see the structure before the data arrives.

## 🗄️ 6. Database Indexing (Neon Scaling)
**Target:** Keep database queries fast as the `Bids` and `Users` tables grow.
- **Current Issue:** Large tables become slow to search (Full Table Scans).
- **Optimization:** Add Prisma Indexes.
- **Action:** Add `@@index` to `auctionId` and `userId` in the `Bid` model within `schema.prisma`. This makes searching for "All bids for this auction" virtually instant.

## 🎨 7. SVG Migration
**Target:** 10x smaller UI assets.
- **Current Issue:** Small UI icons (coins, badges, buttons) use PNG files.
- **Optimization:** Replace with SVG.
- **Action:** Convert tiny decorative icons to SVG code. SVGs are sharper on high-res screens and take up almost zero bandwidth compared to pixels.

## ⏱️ 8. Adaptive Polling (Activity Awareness)
**Target:** Save Serverless Execution time (GB-hours) on Vercel.
- **Current Issue:** The bid page polls every 1 second regardless of whether the user is active.
- **Optimization:** Implement "Cooldown" or "Back-off" polling.
- **Action:** If no browser activity (mouse move/scroll/touch) is detected for 2 minutes, slow down the 1s poll to 10s. Resume 1s polling instantly when the user interacts again.

---

*Last Updated: February 19, 2026*
