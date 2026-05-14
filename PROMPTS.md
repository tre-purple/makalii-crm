# CRM Recreation Prompts for Production Codebase

Run these prompts **in order** in your production Next.js codebase. Each prompt is self-contained — paste it into a new Claude Code conversation (or continue the same one if context allows). Each builds on the previous step's output.

**Prerequisites:** Your production codebase has Next.js App Router, Tailwind, Postgres, and custom auth with an existing `clients` table (`org_name`, `onboarded`) and `users` table linked to orgs.

---

## Prompt 1: Database Schema — Add CRM Fields

```
I'm adding a CRM (client relationship management) system to this codebase. The CRM needs to track contacts, pipeline stages, email history, and deal values for our soil testing lab business.

My current database has:
- `clients` table (really an "orgs" table): has `org_name` and `onboarded` (boolean)
- `users` table: linked to orgs (multiple users per org)

I need to create a database migration that:

1. Adds these CRM columns to the `clients` table:
   - `segment` (text) — one of: "Soil Testing Inquiry", "Government/Policy", "Nonprofit/Community", "Research/Academic", "Volunteer/Intern", "Partnership", "Data/Tech"
   - `tier` (text) — one of: "Hot", "Warm", "Cold"
   - `stage` (text) — one of: "Lead", "Contacted", "Meeting Set", "Proposal Sent", "Negotiating", "Closed Won", "Closed Lost"
   - `island` (text) — one of: "Oʻahu", "Hawaiʻi Island", "Maui", "Kauaʻi", "Molokaʻi", "Lānaʻi", "Statewide", "Mainland"
   - `journey_type` (text, nullable) — one of: "Intro", "Follow-Up", "Updates", "Returning"
   - `deal_value` (integer, default 0) — estimated deal value in dollars
   - `revenue_type` (text, nullable) — one of: "Contract Project", "Mail-In Testing"
   - `contract_value` (integer, default 0) — for Contract Project type
   - `quote_status` (text, default "No Quote Sent") — one of: "No Quote Sent", "Quote Drafted", "Quote Sent", "Quote Accepted", "Quote Declined"
   - `acreage` (integer, nullable) — for Contract Project
   - `sample_sites` (integer, nullable) — for Contract Project
   - `scope_notes` (text, nullable) — project scope for Contract Project
   - `education_workshops` (boolean, nullable) — for Contract Project
   - `source` (text, nullable) — how the lead was acquired (e.g., "Website", "Referral", "Event")
   - `notes` (text, nullable) — internal CRM notes
   - `message` (text, nullable) — original inquiry message from the contact
   - `tags` (text[], default '{}') — arbitrary tags like "Actionable", "Referral"
   - `pending` (boolean, default false) — true = submitted via intake, awaiting admin approval

2. Edit the `users` table for individual people associated with a client/org:
   - `role` (text, nullable) — their role at the org (e.g., "Office Manager", "Director")
   - `is_primary` (boolean, default false) — primary point of contact for this org   

3. Creates a `crm_email_history` table:
   - `id` (serial primary key)
   - `client_id` (foreign key → clients.id, on delete cascade)
   - `contact_id` (foreign key → crm_contacts.id, on delete set null, nullable)
   - `subject` (text)
   - `body` (text)
   - `sent_at` (timestamptz, default now())
   - `opened` (boolean, default false)
   - `clicked` (boolean, default false)
   - `bulk_id` (text, nullable) — groups bulk campaign emails together
   - `bulk_label` (text, nullable) — human name for bulk campaign
   - `journey_type` (text, nullable) — which journey type template was used

All new columns on `clients` should be nullable or have defaults so existing rows aren't broken. Don't seed any data — just create the schema.
```

---

## Prompt 2: CRM Constants and Types

