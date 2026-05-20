import Link from 'next/link';
import { Home, Settings } from 'lucide-react';
import { loadInstalledManifests } from '@/lib/modules';

export async function Sidebar() {
  const manifests = await loadInstalledManifests();
  const moduleNavItems = manifests.flatMap((m) => m.navItems ?? []);

  return (
    <aside className="w-60 shrink-0 border-r border-border bg-sidebar text-sidebar-foreground flex flex-col">
      <div className="px-4 py-4 font-semibold text-lg">Stax</div>
      <nav className="flex-1 px-2 space-y-1">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <Home className="size-4" />
          Dashboard
        </Link>
        {moduleNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="px-2 py-2 border-t border-border">
        <Link
          href="/settings"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <Settings className="size-4" />
          Settings
        </Link>
      </div>
    </aside>
  );
}
