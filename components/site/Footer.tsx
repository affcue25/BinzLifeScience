import Link from 'next/link';
import type { ContactContent, SiteSettings } from '@/lib/content';
import type { NavMenu } from '@/lib/queries';

export default function Footer({
  site,
  contact,
  menus,
}: {
  site: SiteSettings;
  contact: ContactContent;
  menus: NavMenu[];
}) {
  const socials = [
    { label: 'Facebook', href: site.facebook },
    { label: 'LinkedIn', href: site.linkedin },
    { label: 'Instagram', href: site.instagram },
    { label: 'YouTube', href: site.youtube },
  ].filter((s) => s.href);

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-about">
          <div className="footer-brand">{site.name}</div>
          {site.tagline && <p>{site.tagline}</p>}
          {site.footerText && <p className="footer-text">{site.footerText}</p>}
          {socials.length > 0 && (
            <ul className="socials">
              {socials.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h4>Company</h4>
          <ul>
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>
              <Link href="/about">About Us</Link>
            </li>
            <li>
              <Link href="/products">Products</Link>
            </li>
            <li>
              <Link href="/contact">Contact Us</Link>
            </li>
          </ul>
        </div>

        {menus.length > 0 && (
          <div>
            <h4>Products</h4>
            <ul>
              {menus.map((m) => (
                <li key={m.id}>
                  <Link href={`/products/${m.slug}`}>{m.name}</Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <h4>Contact</h4>
          <ul className="footer-contact">
            {contact.address && <li className="pre">{contact.address}</li>}
            {contact.phone && <li>{contact.phone}</li>}
            {contact.email && <li>{contact.email}</li>}
          </ul>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>
          &copy; {new Date().getFullYear()} {site.name}. All rights reserved.
        </span>
      </div>
    </footer>
  );
}
