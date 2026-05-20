import fs from 'node:fs/promises';
import path from 'node:path';

export type InstalledModuleEntry = {
  name: string;
  version: string;
  tier: 'free' | 'paid';
  installedAt: string;
};

export type InstalledModulesFile = {
  version: 1;
  modules: InstalledModuleEntry[];
};

const REGISTRY_PATH = path.join(process.cwd(), 'installed-modules.json');

export async function readInstalledModules(): Promise<InstalledModulesFile> {
  try {
    const raw = await fs.readFile(REGISTRY_PATH, 'utf-8');
    return JSON.parse(raw) as InstalledModulesFile;
  } catch {
    return { version: 1, modules: [] };
  }
}

export type ModuleNavItem = {
  label: string;
  href: string;
  icon?: string;
};

export type LoadedModuleManifest = {
  name: string;
  version: string;
  description: string;
  tier: 'free' | 'paid';
  navItems?: ModuleNavItem[];
  settingsPath?: string;
};

/**
 * Loads manifests for all installed modules. Skips modules whose code
 * isn't present (e.g., partially installed) instead of throwing.
 *
 * Implementation note: uses a webpackIgnore-style dynamic require so the
 * bundler doesn't try to statically resolve `@/modules/*` at build time
 * (which would error on a fresh install where no modules exist yet).
 */
export async function loadInstalledManifests(): Promise<LoadedModuleManifest[]> {
  const registry = await readInstalledModules();
  if (registry.modules.length === 0) return [];

  const manifests: LoadedModuleManifest[] = [];
  for (const entry of registry.modules) {
    try {
      const manifestPath = path.join(process.cwd(), 'modules', entry.name, 'manifest.ts');
      // Use a function-scoped variable for the dynamic specifier so bundlers
      // don't attempt to statically resolve it as an import map entry.
      const spec = manifestPath;
      const mod = (await import(/* webpackIgnore: true */ spec)) as { default: LoadedModuleManifest };
      manifests.push(mod.default);
    } catch {
      // Module declared installed but code missing — skip silently
    }
  }

  return manifests;
}
