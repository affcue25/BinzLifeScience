import AdminForm from '@/components/admin/AdminForm';
import { RICH_HINT, Section, TextArea, TextField } from '@/components/admin/Fields';
import ImageField from '@/components/admin/ImageField';
import ListField from '@/components/admin/ListField';
import { saveAbout } from '@/lib/actions/pages';
import { getAbout } from '@/lib/content';

export const dynamic = 'force-dynamic';

export default async function AboutEditorPage() {
  const a = await getAbout();

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>About Us page</h1>
          <p>Edit the text and images of the About Us page.</p>
        </div>
        <a href="/about" target="_blank" rel="noopener noreferrer" className="adm-btn">
          View page &#8599;
        </a>
      </div>

      <AdminForm action={saveAbout}>
        <Section title="Banner">
          <ImageField name="bannerImage" label="Banner image" initial={a.bannerImage} />
          <TextField name="heroTitle" label="Title" defaultValue={a.heroTitle} required />
          <TextField name="heroSubtitle" label="Subtitle" defaultValue={a.heroSubtitle} />
        </Section>

        <Section title="Our story">
          <TextField name="storyTitle" label="Heading" defaultValue={a.storyTitle} />
          <TextArea name="storyText" label="Text" defaultValue={a.storyText} rows={8} hint={RICH_HINT} />
          <ImageField name="storyImage" label="Image" initial={a.storyImage} />
        </Section>

        <Section title="Mission and vision">
          <TextField name="missionTitle" label="Mission heading" defaultValue={a.missionTitle} />
          <TextArea name="missionText" label="Mission text" defaultValue={a.missionText} rows={3} />
          <TextField name="visionTitle" label="Vision heading" defaultValue={a.visionTitle} />
          <TextArea name="visionText" label="Vision text" defaultValue={a.visionText} rows={3} />
        </Section>

        <Section title="Values">
          <TextField name="valuesTitle" label="Section heading" defaultValue={a.valuesTitle} />
          <ListField
            name="values"
            label="Values"
            initial={a.values}
            fields={[
              { key: 'title', label: 'Heading' },
              { key: 'text', label: 'Text', multiline: true },
            ]}
            addLabel="Add value"
          />
        </Section>

        <Section title="Call to action">
          <TextField name="ctaTitle" label="Title" defaultValue={a.ctaTitle} />
          <TextArea name="ctaText" label="Text" defaultValue={a.ctaText} rows={2} />
        </Section>
      </AdminForm>
    </>
  );
}
