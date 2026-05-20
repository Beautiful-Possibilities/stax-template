# Stax Contacts Schema — Locked for Phase 2

> Reconciled from three inputs: (1) industry research across HubSpot/Pipedrive/Streak/Folk/Attio/Notion/Airtable, (2) Oz's ozmazixhq production CRM (2+ years live), (3) the All-in-One-Business-App Flask reference (clean separation-of-concerns schema).

## Headline

**20 columns**, drawn from 4+ widely-deployed CRMs + ozmazixhq's lived-in lessons + AIO-BA's clean structure. Email is **nullable** (ozmazixhq learned this — social-only contacts exist). Includes a CHECK constraint requiring at least one contact method. Soft delete, RLS, indexes shipped from day one.

---

## Section 1 — Universal fields (appear in 4+ surveyed systems)

| Field | Source |
|---|---|
| First name + Last name | Every CRM + ozmazixhq |
| Email (nullable) | Every CRM, but **ozmazixhq made it nullable post-launch** — social-only contacts exist |
| Phone | HubSpot, Pipedrive, Salesforce, Streak, Airtable, Notion, ozmazixhq |
| Company / Organization | HubSpot, Pipedrive, Airtable, Notion, AIO-BA |
| Job title | HubSpot, Pipedrive, Airtable, Notion |
| Status (lead/prospect/client/inactive) | Airtable, Notion, Pipedrive, ozmazixhq, AIO-BA |
| Last interaction date | HubSpot, Airtable, Notion — solo-critical |
| Next follow-up date | Notion, Airtable, OnePageCRM |
| Notes (inline) | Every CRM (though AIO-BA splits to a notes table — see Phase 3) |
| Created/Updated timestamps | Every modern system |

## Section 2 — Sometimes fields (added selectively for Stax)

| Field | Sourced from | Why we ship it |
|---|---|---|
| `tags` (TEXT[]) | Streak, ozmazixhq | Flexible categorization without rigid workflows |
| `lead_source` | Streak, Airtable, ozmazixhq, AIO-BA | Solos must know which channels work |
| `lifetime_value` | Airtable, Notion, ozmazixhq | Revenue-per-contact = SMB north-star metric |
| `is_featured` (BOOLEAN) | **ozmazixhq lesson** | High-ROI VIP flag for "focus today" dashboards |
| `email_secondary` | **ozmazixhq lesson** | Work + personal email is real-world common |

## Section 3 — What we DEFERRED to Phase 3+ (deliberately)

These fields exist in ozmazixhq but we're not shipping them in Phase 2:

| Field/feature | Why deferred |
|---|---|
| Social handles (instagram, linkedin, twitter, facebook, tiktok columns) | Oz-specific in current form; will ship as Phase 3 optional add-on or via custom-field table |
| `photo_url` | Nice-to-have; storage-bucket pattern; Phase 3 |
| Birth chart / Human Design data (`birth_month`, `birth_day`, `hd_profile`, etc.) | Oz/QRC-vertical; if needed, lives in a separate `contact_custom_fields` table when courses module ships |
| Email engagement (`last_email_opened_at`, `last_email_clicked_at`) | Integration-specific; emails-resend module (Phase 3) can populate these later in a `contact_email_engagement` table |
| Portal/auth linking (`auth_user_id`, `portal_status`, `portal_invited_at`) | Client-portal feature; Phase 3+ |
| Telegram IDs (`telegram_chat_id`, `telegram_group_chat_id`) | Integration-specific; lives in the telegram module's schema when it ships |
| `notes` as a one-to-many table (AIO-BA pattern) | Phase 2 keeps notes inline for simplicity; Phase 3 introduces `contact_notes` table |
| `contact_activities` log (call/email/meeting events) | Phase 3 |
| `contact_deals` association | Phase 5+ (pipelines module) |

## Section 4 — Schema quality lessons taken

**From AIO-BA (Flask):** Separation of concerns. Contact = identity + status. Everything else lives in dedicated related tables (Note, Activity, Deal, Purchase). We adopt this for Phase 3+ — keep Phase 2 lean, refactor outward as modules add need.

**From ozmazixhq (production):** Real-world friction reveals defaults we'd miss. Especially: email-nullable, is_featured for visual prioritization, secondary emails. These are non-obvious until you've actually used a CRM in anger.

**From research:** Standardize on the 4-state status enum (lead/prospect/client/inactive) — it's the universal language across HubSpot/Pipedrive/Folk and matches solo-entrepreneur mental models.

---

## Locked Schema — Phase 2 Migration

