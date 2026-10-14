'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';
import {
  savePage,
  type AboutContent,
  type ContactContent,
  type HomeContent,
} from '@/lib/content';
import { asset, link, list, str, text } from '@/lib/forms';
import type { FormState } from '@/lib/types';

export async function saveHome(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();

  const content: HomeContent = {
    heroEyebrow: str(fd, 'heroEyebrow'),
    heroTitle: str(fd, 'heroTitle'),
    heroSubtitle: text(fd, 'heroSubtitle'),
    heroImage: asset(str(fd, 'heroImage')),
    heroPrimaryText: str(fd, 'heroPrimaryText'),
    heroPrimaryLink: link(str(fd, 'heroPrimaryLink'), '/products'),
    heroSecondaryText: str(fd, 'heroSecondaryText'),
    heroSecondaryLink: link(str(fd, 'heroSecondaryLink'), '/contact'),
    stats: list(fd, 'stats').map((s) => ({ value: s.value ?? '', label: s.label ?? '' })),
    introEyebrow: str(fd, 'introEyebrow'),
    introTitle: str(fd, 'introTitle'),
    introText: text(fd, 'introText'),
    introImage: asset(str(fd, 'introImage')),
    introLinkText: str(fd, 'introLinkText'),
    introLinkHref: link(str(fd, 'introLinkHref'), '/about'),
    productsTitle: str(fd, 'productsTitle'),
    productsSubtitle: str(fd, 'productsSubtitle'),
    whyTitle: str(fd, 'whyTitle'),
    whySubtitle: str(fd, 'whySubtitle'),
    why: list(fd, 'why').map((w) => ({ title: w.title ?? '', text: w.text ?? '' })),
    ctaTitle: str(fd, 'ctaTitle'),
    ctaText: text(fd, 'ctaText'),
    ctaButtonText: str(fd, 'ctaButtonText'),
    ctaButtonLink: link(str(fd, 'ctaButtonLink'), '/contact'),
  };

  await savePage('home', content);
  revalidatePath('/', 'layout');
  return { ok: true, message: 'Homepage saved.' };
}

export async function saveAbout(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();

  const content: AboutContent = {
    heroTitle: str(fd, 'heroTitle'),
    heroSubtitle: str(fd, 'heroSubtitle'),
    bannerImage: asset(str(fd, 'bannerImage')),
    storyTitle: str(fd, 'storyTitle'),
    storyText: text(fd, 'storyText'),
    storyImage: asset(str(fd, 'storyImage')),
    missionTitle: str(fd, 'missionTitle'),
    missionText: text(fd, 'missionText'),
    visionTitle: str(fd, 'visionTitle'),
    visionText: text(fd, 'visionText'),
    valuesTitle: str(fd, 'valuesTitle'),
    values: list(fd, 'values').map((v) => ({ title: v.title ?? '', text: v.text ?? '' })),
    ctaTitle: str(fd, 'ctaTitle'),
    ctaText: text(fd, 'ctaText'),
  };

  await savePage('about', content);
  revalidatePath('/', 'layout');
  return { ok: true, message: 'About Us page saved.' };
}

export async function saveContact(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();

  // Only Google Maps embed links are accepted for the map.
  const rawMap = str(fd, 'mapEmbed');
  const mapEmbed = /^https:\/\/www\.google\.com\/maps\/embed\?/.test(rawMap) ? rawMap : '';
  if (rawMap && !mapEmbed) {
    return {
      error:
        'The map link must be a Google Maps embed URL (it starts with https://www.google.com/maps/embed?). Leave it empty for no map.',
    };
  }

  const content: ContactContent = {
    heroTitle: str(fd, 'heroTitle'),
    heroSubtitle: str(fd, 'heroSubtitle'),
    bannerImage: asset(str(fd, 'bannerImage')),
    intro: text(fd, 'intro'),
    address: text(fd, 'address'),
    phone: str(fd, 'phone'),
    email: str(fd, 'email'),
    hours: text(fd, 'hours'),
    mapEmbed,
    formTitle: str(fd, 'formTitle'),
    formIntro: str(fd, 'formIntro'),
    successMessage: str(fd, 'successMessage'),
  };

  await savePage('contact', content);
  revalidatePath('/', 'layout');
  return { ok: true, message: 'Contact Us page saved.' };
}
