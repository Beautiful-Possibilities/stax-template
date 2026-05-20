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
  settingsPath?: string | null;
};

type RegistryItemJson = {
  name: string;
  description: string;
  meta?: { stax?: { version: string; tier: 'free' | 'paid'; navItems?: ModuleNavItem[]; settingsPath?: string | null } };
};

/**
 * Loads manifests for all installed modules from their copied-in registry-item.json files.
 * Skips modules whose code isn't present (e.g., partially installed) instead of throwing.
 */
export async function loadInstalledManifests(): Promise<LoadedModuleManifest[]> {
  const registry = await readInstalledModules();
  if (registry.modules.length === 0) return [];

  const manifests: LoadedModuleManifest[] = [];
  for (const entry of registry.modules) {
    try {
      const manifestPath = path.join(process.cwd(), 'modules', entry.name, 'registry-item.json');
      const raw = await fs.readFile(manifestPath, 'utf-8');
      const json = JSON.parse(raw) as RegistryItemJson;
      if (!json.meta?.stax) continue;
      manifests.push({
        name: json.name,
        version: json.meta.stax.version,
        description: json.description,
        tier: json.meta.stax.tier,
        navItems: json.meta.stax.navItems,
        settingsPath: json.meta.stax.settingsPath,
      });
    } catch {
      // Module declared installed but manifest missing — skip silently
    }
  }

  return manifests;
}
