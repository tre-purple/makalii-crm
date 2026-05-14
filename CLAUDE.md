# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Makalii Metrics CRM — a client relationship management tool for a Hawai'i-based commercial soil testing lab. Manages contacts, email outreach (Mailchimp), deal pipeline, intake forms, and analytics. Deployed as a static SPA on GitHub Pages.

## Commands

```bash
npm start          # Dev server (localhost:3000)
npm run build      # Production build
npm run deploy     # Build + push to GitHub Pages
npm test           # Run tests (react-scripts test, watch mode)
```

## Architecture

**Stack:** React 19 (CRA) + Supabase (Postgres + Realtime) + Mailchimp (via Supabase Edge Function). No backend server — entirely client-side.

**Routing:** Hash-based (`#intake`, `#contacts`, `#pipeline`, `#analytics`) — handled in `App.jsx` via `window.location.hash`.

**Data flow:**
- `useContacts` hook (`src/hooks/useContacts.js`) is the single source of truth for all contact data
- Fetches from Supabase `contacts` table on mount, seeds sample data if empty
- Subscribes to Supabase Realtime (INSERT/UPDATE/DELETE) for live sync across tabs/users
- Uses optimistic updates — UI state changes immediately, then Supabase write fires async
- All CRUD operations (`addContact`, `updateContact`, `deleteContact`, `importContacts`) go through this hook

**Mailchimp integration** (`src/lib/mailchimp.js`):
- All Mailchimp API calls proxy through a Supabase Edge Function at `/functions/v1/mailchimp`
- Credentials are stored as Supabase secrets, never exposed client-side
- Supports: upsert contact, single send, bulk send (static segments), open/click stats
- Contact name/email changes in the CRM auto-sync to Mailchimp in the background (`App.jsx:updateContact`)

**AI email generation:** EmailModal calls Anthropic Claude API directly from the client to generate draft emails based on contact segment. Templates in `src/constants/templates.js` provide segment-specific and journey-type-specific defaults.

## Database Schema (Supabase `contacts` table)

Single table design. Key field groups:

| Group | Fields |
|-------|--------|
| Identity | `id`, `firstName`, `lastName`, `email`, `phone`, `org` |
| Classification | `segment` (7 types), `tier` (Hot/Warm/Cold), `stage` (7 pipeline stages), `island` (8 options) |
| Engagement | `journeyType` (Intro/Follow-Up/Updates/Returning), `message`, `notes`, `tags[]` |
| Revenue | `value`, `revenueType` (Contract Project / Mail-In Testing), `contractValue`, `quoteStatus` |
| Contract details | `acreageRange`, `sitesCount`, `scopeNotes` (only when revenueType = "Contract Project") |
| Email tracking | `emailHistory[]` — objects with `campaignId`, `subject`, `sentAt`, `opened`, `clicked`, `bulkId`, `bulkLabel`, `journeyType` |
| Intake | `pending` (boolean) — true = submitted via intake form, awaiting admin approval |
| Meta | `createdOn`, `source` |

## Key Constants

All enums, color tokens, and stage/tier/segment definitions live in `src/constants/brand.js`. Email templates in `src/constants/templates.js`. Initial seed data in `src/constants/data.js`.

## Environment Variables

```
REACT_APP_SUPABASE_URL       # Supabase project URL
REACT_APP_SUPABASE_ANON_KEY  # Supabase anonymous key
```

Mailchimp credentials are Supabase secrets (not in .env).

## Component Patterns

- All styling is inline CSS objects (no CSS files, no Tailwind). Brand colors from `BRAND` constant.
- Modals (Add, Email, BulkEmail, Import) render as overlays managed by boolean state in `App.jsx`.
- `DetailPanel` is a slide-in side panel; `lastSelectedRef` keeps content visible during close animation.
- `IntakeQueue` has its own Supabase Realtime subscription filtering for `pending=true` contacts.
- Multi-select + bulk operations (email, field edits) use `checkedIds` Set in `App.jsx`.
