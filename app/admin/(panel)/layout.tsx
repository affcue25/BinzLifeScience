import Link from 'next/link';
import { logoutAction } from '@/lib/actions/auth';
import { requireAdmin } from '@/lib/auth';
import { getSite } from '@/lib/content';
import { unreadCount } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const [site, unread] = await Promise.all([getSite(), unreadCount()]);

  return (
    <div className="adm-shell">
      <aside className="adm-side">
        <div className="adm-brand">
          {site.name}
          <small>Admin panel</small>
        </div>

        <nav className="adm-nav" aria-label="Admin">
          <Link href="/admin">Dashboard</Link>
          <Link href="/admin/menus">Menus</Link>
          <Link href="/admin/products">Products</Link>
          <Link href="/admin/pages/home">Homepage</Link>
          <Link href="/admin/pages/about">About Us</Link>
          <Link href="/admin/pages/contact">Contact Us</Link>
          <Link href="/admin/messages">
            Messages {unread > 0 && <span className="adm-badge">{unread}</span>}
          </Link>
          <Link href="/admin/settings">Settings</Link>
        </nav>

        <div className="adm-side-foot">
          <a href="/" target="_blank" rel="noopener noreferrer">
            View website &#8599;
          </a>
          <span>{admin.email}</span>
          <form action={logoutAction}>
            <button type="submit" className="adm-btn">
              Log out
            </button>
          </form>
        </div>
      </aside>

      <main className="adm-main">{children}</main>
    </div>
  );
}
