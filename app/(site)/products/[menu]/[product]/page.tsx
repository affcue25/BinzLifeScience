import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ProductTabs from '@/components/site/ProductTabs';
import RichText from '@/components/site/RichText';
import { getProduct } from '@/lib/queries';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ menu: string; product: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { menu, product: slug } = await params;
  const product = await getProduct(menu, slug);
  if (!product) return { title: 'Product not found' };
  return { title: product.name, description: product.tagline || undefined };
}

export default async function ProductPage({ params }: Props) {
  const { menu, product: slug } = await params;
  const product = await getProduct(menu, slug);
  if (!product) notFound();

  const contactHref = `/contact?subject=${encodeURIComponent(`Enquiry: ${product.name}`)}`;

  return (
    <>
      {/* Banner */}
      <section className="product-banner">
        {product.banner ? (
          <img src={product.banner} alt={product.name} />
        ) : (
          <div className="ph product-banner-ph" aria-hidden="true">
            {product.name}
          </div>
        )}
      </section>

      {/* Breadcrumb */}
      <div className="crumb-bar">
        <div className="container">
          <nav className="crumbs dark" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span className="sep"> / </span>
            <Link href="/products">Products</Link>
            {product.menu_ancestors.map((item) => (
              <span key={item.slug}>
                <span className="sep"> / </span>
                <Link href={`/products/${item.slug}`}>{item.name}</Link>
              </span>
            ))}
            <span className="sep"> / </span>
            <Link href={`/products/${product.menu_slug}`}>{product.menu_name}</Link>
            <span className="sep"> / </span>
            <span>{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Description, PDFs and Contact Us */}
      <section className="section product-intro">
        <div className="container product-intro-grid">
          <div>
            <span className="eyebrow dark">{product.menu_name}</span>
            <h1>{product.name}</h1>
            {product.tagline && <p className="lead">{product.tagline}</p>}
            {product.description && <RichText text={product.description} />}
          </div>

          <aside className="product-side">
            {product.pdfs.length > 0 && (
              <div className="side-block">
                <h2>Downloads</h2>
                <ul className="pdf-list">
                  {product.pdfs.map((pdf, i) => (
                    <li key={i}>
                      <a
                        href={`${pdf.url}?n=${encodeURIComponent(pdf.title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span className="pdf-icon" aria-hidden="true">
                          PDF
                        </span>
                        <span>{pdf.title}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <Link href={contactHref} className="btn btn-primary btn-block">
              Contact Us
            </Link>
          </aside>
        </div>
      </section>

      {/* Overview / Key Features tabs */}
      <ProductTabs overview={product.overview} features={product.features} />
    </>
  );
}
