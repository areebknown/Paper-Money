# Trading, Contracts & official Loans

This document defines the specialized peer-to-peer (P2P) trading mechanics, the Admin-verified contract system, and the rank-scaled official loan infrastructure.

---

## 1. Artifact Trade System (P2P)

Artifacts in a user's vault can be liquidated in two ways: Selling to the Public or Selling to the Admin.

### A. Public Visibility & Private Safe
*   **Public List**: By default, all owned artifacts are browsable in a global "Marketplace" or "Public Gallery".
*   **Private Safe**: Users can toggle a "Private" setting on any artifact. This hides the card from the public list, making it invisible to collectors and prospective buyers.
*   **The Gear View**: Users access the public list via the "Ball-to-Gear" (Marketplace) icon.

### B. "Request to Buy" (Negotiation)
*   If a collector finds an artifact they want in the Public List:
    1.  They view the item details and see the **Current Owner**.
    2.  They tap **"Request to Buy"**.
    3.  A dialog appears where the buyer enters their **Proposed Amount**.
    4.  **Notification**: The owner receives a real-time notification: *"User X has offered ₹Y for Artifact #PID"*.
    5.  **Approval**: If the owner accepts, the money is instantly transferred from the buyer to the owner, and the artifact shifts ownership in the database.

### C. Admin Buyback (Instant Liquidity)
*   Users can choose to sell an artifact directly back to the "Bank" (Admin).
*   **Price**: Items are sold at their **Original Price** (Base Points).
*   **Inventory Flow**: The artifact is removed from the user's vault and added to the **Admin's Inventory**. 
*   **Re-Auctioning**: Once in the Admin's inventory, these items become available in the Admin Panel to be scheduled for future live auctions.

---

## 2. P2P Contracts (Vault Subpage)

For complex agreements (P2P loans, installment plans, etc.), users utilize the **Contract System**.

### A. Creation & Terms
*   **Location**: Vault > Contracts > Create New.
*   **Fields**:
    *   **Offered By / Offered To**: Selection from a list of verified users.
    *   **Terms Paragraph**: A text block where users write the specific conditions (e.g., "I will pay back 50k by next Monday").
    *   **Dates**: Explicit Start and End dates for the agreement.
*   **Workflow**: Once the fields are filled, it is sent for **Admin Approval**.

### C. Installment Mandates & Auto-Pay (Optional)
When minting a contract, the initiator can toggle the **"Add Installment Feature"**:

1.  **Installment Details**: Configure the specific **Amount** and **Frequency** (e.g., Weekly, Monthly).
2.  **The Mandate (E-Sign)**: The contract offeror must sign a "Mandate" (an official payment authorization).
3.  **Two Operational Modes**:
    *   **Manual Mode (Notification-Only)**: The system sends a notification when an installment is due. The user must manually tap "Pay" in their dashboard.
    *   **Auto-Pay Mode**: The system automatically deducts the installment amount from the user's balance on the due date and transfers it to the recipient.
4.  **The "Pay Page" Dashboard**:
    *   Accessed via the **Middle QR Button** in the main navigation bar.
    *   Displays all "Active Auto-Pays," "Pending Mandates," and "Running Active Installments" in one unified interface.


### B. Verification & Finalization
1.  **Queue**: The contract appears in the "Contract Approvals" section of the Admin Panel.
2.  **Review**: Admin reads the terms and approves or rejects the deal.
3.  **Notification**: Both parties receive a notification once the Admin decides.
4.  **Fee & Activation**: The initiator ("The Minter") must pay a small processing fee. Once paid, the agreement is officially "Finalized" and stored as an active legal-style record on their Contract Page.

---

## 3. Official Loan System (Rank-Scaled)

Unlike P2P contracts, Official Loans are taken directly from the system and are strictly governed by **Loan Tokens**.

### A. Loan Tokens (Concurrency Limit)
*   A Loan Token represents the ability to hold **one parallel official loan**.
*   **Example**: If you have 2 Loan Tokens (Dealer I), you can have two active loans at the same time. If both are unpaid, you cannot take a third.
*   **Scaling**: Rookie I starts with 1 token. Tokens increase as you rank up (See `rank-system.md`).

### B. Loan Tiers & Interest
When applying for an official loan, the user is presented with three primary options based on their **Current Balance**:

| Tier | Amount Granted | Interest Rate |
| :--- | :--- | :--- |
| **Tier 1** | 50% of Current Balance | 10% |
| **Tier 2** | 100% of Current Balance | 15% |
| **Tier 3** | 150% of Current Balance | 20% |

### C. Repayment Flexibility & Compounding
Unlike P2P contracts, Official Loans are designed for extreme flexibility:
*   **"Pay Whenever"**: There are no fixed EMIs or Auto-Pay mandates for Admin loans. Users can repay any amount (partial or full) at any time (e.g., borrow today, repay tomorrow).
*   **Compounding Interest**: Interest on Admin loans is **Compounded**. The longer a debt remains unpaid, the faster the interest burden grows on the remaining principal.

### D. Rank-Based Incentives
As a user increases their Rank Tier, the Loan System becomes more favorable:

*   **Reduced Rates**: "Lesser Interest on loans" (Unlocks at Rookie II).
*   **High-Volume Loans**: "200% Loan at 18% CI rate" (Unlocks at Tycoon II) and "220% Loan" (Crown+).
*   **Management Page**: A dedicated "Loans" page allows users to track running loans, view accrued interest, and make manual payments.