```
I'm building a CRM admin section. Create the shared constants and TypeScript types that all CRM pages will use.

Create `src/lib/crm/constants.ts` with these exact values:

STAGES (pipeline): ["Lead", "Contacted", "Meeting Set", "Proposal Sent", "Negotiating", "Closed Won", "Closed Lost"]

SEGMENTS: ["Soil Testing Inquiry", "Government/Policy", "Nonprofit/Community", "Research/Academic", "Volunteer/Intern", "Partnership", "Data/Tech"]

TIERS: ["Hot", "Warm", "Cold"]

ISLANDS: ["Oʻahu", "Hawaiʻi Island", "Maui", "Kauaʻi", "Molokaʻi", "Lānaʻi", "Statewide", "Mainland"]

JOURNEY_TYPES: ["Intro", "Follow-Up", "Updates", "Returning"]

JOURNEY_TYPE_DESCRIPTIONS:
- Intro: "First-touch outreach — introduce Makaliʻi Metrics and offer a clear next step"
- Follow-Up: "Nurture outreach — they know us, keep the conversation going"
- Updates: "Share news, services, or program updates with engaged contacts"
- Returning: "Re-engagement — past relationship or prior work together"

REVENUE_TYPES: ["Contract Project", "Mail-In Testing"]

QUOTE_STATUSES: ["No Quote Sent", "Quote Drafted", "Quote Sent", "Quote Accepted", "Quote Declined"]

Color mapping (use Tailwind classes, not hex):
- Tier colors: Hot = navy/blue-900, Warm = amber/yellow-700, Cold = gray-500
- Stage colors: Lead = gray-500, Contacted = blue-900, Meeting Set = green-700, Proposal Sent = amber-600, Negotiating = yellow-700, Closed Won = green-700, Closed Lost = red-700
- Journey colors: Intro = gray-500, Follow-Up = amber/yellow-700, Updates = blue-900, Returning = green-700
- Quote status colors: No Quote Sent = gray-500, Quote Drafted = amber-600, Quote Sent = blue-900, Quote Accepted = green-700, Quote Declined = red-700

Each color set should have a `text` class, a `bg` class (light variant), and a `border` class.

Also create `src/lib/crm/types.ts` with TypeScript types for:
- `CrmClient` — the clients table row with all the new CRM fields
- `CrmContact` — the crm_contacts table row
- `CrmEmailRecord` — the crm_email_history table row
- Helper union types for Tier, Stage, Segment, Island, JourneyType, RevenueType, QuoteStatus

Also create a `src/lib/crm/helpers.ts` with:
- `getInitials(firstName: string, lastName: string)` → uppercase initials
- `formatDealValue(value: number)` → "$5k", "$350", or "—" for 0
- `getAvatarColor(id: number)` → cycles through a palette of Tailwind bg classes
```

---

## Prompt 3: CRM Data Access Layer (Server Actions)

```
Create server actions for CRM CRUD operations. These will be used by all CRM pages.

Create `src/app/admin/crm/actions.ts` (or wherever server actions go in this project's convention) with these functions:

1. `getClients()` — fetch all clients with their CRM fields, ordered by id. Exclude pending ones by default. Include a count of associated crm_contacts.

2. `getClient(id)` — fetch a single client with all CRM fields, plus their crm_contacts and crm_email_history (ordered by sent_at desc).

3. `getPendingClients()` — fetch clients where pending = true, ordered by id desc.

4. `createClient(data)` — insert a new client with CRM fields. Set sensible defaults: tier="Warm", stage="Lead", pending=false.

5. `updateClient(id, updates)` — partial update of any CRM fields on the clients table.

6. `deleteClient(id)` — delete a client and cascade to contacts/email history.

7. `addContact(clientId, contact)` — insert into crm_contacts.

8. `importClients(clients[])` — bulk insert, deduplicate by org_name (skip existing). Each item should have client fields + optionally a primary contact (first_name, last_name, email).

9. `approveClient(id)` — set pending = false on a client.

10. `bulkUpdateClients(ids[], field, value)` — update one field across multiple clients at once.

11. `recordEmail(clientId, contactId, subject, body, journeyType?, bulkId?, bulkLabel?)` — insert into crm_email_history.

12. `getEmailStats(clientId)` — get email history for a client with open/click counts.

Use the existing database connection pattern in this project. All functions should be server actions (use 'use server'). Use proper TypeScript types from the types file created in the previous step.
```

