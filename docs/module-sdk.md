# Module SDK Reference

A Stax module is a folder under `modules/<name>/` in the `stax-modules` repo. The CLI copies its files into a customer's project at the targets declared in the module's manifest.

**Stax modules follow [shadcn/ui's `registry-item.json` schema](https://ui.shadcn.com/docs/registry/registry-item-json)** with Stax-specific fields nested under `meta.stax`. This keeps Stax compatible with the broader shadcn registry ecosystem ([registry.directory](https://registry.directory), IDE tooling, third-party indexes).

## Anatomy

```
modules/contacts/
├── registry-item.json  ← required (shadcn schema + Stax meta)
├── README.md           ← required
├── routes/             ← optional; files declared in registry-item.json target /app/<name>/
├── components/         ← optional; files declared target /components/<name>/
├── lib/                ← optional; files declared target /lib/<name>/
├── migrations/         ← optional; files declared with type: "registry:migration"
└── api.ts              ← optional; public surface other modules import from
```

## Manifest — `registry-item.json`

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "contacts",
  "type": "registry:block",
  "title": "Contacts CRM",
  "description": "Contact and account management — the CRM core.",
  "dependencies": [],
  "registryDependencies": [],
  "files": [
    { "path": "routes/page.tsx",       "type": "registry:page",      "target": "app/contacts/page.tsx" },
    { "path": "components/list.tsx",   "type": "registry:component", "target": "components/contacts/list.tsx" },
    { "path": "lib/api.ts",            "type": "registry:lib",       "target": "lib/contacts/api.ts" },
    { "path": "migrations/001_contacts.sql", "type": "registry:migration", "target": "supabase/migrations/001_contacts.sql" }
  ],
  "categories": ["crm"],
  "meta": {
    "stax": {
      "version": "1.0.0",
      "tier": "free",
      "licenseUrl": null,
      "requires": [],
      "navItems": [
        { "label": "Contacts", "href": "/contacts", "icon": "Users" }
      ],
      "settingsPath": "/settings/contacts",
      "envVars": [],
      "migrations": ["001_contacts.sql"]
    }
  }
}
```

### Shadcn-standard fields

| Field | Required | Notes |
|---|---|---|
| `$schema` | optional | Points to shadcn's JSON Schema for IDE help. Recommend always include. |
| `name` | yes | Lowercase, alphanumeric + `-_`; must match folder name |
| `type` | yes | Use `registry:block` for Stax modules (a multi-file feature unit) |
| `title` | yes | Human-readable display name |
| `description` | yes | One-sentence; shown in `stax list` and the Settings page |
| `dependencies` | optional | NPM packages to install when this module installs |
| `devDependencies` | optional | NPM dev deps to install |
| `registryDependencies` | optional | Other shadcn registry items (rare for Stax modules) |
| `files` | yes | Array of `{ path, type, target? }`. `path` is relative to the module folder; `target` is the destination in the customer's repo |
| `categories` | optional | Tags for discovery |

### Stax-specific fields (under `meta.stax`)

| Field | Required | Notes |
|---|---|---|
| `version` | yes | semver |
| `tier` | yes | `'free'` or `'paid'` |
| `licenseUrl` | for paid | URL to your Gumroad / checkout page; null for free |
| `requires` | yes | Other Stax module names that must be installed first |
| `navItems` | yes | Sidebar entries the module contributes; empty array OK |
| `settingsPath` | optional | Route under `/settings/` for this module's settings page; null if none |
| `envVars` | yes | Names of env vars `stax doctor` should check for |
| `migrations` | yes | Filenames in the `migrations/` folder (in install order) |

### File `type` values

Shadcn standard:
- `registry:page` — Next.js App Router page (`target` required, points to `app/...`)
- `registry:component` — React component
- `registry:lib` — TS utility / server action
- `registry:hook` — React hook
- `registry:ui` — shadcn UI component
- `registry:file` — generic file (`target` required)

Stax extensions:
- `registry:migration` — Supabase SQL migration. CLI injects a timestamp prefix into the filename at install so they apply in install order.

### Target path conventions

The `target` field accepts either literal paths (`app/contacts/page.tsx`) or shadcn-style alias placeholders:

- `@components/` → resolves to `components/`
- `@ui/` → resolves to `components/ui/`
- `@lib/` → resolves to `lib/`
- `@hooks/` → resolves to `hooks/`

For Stax modules, prefer literal paths — they're more readable.

## CLI Lifecycle

1. **`npx stax add <name>`** — fetches `registry-item.json` from the `stax-modules` repo via GitHub's Contents API, validates `meta.stax.requires`, copies each file in `files[]` to its `target`, updates `installed-modules.json`. If `tier === 'paid'`, shows license-please notice first.
2. **`npx stax update <name>`** — *(Phase 2+)* re-fetches the latest version and 3-way diffs against local changes.
3. **`npx stax remove <name>`** — *(Phase 2+)* deletes copied files; leaves migrations + data in place.

## Module-to-module imports

If module B depends on module A:

1. Declare in manifest: `"requires": ["a"]` (under `meta.stax.requires`)
2. Import via the public API only: `import { getThing } from '@/modules/a/api'`
3. Never import from `@/modules/a/lib/internal/...` or `@/modules/a/components/...`

`api.ts` is the only file other modules may touch. Everything else is private to its module.

## Migrations

Each module ships SQL migrations as files with `"type": "registry:migration"`. On install, the CLI:

1. Reads each file in `files[]` with that type
2. Copies it to the declared `target`, prefixing the filename with a timestamp
3. Tells the user to run `supabase db push`

Rules:
- Additive only. Never `DROP` another module's tables.
- Always enable RLS and add at least one policy.
- Reference `auth.users(id)` for user-scoping where appropriate.

## Publishing your module to the registry

(Phase 2+) Once `stax-modules` has a few real modules, we'll publish to:
- [registry.directory](https://registry.directory) — the canonical shadcn registry index
- [shadcnregistry.com](https://shadcnregistry.com) — alternate index

This gives Stax modules visibility alongside the broader shadcn ecosystem.
