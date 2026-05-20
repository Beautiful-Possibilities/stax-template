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
 */
export async function loadInstalledManifests(): Promise<LoadedModuleManifest[]> {
  const registry = await readInstalledModules();
  const manifests: LoadedModuleManifest[] = [];

  for (const entry of registry.modules) {
    try {
      const mod = await import(`@/modules/${entry.name}/manifest`);
      manifests.push(mod.default as LoadedModuleManifest);
    } catch {
      // Module declared installed but code missing — skip silently
    }
  }

  return manifests;
}