---

## Prompt 4: CRM Layout and Navigation

```
Create the CRM admin layout and navigation. The CRM should live at `/admin/crm` and be protected by the existing admin auth.

Create `src/app/admin/crm/layout.tsx`:
- Admin-only route (use this project's existing auth pattern to gate access)
- Full-height layout with a top nav bar
- The nav bar should have:
  - Left: Logo area with "makaliʻi metrics · crm" text
  - Center: Nav tabs for "Contacts", "Pipeline", "Analytics", "Intake"
  - The Intake tab should show a badge with the count of pending clients (fetch on load)
  - Right: Summary text showing "{N} contacts · {N} hot leads"
- The nav bar should be dark (bg-slate-900 / navy) with light text
- Below the nav bar: render `{children}` in a full-height container with a light gray background (bg-gray-50)

Create these route stubs (just a placeholder div for now — we'll fill them in subsequent prompts):
- `src/app/admin/crm/page.tsx` — contacts view (default)
- `src/app/admin/crm/pipeline/page.tsx` — pipeline kanban
- `src/app/admin/crm/analytics/page.tsx` — analytics dashboard
- `src/app/admin/crm/intake/page.tsx` — intake queue

Use Tailwind for all styling. The nav tabs should highlight the active route. Use Next.js `usePathname` for active state detection.
```

---

## Prompt 5: Contacts List View

```
Build the main CRM contacts list page at `src/app/admin/crm/page.tsx`.

This is the primary view showing all non-pending clients with filtering, search, multi-select, and bulk operations.

**Filter bar** (sticky top, card-style container):
- Select-all checkbox (with indeterminate state when some but not all are selected)
- Search input — filters by org name, contact name, email, segment
- Dropdown filters: Tier (All/Hot/Warm/Cold), Segment (All + 7 segments), Stage (All + 7 stages)
- "Import CSV" button (secondary style)
- "+ Add client" button (primary style, navy background)

**Journey type quick-select pills** (below filter bar):
- Show a pill for each journey type that has at least one client assigned
- Each pill shows the journey type name and count
- Clicking a pill toggles selection of ALL clients with that journey type
- Active state: colored border + tinted background matching the journey type color

**Client list** (scrollable):
- Show "{N} contacts shown" and "{N} selected" counts
- Each client card shows:
  - Checkbox for multi-select
  - Avatar circle (initials, colored based on id)
  - Client org name (bold) + primary contact name
  - Island name
  - Original message preview (truncated, single line)
  - Pills: Tier, Stage, Segment, Journey Type (if assigned), first 2 tags, email count badge (green)
  - Email draft button on the right side
- Clicking a card should open a detail panel (we'll build that in Prompt 7)

**Bulk action bar** (fixed bottom, appears when any clients are selected):
- Dark navy background, rounded
- Shows "{N} selected"
- Journey type toggle pills
- Dropdown selectors for: "Set Tier…", "Set Stage…", "Set Journey…"
- "Send Bulk Email" button
- "Clear" button to deselect all

This should be a client component. Fetch the initial data server-side and pass it as props. Use the server actions from Prompt 3 for all mutations. Use Tailwind for all styling — no inline styles.
```

---

## Prompt 6: Pipeline Kanban View

```
Build the pipeline kanban view at `src/app/admin/crm/pipeline/page.tsx`.

This is a horizontal kanban board with 7 columns, one per pipeline stage: Lead, Contacted, Meeting Set, Proposal Sent, Negotiating, Closed Won, Closed Lost.

**Column headers:**
- Stage name (uppercase, small text, colored per stage)
- Count badge (how many clients in that stage)
- Total deal value for that stage (formatted like "$45k" or "—")
- Each column header has a tinted background matching the stage color

**Cards in each column:**
- Client org name (bold, navy)
- Primary contact name (gray, smaller)
- Tier pill
- Deal value if > 0

**Layout:**
- Horizontal scroll if columns overflow
- Minimum width per column ~130px, flex: 1
- Minimum total width 960px to ensure all columns are visible

**Interaction:**
- Clicking a card opens the detail panel (same as contacts view)

Fetch all non-pending clients server-side, group by stage, pass to a client component. Use Tailwind only.
```

