import fs from 'node:fs/promises';
import path from 'node:path';
import readline from 'node:readline/promises';

export type CopyPlan = {
  /** Where the file came from (the source GitHub path). */
  from: string;
  /** Where it's being written locally (absolute). */
  to: string;
  /** Resolved file contents. */
  contents: string;
};

export async function ensureDir(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true });
}

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question(question);
  rl.close();
  return answer.trim().toLowerCase();
}

export async function writeWithConflictCheck(
  plan: CopyPlan,
  opts: { yes?: boolean } = {},
): Promise<'wrote' | 'skipped'> {
  const exists = await fileExists(plan.to);

  if (exists && !opts.yes) {
    const answer = await prompt(
      `⚠️  ${path.relative(process.cwd(), plan.to)} exists. Overwrite? (y/N) `,
    );
    if (answer !== 'y' && answer !== 'yes') {
      return 'skipped';
    }
  }

  await ensureDir(path.dirname(plan.to));
  await fs.writeFile(plan.to, plan.contents, 'utf-8');
  return 'wrote';
}
