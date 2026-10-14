import type { Metadata } from 'next';
import Link from 'next/link';
import PageHero from '@/components/site/PageHero';
import ProductCard from '@/components/site/ProductCard';
import { getCatalog, type CatalogMenu } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Products' };

function MenuBlocks({ menus }: { menus: CatalogMenu[] }) {
  return menus.map((menu) => (
    <div key={menu.id} className="menu-block">
      <div className="menu-block-head">
        <h2>{menu.name}</h2>
        <Link href={`/products/${menu.slug}`} className="more">
          View all &rarr;
        </Link>
      </div>
      {menu.products.length > 0 && (
        <div className="product-grid">
          {menu.products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
      {menu.children.length > 0 && (
        <div className="submenu-blocks">
          <MenuBlocks menus={menu.children} />
        </div>
      )}
    </div>
  ));
}

export default async function ProductsIndexPage() {
  const menus = await getCatalog();

  return (
    <>
      <PageHero title="Our Products" subtitle="Browse our full range by category." />

      <section className="section">
        <div className="container">
          {menus.length === 0 && <p className="muted">No products have been published yet.</p>}
          <MenuBlocks menus={menus} />
        </div>
      </section>
    </>
  );
}