---

## Prompt 7: Detail Panel (Slide-in Sidebar)

```
Build a slide-in detail panel component at `src/components/crm/DetailPanel.tsx`. This panel slides in from the right when a client is selected in the contacts list or pipeline view.

The panel needs to be managed from the CRM layout level so it works across all views. Add the panel to the CRM layout with:
- A backdrop overlay (semi-transparent dark) that closes the panel when clicked
- The panel slides from right: `translate-x-full` when closed, `translate-x-0` when open
- Width: `max(320px, 25vw)`
- Transition: 300ms cubic-bezier ease

**Panel content (top to bottom):**

1. **Header:** Avatar circle + client org name + primary contact name. Close button (X).

2. **Status pills:** Tier, Stage, Segment, Quote Status (if contract project)

3. **Info rows** (label-value pairs, evenly spaced):
   - Island, Deal Value (formatted), Date Created, Source, Primary Contact Email, Primary Contact Phone

4. **Journey Type selector:** Row of pill buttons for Intro / Follow-Up / Updates / Returning. Clicking one sets it (clicking active one clears it). Show description text below when one is active.

5. **Revenue Type toggle:** Two pill buttons: "Contract Project" / "Mail-In Testing". Clicking active one clears it.

6. **Contract Project section** (only visible when revenue type = "Contract Project"):
   - Tinted blue/navy background card
   - "CONTRACT PROJECT DETAILS" uppercase label
   - Contract Value ($) — number input
   - Acreage + Sample Sites — two number inputs side by side
   - Education Workshops — Yes/No toggle buttons
   - Quote Status — dropdown select
   - Scope Notes — textarea, saves on blur

7. **Mail-In Testing section** (only visible when revenue type = "Mail-In Testing"):
   - Tinted green background card
   - Price Override ($) — number input

8. **Original message** (if exists): Read-only text in a sand/tan tinted box

9. **Stage selector:** Full-width dropdown

10. **Tier selector:** Full-width dropdown

11. **Tags:** Display existing tags as pills

12. **Notes section:** Read-only display of existing notes + "Add note" textarea + "Save note" button (appends with date prefix)

13. **Pricing Calculator** (only for non-contract types):
   - Expandable section with toggle
   - Test package dropdown: Basic pH ($45), Standard Fertility ($75), Comprehensive Nutrient ($120), Hawaiʻi Soil Health ($175), Multi-Element ($275), Carbon Smart ($225)
   - Number of samples input
   - 15% volume discount at 10+ samples
   - Price breakdown display
   - "Apply to deal value" button
   - Optional: "vs. mainland labs" comparison toggle

14. **Email History** (if any emails sent):
   - List of sent emails: subject, date, opened/clicked status
   - Each entry in a light gray card

15. **Action buttons:**
   - "Draft reply email" — full width, sand/tan color
   - "Remove client" — full width, red text, destructive style

All field changes should call `updateClient` server action immediately (optimistic updates in the UI). Use Tailwind only.
```

---

## Prompt 8: Analytics Dashboard

