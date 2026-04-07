# Artifact Card UI Implementation Prompt

You are tasked with implementing a detailed "Artifact Card" interface. The following details precisely specify the behavior, structure, and styling required. 

## Interaction & Behavior
- **Trigger**: The interaction begins when a user taps an "artifact mini card" (currently stacked on the inventory page).
- **Expansion**: Upon tapping, an extended, Pokémon card-like sheet emerges and the card expands.
- **Background Focus**: The app background must turn slightly darker to increase focus on the expanded card.
- **Dismissal**: Tapping the darker background area should minimize the card back to its initial state.
- **Card Flip**: Swiping on the card from left to right (or vice versa) should play a smooth flipping animation, making the back of the card visible. 

## Front of the Card Structure
- **Overall Shape**: A rounded rectangular card.
- **Background Color**: The card's overall background color should reflect its tier (matching the tier letter colors), but must be more subtle so it doesn't interfere with text and information readability.
- **Image Container**: A large rounded rectangle container on the upper half of the card containing the artifact image.
- **Header Information**:
  - **Top Left**: The Artifact PID prefixed with a hash (e.g., `#1001`).
  - **Top Right**: The Tier (e.g., `Tier - A`).
    - *Tier Styling*: The tier letter must look increasingly premium as it reaches higher tiers:
      - Lower tiers (`E`, `D`, `C`): Dull colors with little to no gradient.
      - Mid tiers (`B`, `A`): Silverish/goldish gradients.
      - Rare tiers (`S`, `SS`, `SSS`, `SSS+`): Purplish/diamond/reddish gradients.
- **Body Content** (Below the image, both left-aligned):
  - **Name**: The artifact's name.
  - **Description**: The artifact's description.
- **Secondary Information** (Below the description):
  - **Composition**: Dimensions and materials within the artifact (e.g., gold or silver). *Note: Do not write the price here. Only specify how much gold, diamond, etc., is in the artifact.*
- **Footer Information** (Bottom of the card):
  - Written in relatively small, subtle fonts:
    - `Last sold price: [Value]`
    - `Current Owner: [Value]`

## Back of the Card Structure
- The back layout is the exact same for every card regardless of its tier.
- **Body Color**: A dark blue body (matching the app theme).
- **Border**: A yellow inner border. Ensure there is some gap from the card borders so the dark blue body encloses the yellow border completely.
- **Center Logo**: The "Bid Wars" logo placed in the center of the card (the same logo used on the app header).

## External Actions
- **Action Buttons**: Positioned beneath the card, there must be three 3D buttons aligned horizontally:
  - `Pawn`
  - `Sell`
  - `Private`

## Performance & Animation Constraints
- Use smart, smooth animations. 
- **DO NOT** use hardware-heavy animations.
- **DO NOT** use any kind of visual blurs.
- Keep the mobile userbase in mind, ensuring performance stays optimal.
