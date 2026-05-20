import { z } from 'zod';

export const NavItemSchema = z.object({
  label: z.string().min(1),
  href: z.string().startsWith('/'),
  icon: z.string().optional(),
});

export const ModuleManifestSchema = z.object({
  name: z.string().regex(/^[a-z0-9][a-z0-9-_]*$/),
  version: z.string().regex(/^\d+\.\d+\.\d+/),
  description: z.string().min(1),
  tier: z.enum(['free', 'paid']),
  licenseUrl: z.string().url().optional(),
  requires: z.array(z.string()).default([]),
  navItems: z.array(NavItemSchema).default([]),
  settingsPath: z.string().startsWith('/').optional(),
  envVars: z.array(z.string()).default([]),
  migrations: z.array(z.string()).default([]),
});

export type ModuleManifest = z.infer<typeof ModuleManifestSchema>;
