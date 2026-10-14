import AdminForm from '@/components/admin/AdminForm';
import { RICH_HINT, Section, TextArea, TextField } from '@/components/admin/Fields';
import ImageField from '@/components/admin/ImageField';
import ListField from '@/components/admin/ListField';
import { saveHome } from '@/lib/actions/pages';
import { getHome } from '@/lib/content';

export const dynamic = 'force-dynamic';

export default async function HomeEditorPage() {
  const h = await getHome();

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Homepage</h1>
          <p>Edit the banner and every section of the homepage.</p>
        </div>
        <a href="/" target="_blank" rel="noopener noreferrer" className="adm-btn">
          View homepage &#8599;
        </a>
      </div>

      <AdminForm action={saveHome}>
        <Section title="Banner">
          <ImageField
            name="heroImage"
            label="Banner image"
            initial={h.heroImage}
            hint="Large background photo. Leave empty to use the theme colours."
          />
          <TextField name="heroEyebrow" label="Small text above the title" defaultValue={h.heroEyebrow} />
          <TextField name="heroTitle" label="Title" defaultValue={h.heroTitle} required />
          <TextArea name="heroSubtitle" label="Subtitle" defaultValue={h.heroSubtitle} rows={3} />
          <TextField name="heroPrimaryText" label="First button text" defaultValue={h.heroPrimaryText} />
          <TextField
            name="heroPrimaryLink"
            label="First button link"
            defaultValue={h.heroPrimaryLink}
            hint="For example /products or /contact"
          />
          <TextField name="heroSecondaryText" label="Second button text" defaultValue={h.heroSecondaryText} />
          <TextField name="heroSecondaryLink" label="Second button link" defaultValue={h.heroSecondaryLink} />
        </Section>

        <Section title="Key numbers">
          <ListField
            name="stats"
            label="Numbers bar under the banner"
            initial={h.stats}
            fields={[
              { key: 'value', label: 'Number (e.g. 10+)' },
              { key: 'label', label: 'Label' },
            ]}
            addLabel="Add number"
            hint="Replace the sample numbers with your real figures, or remove them."
          />
        </Section>

        <Section title="Introduction">
          <TextField name="introEyebrow" label="Small text above the title" defaultValue={h.introEyebrow} />
          <TextField name="introTitle" label="Title" defaultValue={h.introTitle} />
          <TextArea name="introText" label="Text" defaultValue={h.introText} rows={6} hint={RICH_HINT} />
          <ImageField name="introImage" label="Image" initial={h.introImage} />
          <TextField name="introLinkText" label="Button text" defaultValue={h.introLinkText} />
          <TextField name="introLinkHref" label="Button link" defaultValue={h.introLinkHref} />
        </Section>

        <Section title="Products section">
          <TextField name="productsTitle" label="Title" defaultValue={h.productsTitle} />
          <TextField name="productsSubtitle" label="Subtitle" defaultValue={h.productsSubtitle} />
          <p style={{ margin: 0, color: 'var(--a-muted)' }}>
            The menus and featured products shown here come from the Menus and Products pages. Tick
            &quot;Show on homepage&quot; on a product to feature it.
          </p>
        </Section>

        <Section title="Why choose us">
          <TextField name="whyTitle" label="Title" defaultValue={h.whyTitle} />
          <TextField name="whySubtitle" label="Subtitle" defaultValue={h.whySubtitle} />
          <ListField
            name="why"
            label="Points"
            initial={h.why}
            fields={[
              { key: 'title', label: 'Heading' },
              { key: 'text', label: 'Text', multiline: true },
            ]}
            addLabel="Add point"
          />
        </Section>

        <Section title="Call to action band">
          <TextField name="ctaTitle" label="Title" defaultValue={h.ctaTitle} />
          <TextArea name="ctaText" label="Text" defaultValue={h.ctaText} rows={2} />
          <TextField name="ctaButtonText" label="Button text" defaultValue={h.ctaButtonText} />
          <TextField name="ctaButtonLink" label="Button link" defaultValue={h.ctaButtonLink} />
        </Section>
      </AdminForm>
    </>
  );
}
