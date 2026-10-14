import AdminForm from '@/components/admin/AdminForm';
import { Section, TextArea, TextField } from '@/components/admin/Fields';
import ImageField from '@/components/admin/ImageField';
import { changePassword, saveSettings } from '@/lib/actions/settings';
import { getSite, THEMES } from '@/lib/content';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const site = await getSite();

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Settings</h1>
          <p>Company name, logo, website theme and social links.</p>
        </div>
      </div>

      <AdminForm action={saveSettings}>
        <Section title="Website theme">
          <div className="adm-themes">
            {THEMES.map((t) => (
              <label key={t.id} className="adm-theme">
                <input type="radio" name="theme" value={t.id} defaultChecked={site.theme === t.id} />
                <span>
                  <strong>{t.name}</strong>
                  <small>{t.description}</small>
                  <span className="adm-swatches">
                    {t.swatches.map((c) => (
                      <i key={c} style={{ background: c }} />
                    ))}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </Section>

        <Section title="Company">
          <TextField name="name" label="Company name" defaultValue={site.name} required />
          <TextField
            name="tagline"
            label="Tagline"
            defaultValue={site.tagline}
            hint="Shown in the browser tab and the footer."
          />
          <ImageField
            name="logo"
            label="Logo"
            initial={site.logo}
            hint="PNG, JPG or WebP with a transparent or plain background. Without a logo, the company name is shown as text."
          />
        </Section>

        <Section title="Footer and social links">
          <TextArea name="footerText" label="Footer text (optional)" defaultValue={site.footerText} rows={2} />
          <TextField name="facebook" label="Facebook page link" defaultValue={site.facebook} placeholder="https://" />
          <TextField name="linkedin" label="LinkedIn page link" defaultValue={site.linkedin} placeholder="https://" />
          <TextField name="instagram" label="Instagram link" defaultValue={site.instagram} placeholder="https://" />
          <TextField name="youtube" label="YouTube link" defaultValue={site.youtube} placeholder="https://" />
        </Section>
      </AdminForm>

      <div className="adm-card">
        <h2>Change your password</h2>
        <AdminForm action={changePassword} submitLabel="Change password">
          <TextField name="current" label="Current password" type="password" required />
          <TextField name="next" label="New password (8+ characters)" type="password" required />
          <TextField name="confirm" label="Confirm new password" type="password" required />
        </AdminForm>
      </div>
    </>
  );
}
