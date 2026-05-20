import { Command } from 'commander';
import fs from 'node:fs/promises';
import path from 'node:path';
import { listDir } from '../lib/github-fetch';

type Installed = { name: string; version: string; tier: string };

async function readInstalled(): Promise<Installed[]> {
  try {
    const raw = await fs.readFile(path.join(process.cwd(), 'installed-modules.json'), 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.modules) ? parsed.modules : [];
  } catch {
    return [];
  }
}

export const listCommand = new Command('list')
  .description('Show installed and available modules')
  .action(async () => {
    const installed = await readInstalled();
    console.log('Installed:');
    if (installed.length === 0) console.log('  (none)');
    for (const m of installed) {
      console.log(`  ${m.name}@${m.version} (${m.tier})`);
    }

    console.log('\nAvailable in stax-modules:');
    try {
      const entries = await listDir('modules');
      for (const e of entries) {
        if (e.type === 'dir') console.log(`  ${e.name}`);
      }
    } catch (e) {
      console.log(`  (could not reach GitHub: ${(e as Error).message})`);
    }
  });