```
Build the analytics dashboard at `src/app/admin/crm/analytics/page.tsx`.

This has two tabs: "Overview" and "Campaigns".

**Overview tab:**

Top metric cards (horizontal row, wrapping):
- Total Contacts (count, "inquiries logged")
- Hot Leads (count of tier="Hot", "need attention")
- Actionable (count of clients with "Actionable" tag, "ready to respond")
- Pipeline Value (sum of all deal values, formatted, "estimated")
- Active (count excluding Closed Won/Closed Lost, "in pipeline")

Charts section (flex row, wrapping):
1. **Inquiries by segment** — horizontal bar chart. For each segment: label, count, proportional bar (navy fill on sand/tan track). Sorted by count descending.
2. **Stage breakdown** — same format but colored per stage.
3. **By tier** — three stacked cards (one per tier) showing count with tinted backgrounds.

**Pipeline by revenue type** section:
- Three cards side-by-side: Contract Project, Mail-In Testing, Untyped
- Each shows: count of clients, total value, colored tint matching type

**Action items** section:
- List of clients tagged "Actionable"
- Each row: name, org, tier pill, "View" button, "Draft" email button

**Campaigns tab:**

Top metric cards:
- Total Sent (email count)
- Open Rate (percentage across all sent)
- Not Emailed (count of clients with no email history)

Three side-by-side chart cards:
1. Open rate by segment — bar chart with rates
2. Open rate by journey type — bar chart with rates
3. Open rate by pipeline stage — bar chart with rates

**Bulk Campaigns** section:
- Group emails by bulk_id
- For each campaign: name, recipient count, open rate, date
- Expandable: click to see per-recipient opened/clicked status

**Contacts never emailed** section:
- List with name, org, tier pill, "View" and "Draft" buttons

Fetch all data server-side. Use Tailwind for all styling. Bar charts should be pure CSS (div widths as percentages) — no chart library needed.
```

---

## Prompt 9: Intake Queue and Intake Form

```
Build two things: the admin intake queue and the public intake form.

**1. Intake Queue** at `src/app/admin/crm/intake/page.tsx`:

Header:
- Title: "Intake Queue"
- Subtitle: "Contacts submitted by the team — review and approve to add to the pipeline."
- Pending count badge (amber/yellow)
- Refresh button

Share link section:
- Card showing the intake form URL
- "Copy link" button that copies to clipboard

Empty state:
- When no pending clients: show centered "Queue is clear" message with mailbox icon

Pending client cards:
- Each card has a left amber border accent
- Shows: avatar initials, client org name, primary contact name/email/phone, island
- Status pills: "Pending", segment, island
- "More / Less" toggle to expand and show message + notes
- Two action buttons: "Approve & add to pipeline" (primary) and "Discard" (red/destructive)
- Approve calls `approveClient(id)` server action and removes from list
- Discard calls `deleteClient(id)` server action and removes from list

**2. Public Intake Form** at `src/app/intake/page.tsx` (or wherever makes sense — this route should be accessible WITHOUT admin auth):

This is a standalone form page for field staff to submit new contacts.

Header: Dark navy bar with "makaliʻi metrics · new contact" text

Form sections in a centered card (max-width ~480px):

Section 1 - "Who's submitting this?":
- Your name (required)
- How did you meet them? (required, dropdown): Farm Bureau/Event, NRCS/EQIP Program, Capitol/Gov Outreach, Referral, Website/Inbound, Direct Outreach, Conference/Workshop, Social Media, Other
- If "Other": text input for description

Section 2 - "Contact info":
- First name (required) + Last name (side by side)
- Email (required)
- Phone + Island dropdown (side by side)
- Organization / Farm / Agency

Section 3 - "Segment":
- Row of pill buttons for the 7 segments (select one)

Section 4 - "Context":
- "What did they say / ask about?" — textarea
- "Your notes (internal)" — textarea

Submit button: "Submit contact →"
- On submit: creates a new client with `pending: true`, tier: "Warm", stage: "Lead", source set to the "how met" answer
- Also creates a crm_contact record for the person
- Success state: "Contact submitted!" confirmation with "Add another contact" button

Validation: first name, email, submitter name, and how-met are required.

Use Tailwind. The form should look clean and professional.
```

---

## Prompt 10: Email Modal (Single Send)

