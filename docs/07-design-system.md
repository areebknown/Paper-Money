# Design System & Aesthetics Guidelines

Bid Wars uses a highly specific, premium, gaming-inspired aesthetic resembling high-end interfaces like GTA Online or sophisticated crypto exchanges. Do not deviate from these core styles.

## Typography
- **Primary/Display Font:** `'Russo_One'` (Used for all headers, ranks, amounts, and aggressive UI elements). Must be uppercase.
- **Body Font:** `'Inter'` (Default Tailwind sans).

## Color Palette
- **Backgrounds:** Deep, dark, immersive grays bordering on black. Heavy use of `bg-gray-900`, `bg-black`, and transparent overlays like `bg-black/50` for glass effects.
- **Accent - Gold (The MVP Color):** `#FBBF24` (Tailwind `yellow-400`). Used for winning bids, ranks, and primary user wealth indicators.
- **Accent - Red (Urgency):** `#DC2626` (Tailwind `red-600`) to `#B91C1C`. Used for live auction indicators, severe warnings, and destructive actions.
- **Accent - Blue:** Used for generic admin actions or secondary information panels.
- **Accent - Green (Success):** `#22C55E` (Tailwind `green-500`). Used sparingly for "You Won" state confirmation bubbles.

## UI Components & Shapes
- **Cards & Panels:** Distinctly rounded corners (`rounded-2xl` or `rounded-xl`).
- **Surface Texture:** Almost all flat surfaces use a subtle inner border (`border border-white/10`) to create a faux-3D separation from the background.
- **Gradients:** Use aggressive, harsh gradients for buttons (e.g., `bg-gradient-to-r from-red-600 to-red-800`).
- **Effects:** Heavy glow usage (`shadow-[0_0_15px_rgba(...)]`) on active text elements (like the countdown timer) to make them look like LED displays.

## Visual Illusion (The 2.5D Room)
The Live Bid page features a complex CSS geometric illusion to create depth:
- `perspective: 1000px` on the parent container.
- Explicit 3D transforms (`rotateX`, `rotateY`, `translateZ`) on HTML elements acting as left, right, back walls, and the floor.
- Avoid introducing new absolute elements in that specific container unless you understand exactly where they exist on the Z-axis.
