import type { Metadata } from 'next';
import ContactForm from '@/components/site/ContactForm';
import PageHero from '@/components/site/PageHero';
import RichText from '@/components/site/RichText';
import { getContact } from '@/lib/content';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Contact Us' };

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string | string[] }>;
}) {
  const contact = await getContact();
  const sp = await searchParams;
  const rawSubject = Array.isArray(sp.subject) ? sp.subject[0] : sp.subject;
  const subject = (rawSubject ?? '').slice(0, 120);

  return (
    <>
      <PageHero title={contact.heroTitle} subtitle={contact.heroSubtitle} image={contact.bannerImage} />

      <section className="section">
        <div className="container contact-grid">
          <div className="contact-info">
            {contact.intro && <RichText text={contact.intro} />}

            {contact.address && (
              <div className="info-block">
                <h3>Address</h3>
                <p className="pre">{contact.address}</p>
              </div>
            )}
            {contact.phone && (
              <div className="info-block">
                <h3>Phone</h3>
                <p>{contact.phone}</p>
              </div>
            )}
            {contact.email && (
              <div className="info-block">
                <h3>Email</h3>
                <p>{contact.email}</p>
              </div>
            )}
            {contact.hours && (
              <div className="info-block">
                <h3>Opening hours</h3>
                <p className="pre">{contact.hours}</p>
              </div>
            )}
          </div>

          <div className="contact-card">
            <h2>{contact.formTitle}</h2>
            {contact.formIntro && <p className="muted">{contact.formIntro}</p>}
            <ContactForm defaultSubject={subject} successMessage={contact.successMessage} />
          </div>
        </div>
      </section>

      {contact.mapEmbed && (
        <section className="map-section">
          <iframe
            src={contact.mapEmbed}
            title="Map"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </section>
      )}
    </>
  );
}
