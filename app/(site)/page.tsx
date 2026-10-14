import SmartLink from '@/components/site/SmartLink';
import ProductCard from '@/components/site/ProductCard';
import RichText from '@/components/site/RichText';
import Link from 'next/link';
import { getHome } from '@/lib/content';
import { getHomeProducts, getVisibleMenusWithCounts } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [home, menus, products] = await Promise.all([
    getHome(),
    getVisibleMenusWithCounts(),
    getHomeProducts(6),
  ]);
  const stats = home.stats.filter((s) => s.value || s.label);
  const why = home.why.filter((w) => w.title || w.text);

  return (
    <>
      {/* Hero */}
      <section className="hero">
        {home.heroImage && (
          <div className="hero-bg" style={{ backgroundImage: `url(${home.heroImage})` }} />
        )}
        <div className="hero-overlay" />
        <div className="container hero-inner">
          {home.heroEyebrow && <span className="eyebrow">{home.heroEyebrow}</span>}
          <h1>{home.heroTitle}</h1>
          {home.heroSubtitle && <p className="hero-sub">{home.heroSubtitle}</p>}
          <div className="hero-actions">
            {home.heroPrimaryText && (
              <SmartLink href={home.heroPrimaryLink} className="btn btn-accent">
                {home.heroPrimaryText}
              </SmartLink>
            )}
            {home.heroSecondaryText && (
              <SmartLink href={home.heroSecondaryLink} className="btn btn-ghost">
                {home.heroSecondaryText}
              </SmartLink>
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      {stats.length > 0 && (
        <section className="stats-bar">
          <div className="container stats-grid">
            {stats.map((s, i) => (
              <div key={i} className="stat">
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Intro */}
      {(home.introTitle || home.introText) && (
        <section className="section">
          <div className={`container split ${home.introImage ? '' : 'split-single'}`}>
            <div>
              {home.introEyebrow && <span className="eyebrow dark">{home.introEyebrow}</span>}
              {home.introTitle && <h2>{home.introTitle}</h2>}
              <RichText text={home.introText} />
              {home.introLinkText && (
                <SmartLink href={home.introLinkHref} className="btn btn-primary">
                  {home.introLinkText}
                </SmartLink>
              )}
            </div>
            {home.introImage && (
              <div className="split-media">
                <img src={home.introImage} alt={home.introTitle} loading="lazy" />
              </div>
            )}
          </div>
        </section>
      )}

      {/* Product categories (menus) */}
      {menus.length > 0 && (
        <section className="section section-alt">
          <div className="container">
            <div className="section-head">
              <h2>{home.productsTitle}</h2>
              {home.productsSubtitle && <p>{home.productsSubtitle}</p>}
            </div>
            <div className="category-grid">
              {menus.map((m) => (
                <Link key={m.id} href={`/products/${m.slug}`} className="category-card">
                  <h3>{m.name}</h3>
                  {m.description && <p>{m.description}</p>}
                  <span className="more">
                    {m.product_count} {m.product_count === 1 ? 'product' : 'products'} &rarr;
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured products */}
      {products.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-head">
              <h2>Featured products</h2>
            </div>
            <div className="product-grid">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            <div className="center">
              <Link href="/products" className="btn btn-outline">
                View all products
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Why choose us */}
      {why.length > 0 && (
        <section className="section section-dark">
          <div className="container">
            <div className="section-head">
              <h2>{home.whyTitle}</h2>
              {home.whySubtitle && <p>{home.whySubtitle}</p>}
            </div>
            <div className="why-grid">
              {why.map((w, i) => (
                <div key={i} className="why-card">
                  <h3>{w.title}</h3>
                  <p>{w.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Call to action */}
      {home.ctaTitle && (
        <section className="cta-band">
          <div className="container cta-inner">
            <div>
              <h2>{home.ctaTitle}</h2>
              {home.ctaText && <p>{home.ctaText}</p>}
            </div>
            {home.ctaButtonText && (
              <SmartLink href={home.ctaButtonLink} className="btn btn-accent">
                {home.ctaButtonText}
              </SmartLink>
            )}
          </div>
        </section>
      )}
    </>
  );
}