```sql
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identity (required)
  first_name VARCHAR(100) NOT NULL,
  last_name  VARCHAR(100) NOT NULL,

  -- Core contact methods (nullable; CHECK ensures at least one)
  email           VARCHAR(255),
  email_secondary VARCHAR(255),
  phone           VARCHAR(50),

  -- Professional context
  company_name VARCHAR(255),
  job_title    VARCHAR(100),

  -- Relationship management
  status VARCHAR(50) NOT NULL DEFAULT 'lead',
    -- enum: lead, prospect, client, inactive
  tags        TEXT[]  DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,

  -- Key dates for solo entrepreneurs
  last_interaction_at TIMESTAMPTZ,
  next_followup_at    TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Solo-focused tracking
  lead_source    VARCHAR(100),
  lifetime_value NUMERIC(12, 2) DEFAULT 0,

  -- Rich context
  notes TEXT,

  -- Ownership (Supabase RLS)
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Soft delete
  deleted_at TIMESTAMPTZ
);

-- Contact-method requirement
ALTER TABLE contacts
  ADD CONSTRAINT contacts_has_contact_method
  CHECK (
    email           IS NOT NULL
    OR email_secondary IS NOT NULL
    OR phone        IS NOT NULL
  );

-- Status enum guard
ALTER TABLE contacts
  ADD CONSTRAINT contacts_status_check
  CHECK (status IN ('lead', 'prospect', 'client', 'inactive'));

-- Indexes
CREATE INDEX idx_contacts_user_status
  ON contacts(user_id, status)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_contacts_user_followup
  ON contacts(user_id, next_followup_at)
  WHERE deleted_at IS NULL AND next_followup_at IS NOT NULL;

CREATE INDEX idx_contacts_user_email
  ON contacts(user_id, email);

CREATE INDEX idx_contacts_user_featured
  ON contacts(user_id, is_featured)
  WHERE deleted_at IS NULL AND is_featured = true;

-- Row-level security
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see their own contacts"
  ON contacts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Auto-update updated_at (assumes set_updated_at() helper from core)
CREATE TRIGGER contacts_set_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();
```

**Column count:** 20 (id, first_name, last_name, email, email_secondary, phone, company_name, job_title, status, tags, is_featured, last_interaction_at, next_followup_at, created_at, updated_at, lead_source, lifetime_value, notes, user_id, deleted_at).

## Lookup table — `contact_lead_sources`

Ship the contacts module with a companion `contact_lead_sources` table so customers can extend without a migration:

```sql
CREATE TABLE contact_lead_sources (
  slug          VARCHAR(50)  PRIMARY KEY,
  label         VARCHAR(100) NOT NULL,
  display_order INTEGER      NOT NULL DEFAULT 100,
  user_id       UUID         REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Default rows (user_id NULL = shared system defaults)
INSERT INTO contact_lead_sources (slug, label, display_order) VALUES
  ('referral',       'Referral',         10),
  ('linkedin',       'LinkedIn',         20),
  ('webinar',        'Webinar',          30),
  ('cold_email',     'Cold email',       40),
  ('organic',        'Organic search',   50),
  ('website',        'Website form',     60),
  ('event',          'Event / Meetup',   70),
  ('podcast',        'Podcast',          80),
  ('referral_paid',  'Affiliate / Paid', 90),
  ('other',          'Other',           100);

ALTER TABLE contact_lead_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see defaults + their own sources"
  ON contact_lead_sources FOR ALL
  USING (user_id IS NULL OR auth.uid() = user_id);
```

## Phase 3+ extension path

When modules need contact-side custom fields or richer history, ship these companion tables (AIO-BA pattern + Twenty pattern):

- `contact_notes(id, contact_id, content, author_id, created_at)` — rich timeline notes
- `contact_activities(id, contact_id, action_type, description, ref_id, created_at)` — unified activity feed (calls, emails, meetings, status changes, tag changes)
- `contact_custom_fields(id, contact_id, field_key, field_value_text, field_value_number, field_value_date)` — Twenty-style EAV for module-added per-contact data
- `contact_email_engagement(contact_id, last_opened_at, last_clicked_at, opens_count, clicks_count)` — populated by emails-resend module

## Customization points (for the customer-facing guide)

These get a dedicated section in Phase 2's getting-started-with-contacts.md. Each is something Claude Code can do in <60 seconds:

- **Add a custom field** (e.g., `coaching_program`, `referral_credit_due`) — Claude adds column + form field + table cell
- **Add a new status value** beyond lead/prospect/client/inactive (e.g., `archived`, `dormant`)
- **Add a new lead source** — just insert a row into `contact_lead_sources`; no migration
- **Surface a custom view** (e.g., "show contacts with next_followup_at in the next 7 days who are status='client'")
- **Hide fields you don't use** (e.g., remove `job_title` if you serve consumers, not B2B)
- **Add social handles** as nullable VARCHAR columns (Phase 2 leaves them out; if you want them on day one, Claude can add them)

## Sources

- HubSpot default contact properties — https://knowledge.hubspot.com/properties/hubspots-default-contact-properties
- Pipedrive PersonFields API — https://developers.pipedrive.com/docs/api/v1/PersonFields
- Airtable Sales CRM template — https://academy.airtable.com/quick-start-the-sales-crm-airtable-template
- Notion CRM patterns — https://zapier.com/blog/notion-crm/
- Twenty schema — https://github.com/twentyhq/twenty
- Folk/Attio/Clay comparison — https://www.weekcrm.com/news/2026-04-24-attio-vs-folk-vs-clay
- OnePageCRM (solopreneur-focused) — https://www.onepagecrm.com/personal-crm-for-sales-focused-solopreneurs/
- **ozmazixhq** (Oz's production CRM) — `/Users/ozluv/Documents/Projects/ozmazixhq/supabase/migrations/`
- **All-in-One-Business-App** (Oz's Flask reference) — `/Users/ozluv/Desktop/All Coding Projects/All-in-One-Business-App/`
