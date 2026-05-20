# Stax Landscape Research — 2026-05-20

> Three parallel research tracks run pre-Phase-2 to ensure we're not reinventing solved problems and to lock the canonical contacts schema before we build it.

## Synthesis (the TL;DR)

1. **Closest OSS analogue: [Twenty](https://github.com/twentyhq/twenty)** — modern, TypeScript, metadata-driven CRM. Their approach (objects defined in metadata tables rather than fixed SQL columns) is worth borrowing for module extensibility down the road.
2. **Stax's CLI architecture is sound** — code-copy pattern matches shadcn/ui. But: we should align our manifest format with shadcn's `registry.json + registry-item.json` schema *before* writing more modules, so future community registries are interoperable.
3. **Canonical contacts schema is decided** — 16 columns, drawn from HubSpot/Pipedrive/Streak/Folk/Attio/Notion conventions + ozmazixhq lived experience. Ready to drop into Phase 2.

## Strategic Implications

- **Adopt shadcn registry schema for `manifest.ts` v2** — replace our hand-rolled format. Adds compatibility with [registry.directory](https://registry.directory) and the growing shadcn-registry tooling. Small refactor cost now; large ecosystem leverage later.
- **Adopt Twenty's "metadata table" pattern for Phase 5+** — when modules need to declare custom fields per-customer-install, we'll want a `contact_custom_fields` table rather than ALTERing the contacts table. Punt for Phase 2; lock in by Phase 3.
- **Ship the locked 16-column schema as the Phase 2 contacts module** — no further design needed. See `2026-05-20-contacts-schema.md`.

---

## Track A — Open-source self-hosted CRMs

| Project | Stack | Schema highlight | Plugin/module system | Steal | Avoid |
|---|---|---|---|---|---|
| [**Twenty**](https://github.com/twentyhq/twenty) | TypeScript / NestJS / Postgres / GraphQL | Person: `firstName`, `lastName`, `email`, `phone` — minimal core. Metadata-driven (objects computed from metadata tables). | `npx create-twenty-app` — custom objects as TS, WASM sandbox execution, AI skills | Metadata-first architecture | GraphQL overhead for solo |
| [**EspoCRM**](https://github.com/espocrm/espocrm) | PHP / MySQL/Postgres | Entity Manager for runtime field/entity customization | Admin-driven custom entities | Admin-UI-driven extensibility | Field serialization complexity |
| [**Mautic**](https://github.com/mautic/mautic) | PHP/Symfony / MySQL | Behavioral tracking baked in (lifecycle_status, lead_score) | Mautic addons | Smart migration system for schema changes | Overkill for non-marketers |
| [**SuiteCRM**](https://github.com/SuiteCRM/SuiteCRM) | PHP / MySQL | `contacts` + `contacts_cstm` for custom fields | Custom modules | **`_cstm` table pattern for user-added fields** | Enterprise complexity |
| [**Vtiger**](https://github.com/vtiger-crm/vtigercrm) | PHP / MySQL | `vtiger_contactdetails`: salutation, firstname, lastname, phone, mobile, title, fax, leadsource, accountid | Modules | — | Legacy patterns |
| [**Krayin**](https://github.com/krayin/laravel-crm) | Laravel / PHP / MySQL | Lead, Contact, Account, Opportunity modules | Package-based extension | Modularity model | Laravel-tight |
| [**Crater**](https://github.com/crater-invoice-inc/crater) | Laravel / Vue | Minimal contact (name, email, address — billing-focused) | — | Keep contacts lightweight, upsell features | Invoicing-narrow |
| [**NocoDB**](https://github.com/nocodb/nocodb) | Vue / TypeScript / Postgres | Flexible field types (Lookup, Rollup, Currency, Formula) | API/REST extensions, no plugin system yet | Variant cell types + view paradigm | No customer-coded extensions |
| [**Mailcoach**](https://github.com/spatie/Mailcoach) | Laravel / Spatie | Subscriber = contact + tags | SDK-first | Tag-driven segmentation | Email-only |

**Verdict.** None of these target solo entrepreneurs with a free core + paid modules bundled in one CLI install. Twenty is the closest in *spirit* (modular, modern stack) but is built for teams. Stax's niche is the modular-but-unified experience for non-technical solopreneurs — a real white space.

**Top 3 patterns to borrow:**
1. **Metadata-driven schema (Twenty)** — module declares objects in a metadata table; UI + types computed from it. Lets us add user-custom fields without ALTER TABLE.
2. **`_cstm` companion table (SuiteCRM)** — separate user-added fields from core columns. Cleaner upgrades.
3. **Lightweight core + paid-tier features (Crater)** — keep `contacts` minimal in the free tier; behavioral tracking, scoring, pipelines come from paid modules.

---

## Track B — Next.js+Supabase SaaS starters & code-copy registries

### B1: SaaS Starter Boilerplate Landscape

| Product | Stack | Price | Differentiation | Verdict for Stax |
|---|---|---|---|---|
| [Supastarter](https://supastarter.dev) | Next.js + Supabase, Nuxt option | $349–$1,499 lifetime | Full kit: auth, payments, multi-tenant, AI, i18n | **Monolithic** — opposite shape to Stax |
| [Makerkit](https://makerkit.dev/next-supabase) | Next.js 16 + Supabase | $299–$599 lifetime (+ free OSS option) | MFA, Stripe, multi-tenant orgs, RBAC, blog/docs, Playwright | Closest competitor on stack; still monolithic |
| ShipFast | Next.js | Lifetime | Minimal-boilerplate-for-fast-launch | Faster than Supastarter but less depth |
| SaaSBold / Nextbase / BuilderKit | Next.js + various | $300–$600 | Pre-built auth + payments + design | Crowded undifferentiated tier |
| [OpenSaaS](https://github.com/wasp-lang/open-saas) | Wasp (full-stack framework) | Free, OSS | One-command deploy to Fly.io | Different stack (Wasp); not Vercel-first |
| Gravity / SaaSBox | Node + React | $99–$199/yr subscription | Older patterns | — |

**Verdict.** Most SaaS boilerplates ship as monoliths — you get the whole thing or nothing. **Stax's `npx stax add <module>` (code-copy modular) approach is genuinely differentiated** in the SaaS-template market. The closest analogue is OpenSaaS but that's on Wasp, not Vercel-first.

### B2: Code-copy module / registry / plugin systems

| System | Pattern | Key files | Relevance to Stax |
|---|---|---|---|
| [**shadcn/ui**](https://ui.shadcn.com) | Code-copy via CLI | `components.json` (local), `registry.json` (server), `registry-item.json` (per item) | ⭐ **The pattern to align with** |
| [registry.directory](https://registry.directory) | Index of community shadcn registries | — | Stax should publish itself here |
| [shadcnregistry.com](https://shadcnregistry.com) | Alternate community index | — | Cross-listing valuable |
| Payload CMS | Centralized registry + dynamic loading | Plugin manifests | Different model — code-in-process, not code-copy |
| Block Protocol | Universal interop spec | `block-metadata.json` + Semtype | Heavyweight; future consideration |
| OpenAPI / AsyncAPI manifests | Declarative function/event schemas | YAML/JSON specs | Useful pattern for module API surface |
| Atlassian Forge | Vendor-locked module system | `manifest.yml` | Don't follow — Vercel-first matters |

**Verdict.** **Adopt shadcn's `registry.json` + `registry-item.json` schema verbatim.** It's proven by 10K+ developers, has mature tooling (registry indexes, IDE integrations), and unlocks community registry compatibility. We add a `stax.config.json` overlay for Stax-specific metadata (`tier: 'free' | 'paid'`, `licenseUrl`, `envVars`, etc.) without polluting the shadcn schema.

**Two gaps to close before scaling:**
1. **Registry discoverability** — publish to registry.directory + shadcnregistry.com when modules ship.
2. **Typed manifests** — current manifest is a TypeScript object with regex-extracted defaults. Replace with proper `registry-item.json` + zod-validated `stax.config.json`.

---

## Track C — Canonical contacts schema (locked for Phase 2)

See [2026-05-20-contacts-schema.md](./2026-05-20-contacts-schema.md) for the full schema doc.

---

## Decisions to make next

1. **Realign Stax CLI to shadcn's `registry.json` schema** — touch the existing `cli/lib/manifest-schema.ts`, `cli/commands/add.ts`, and the `_test-stub` manifest. Small refactor, ~2-3 hour scope.
2. **Lock the proposed 16-column contacts schema as the Phase 2 spec** — no further design discussion needed; can write the Phase 2 plan now.

---

## Sources

All citations live in the individual track sections above and in [2026-05-20-contacts-schema.md](./2026-05-20-contacts-schema.md).
