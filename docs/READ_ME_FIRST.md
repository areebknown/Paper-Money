# 🚨 READ ME FIRST: AI Context Guidelines 🚨

Welcome to the **Bid Wars** codebase! You are an AI agent picking up where the last session left off. This `docs/` folder contains absolutely essential context about the app's architecture, historical bugs, and upcoming plans. 

Before doing **ANY** work, you MUST read the files in this directory to synchronize your context with the 99.99% of progress already completed.

### Rules for AI Agents:
1. **DO NOT DELETE THESE FILES.** These files represent the permanent memory of the project. 
2. **APPEND, DO NOT OVERWRITE (unless refactoring).** If you build a new major feature, fix a new complex bug, or change the architecture, you MUST come back to these files and append the new information on the next available line. Keep the documentation a living, up-to-date source of truth.
3. **READ BEFORE CODING.** If you are asked to fix a bidding bug or modify real-time logic, heavily consult `01-architecture.md` and `02-bug-history.md` first. Many "obvious" solutions (like a simple React `useEffect`) have previously caused catastrophic race conditions that took hours to debug.
4. **RESPECT THE FREE TIER LIMITS.** Consult `03-server-limits.md` before adding new database polls, cron jobs, or Pusher channels.

### Directory Structure:
- `01-architecture.md`: The complete blueprint of the app — frontend, backend, real-time sync, and game logic.
- `02-bug-history.md`: A log of the most brutal race conditions and edge cases we've already solved. 
- `03-server-limits.md`: Mathematical limits of our current Vercel, Neon DB, and Pusher free tiers.
- `04-admin-panel-plans.md`: Information regarding the pending major overhaul of the Admin dashboard.

Proceed to read `01-architecture.md` now to understand the application you are working on.
