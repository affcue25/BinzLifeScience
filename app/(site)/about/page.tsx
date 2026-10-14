import type { Metadata } from 'next';
import Link from 'next/link';
import PageHero from '@/components/site/PageHero';
import RichText from '@/components/site/RichText';
import { getAbout } from '@/lib/content';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'About Us' };

export default async function AboutPage() {
  const about = await getAbout();
  const values = about.values.filter((v) => v.title || v.text);

  return (
    <>
      <PageHero title={about.heroTitle} subtitle={about.heroSubtitle} image={about.bannerImage} />

      <section className="section">
        <div className={`container split ${about.storyImage ? '' : 'split-single'}`}>
          <div>
            {about.storyTitle && <h2>{about.storyTitle}</h2>}
            <RichText text={about.storyText} />
          </div>
          {about.storyImage && (
            <div className="split-media">
              <img src={about.storyImage} alt={about.storyTitle} loading="lazy" />
            </div>
          )}
        </div>
      </section>

      {(about.missionText || about.visionText) && (
        <section className="section section-alt">
          <div className="container two-col">
            {about.missionText && (
              <div className="panel">
                <h3>{about.missionTitle}</h3>
                <RichText text={about.missionText} />
              </div>
            )}
            {about.visionText && (
              <div className="panel">
                <h3>{about.visionTitle}</h3>
                <RichText text={about.visionText} />
              </div>
            )}
          </div>
        </section>
      )}

      {values.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-head">
              <h2>{about.valuesTitle}</h2>
            </div>
            <div className="why-grid light">
              {values.map((v, i) => (
                <div key={i} className="why-card">
                  <h3>{v.title}</h3>
                  <p>{v.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {about.ctaTitle && (
        <section className="cta-band">
          <div className="container cta-inner">
            <div>
              <h2>{about.ctaTitle}</h2>
              {about.ctaText && <p>{about.ctaText}</p>}
            </div>
            <Link href="/contact" className="btn btn-accent">
              Contact Us
            </Link>
          </div>
        </section>
      )}
    </>
  );
}
