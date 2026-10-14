export default function PageHero({
  title,
  subtitle,
  image,
  crumbs,
}: {
  title: string;
  subtitle?: string;
  image?: string;
  crumbs?: { label: string; href?: string }[];
}) {
  return (
    <section className="page-hero">
      {image && <div className="page-hero-bg" style={{ backgroundImage: `url(${image})` }} />}
      <div className="page-hero-overlay" />
      <div className="container page-hero-inner">
        {crumbs && crumbs.length > 0 && (
          <nav className="crumbs" aria-label="Breadcrumb">
            {crumbs.map((c, i) => (
              <span key={i}>
                {c.href ? <a href={c.href}>{c.label}</a> : c.label}
                {i < crumbs.length - 1 && <span className="sep"> / </span>}
              </span>
            ))}
          </nav>
        )}
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </section>
  );
}
