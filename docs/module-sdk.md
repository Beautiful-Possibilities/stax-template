# Module SDK Reference

A Stax module is a folder under `modules/<name>/` in the `stax-modules` repo. The CLI copies its files into a customer's project at known paths.

## Anatomy

```
modules/contacts/
├── manifest.ts        ← required
├── README.md          ← required
├── routes/            ← optional; copied into /app/<name>/
├── components/        ← optional; copied into /components/<name>/
├── lib/               ← optional; copied into /lib/<name>/
├── migrations/        ← optional; copied into /supabase/migrations/<timestamp>_<name>_<file>.sql
└── api.ts             ← optional; public surface for other modules to import
```

## Manifest

```ts
export default {
  name: 'contacts',
  version: '1.0.0',
  description: 'Contact and account management — the CRM core.',
  tier: 'free',                              // 'free' | 'paid'
  licenseUrl: undefined,                     // required on paid modules
  requires: [],                              // other module names this depends on
  navItems: [
    { label: 'Contacts', href: '/contacts', icon: 'Users' },
  ],
  settingsPath: '/settings/contacts',
  envVars: [],
  migrations: ['001_contacts.sql'],
} satisfies ModuleManifest;
```

### Fields

| Field | Required | Notes |
|---|---|---|
| `name` | yes | Lowercase, alphanumeric + `-_`; must match the folder name |
| `version` | yes | semver |
| `description` | yes | One-line; shown in `stax list` |
| `tier` | yes | `'free'` or `'paid'` |
| `licenseUrl` | for paid | URL to your Gumroad / checkout page |
| `requires` | yes | Array of module names that must be installed first |
| `navItems` | yes | Sidebar entries; empty array OK |
| `settingsPath` | optional | Route under `/settings/` where this module's settings live |
| `envVars` | yes | Names of env vars the module needs (used by `stax doctor`) |
| `migrations` | yes | Filenames in the `migrations/` folder (in install order) |

### Phase 1 manifest format constraint

The CLI in Phase 1 parses `manifest.ts` with a regex + `new Function(...)`:

```ts
const match = text.match(/export default\s+(\{[\s\S]*?\})\s+satisfies/);
```

This means manifests MUST be written as a single `export default { ... } satisfies ...;` block — no helper functions, no imports inside the object literal. Phase 2+ will replace this with a proper TS evaluator.

## CLI Lifecycle

1. **`npx stax add <name>`** — fetches manifest, validates `requires`, copies files, updates `installed-modules.json`. If `tier === 'paid'`, shows license-please notice first.
2. **`npx stax update <name>`** — *(Phase 2+)* re-fetches the latest version and 3-way diffs against local changes.
3. **`npx stax remove <name>`** — *(Phase 2+)* deletes copied files; leaves migrations + data in place.

## Module-to-module imports

If module B depends on module A:

1. Declare in manifest: `requires: ['a']`
2. Import via the public API only: `import { getThing } from '@/modules/a/api'`
3. Never import from `@/modules/a/lib/internal/...` or `@/modules/a/components/...`

`api.ts` is the only file other modules may touch. Everything else is private to its module.

## Migrations

Each module ships SQL migrations in `migrations/`. On install, the CLI:

1. Reads each file in `migrations/` (in order)
2. Copies it to `supabase/migrations/<timestamp>_<module-name>_<original-name>.sql`
3. Tells the user to run `supabase db push`

Rules:
- Additive only. Never `DROP` another module's tables.
- Always enable RLS and add at least one policy.
- Reference `auth.users(id)` for user-scoping where appropriate.
