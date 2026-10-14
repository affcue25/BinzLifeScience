import Link from 'next/link';
import { getSite, THEMES } from '@/lib/content';
import { countRows, getMessages } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const [site, messages, menuCount, productCount, messageCount] = await Promise.all([
    getSite(),
    getMessages(),
    countRows('menus'),
    countRows('products'),
    countRows('messages'),
  ]);
  const theme = THEMES.find((t) => t.id === site.theme);
  const recent = messages.slice(0, 4);

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Dashboard</h1>
          <p>Manage everything on the {site.name} website.</p>
        </div>
        <a href="/" target="_blank" rel="noopener noreferrer" className="adm-btn">
          View website &#8599;
        </a>
      </div>

      <div className="adm-grid">
        <div className="adm-card adm-stat">
          <strong>{menuCount}</strong>
          <span>Menus</span>
        </div>
        <div className="adm-card adm-stat">
          <strong>{productCount}</strong>
          <span>Products</span>
        </div>
        <div className="adm-card adm-stat">
          <strong>{messageCount}</strong>
          <span>Messages received</span>
        </div>
        <div className="adm-card adm-stat">
          <strong style={{ fontSize: '1.3rem' }}>{theme?.name}</strong>
          <span>
            Current theme (<Link href="/admin/settings">change</Link>)
          </span>
        </div>
      </div>

      <div className="adm-card">
        <h2>Quick actions</h2>
        <div className="adm-row-actions" style={{ flexWrap: 'wrap' }}>
          <Link href="/admin/menus" className="adm-btn">
            Add a menu
          </Link>
          <Link href="/admin/products/new" className="adm-btn primary">
            Add a product
          </Link>
          <Link href="/admin/pages/home" className="adm-btn">
            Edit homepage
          </Link>
          <Link href="/admin/settings" className="adm-btn">
            Upload logo / change theme
          </Link>
        </div>
      </div>

      <div className="adm-card">
        <h2>Latest messages</h2>
        {recent.length === 0 ? (
          <p className="adm-empty" style={{ padding: 0, textAlign: 'left' }}>
            No messages yet. Messages sent from the Contact Us form appear here.
          </p>
        ) : (
          <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
            {recent.map((m) => (
              <li key={m.id}>
                <strong>{m.name}</strong> {m.subject ? `: ${m.subject}` : ''}{' '}
                {!m.is_read && <span className="adm-pill ok">New</span>}
              </li>
            ))}
          </ul>
        )}
        <p style={{ marginBottom: 0, marginTop: '0.8rem' }}>
          <Link href="/admin/messages">Open all messages</Link>
        </p>
      </div>
    </>
  );
}
