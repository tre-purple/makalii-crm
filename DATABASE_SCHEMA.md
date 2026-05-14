# Makalii Metrics CRM — Database Schema

> Single-table design. One `contacts` table covers the entire CRM.
> Use this reference to recreate the table in another database.

---

## Table: `contacts`

### Identity

| Column | Type | Default | Nullable | Notes |
|--------|------|---------|----------|-------|
| `id` | `SERIAL` / `INTEGER` | Auto-increment | NO | Primary key |
| `firstName` | `TEXT` | — | NO | Required |
| `lastName` | `TEXT` | `""` | YES | |
| `email` | `TEXT` | — | NO | Required, used as Mailchimp key |
| `phone` | `TEXT` | `""` | YES | Freeform (e.g. `808-208-2825`) |
| `org` | `TEXT` | `""` | YES | Organization / farm / agency |

### Classification

| Column | Type | Default | Nullable | Enum Values |
|--------|------|---------|----------|-------------|
| `segment` | `TEXT` | `"Soil Testing Inquiry"` | NO | `Soil Testing Inquiry`, `Government/Policy`, `Nonprofit/Community`, `Research/Academic`, `Volunteer/Intern`, `Partnership`, `Data/Tech` |
| `tier` | `TEXT` | `"Warm"` | NO | `Hot`, `Warm`, `Cold` |
| `stage` | `TEXT` | `"Lead"` | NO | `Lead`, `Contacted`, `Meeting Set`, `Proposal Sent`, `Negotiating`, `Closed Won`, `Closed Lost` |
| `island` | `TEXT` | `""` | YES | `Oʻahu`, `Hawaiʻi Island`, `Maui`, `Kauaʻi`, `Molokaʻi`, `Lānaʻi`, `Statewide`, `Mainland` |

### Engagement

| Column | Type | Default | Nullable | Notes |
|--------|------|---------|----------|-------|
| `journeyType` | `TEXT` | `NULL` | YES | `Intro`, `Follow-Up`, `Updates`, `Returning` |
| `message` | `TEXT` | `""` | YES | Original inquiry / message from contact |
| `notes` | `TEXT` | `""` | YES | Internal notes, can be multi-line with timestamps |
| `tags` | `TEXT[]` | `[]` | YES | Array of strings (e.g. `["Actionable", "UH", "Multi-element"]`) |
| `source` | `TEXT` | `""` | YES | How the contact was found (see Source Values below) |
| `createdOn` | `TEXT` | Current date | YES | Stored as formatted string: `"May 13, 2026"` |

**Source values used by intake form:**
`Farm Bureau / Event`, `NRCS / EQIP Program`, `Capitol / Gov Outreach`, `Referral`, `Website / Inbound`, `Direct Outreach`, `Conference / Workshop`, `Social Media`, `Other`

### Email Tracking

| Column | Type | Default | Nullable | Notes |
|--------|------|---------|----------|-------|
| `emailHistory` | `JSONB[]` | `[]` | YES | Array of email record objects |

Each object in `emailHistory`:

```json
{
  "campaignId": "string — Mailchimp campaign ID",
  "subject": "string — email subject line",
  "sentAt": "string — ISO 8601 timestamp",
  "opened": "boolean — default false",
  "clicked": "boolean — default false",
  "bulkId": "string — optional, e.g. bulk-Intro-1715600000000",
  "bulkLabel": "string — optional, e.g. Intro Outreach — May 2026",
  "journeyType": "string — optional, links to journey type"
}
```

### Revenue & Deal

| Column | Type | Default | Nullable | Notes |
|--------|------|---------|----------|-------|
| `value` | `NUMERIC` | `0` | YES | Deal value in USD (non-contract deals) |
| `revenueType` | `TEXT` | `NULL` | YES | `Contract Project` or `Mail-In Testing` |
| `contractValue` | `NUMERIC` | `0` | YES | Used when revenueType = `Contract Project` |
| `quoteStatus` | `TEXT` | `"No Quote Sent"` | YES | `No Quote Sent`, `Quote Drafted`, `Quote Sent`, `Quote Accepted`, `Quote Declined` |

### Contract Project Fields

These are only relevant when `revenueType = "Contract Project"`:

| Column | Type | Default | Nullable | Notes |
|--------|------|---------|----------|-------|
| `acreage` | `NUMERIC` | `NULL` | YES | Project acreage |
| `sampleSites` | `NUMERIC` | `NULL` | YES | Number of soil sample sites |
| `educationWorkshops` | `BOOLEAN` | `NULL` | YES | Whether contract includes education workshops |
| `scopeNotes` | `TEXT` | `""` | YES | Project scope, deliverables, timeline |

### Admin / Intake

| Column | Type | Default | Nullable | Notes |
|--------|------|---------|----------|-------|
| `pending` | `BOOLEAN` | `FALSE` | NO | `true` = submitted via intake form, awaiting approval. `false` = active in pipeline |

---

## TypeScript Shape (for reference)

