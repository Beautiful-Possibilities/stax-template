import { Command } from 'commander';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fetchText } from '../lib/github-fetch';
import { writeWithConflictCheck } from '../lib/file-copy';
import { ModuleManifestSchema, type ModuleManifest } from '../lib/manifest-schema';

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
  const text = await fetchText(`modules/${moduleName}/registry-item.json`);
  const obj = JSON.parse(text);
  const parsed = ModuleManifestSchema.parse(obj);
  if (parsed.name !== moduleName) {
    throw new Error(`Manifest name "${parsed.name}" does not match requested "${moduleName}"`);
  }
  return parsed;
}

/**
 * Resolve a registry file's `target` (or fall back to `path`) into an absolute
 * destination on the customer's machine. Handles shadcn-style alias prefixes
 * (@components/, @lib/, etc.) and the Stax-specific `registry:migration` type
 * which gets a timestamp prefix injected for ordering.
 */
function resolveDest(moduleName: string, file: { path: string; type: string; target?: string }): string {
  const cwd = process.cwd();
  const explicitTarget = file.target ?? file.path;

  // Shadcn alias placeholders
  const aliased = explicitTarget
    .replace(/^@components\//, 'components/')
    .replace(/^@ui\//, 'components/ui/')
    .replace(/^@lib\//, 'lib/')
    .replace(/^@hooks\//, 'hooks/')
    .replace(/^@utils\//, 'lib/utils/');

  // Stax: migrations get a timestamp prefix so Supabase applies them in order
  if (file.type === 'registry:migration') {
    const ts = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
    const dir = path.dirname(aliased);
    const filename = path.basename(aliased);
    return path.join(cwd, dir, `${ts}_${moduleName}_${filename}`);
  }

  return path.join(cwd, aliased);
}

export const addCommand = new Command('add')
  .description('Install a module from the stax-modules repo')
  .argument('<module>', 'module name (folder under modules/ in stax-modules)')
  .option('-y, --yes', 'auto-confirm file overwrites')
  .action(async (moduleName: string, opts: { yes?: boolean }) => {
    console.log(`Fetching manifest for "${moduleName}"…`);
    const manifest = await fetchManifest(moduleName);
    const stax = manifest.meta.stax;

    if (stax.tier === 'paid') {
      console.log(`\nThis is a paid module. License: ${stax.licenseUrl ?? '(see module README)'}`);
      console.log('By installing, you confirm you have purchased a license.\n');
    }

    // Dependency check
    const registry = await readRegistry();
    const installedNames = new Set(registry.modules.map((m) => m.name));
    for (const dep of stax.requires) {
      if (!installedNames.has(dep)) {
        console.error(
          `✗ Missing required module: ${dep}. Install it first with: npx stax add ${dep}`,
        );
        process.exit(1);
      }
    }

    let wrote = 0;
    let skipped = 0;
    let migrationsCopied = 0;

    // Always copy the manifest itself to modules/<name>/registry-item.json
    // so the customer's repo carries the install record.
    const manifestDest = path.join(process.cwd(), 'modules', moduleName, 'registry-item.json');
    const manifestText = await fetchText(`modules/${moduleName}/registry-item.json`);
    const result = await writeWithConflictCheck(
      { from: `modules/${moduleName}/registry-item.json`, to: manifestDest, contents: manifestText },
      { yes: opts.yes },
    );
    if (result === 'wrote') wrote++;
    else skipped++;
    console.log(`  ${result === 'wrote' ? '+' : '-'} ${path.relative(process.cwd(), manifestDest)}`);

    // Copy each declared file
    for (const file of manifest.files) {
      const sourcePath = `modules/${moduleName}/${file.path}`;
      const dest = resolveDest(moduleName, file);
      const contents = await fetchText(sourcePath);
      const r = await writeWithConflictCheck(
        { from: sourcePath, to: dest, contents },
        { yes: opts.yes },
      );
      if (r === 'wrote') wrote++;
      else skipped++;
      if (file.type === 'registry:migration') migrationsCopied++;
      console.log(`  ${r === 'wrote' ? '+' : '-'} ${path.relative(process.cwd(), dest)}`);
    }

    // Optional README
    try {
      const readmeText = await fetchText(`modules/${moduleName}/README.md`);
      const readmeDest = path.join(process.cwd(), 'modules', moduleName, 'README.md');
      const r = await writeWithConflictCheck(
        { from: `modules/${moduleName}/README.md`, to: readmeDest, contents: readmeText },
        { yes: opts.yes },
      );
      if (r === 'wrote') wrote++;
      else skipped++;
      console.log(`  ${r === 'wrote' ? '+' : '-'} ${path.relative(process.cwd(), readmeDest)}`);
    } catch {
      // README is optional
    }

    // Update registry
    const next = registry.modules.filter((m) => m.name !== moduleName);
    next.push({
      name: manifest.name,
      version: stax.version,
      tier: stax.tier,
      installedAt: new Date().toISOString(),
    });
    await writeRegistry({ version: 1, modules: next });

    console.log(`\nDone. ${wrote} written, ${skipped} skipped.`);
    if (migrationsCopied > 0) {
      console.log(`\n${migrationsCopied} migration(s) copied. Apply them with:  supabase db push`);
    }
    if (manifest.docs) {
      console.log(`\n${manifest.docs}`);
    }
  });
