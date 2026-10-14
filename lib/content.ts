import { dbError, getSupabase } from './db';
import { parseJson } from './json';

export type ThemeId = 'agrotech' | 'deepsoil';

export const THEMES: { id: ThemeId; name: string; description: string; swatches: string[] }[] = [
  {
    id: 'agrotech',
    name: 'Agro Tech',
    description: 'Deep teal with a fresh lime accent. Corporate, science-driven, sharp corners.',
    swatches: ['#0A3D47', '#0A6F7C', '#9BE15D', '#F3F8F8'],
  },
  {
    id: 'deepsoil',
    name: 'Deep Soil',
    description: 'Forest green with harvest gold and cream. Premium, established, serif headings.',
    swatches: ['#14342B', '#D9A441', '#6B4A2F', '#F6F1E7'],
  },
];

/* ------------------------------------------------------------------ */
/* Site settings                                                       */
/* ------------------------------------------------------------------ */

export type SiteSettings = {
  name: string;
  tagline: string;
  logo: string;
  theme: ThemeId;
  footerText: string;
  facebook: string;
  linkedin: string;
  instagram: string;
  youtube: string;
};

export const DEFAULT_SITE: SiteSettings = {
  name: 'Binz Life & Science',
  tagline: 'Science-led crop nutrition',
  logo: '',
  theme: 'agrotech',
  footerText: '',
  facebook: '',
  linkedin: '',
  instagram: '',
  youtube: '',
};

export async function getSite(): Promise<SiteSettings> {
  const { data, error } = await getSupabase()
    .from('settings')
    .select('value')
    .eq('key', 'site')
    .maybeSingle();
  if (error) dbError(error, 'Could not load site settings');
  const merged = { ...DEFAULT_SITE, ...parseJson<Partial<SiteSettings>>(data?.value, {}) };
  if (merged.theme !== 'agrotech' && merged.theme !== 'deepsoil') merged.theme = 'agrotech';
  return merged;
}

export async function saveSiteSettings(site: SiteSettings) {
  const { error } = await getSupabase()
    .from('settings')
    .upsert({ key: 'site', value: JSON.stringify(site) });
  if (error) dbError(error, 'Could not save site settings');
}

/* ------------------------------------------------------------------ */
/* Page content                                                        */
/* ------------------------------------------------------------------ */

type Pair = { title: string; text: string };
type Stat = { value: string; label: string };

export type HomeContent = {
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  heroPrimaryText: string;
  heroPrimaryLink: string;
  heroSecondaryText: string;
  heroSecondaryLink: string;
  stats: Stat[];
  introEyebrow: string;
  introTitle: string;
  introText: string;
  introImage: string;
  introLinkText: string;
  introLinkHref: string;
  productsTitle: string;
  productsSubtitle: string;
  whyTitle: string;
  whySubtitle: string;
  why: Pair[];
  ctaTitle: string;
  ctaText: string;
  ctaButtonText: string;
  ctaButtonLink: string;
};

export const DEFAULT_HOME: HomeContent = {
  heroEyebrow: 'Binz Life & Science',
  heroTitle: 'Healthier soil. Stronger crops. Better harvests.',
  heroSubtitle:
    'Science-led fertilizers and crop nutrition solutions for growers who want reliable results, season after season.',
  heroImage: '',
  heroPrimaryText: 'Explore Products',
  heroPrimaryLink: '/products',
  heroSecondaryText: 'Contact Us',
  heroSecondaryLink: '/contact',
  stats: [
    { value: '10+', label: 'Years of experience' },
    { value: '50+', label: 'Products and solutions' },
    { value: '1000+', label: 'Growers served' },
  ],
  introEyebrow: 'Who we are',
  introTitle: 'Crop nutrition backed by science',
  introText:
    'We develop and supply fertilizers that help growers get more from every acre.\n\nOur team combines agronomy, quality control and field experience to deliver products you can depend on.',
  introImage: '',
  introLinkText: 'Learn more about us',
  introLinkHref: '/about',
  productsTitle: 'Our Products',
  productsSubtitle: 'Explore our range of fertilizers and crop nutrition solutions.',
  whyTitle: 'Why growers choose us',
  whySubtitle: 'What you can expect when you work with Binz Life & Science.',
  why: [
    { title: 'Science-led formulas', text: 'Every product is developed around crop and soil needs.' },
    { title: 'Consistent quality', text: 'Strict quality control from raw material to finished bag.' },
    { title: 'Agronomic support', text: 'Practical advice to help you apply the right product at the right time.' },
    { title: 'Reliable supply', text: 'Dependable availability when your crop needs it.' },
  ],
  ctaTitle: 'Need help choosing the right product?',
  ctaText: 'Talk to our team and we will recommend a solution for your crop and soil.',
  ctaButtonText: 'Contact Us',
  ctaButtonLink: '/contact',
};

