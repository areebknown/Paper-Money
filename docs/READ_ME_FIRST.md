# 🚨 READ ME FIRST: AI Context Guidelines 🚨

Welcome to the **Bid Wars** codebase! You are an AI agent picking up where the last session left off. This `docs/` folder contains absolutely essential context about the app's architecture, historical bugs, and upcoming plans. 

Before doing **ANY** work, you MUST read the files in this directory to synchronize your context with the 99.99% of progress already completed.

### Rules for AI Agents:
1. **DO NOT DELETE THESE FILES.** These files represent the permanent memory of the project. 
2. **APPEND, DO NOT OVERWRITE (unless refactoring).** If you build a new major feature, fix a new complex bug, or change the architecture, you MUST come back to these files and append the new information on the next available line. Keep the documentation a living, up-to-date source of truth.
3. **READ BEFORE CODING.** If you are asked to fix a bidding bug or modify real-time logic, heavily consult `01-architecture.md` and `02-bug-history.md` first. Many "obvious" solutions (like a simple React `useEffect`) have previously caused catastrophic race conditions that took hours to debug.
4. **RESPECT THE FREE TIER LIMITS.** Consult `03-server-limits.md` before adding new database polls, cron jobs, or Pusher channels.
5. **CREATE AGENT SESSION LOGS.** When the user explicitly commands it, create a new file in this directory named `[date]-agent-session.md` (e.g., `09-03-2026-agent-session.md`). Use this file to log your specific progress, tasks completed (using markdown tables), and timestamped notes so future agent instances can track exactly what happened in your local chat session.

### Directory Structure:
- `01-architecture.md`: The complete blueprint of the app — frontend, backend, real-time sync, and game logic.
- `02-bug-history.md`: A log of the most brutal race conditions and edge cases we've already solved. 
- `03-server-limits.md`: Mathematical limits of our current Vercel, Neon DB, and Pusher free tiers.
- `04-admin-panel-plans.md`: Information regarding the pending major overhaul of the Admin dashboard.
- `05-database-schema.md`: Technical breakdown of Prisma models and critical PostgreSQL transaction handling.
- `06-api-contract.md`: The master list of core API routes, their behaviors, and precise payload expectations.
- `07-design-system.md`: Project-specific aesthetic guidelines, Tailwind variables, and notes on the 2.5D visual illusions.

---

### 🚀 Performance & Animation Checklist (Mandatory)
Before pushing any UI or Data changes, you MUST verify:
- [ ] **Concurrency**: Are all independent `await` calls wrapped in `Promise.all`? (See `01-architecture.md`)
- [ ] **Streaming**: Does the new page/module have a matching `loading.tsx` skeleton?
- [ ] **No-Blur**: Have you removed `backdrop-blur` from any scrolling lists or modals? (See `07-design-system.md`)
- [ ] **Glows**: Are decorative glows using **Radial Gradients** instead of `blur-3xl`?
- [ ] **Expansions**: Are you using **Framer Motion `height: auto`** instead of CSS `max-height`?

Proceed to read `01-architecture.md` now to understand the application you are working on.