```
Build an email composition modal at `src/components/crm/EmailModal.tsx`.

This modal opens when a user clicks "Draft reply email" on a client. It supports journey-type-based templates and AI-enhanced drafting.

**Modal structure:**
- Overlay backdrop (dark semi-transparent)
- Centered card, 560px max width
- Close button top-right

**Header:**
- "Draft reply" title
- "To: {contact name} · {email}" subtitle
- Journey type pills (Intro, Follow-Up, Updates, Returning) — clicking one loads that template

**Journey type templates (hardcoded defaults):**

Intro:
- Subject: "Aloha from Makaliʻi Metrics — Hawaiʻi's Soil Testing Lab"
- Body: "Aloha {firstName},\n\nMahalo for your interest in Makaliʻi Metrics! We're Hawaiʻi's first locally-staffed commercial soil testing lab, and we'd love to help you understand your soil.\n\nWe offer:\n• Full soil health panels with Hawaii-specific interpretation\n• Fast turnaround — typically within a few business days\n• Local expertise that mainland labs can't provide\n\nWould you be open to a quick 15-minute call this week?\n\nMahalo nui,\nDaniel Richardson, Founder\nMakaliʻi Metrics (808) 392-3975\ninfo@makaliimetrics.com | makaliimetrics.com"

Follow-Up:
- Subject: "Following up — Makaliʻi Metrics"
- Body: "Aloha {firstName},\n\nJust checking back in — I wanted to make sure my previous message didn't get lost!\n\nWe'd love to support your work. If now isn't the right time, no worries — just let me know when works best.\n\nMahalo nui,\nDaniel Richardson, Founder\nMakaliʻi Metrics (808) 392-3975\ninfo@makaliimetrics.com | makaliimetrics.com"

Updates:
- Subject: "A quick update from Makaliʻi Metrics"
- Body: "Aloha {firstName},\n\nMahalo for staying connected! We've been growing our lab capacity and can now offer faster turnaround and more testing options than ever.\n\nIs there anything specific we can help you with right now? I'd love to reconnect.\n\nMahalo nui,\nDaniel Richardson, Founder\nMakaliʻi Metrics (808) 392-3975\ninfo@makaliimetrics.com | makaliimetrics.com"

Returning:
- Subject: "Aloha again from Makaliʻi Metrics"
- Body: "Aloha {firstName},\n\nIt's been a little while — I hope things are going well! I wanted to reach out and see how your work is progressing and whether Makaliʻi Metrics can be of service.\n\nWe've added new testing capabilities and would love to continue supporting you. Let me know if you'd like to reconnect.\n\nMahalo nui,\nDaniel Richardson, Founder\nMakaliʻi Metrics (808) 392-3975\ninfo@makaliimetrics.com | makaliimetrics.com"

**When a journey type pill is clicked:**
1. Immediately populate subject + body with the template (replacing {firstName} with the contact's actual first name)
2. Show a spinner
3. Call your AI model endpoint to improve the draft — prompt: "You are writing on behalf of Daniel Richardson at Makaliʻi Metrics, Hawaiʻi's first locally-staffed commercial soil testing lab. Contact: {name}, {org}. Journey type: {type} — {description}. Improve this draft to feel personal and specific to this contact. Keep it under 120 words. Plain text only. No subject line."
4. Replace the body with the AI response when it arrives

**Email compose area:**
- Subject input (editable)
- Body textarea (editable, ~14 rows)

**Action buttons:**
- "Copy" — copies "Subject: {subject}\n\n{body}" to clipboard
- "Open in Mail" — opens mailto: link
- "Regenerate" — re-runs the AI enhancement

**Send button** (full width):
- "Send via Resend" — use whatever email sending integration this project has
- On success: record the email in crm_email_history via the `recordEmail` server action
- Show success/error state on the button

Use Tailwind. Loading states should show a spinning indicator.
```

---

## Prompt 11: Bulk Email Modal

