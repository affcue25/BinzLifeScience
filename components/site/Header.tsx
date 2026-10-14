import Link from 'next/link';
import type { SiteSettings } from '@/lib/content';
import type { NavMenu } from '@/lib/queries';

function MenuLinks({ menus }: { menus: NavMenu[] }) {
  return menus.map((menu) => {
    const nested = menu.children.length > 0 || menu.products.length > 0;
    return (
      <li key={`menu-${menu.id}`} className={nested ? 'has-sub' : undefined}>
        <Link href={`/products/${menu.slug}`}>{menu.name}</Link>
        {nested && (
          <ul className="sub">
            <MenuLinks menus={menu.children} />
            {menu.products.map((product) => (
              <li key={`product-${menu.id}-${product.slug}`}>
                <Link href={`/products/${menu.slug}/${product.slug}`}>{product.name}</Link>
              </li>
            ))}
          </ul>
        )}
      </li>
    );
  });
}

export default function Header({ site, menus }: { site: SiteSettings; menus: NavMenu[] }) {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand" aria-label={site.name}>
          {site.logo ? (
            <img src={site.logo} alt={site.name} className="brand-logo" />
          ) : (
            <>
              <span className="brand-mark" aria-hidden="true">
                {site.name?.charAt(0)}
              </span>
              <span className="brand-name">{site.name}</span>
            </>
          )}
        </Link>

        {/* CSS-only mobile menu: the checkbox controls the nav */}
        <input type="checkbox" id="nav-toggle" className="nav-toggle" aria-label="Open menu" />
        <label htmlFor="nav-toggle" className="nav-burger" aria-hidden="true">
          <span />
          <span />
          <span />
        </label>

        <nav className="main-nav" aria-label="Main">
          <ul>
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>
              <Link href="/about">About Us</Link>
            </li>
            <MenuLinks menus={menus} />
            <li>
              <Link href="/contact" className="nav-cta">
                Contact Us
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