```typescript
type Contact = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  org: string;

  segment:
    | "Soil Testing Inquiry"
    | "Government/Policy"
    | "Nonprofit/Community"
    | "Research/Academic"
    | "Volunteer/Intern"
    | "Partnership"
    | "Data/Tech";
  tier: "Hot" | "Warm" | "Cold";
  stage:
    | "Lead"
    | "Contacted"
    | "Meeting Set"
    | "Proposal Sent"
    | "Negotiating"
    | "Closed Won"
    | "Closed Lost";
  island:
    | "Oʻahu"
    | "Hawaiʻi Island"
    | "Maui"
    | "Kauaʻi"
    | "Molokaʻi"
    | "Lānaʻi"
    | "Statewide"
    | "Mainland"
    | "";

  journeyType: "Intro" | "Follow-Up" | "Updates" | "Returning" | null;
  message: string;
  notes: string;
  tags: string[];
  source: string;
  createdOn: string;

  emailHistory: {
    campaignId: string;
    subject: string;
    sentAt: string;
    opened: boolean;
    clicked: boolean;
    bulkId?: string;
    bulkLabel?: string;
    journeyType?: string;
  }[];

  value: number;
  revenueType: "Contract Project" | "Mail-In Testing" | null;
  contractValue: number;
  quoteStatus:
    | "No Quote Sent"
    | "Quote Drafted"
    | "Quote Sent"
    | "Quote Accepted"
    | "Quote Declined";
  acreage: number | null;
  sampleSites: number | null;
  educationWorkshops: boolean | null;
  scopeNotes: string;

  pending: boolean;
};
```

---

## SQL CREATE Statement

Ready to paste into PostgreSQL (or adapt for MySQL, SQLite, etc.):

```sql
CREATE TABLE contacts (
  id              SERIAL PRIMARY KEY,

  -- Identity
  "firstName"     TEXT NOT NULL,
  "lastName"      TEXT DEFAULT '',
  email           TEXT NOT NULL,
  phone           TEXT DEFAULT '',
  org             TEXT DEFAULT '',

  -- Classification
  segment         TEXT NOT NULL DEFAULT 'Soil Testing Inquiry',
  tier            TEXT NOT NULL DEFAULT 'Warm',
  stage           TEXT NOT NULL DEFAULT 'Lead',
  island          TEXT DEFAULT '',

  -- Engagement
  "journeyType"   TEXT,
  message         TEXT DEFAULT '',
  notes           TEXT DEFAULT '',
  tags            TEXT[] DEFAULT '{}',
  source          TEXT DEFAULT '',
  "createdOn"     TEXT,

  -- Email tracking
  "emailHistory"  JSONB DEFAULT '[]'::jsonb,

  -- Revenue
  value           NUMERIC DEFAULT 0,
  "revenueType"   TEXT,
  "contractValue" NUMERIC DEFAULT 0,
  "quoteStatus"   TEXT DEFAULT 'No Quote Sent',

  -- Contract project fields
  acreage         NUMERIC,
  "sampleSites"   NUMERIC,
  "educationWorkshops" BOOLEAN,
  "scopeNotes"    TEXT DEFAULT '',

  -- Admin
  pending         BOOLEAN NOT NULL DEFAULT FALSE
);
```

---

## Query Patterns the CRM Uses

**Fetch all contacts (ordered):**
```sql
SELECT * FROM contacts ORDER BY id;
```

**Fetch pending intake queue:**
```sql
SELECT * FROM contacts WHERE pending = TRUE ORDER BY id DESC;
```

**Update a contact:**
```sql
UPDATE contacts SET "firstName" = $1, tier = $2, ... WHERE id = $3;
```

**Bulk insert (import):**
```sql
INSERT INTO contacts ("firstName", "lastName", email, ...) VALUES (...), (...), ...;
```

**Approve intake submission:**
```sql
UPDATE contacts SET pending = FALSE WHERE id = $1;
```

**Delete contact:**
```sql
DELETE FROM contacts WHERE id = $1;
```

---

## Realtime Subscriptions

The CRM listens for live changes on the `contacts` table to sync across tabs/users:

- **Channel `contacts`** — listens for `INSERT`, `UPDATE`, `DELETE` on `public.contacts`
- **Channel `intake-queue`** — listens for `INSERT`, `UPDATE` on `public.contacts`, client-side filters for `pending = true`

If your new database supports change notifications (Postgres LISTEN/NOTIFY, Supabase Realtime, Hasura subscriptions, etc.), wire these up for live sync. Otherwise the CRM falls back to its local optimistic state.

---

## Migration Notes

When moving to a new database:

1. **`emailHistory` as JSONB** — If your target DB doesn't support JSONB arrays natively, store as a JSON text column and parse on read
2. **`tags` as TEXT[]** — Same: if no array support, use a JSON text column or a comma-separated string
3. **`createdOn` as TEXT** — The CRM stores human-readable dates like `"May 13, 2026"`, not ISO timestamps. You may want to normalize this to a proper `TIMESTAMP` column and format on the frontend
4. **Column casing** — The CRM uses camelCase (`firstName`, `emailHistory`). If your DB convention is snake_case, rename columns and update the frontend queries accordingly
5. **`id` generation** — Currently auto-increment integer. UUIDs work fine too; the CRM only uses `id` for equality checks (`WHERE id = $1`)