```
Build a bulk email modal at `src/components/crm/BulkEmailModal.tsx`.

This opens when the user clicks "Send Bulk Email" from the bulk action bar in the contacts list. It receives an array of selected clients.

**Three stages: compose → sending → done**

**Compose stage:**

Header: "Bulk Email — {N} contacts" + subtitle: "One campaign, personalised per recipient"

Journey type selector: four pill buttons. Changing the journey type reloads the template and triggers AI generation.

Loading state: spinner with "Generating email…"

When ready:
- Subject input
- Body textarea (~11 rows) with hint: "use {firstName} for the first name"
- Summary box: "1 campaign — '{subject}' sent to {N} contacts via a single campaign. Each recipient's first name is personalised automatically."
- "Regenerate" button + "Send campaign to {N} contacts" primary button

AI generation prompt: "You are writing a bulk outreach email for Daniel Richardson at Makaliʻi Metrics, Hawaiʻi's first locally-staffed commercial soil testing lab. Journey type: {type}. Context: {description}. Write a short, warm email (under 120 words). Use {firstName} as the greeting placeholder. Sign off as Daniel Richardson, Makaliʻi Metrics, (808) 392-3975 | makaliimetrics.com. No markdown. Plain text only. Do not include the subject line."

**Sending stage:**
- Full-width spinner
- Progress text: "Creating campaign…" → "Logging to contacts…"

**Done stage (success):**
- Green checkmark
- "Campaign sent to {N} contacts"
- Campaign name
- "Done" button to close

**Done stage (error):**
- Warning icon
- "Send failed" with error message
- "Back to compose" button

**On send:**
1. Send the email to all selected contacts using this project's email sending integration
2. Replace {firstName} with each contact's actual first name (or the production email system's merge tag equivalent)
3. Generate a unique bulkId (like "bulk-{journeyType}-{timestamp}")
4. For each recipient, record in crm_email_history with the shared bulkId and bulkLabel
5. Close modal and clear selection

Use Tailwind only.
```

---

## Prompt 12: Add Client Modal and CSV Import Modal

```
Build two modals: AddModal and ImportModal for the CRM.

**1. Add Client Modal** at `src/components/crm/AddModal.tsx`:

A 3-step modal form:

Step 1 — "Contact info":
- First name (required) + Last name (side by side)
- Email (required)
- Phone + Island dropdown (side by side)
- Organization name
- Validation: first name and email required to proceed

Step 2 — "Classification":
- Journey Type: card-style buttons with name + description
- Segment: row of pill buttons (7 options)
- Tier: three radio-card options (Hot = "Active need", Warm = "Interested", Cold = "Early stage") with colored dots
- Stage: list of 7 radio options with colored dots
- Validation: segment, tier, and stage all required

Step 3 — "Message & notes":
- "Their message / inquiry" — textarea
- "Internal notes" — textarea
- Pricing calculator (same as in DetailPanel — package selector, quantity, volume discount, apply to deal value)
- Manual deal value override input
- Preview card showing the client summary with pills

Progress bar: 3 segments, fills as you advance. Step indicator text: "Step N of 3 — {section name}"
Navigation: "Back" and "Continue" buttons. Final step: "Add client" button.

On save: creates the client (via `createClient` server action) + a crm_contact record for the person.

**2. Import CSV Modal** at `src/components/crm/ImportModal.tsx`:

Three states: upload → preview → success

Upload state:
- Drag & drop zone (dashed border, accepts .csv)
- "or click to browse" text
- Expected columns info: "Name or First Name + Last Name · Email · Phone · Organization · Message · Island"

Preview state:
Auto-detect CSV columns using these aliases:
- firstName: "first name", "first_name", "firstname", "given name"
- lastName: "last name", "last_name", "lastname", "surname", "family name"
- name: "name", "full name", "full_name", "your name", "contact name" (split into first+last)
- email: "email", "email address", "e-mail", "your email"
- phone: "phone", "phone number", "telephone", "mobile", "cell"
- org: "organization", "org", "company", "farm", "agency", "business", "affiliation"
- message: "message", "inquiry", "comments", "how can we help", "your message", "question"
- island: "island", "which island", "island/region", "location"

Show detected column mappings as small pills.

Default field selectors: Segment, Tier, Stage, Source (applied to all imports).

Preview table: Name, Email, Org, Island columns for new contacts.

Deduplication: match by org_name against existing clients. Show count of duplicates that will be skipped.

"Import {N} contacts" primary button.

Success state: "{N} contacts imported" with checkmark, "{N} duplicates skipped", "Done" button.

CSV parsing: handle quoted fields, commas in values, \r\n line endings.

Use Tailwind. Both modals should have dark overlay backdrops that close on click.
```

