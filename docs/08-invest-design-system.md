# Invest UI Design Guidelines

This document outlines the visual design language to ensure absolute consistency across the `Home` and `Invest` sections of the Bid Wars app.

## 1. Backgrounds & Textures
- **Base Color:** Deep Space Blue (`#111827`)
- **Texture:** Transparent Carbon Fibre Pattern (`bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]`)
- **Selections:** Accentuate active text highlights using `selection:bg-[#FBBF24] selection:text-[#1E3A8A]`.
- **Avoid:** Do not use random red/orange radial gradients or blurs, as they clash with the core carbon-fibre aesthetic.

## 2. Branding Colors
- **Primary Accent (The "Money" Color):** `text-[#FBBF24]` / `bg-[#FBBF24]`. Used strictly for "Invest" calls to action, section divider bars, and primary balance indicators (wallet).
- **Secondary Accent:** Blue / Dark Blue (`#1E3A8A` for headers, `text-blue-400` for rank indicators).
- **Dangerous Red:** Use vivid `#FF3B3B` or `text-red-500` for market drops, negative portfolio stats, and "Invested Value" to symbolize trapped cash.
- **Profit Green:** Use sharp `#22C55E` (emerald to green-500 tones) for market yields and portfolio profits to stand out vividly against the dark background.

## 3. Top Header Rules
- Main Dashboards (`/home`, `/invest`) must always use the rigid `#1E3A8A` header with a sharp bottom edge `border-b border-[#FBBF24]`.
- Child Pages (e.g. `/invest/[id]`) should **drop** the rigid header to maximize screen space for graphs and modals. Instead, they must render the Balance Pill purely floating on top, and utilize a Circular Back Button integrated directly into the Asset's Title card.

## 4. Typography
- **Headers / Numbers:** `font-['Russo_One']`
- **Body / Subtext:** `font-['Inter']`
- Data grids, balances, and P/L sections must heavily lean on `font-black` and uppercase `tracking-widest` to maintain the dashboard "arcade" feel.
