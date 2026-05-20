import Link from 'next/link';
import { loadInstalledManifests } from '@/lib/modules';

export default async function SettingsPage() {
  const manifests = await loadInstalledManifests();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Configure Stax core and any installed modules.
        </p>
      </div>

      <section className="space-y-2">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Modules</h2>
        {manifests.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No modules installed. Try <code className="font-mono">npx stax add _test-stub</code>.
          </p>
        )}
        {manifests.length > 0 && (
          <ul className="divide-y divide-border rounded-md border border-border">
            {manifests.map((m) => (
              <li key={m.name} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{m.name}</div>
                  <div className="text-xs text-muted-foreground">v{m.version} · {m.tier}</div>
                </div>
                {m.settingsPath && (
                  <Link href={m.settingsPath} className="text-sm underline">
                    Configure
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