export type AboutContent = {
  heroTitle: string;
  heroSubtitle: string;
  bannerImage: string;
  storyTitle: string;
  storyText: string;
  storyImage: string;
  missionTitle: string;
  missionText: string;
  visionTitle: string;
  visionText: string;
  valuesTitle: string;
  values: Pair[];
  ctaTitle: string;
  ctaText: string;
};

export const DEFAULT_ABOUT: AboutContent = {
  heroTitle: 'About Us',
  heroSubtitle: 'Helping growers get more from their land.',
  bannerImage: '',
  storyTitle: 'Our story',
  storyText:
    'Binz Life & Science supplies fertilizers and crop nutrition solutions to growers.\n\nEdit this text from the admin panel to tell your own story: how the company started, what it stands for and who it serves.',
  storyImage: '',
  missionTitle: 'Our mission',
  missionText: 'To help growers produce healthier crops and better yields with science-led nutrition.',
  visionTitle: 'Our vision',
  visionText: 'To be the most trusted name in crop nutrition for the growers we serve.',
  valuesTitle: 'What we value',
  values: [
    { title: 'Quality', text: 'We do not compromise on what goes into the bag.' },
    { title: 'Science', text: 'Our recommendations are based on evidence from the field and the lab.' },
    { title: 'Partnership', text: 'We succeed when our growers succeed.' },
  ],
  ctaTitle: 'Want to work with us?',
  ctaText: 'Get in touch and we will be happy to help.',
};

export type ContactContent = {
  heroTitle: string;
  heroSubtitle: string;
  bannerImage: string;
  intro: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
  mapEmbed: string;
  formTitle: string;
  formIntro: string;
  successMessage: string;
};

export const DEFAULT_CONTACT: ContactContent = {
  heroTitle: 'Contact Us',
  heroSubtitle: 'We would love to hear from you.',
  bannerImage: '',
  intro: 'Questions about our products or need advice? Send us a message and our team will reply soon.',
  address: 'Your office address\nCity, Country',
  phone: '+00 000 0000000',
  email: 'info@example.com',
  hours: 'Monday to Saturday\n9:00 AM to 6:00 PM',
  mapEmbed: '',
  formTitle: 'Send us a message',
  formIntro: 'Fill in the form and we will get back to you.',
  successMessage: 'Thank you. Your message has been sent and we will reply soon.',
};

type PageKey = 'home' | 'about' | 'contact';

async function getPage<T extends object>(key: PageKey, defaults: T): Promise<T> {
  const { data, error } = await getSupabase()
    .from('pages')
    .select('content')
    .eq('key', key)
    .maybeSingle();
  if (error) dbError(error, 'Could not load page');
  return { ...defaults, ...parseJson<Partial<T>>(data?.content, {}) };
}

export async function savePage(key: PageKey, content: object) {
  const { error } = await getSupabase().from('pages').upsert({
    key,
    content: JSON.stringify(content),
    updated_at: new Date().toISOString(),
  });
  if (error) dbError(error, 'Could not save page');
}

export const getHome = () => getPage('home', DEFAULT_HOME);
export const getAbout = () => getPage('about', DEFAULT_ABOUT);
export const getContact = () => getPage('contact', DEFAULT_CONTACT);