---

## Prompt 13: Wire Everything Together

```
Wire all CRM components together. The modals, detail panel, and state management need to be connected across the CRM pages.

Create a CRM context provider at `src/components/crm/CrmProvider.tsx` (or use whatever state pattern this project prefers) that manages:

1. **Selected client** — which client's detail panel is open (shared across contacts + pipeline views)
2. **Checked client IDs** — Set of multi-selected client IDs (for bulk operations)
3. **Modal state** — which modal is open: add, import, email (single), bulk email, or none
4. **Email draft state** — current subject/body for the email modal
5. **Email target** — which client the email modal is targeting

Wrap the CRM layout with this provider.

Update the contacts list page to:
- Open AddModal when "+ Add client" is clicked
- Open ImportModal when "Import CSV" is clicked
- Open EmailModal when the email button on a card is clicked
- Open BulkEmailModal when "Send Bulk Email" in bulk bar is clicked
- Open DetailPanel when a client card is clicked
- Close DetailPanel when clicking the backdrop

Update the pipeline page to:
- Open DetailPanel when a kanban card is clicked

Update the analytics page to:
- Open DetailPanel when "View" is clicked on an action item
- Open EmailModal when "Draft" is clicked

Make sure the detail panel, all modals, and the bulk action bar work correctly with real server actions for all mutations. After a mutation (add, edit, delete, import, approve), the UI should reflect the change immediately (optimistic update or refetch).

Test that:
- Creating a new client via AddModal appears in the contacts list
- Importing CSV adds new clients
- Editing fields in DetailPanel persists
- Bulk operations (set tier/stage/journey) update all selected clients
- Approving an intake removes it from queue and adds to contacts
- Email send records to crm_email_history
```

---

## Prompt 14: Final Polish and Review

```
Review the entire CRM implementation for quality and completeness. Check every component against the original requirements:

1. **Contacts list**: search, filter by tier/segment/stage, multi-select, journey type pills, bulk actions (set tier, set stage, set journey, send bulk email), select all / clear
2. **Pipeline kanban**: 7 columns, cards with org name + contact + tier + value, stage header with count + total value
3. **Analytics - Overview**: 5 metric cards, segment bar chart, stage bar chart, tier cards, revenue type breakdown, actionable items list
4. **Analytics - Campaigns**: 3 metric cards, open rate by segment/journey/stage charts, bulk campaign list with expand, never-emailed list
5. **Intake queue**: pending count badge in nav, share link, pending cards with expand, approve/discard actions
6. **Intake form**: standalone public page, 4-section form, validation, success state
7. **Detail panel**: slide-in, all fields editable, contract project section, mail-in section, pricing calculator, email history, notes
8. **Email modal**: journey type templates, AI enhancement, copy/mail/send, send recording
9. **Bulk email**: journey type selection, AI generation, send to all, bulk_id tracking
10. **Add modal**: 3-step form, pricing calculator, preview
11. **Import modal**: drag & drop CSV, auto-detect columns, dedup, defaults, preview table

Fix any issues you find. Make sure:
- All Tailwind classes are used correctly (no inline styles)
- Loading states exist for async operations
- Empty states are handled ("No contacts match", "Queue is clear", etc.)
- The color system is consistent throughout
- The pending count badge in the nav updates when intakes are approved/discarded
- Navigation between views preserves the detail panel state
- The intake form route is accessible without admin auth
- All other CRM routes require admin auth
```
