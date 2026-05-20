import { z } from 'zod';

/**
 * Stax module manifests follow shadcn/ui's `registry-item.json` schema, with
 * Stax-specific metadata in `meta.stax`. This keeps us compatible with the
 * shadcn registry ecosystem (registry.directory, IDE tooling, third-party
 * registry indexes) while letting us layer in our own fields.
 *
 * See: https://ui.shadcn.com/docs/registry/registry-item-json
 */

export const RegistryFileSchema = z.object({
  /** Source path relative to the module directory (e.g. "routes/page.tsx"). */
  path: z.string().min(1),
  /** Shadcn file type (registry:page, registry:component, registry:lib, etc.) or Stax extension (registry:migration). */
  type: z.string().min(1),
  /** Destination path relative to the customer's project root. Required for registry:page, registry:file, registry:migration. */
  target: z.string().optional(),
  /** Inline file content (rare — usually omitted; CLI fetches `path` from the registry). */
  content: z.string().optional(),
});

export const NavItemSchema = z.object({
  label: z.string().min(1),
  href: z.string().startsWith('/'),
  icon: z.string().optional(),
});

/** Stax-specific fields, lived in `meta.stax` of the registry-item.json. */
export const StaxMetaSchema = z.object({
  /** Semver of the module. */
  version: z.string().regex(/^\d+\.\d+\.\d+/),
  /** Free tier (default) or Paid (license required). */
  tier: z.enum(['free', 'paid']),
  /** Gumroad / checkout URL for paid modules; optional for free. */
  licenseUrl: z.string().url().nullable().optional(),
  /** Names of other Stax modules this one depends on (CLI enforces at install). */
  requires: z.array(z.string()).default([]),
  /** Sidebar entries to register on install. */
  navItems: z.array(NavItemSchema).default([]),
  /** Route under /settings/ where this module's settings page lives. */
  settingsPath: z.string().startsWith('/').nullable().optional(),
  /** Env vars `stax doctor` should check for. */
  envVars: z.array(z.string()).default([]),
  /** SQL migration filenames in the order they should apply. */
  migrations: z.array(z.string()).default([]),
});

export const ModuleManifestSchema = z.object({
  /** Optional JSON Schema pointer for IDE help. */
  $schema: z.string().optional(),
  /** Module name (must match the folder name). */
  name: z.string().regex(/^[a-z0-9_][a-z0-9-_]*$/),
  /** Shadcn item type. For Stax modules: "registry:block". */
  type: z.string(),
  /** Human-readable display name. */
  title: z.string().min(1),
  /** One-sentence description shown in `stax list` and the settings page. */
  description: z.string().min(1),
  /** Optional author tag. */
  author: z.string().optional(),
  /** NPM packages this module needs at runtime. */
  dependencies: z.array(z.string()).default([]),
  /** NPM dev-only packages this module needs. */
  devDependencies: z.array(z.string()).default([]),
  /** Other shadcn registry items this depends on (mostly unused for Stax). */
  registryDependencies: z.array(z.string()).default([]),
  /** Files to copy on install. */
  files: z.array(RegistryFileSchema).min(1),
  /** CSS rules to merge (Tailwind 4 conventions). */
  css: z.record(z.string(), z.record(z.string(), z.string())).optional(),
  /** CSS variable definitions. */
  cssVars: z
    .object({
      theme: z.record(z.string(), z.string()).optional(),
      light: z.record(z.string(), z.string()).optional(),
      dark: z.record(z.string(), z.string()).optional(),
    })
    .optional(),
  /** Env vars the module sets (for tooling). */
  envVars: z.record(z.string(), z.string()).optional(),
  /** Post-install instructions to show the user. */
  docs: z.string().optional(),
  /** Organizational tags. */
  categories: z.array(z.string()).default([]),
  /** Free-form metadata. Stax-specific fields live here under `stax`. */
  meta: z
    .object({
      stax: StaxMetaSchema,
    })
    .passthrough(),
});

export type ModuleManifest = z.infer<typeof ModuleManifestSchema>;
export type StaxMeta = z.infer<typeof StaxMetaSchema>;
export type RegistryFile = z.infer<typeof RegistryFileSchema>;
