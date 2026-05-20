import { Command } from 'commander';
import { execSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

export const createCommand = new Command('create')
  .description('Clone the stax-template into a new project directory')
  .argument('<dir>', 'target directory name (must not exist)')
  .option('--repo <url>', 'override template repo URL', 'https://github.com/ozluv/stax-template.git')
  .action(async (dir: string, opts: { repo: string }) => {
    const target = path.resolve(process.cwd(), dir);
    try {
      await fs.access(target);
      console.error(`✗ Directory "${dir}" already exists.`);
      process.exit(1);
    } catch {
      // good — does not exist
    }

    console.log(`Cloning ${opts.repo} into ${target}…`);
    execSync(`git clone --depth 1 ${opts.repo} ${target}`, { stdio: 'inherit' });

    console.log('Stripping git history (this is your project now)…');
    await fs.rm(path.join(target, '.git'), { recursive: true, force: true });

    execSync('git init', { cwd: target, stdio: 'inherit' });

    console.log('\nNext steps:');
    console.log(`  cd ${dir}`);
    console.log('  pnpm install');
    console.log('  cp .env.example .env.local   # fill in Supabase keys');
    console.log('  pnpm dev');
  });
