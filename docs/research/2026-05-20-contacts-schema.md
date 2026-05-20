# Stax Contacts Schema — Locked for Phase 2

> Derived from cross-referencing HubSpot, Pipedrive, Streak, Salesforce, Folk, Attio, Notion templates, Airtable templates, Twenty, and ozmazixhq.

## Universal fields (appear in 4+ surveyed systems)

| Field | Why it's universal |
|---|---|
| First name + Last name | Identity — every CRM |
| Email | Primary contact — every CRM |
| Phone | HubSpot, Pipedrive, Salesforce, Streak, Airtable, Notion |
| Company / Organization | HubSpot, Pipedrive, Salesforce, Airtable, Notion |
| Job title | HubSpot, Pipedrive, Airtable, Notion |
| Status / Stage (lead → prospect → client → inactive) | Airtable, Notion, Pipedrive |
| Last interaction date | HubSpot, Airtable, Notion — solo-essential |
| Next follow-up date | Notion, Airtable, OnePageCRM |
| Notes | Implicit in every CRM |
| Created/Updated timestamps | Every modern CRM |

## Sometimes fields (appear in 2-3 systems)

| Field | When useful |
|---|---|
| Lead source | Streak, Airtable, SMB best practice — solos must track what works |
| Lifetime value | Airtable, Notion — solos need revenue-per-contact |
| Tags / Labels | Streak, modern systems — flexible categorization |
| LinkedIn / Social URLs | Notion, Folk, Attio — helpful for research |
| Birthday / Anniversary | Pipedrive, Notion — relationship building |

## Solo-entrepreneur-specific recommendations

For coaches, consultants, course creators specifically:

1. **Last interaction date** — solos rely on memory; this prevents stale relationships
2. **Next follow-up date** — solos must batch outreach; prevents follow-up debt
3. **Lead source** — solos must know which channels (referral, LinkedIn, webinar, cold email, organic) produce quality leads
4. **Tags** — "warm lead," "needs proposal," "annual check-in" — flexible without complex workflows
5. **Lifetime value** — total spend per contact for course creators; estimated revenue from engagement for coaches
6. **Status** with the four-state default: `lead`, `prospect`, `client`, `inactive` — indicates when to re-engage

---

## Proposed Stax Contacts Schema

```sql
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identity (required)
  first_name VARCHAR(100) NOT NULL,
  last_name  VARCHAR(100) NOT NULL,

  -- Core contact methods
  email VARCHAR(255),
  phone VARCHAR(50),

  -- Professional context
  company_name VARCHAR(255),
  job_title    VARCHAR(100),

  -- Relationship management
  status VARCHAR(50) NOT NULL DEFAULT 'lead',
    -- enum: lead, prospect, client, inactive
  tags TEXT[] DEFAULT '{}',

  -- Key dates for solo entrepreneurs
  last_interaction_at TIMESTAMPTZ,
  next_followup_at    TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Solo-focused tracking
  lead_source    VARCHAR(100),
    -- common values: referral, linkedin, webinar, cold_email, organic, website, event
  lifetime_value NUMERIC(12, 2) DEFAULT 0,

  -- Rich context
  notes TEXT,

  -- Ownership
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Soft delete
  deleted_at TIMESTAMPTZ
);

-- Constraint: at least one contact method
ALTER TABLE contacts ADD CONSTRAINT contacts_has_contact_method
  CHECK (email IS NOT NULL OR phone IS NOT NULL);

-- Indexes
CREATE INDEX idx_contacts_user_status     ON contacts(user_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_contacts_user_followup   ON contacts(user_id, next_followup_at) WHERE deleted_at IS NULL AND next_followup_at IS NOT NULL;
CREATE INDEX idx_contacts_user_email      ON contacts(user_id, email);

-- Row-level security (Supabase pattern)
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see their own contacts"
  ON contacts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Auto-update updated_at on row change
CREATE TRIGGER contacts_set_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();
```

**Column count:** 16 (id, first_name, last_name, email, phone, company_name, job_title, status, tags, last_interaction_at, next_followup_at, created_at, updated_at, lead_source, lifetime_value, notes, user_id, deleted_at) — pragmatic, not exhaustive.

## Default reference values to ship with the module

```sql
-- Default lead sources (UI dropdown)
-- Stored as CHECK or as a separate lookup table — TBD in Phase 2 planning
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
```

(Lead-sources as a lookup table — not an enum — so customers can add new sources without a migration. Common Stax pattern.)

## Customization points (documented for the customer-facing guide)

Phase 2's getting-started-with-contacts.md will explicitly call out these as "common customizations Claude Code can do for you":

- **Add a custom field** (e.g., `coaching_program`, `course_status`) — Claude adds column + form field + table cell in <60s
- **Add a new status value** beyond lead/prospect/client/inactive
- **Add a new lead source** to the lookup table
- **Surface a field on the dashboard** (e.g., "show contacts with next_followup_at in the next 7 days")
- **Hide fields you don't use** (e.g., remove `job_title` if you serve consumers, not B2B)

## Extension path (Phase 3+)

When modules need contact-side custom fields (e.g., `courses` module wants to track `last_lesson_completed` per contact), we'll add a companion `contact_custom_fields` table (Twenty's pattern). Spec deferred to Phase 3.

## Sources

- HubSpot default contact properties — https://knowledge.hubspot.com/properties/hubspots-default-contact-properties
- Pipedrive PersonFields API — https://developers.pipedrive.com/docs/api/v1/PersonFields
- Airtable Sales CRM template — https://academy.airtable.com/quick-start-the-sales-crm-airtable-template
- Notion CRM patterns — https://zapier.com/blog/notion-crm/
- Twenty schema — https://github.com/twentyhq/twenty
- Folk/Attio/Clay comparison — https://www.weekcrm.com/news/2026-04-24-attio-vs-folk-vs-clay
- OnePageCRM (solopreneur-focused) — https://www.onepagecrm.com/personal-crm-for-sales-focused-solopreneurs/
