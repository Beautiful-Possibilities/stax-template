const DEFAULT_REPO = process.env.STAX_MODULES_REPO ?? 'Beautiful-Possibilities/stax-modules';
const DEFAULT_BRANCH = process.env.STAX_MODULES_BRANCH ?? 'main';

function rawUrl(filePath: string, repo = DEFAULT_REPO, branch = DEFAULT_BRANCH): string {
  return `https://raw.githubusercontent.com/${repo}/${branch}/${filePath}`;
}

function apiUrl(dirPath: string, repo = DEFAULT_REPO, branch = DEFAULT_BRANCH): string {
  return `https://api.github.com/repos/${repo}/contents/${dirPath}?ref=${branch}`;
}

export async function fetchText(filePath: string): Promise<string> {
  // Use the GitHub Contents API (not raw.githubusercontent.com) — the API
  // honors branch refs immediately, while the raw CDN can be ~5 min stale.
  const url = `https://api.github.com/repos/${DEFAULT_REPO}/contents/${filePath}?ref=${DEFAULT_BRANCH}`;
  const res = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github.raw+json',
      ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
    },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: HTTP ${res.status}`);
  }
  return res.text();
}

/** Fallback raw URL (kept for cases where Contents API is rate-limited). */
export function getRawUrl(filePath: string): string {
  return rawUrl(filePath);
}

export type GitHubTreeEntry = {
  name: string;
  path: string;
  type: 'file' | 'dir';
};

export async function listDir(dirPath: string): Promise<GitHubTreeEntry[]> {
  const url = apiUrl(dirPath);
  const res = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
    },
  });
  if (!res.ok) {
    throw new Error(`Failed to list ${url}: HTTP ${res.status}`);
  }
  const entries = (await res.json()) as Array<{ name: string; path: string; type: string }>;
  return entries
    .filter((e) => e.type === 'file' || e.type === 'dir')
    .map((e) => ({ name: e.name, path: e.path, type: e.type as 'file' | 'dir' }));
}

/** Recursively list every file under `rootDir`. */
export async function walkDir(rootDir: string): Promise<string[]> {
  const results: string[] = [];
  const stack: string[] = [rootDir];
  while (stack.length) {
    const dir = stack.pop()!;
    const entries = await listDir(dir);
    for (const e of entries) {
      if (e.type === 'file') results.push(e.path);
      else stack.push(e.path);
    }
  }
  return results;
}
