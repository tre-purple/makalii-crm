# Prompt: Create CRM API Endpoints

Paste this into a Claude Code session in your **production Next.js codebase**.

---

```
I need to create API route handlers for a CRM system. A separate React SPA (deployed on the same domain) will call these endpoints using session cookie auth (credentials: "include"). The SPA handles camelCase ↔ snake_case field mapping on its side — all request/response bodies use snake_case.

## Database schema

The migration has already been run. Here's what exists:

### `orgs` table (existing + new CRM columns)

Existing columns:
- id (text, PK)
- org_name (text, not null)
- onboarded (boolean, default false)
- created_at (timestamptz)
- updated_at (timestamptz)

New CRM columns (all nullable or have defaults):
- segment (text, default 'Soil Testing Inquiry') — enum: "Soil Testing Inquiry", "Government/Policy", "Nonprofit/Community", "Research/Academic", "Volunteer/Intern", "Partnership", "Data/Tech"
- tier (text, default 'Warm') — enum: "Hot", "Warm", "Cold"
- stage (text, default 'Lead') — enum: "Lead", "Contacted", "Meeting Set", "Proposal Sent", "Negotiating", "Closed Won", "Closed Lost"
- island (text, nullable) — enum: "Oʻahu", "Hawaiʻi Island", "Maui", "Kauaʻi", "Molokaʻi", "Lānaʻi", "Statewide", "Mainland"
- journey_type (text, nullable) — enum: "Intro", "Follow-Up", "Updates", "Returning"
- deal_value (integer, default 0)
- revenue_type (text, nullable) — enum: "Contract Project", "Mail-In Testing"
- contract_value (integer, default 0)
- quote_status (text, default 'No Quote Sent') — enum: "No Quote Sent", "Quote Drafted", "Quote Sent", "Quote Accepted", "Quote Declined"
- acreage (integer, nullable)
- sample_sites (integer, nullable)
- scope_notes (text, nullable)
- education_workshops (boolean, nullable)
- source (text, nullable)
- notes (text, nullable)
- message (text, nullable)
- tags (text[], default '{}')
- pending (boolean, default false)

### `crm_contacts` table (new)

- id (serial, PK)
- org_id (text, FK → orgs.id, ON DELETE CASCADE)
- first_name (text, not null)
- last_name (text, nullable)
- email (text, nullable)
- phone (text, nullable)
- role (text, nullable)
- is_primary (boolean, default false)
- created_at (timestamptz, default now())

### `crm_email_history` table (new)

- id (serial, PK)
- org_id (text, FK → orgs.id, ON DELETE CASCADE)
- contact_id (integer, FK → crm_contacts.id, ON DELETE SET NULL, nullable)
- subject (text)
- body (text)
- sent_at (timestamptz, default now())
- opened (boolean, default false)
- clicked (boolean, default false)
- bulk_id (text, nullable)
- bulk_label (text, nullable)
- journey_type (text, nullable)

## Endpoints to create

Use this project's existing patterns for route handlers, database queries (Kysely), and auth middleware. All routes require authenticated session (use existing auth check). Return JSON for all responses.

### 1. GET /api/crm/clients

Fetch all orgs with CRM fields. For each org, also include the primary contact's fields flattened onto the response: `first_name`, `last_name`, `email`, `phone` (from crm_contacts where is_primary = true).

Query params:
- `?pending=true` — filter to only pending orgs (for intake queue, ordered by id DESC)
- No param or `?pending=false` — exclude pending orgs (default behavior, ordered by id ASC)

The response should be an array of objects. Each object has all the org CRM columns plus the flattened primary contact fields. If there's no primary contact, those fields should be empty strings.

Also include `email_history` as a JSON array for each org — fetch from crm_email_history, ordered by sent_at desc. Each entry: `{ campaign_id, subject, sent_at, opened, clicked, bulk_id, bulk_label, journey_type }`. Use campaign_id as an alias — there's no campaign_id column, use the `id` from crm_email_history as the campaign_id. If no email history, return empty array `[]`.

### 2. POST /api/crm/clients

Create a new org with CRM fields + optionally a primary crm_contact.

Request body (all snake_case):
```json
{
  "org_name": "Some Farm",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone": "808-555-0100",
  "segment": "Soil Testing Inquiry",
  "tier": "Warm",
  "stage": "Lead",
  "island": "Oʻahu",
  "message": "...",
  "notes": "...",
  "source": "Website",
  "tags": ["Intake"],
  "pending": true,
  "created_on": "May 13, 2026"
}
```

Logic:
1. Extract `first_name`, `last_name`, `email`, `phone` from the body — these go into crm_contacts, not orgs.
2. If `org_name` is not provided, construct it from `first_name` + `last_name` (e.g. "John Doe").
3. Insert into orgs with remaining CRM fields. Use defaults: tier="Warm", stage="Lead", segment="Soil Testing Inquiry" for any missing fields.
4. If first_name is provided, insert into crm_contacts with is_primary=true, linked to the new org.
5. Return the full org row with flattened primary contact fields (same shape as GET response).

### 3. PATCH /api/crm/clients/[id]

Partial update of CRM fields on an org.

Request body: any subset of CRM columns (snake_case). Example:
```json
{ "tier": "Hot", "stage": "Contacted" }
```

If the body contains contact-level fields (`first_name`, `last_name`, `email`, `phone`), update the primary crm_contact for this org (or create one if none exists).

If the body contains `email_history` (array), this is a full replacement of the org's email history. Delete existing crm_email_history rows for this org and insert the new ones.

Return the updated org with flattened primary contact (same shape as GET).

### 4. DELETE /api/crm/clients/[id]

Delete an org by ID. The CASCADE on crm_contacts and crm_email_history handles cleanup.

Return 204 No Content.

### 5. POST /api/crm/clients/import

Bulk insert. Request body is an array of objects (same shape as POST /api/crm/clients body).

Logic:
1. For each item, check if an org with the same org_name already exists — skip duplicates.
2. Insert new orgs + primary contacts.
3. Return array of created orgs (same shape as GET response). Only return newly created ones, not skipped duplicates.

### 6. POST /api/crm/mailchimp

Proxy for Mailchimp API calls. The CRM SPA sends:
```json
{
  "action": "upsertContact" | "sendEmail" | "bulkSend" | "getContactStats",
  "payload": { ... }
}
```

For now, create a stub that returns appropriate mock responses based on the action:
- "upsertContact": return `{ success: true }`
- "sendEmail": return `{ campaignId: "mock-" + Date.now() }`
- "bulkSend": return `{ campaignId: "mock-" + Date.now(), campaignName: payload.campaignTitle, dashboardUrl: "" }`
- "getContactStats": return `{ stats: {} }`

Add a TODO comment noting this should be wired to the actual Mailchimp API later.

## Important implementation notes

- Use the existing auth middleware pattern in this project — every endpoint must verify the session cookie
- Use the existing database query pattern (Kysely) — don't introduce a new query library
- All field names in request/response are snake_case
- The `tags` field is a Postgres text array (text[]) — make sure to handle it correctly in Kysely queries
- The `email_history` field in the GET response is constructed from the crm_email_history table, not stored as JSONB on the orgs table
- For CORS: the CRM SPA will be on the same domain, so no special CORS headers are needed. But credentials: "include" must work — make sure cookies are passed through.
- Group the route files under `src/app/api/crm/` following Next.js App Router conventions
```
