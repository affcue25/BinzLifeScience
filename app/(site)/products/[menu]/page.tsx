import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PageHero from '@/components/site/PageHero';
import ProductCard from '@/components/site/ProductCard';
import { countCatalogProducts, findCatalogMenu, getCatalog } from '@/lib/queries';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ menu: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { menu: slug } = await params;
  const found = findCatalogMenu(await getCatalog(), slug);
  return { title: found?.menu.name ?? 'Products' };
}

export default async function MenuPage({ params }: Props) {
  const { menu: slug } = await params;
  const found = findCatalogMenu(await getCatalog(), slug);
  if (!found) notFound();

  const { menu, ancestors } = found;
  const empty = menu.products.length === 0 && menu.children.length === 0;

  return (
    <>
      <PageHero
        title={menu.name}
        subtitle={menu.description}
        crumbs={[
          { label: 'Products', href: '/products' },
          ...ancestors.map((item) => ({ label: item.name, href: `/products/${item.slug}` })),
          { label: menu.name },
        ]}
      />
      <section className="section">
        <div className="container">
          {menu.children.length > 0 && (
            <div className="category-grid">
              {menu.children.map((child) => {
                const count = countCatalogProducts(child);
                return (
                  <Link key={child.id} href={`/products/${child.slug}`} className="category-card">
                    <h3>{child.name}</h3>
                    {child.description && <p>{child.description}</p>}
                    <span className="more">
                      {count} {count === 1 ? 'product' : 'products'} &rarr;
                    </span>
                  </Link>
                );
              })}
            </div>
          )}

          {menu.products.length > 0 && (
            <div className="product-grid" style={menu.children.length > 0 ? { marginTop: '2.5rem' } : undefined}>
              {menu.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {empty && <p className="muted">There are no products in this category yet.</p>}
        </div>
      </section>
    </>
  );
}
