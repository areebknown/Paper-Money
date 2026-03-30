# Profile Overlay & Interaction System

This document defines the transition from a standalone `/profile` page to a dynamic, in-place Profile Overlay triggered by the top-right avatar.

---

## 1. Interaction Model (The "Spring" Overlay)

*   **Trigger**: Tapping the top-right Profile Icon.
*   **Animation**: Instead of a hard redirect, the icon expands using **Framer Motion**.
*   **Behavior**: A card slides down or expands from the icon's position, blurring the background context slightly (if on a non-scrolling element) or simply overlaying it.
*   **Closing**: Tapping outside the card or a "Close" icon collapses it back into the avatar.

---

## 2. Card Architecture

### A. The Identity Header (Top Section)
*   **Avatar**: High-quality circular PFP.
*   **Big Name**: The `username` in a bold, display font (`Russo One`).
*   **Identity Subtitle**: The connected Mobile Number (Main) or Email ID (Secondary).

### B. Navigation Options (The List)
1.  **Public Profile**: Redirects to a dedicated view of how *others* see the user's progress/artifacts.
2.  **Edit Profile**:
    *   **Manage PFP**: Uploads to a specific Cloudinary folder.
    *   **Optimization**: Cloudinary transformations MUST enforce a `200x200` square crop and `q_auto:eco` to keep asset delivery extremely light for chat bubbles.
    *   **Storage Cleanup**: To avoid wasting Cloudinary storage, the server-side logic MUST call `cloudinary.v2.uploader.destroy(old_public_id)` before saving the new PFP URL to the database.
    *   **Fields**: Edit `username`, add `Real Name`.
3.  **Rank**: Redirects to the central Rank/Stats page.
4.  **Friends**:
    *   Send/Accept requests.
    *   View current friend list.
5.  **Settings**:
    *   **Notification Toggles**: Push notifications for payments received, auction starts, etc.
    *   **Identity Update**: Change Email/Mobile number.
6.  **Switch Account**: Quick-toggle between linked Finance/Secondary accounts.
7.  **Join Account**: The UI to link a Secondary account to a Main account (See `08-account-system.md`).
8.  **Logout**: Standard session termination.

---

## 3. Implementation Checklist

- [ ] **Shared Component**: Create `components/ProfileOverlay.tsx` to centralize this logic.
- [ ] **Header Refactor**: Replace `<Link href="/profile">` across all primary pages (`home`, `invest`, `inventory`, `bid`) with the new `ProfileOverlay` trigger.
- [ ] **State Management**: Use a global state or a context provider if the profile needs to be accessed/closed from anywhere.
- [ ] **Cloudinary Integration**: Update the upload logic specifically for the "Profile" preset.
