import { Command } from 'commander';
import fs from 'node:fs/promises';
import path from 'node:path';

export const doctorCommand = new Command('doctor')
  .description('Verify your Stax install is healthy')
  .action(async () => {
    const checks: Array<{ name: string; ok: boolean; detail?: string }> = [];

    // Check: installed-modules.json exists and parses
    try {
      const raw = await fs.readFile(path.join(process.cwd(), 'installed-modules.json'), 'utf-8');
      const parsed = JSON.parse(raw);
      checks.push({
        name: 'installed-modules.json present and valid',
        ok: parsed && typeof parsed === 'object' && Array.isArray(parsed.modules),
      });
    } catch (e) {
      checks.push({
        name: 'installed-modules.json present and valid',
        ok: false,
        detail: String(e),
      });
    }

    // Check: env vars
    const requiredEnv = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'];
    for (const key of requiredEnv) {
      checks.push({
        name: `env: ${key}`,
        ok: !!process.env[key],
        detail: process.env[key] ? undefined : 'not set (load .env.local before running)',
      });
    }

    // Check: package.json has expected scripts
    try {
      const pkg = JSON.parse(
        await fs.readFile(path.join(process.cwd(), 'package.json'), 'utf-8'),
      );
      checks.push({
        name: 'package.json has stax script',
        ok: typeof pkg.scripts?.stax === 'string',
      });
    } catch {
      checks.push({ name: 'package.json has stax script', ok: false });
    }

    let allOk = true;
    for (const c of checks) {
      const mark = c.ok ? '✓' : '✗';
      console.log(`${mark} ${c.name}${c.detail ? ` — ${c.detail}` : ''}`);
      if (!c.ok) allOk = false;
    }

    if (!allOk) process.exit(1);
    console.log('\nAll checks pass.');
  });
