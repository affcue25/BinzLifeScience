import AdminForm from '@/components/admin/AdminForm';
import { Section, TextArea, TextField } from '@/components/admin/Fields';
import ImageField from '@/components/admin/ImageField';
import { saveContact } from '@/lib/actions/pages';
import { getContact } from '@/lib/content';

export const dynamic = 'force-dynamic';

export default async function ContactEditorPage() {
  const c = await getContact();

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Contact Us page</h1>
          <p>Contact details here are also shown in the website footer.</p>
        </div>
        <a href="/contact" target="_blank" rel="noopener noreferrer" className="adm-btn">
          View page &#8599;
        </a>
      </div>

      <AdminForm action={saveContact}>
        <Section title="Banner">
          <ImageField name="bannerImage" label="Banner image" initial={c.bannerImage} />
          <TextField name="heroTitle" label="Title" defaultValue={c.heroTitle} required />
          <TextField name="heroSubtitle" label="Subtitle" defaultValue={c.heroSubtitle} />
        </Section>

        <Section title="Contact details">
          <TextArea name="intro" label="Introduction" defaultValue={c.intro} rows={3} />
          <TextArea name="address" label="Address" defaultValue={c.address} rows={3} />
          <TextField name="phone" label="Phone" defaultValue={c.phone} />
          <TextField name="email" label="Email" defaultValue={c.email} type="email" />
          <TextArea name="hours" label="Opening hours" defaultValue={c.hours} rows={2} />
        </Section>

        <Section title="Map (optional)">
          <TextField
            name="mapEmbed"
            label="Google Maps embed link"
            defaultValue={c.mapEmbed}
            hint='In Google Maps choose Share, then Embed a map, then copy only the address inside src="..." (it starts with https://www.google.com/maps/embed?). Leave empty for no map.'
          />
        </Section>

        <Section title="Contact form">
          <TextField name="formTitle" label="Form heading" defaultValue={c.formTitle} />
          <TextField name="formIntro" label="Text above the form" defaultValue={c.formIntro} />
          <TextField
            name="successMessage"
            label="Message shown after sending"
            defaultValue={c.successMessage}
          />
        </Section>
      </AdminForm>
    </>
  );
}
