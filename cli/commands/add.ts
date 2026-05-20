import { Command } from 'commander';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fetchText, walkDir } from '../lib/github-fetch';
import { writeWithConflictCheck } from '../lib/file-copy';
import { ModuleManifestSchema, type ModuleManifest } from '../lib/manifest-schema';

const DEST_MAP: Record<string, string> = {
  routes: 'app',
  components: 'components',
  lib: 'lib',
  migrations: 'supabase/migrations',
};

type RegistryFile = {
  version: 1;
  modules: Array<{
    name: string;
    version: string;
    tier: 'free' | 'paid';
    installedAt: string;
  }>;
};

async function readRegistry(): Promise<RegistryFile> {
  try {
    const raw = await fs.readFile(path.join(process.cwd(), 'installed-modules.json'), 'utf-8');
    return JSON.parse(raw) as RegistryFile;
  } catch {
    return { version: 1, modules: [] };
  }
}

async function writeRegistry(reg: RegistryFile): Promise<void> {
  await fs.writeFile(
    path.join(process.cwd(), 'installed-modules.json'),
    JSON.stringify(reg, null, 2) + '\n',
    'utf-8',
  );
}

async function fetchManifest(moduleName: string): Promise<ModuleManifest> {
  const text = await fetchText(`modules/${moduleName}/manifest.ts`);
  // Module manifests are TS source; we extract the `default export object` heuristically.
  // Phase 1 contract: manifest must be a single `export default { ... } satisfies ...;` block.
  const match = text.match(/export default\s+(\{[\s\S]*?\})\s+satisfies/);
  if (!match) throw new Error(`Could not parse manifest for "${moduleName}"`);

  const obj = new Function(`return ${match[1]};`)();
  const parsed = ModuleManifestSchema.parse(obj);
  if (parsed.name !== moduleName) {
    throw new Error(`Manifest name "${parsed.name}" does not match requested "${moduleName}"`);
  }
  return parsed;
}

function localDestForSource(moduleName: string, sourcePath: string): string | null {
  // sourcePath looks like 'modules/<name>/routes/page.tsx'
  const rel = sourcePath.replace(new RegExp(`^modules/${moduleName}/`), '');
  const topDir = rel.split('/')[0];
  const remainder = rel.split('/').slice(1).join('/');

  if (topDir === 'manifest.ts') {
    return path.join(process.cwd(), 'modules', moduleName, 'manifest.ts');
  }
  if (topDir === 'README.md' || topDir === 'api.ts') {
    return path.join(process.cwd(), 'modules', moduleName, topDir);
  }
  const destRoot = DEST_MAP[topDir];
  if (!destRoot) return null;

  if (topDir === 'migrations') {
    const ts = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
    return path.join(process.cwd(), destRoot, `${ts}_${moduleName}_${remainder}`);
  }
  if (topDir === 'routes') {
    return path.join(process.cwd(), 'app', moduleName, remainder);
  }
  return path.join(process.cwd(), destRoot, moduleName, remainder);
}

export const addCommand = new Command('add')
  .description('Install a module from the stax-modules repo')
  .argument('<module>', 'module name (folder under modules/ in stax-modules)')
  .option('-y, --yes', 'auto-confirm file overwrites')
  .action(async (moduleName: string, opts: { yes?: boolean }) => {
    console.log(`Fetching manifest for "${moduleName}"…`);
    const manifest = await fetchManifest(moduleName);

    if (manifest.tier === 'paid') {
      console.log(`\nThis is a paid module. License: ${manifest.licenseUrl ?? '(see module README)'}`);
      console.log('By installing, you confirm you have purchased a license.\n');
    }

    // Dependency check
    const registry = await readRegistry();
    const installedNames = new Set(registry.modules.map((m) => m.name));
    for (const dep of manifest.requires) {
      if (!installedNames.has(dep)) {
        console.error(
          `✗ Missing required module: ${dep}. Install it first with: npx stax add ${dep}`,
        );
        process.exit(1);
      }
    }

    console.log(`Listing files under modules/${moduleName}…`);
    const files = await walkDir(`modules/${moduleName}`);

    let wrote = 0;
    let skipped = 0;
    for (const sourcePath of files) {
      const to = localDestForSource(moduleName, sourcePath);
      if (!to) continue;
      const contents = await fetchText(sourcePath);
      const result = await writeWithConflictCheck(
        { from: sourcePath, to, contents },
        { yes: opts.yes },
      );
      if (result === 'wrote') wrote++;
      else skipped++;
      console.log(`  ${result === 'wrote' ? '+' : '-'} ${path.relative(process.cwd(), to)}`);
    }

    // Update registry (replace existing entry if reinstalling)
    const next = registry.modules.filter((m) => m.name !== moduleName);
    next.push({
      name: manifest.name,
      version: manifest.version,
      tier: manifest.tier,
      installedAt: new Date().toISOString(),
    });
    await writeRegistry({ version: 1, modules: next });

    console.log(`\nDone. ${wrote} written, ${skipped} skipped.`);
    if (files.some((f) => f.includes('/migrations/'))) {
      console.log('\nMigrations were copied. Apply them with:  supabase db push');
    }
  });
