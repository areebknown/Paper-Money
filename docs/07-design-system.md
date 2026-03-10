# Design System & Aesthetics Guidelines

This document outlines the design styles for the current Bid Wars app project, primarily referencing the Home page and `bidwarsui.html` standards to ensure a cohesive user experience across all modules.

## 1. Global Background
- **Primary Color:** Solid Dark Navy (`#111827` or Tailwind `bg-gray-900` / `bg-[#111827]`).
- **Texture:** The Home page utilizes a dark solid base. Do not use random red/orange glowing orbs or dotted grids (`mask-image` grids) unless explicitly requested, as they conflict with the "financial/investment market" vibe and lean too far into "arcade/casino".

## 2. Typography & Fonts
- **Primary/Display Font:** `'Russo_One'` (Used for all headers, ranks, amounts, and aggressive UI elements). Must be uppercase.
- **Body Font:** `'Inter'` (Default Tailwind sans).
- **Secondary Data Font:** `'Inter' font-mono` (Tailwind `font-mono`) or system monospace for critical numbers.

## 3. Color Palette
- **Accent - Yellow/Gold (The MVP Color):** `#FBBF24` (Tailwind `yellow-400`). Used for primary CTAs (Invest / Confirm), winning bids, user balances, ranks, and primary section vertical indicators (e.g., `<div className="w-1.5 h-6 bg-[#FBBF24] rounded-full"></div>`).
- **Accent - Red (Urgency/Loss):** `#EF4444` to `#DC2626` (Tailwind `red-500` to `red-600`). Must be vibrant. Used for losses (`-X.X%`), live auction indicators, "Invested Value" icons, and destructive actions.
- **Accent - Green (Success/Profit):** `#10B981` to `#059669` (Tailwind `emerald-500` to `emerald-600`). Must be vibrant and punchy. Used for profits (`+X.X%`) and "You Won" state confirmation bubbles.
- **Accent - Blue (Brand Identity):** `#1E3A8A` (Tailwind `blue-900`). Used primarily for top headers and specific navigation accents.

## 4. UI Components & Shapes
- **Cards & Panels:** Use distinct rounded corners (`rounded-2xl` or `rounded-3xl`).
- **Card Borders (Faux-Glassmorphism):** Instead of using heavy `backdrop-blur` (which causes GPU scroll lag), cards should implement a hard dark background (e.g., `bg-[#1e293b]`) with a subtle white edge (`border border-white/5` or `border-white/10`). Hover states can push the border color slightly brighter (`hover:border-white/20` or `hover:border-cyan-500/30`).
- **Headers:** Top global headers must be full-width and perfectly rectangular at the bottom (`rounded-none`), not `rounded-b-3xl`. The header layout always consists of:
  - Left: Balance Pill + Rank Pill (Width exactly `w-auto` wrapping content, `min-w-[80px]`).
  - Center: Absolute positioned Logo (`h-[50px] w-auto`).
  - Right: Notifications + Profile (Width exactly `w-24 justify-end`).
- **Gradients:** Keep gradients limited to icons, avatar bubbles, or progress bars.
- **Effects:** Heavy glow usage (`shadow-[0_0_15px_rgba(...)]`) on active text elements.

## 5. Footers / Navigation
- There is only **one** universal Bottom Navigation component. Elements inside individual flow pages (like an element's purchase page) should **not** render the BottomNav—they should rely on "Back" buttons in the actual page UI to prevent the primary CTAs from colliding with universal navigation.
