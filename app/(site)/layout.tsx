import Footer from '@/components/site/Footer';
import Header from '@/components/site/Header';
import { getContact, getSite } from '@/lib/content';
import { getNavMenus } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [site, contact, menus] = await Promise.all([getSite(), getContact(), getNavMenus()]);

  return (
    <>
      <Header site={site} menus={menus} />
      <main>{children}</main>
      <Footer site={site} contact={contact} menus={menus} />
    </>
  );
}
