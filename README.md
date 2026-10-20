# 🛡️ SpartanTrace - SJSU Campus Lost & Found Platform

> An SJSU-specific item recovery web application built with **React**, **TypeScript**, and **Tailwind CSS** in the marketplace style of **OfferUp.com**, with support for **Supabase Free Tier** PostgreSQL database.

---

## 🌟 Key Features & Requirements Coverage

SpartanTrace is designed based on the functional specifications and product backlog (US01–US15, FR01–FR32):

### 1. 🔍 Finder Workflows (User Stories US01 – US04)
- **Post a Found Item (FR01, FR02, FR03)**:
  - Form capturing title, description, photo (upload from device or URL / quick presets), category, SJSU campus location, and date found.
  - Strict validation preventing submission if any field is missing or if the date found is in the future.
  - Generates unique ID, sets status to `Available`, and publishes to active search results.
- **Manage Claims & Ownership Requests (FR04, FR05, FR06)**:
  - Only the Finder who created the listing can view all claims submitted for that listing (claimant name, email, submission timestamp, and claim status).
  - Open a dedicated direct-message conversation with any claimant directly associated with that claim.
  - Listing lifecycle status transitions: `Available` ➔ `Pending` (while reviewing claim) ➔ `Claimed` (when claimant is accepted).
- **Complete an Item Return (FR07, FR08)**:
  - Finder can confirm handover and mark item as `Returned`.
  - Records the exact return date and time.
  - Once marked `Returned`, item is automatically removed from active search results and alert matching, while being retained in the Finder's history and claimant's claim history as read-only.
- **Update Listing (FR09, FR10)**:
  - Finder can edit title, description, photo, category, location, and date while in `Available`, `Pending`, or `Claimed` status. Returned listings are locked as read-only.
  - Validates edits with the same rules and updates without creating duplicates.

### 2. 🔎 Looker Workflows (User Stories US05 – US08)
- **Search Lost Items (FR11, FR12)**:
  - Search active found-item listings by keyword matching title and description.
  - Sort by **Relevance** (default) or **Newest**. Equal relevance displays most recently posted items first.
- **Narrow Results with Filters (FR13)**:
  - Filter by category pills, campus location dropdown, and date range (`Today`, `Past 3 Days`, `Past Week`, `Past Month`, `Anytime`).
  - Filters combine seamlessly and can be cleared individually or all at once.
- **Contact Finder & Claim an Item (FR14, FR15)**:
  - Authenticated Lookers can submit an active claim for an Available listing with proof of ownership details.
  - Automatically initializes or opens a direct-message conversation between the Looker and Finder.
- **Lost-Item Alerts & Automatic Matching (FR16, FR17, FR25)**:
  - Lookers can register active lost-item alerts with keywords, optional category, and location.
  - When any newly published Available listing matches an active alert, SpartanTrace immediately triggers an in-app notification linking directly to the listing.

### 3. 🔐 System Workflows (User Stories US09 – US12)
- **SJSU Email Registration & Verification (FR18, FR19, FR20)**:
  - Registration is strictly restricted to verified `@sjsu.edu` university emails. Non-SJSU emails are rejected.
  - Email verification link flow with activation confirmation.
- **Authentication & Security (FR21, FR22, FR23)**:
  - Secure login with verified SJSU credentials.
  - Denies access to suspended accounts.
  - 30-minute inactivity session expiration.
  - 15-minute temporary lockout after 5 consecutive failed login attempts.
- **In-App Notifications Center (FR24)**:
  - Notification bells for claims received, messages sent, claim approvals, and alert matches.
  - Instant read/unread tracking and direct navigation.

### 4. ⚖️ Administrator Workflows (User Stories US13 – US15)
- **Content Reporting & Review Queue (FR26, FR27, FR28)**:
  - Authenticated users can report any listing or direct message with a required reason.
  - Admin review dashboard displays reported content snippet, owner, reporter, and reason.
  - Admin can resolve by marking reports as **Dismissed** or **Confirmed**.
- **Content Removal (FR29, FR30)**:
  - Administrators can remove invalid or violating listings or messages.
  - Content is immediately removed from normal user view while retaining audit records.
  - Automatically notifies the content owner with the administrative reason.
- **Account Suspension & Audit Log (FR31, FR32)**:
  - Administrator can suspend or restore user accounts.
  - Comprehensive, read-only Admin Audit Log recording admin name, action, target ID, reason, and timestamp.

---

## 🎨 OfferUp Design Aesthetic
- **Header**: OfferUp clean white top bar with emerald green action button, prominent search bar with location dropdown pill, direct message icon, notifications bell, and user avatar.
- **Horizontal Category Bar**: Quick icon pills (`Electronics`, `Keys`, `IDs & Cards`, `Bags & Backpacks`, `Clothing`, etc.).
- **Marketplace Grid**: High-resolution image cards with `FOUND` pill, status badge, location pin, relative timestamp (`2h ago`), and hover zoom.
- **Direct Messaging Drawer**: OfferUp-style sliding chat thread with item summary preview at the top.
- **1-Click Test Switcher**: Top banner allows testing between **Jane Spartan (Finder)**, **Sam Student (Looker)**, and **Officer Alex (Admin)** instantly without needing separate incognito windows.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation
```bash
# 1. Install dependencies
npm install

# 2. Run local dev server
npm run dev

# 3. Build production bundle
npm run build
```

---

## 🗄️ Supabase Free Tier Configuration

SpartanTrace runs **out-of-the-box in local demo mode** with pre-seeded SJSU campus items and accounts. To connect to your free cloud Supabase instance:

1. Create a free account and project at [Supabase](https://supabase.com).
2. In the Supabase Dashboard, open the **SQL Editor**.
3. Copy the contents of [`supabase/schema.sql`](./supabase/schema.sql) and paste them into the SQL editor, then click **Run**.
4. Go to **Project Settings ➔ API** in Supabase and copy:
   - `Project URL`
   - `Project API anon key`
5. Either:
   - Paste them into your `.env` file:
     ```env
     VITE_SUPABASE_URL=https://your-project.supabase.co
     VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     ```
   - OR click **"Supabase Settings / SQL"** directly in the top banner of the SpartanTrace web interface and paste them in the interactive modal.
