'use server';

import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';
import { getSite, saveSiteSettings, type ThemeId } from '@/lib/content';
import { getSupabase } from '@/lib/db';
import { asset, link, str } from '@/lib/forms';
import type { FormState } from '@/lib/types';

export async function saveSettings(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();

  const name = str(fd, 'name');
  if (!name) return { error: 'Company name is required.' };

  const themeRaw = str(fd, 'theme');
  const theme: ThemeId = themeRaw === 'deepsoil' ? 'deepsoil' : 'agrotech';

  await saveSiteSettings({
    ...(await getSite()),
    name,
    tagline: str(fd, 'tagline'),
    logo: asset(str(fd, 'logo')),
    theme,
    footerText: str(fd, 'footerText'),
    facebook: link(str(fd, 'facebook')),
    linkedin: link(str(fd, 'linkedin')),
    instagram: link(str(fd, 'instagram')),
    youtube: link(str(fd, 'youtube')),
  });

  revalidatePath('/', 'layout');
  return { ok: true, message: 'Settings saved.' };
}

export async function changePassword(_prev: FormState, fd: FormData): Promise<FormState> {
  const admin = await requireAdmin();

  const current = typeof fd.get('current') === 'string' ? (fd.get('current') as string) : '';
  const next = typeof fd.get('next') === 'string' ? (fd.get('next') as string) : '';
  const confirm = typeof fd.get('confirm') === 'string' ? (fd.get('confirm') as string) : '';

  const { data: row, error } = await getSupabase()
    .from('users')
    .select('password_hash')
    .eq('id', admin.id)
    .maybeSingle();
  if (error) return { error: error.message };
  if (!row || !bcrypt.compareSync(current, row.password_hash)) {
    return { error: 'Your current password is not correct.' };
  }
  if (next.length < 8) return { error: 'New password must be at least 8 characters.' };
  if (next !== confirm) return { error: 'New passwords do not match.' };

  const updated = await getSupabase()
    .from('users')
    .update({ password_hash: bcrypt.hashSync(next, 10) })
    .eq('id', admin.id);
  if (updated.error) return { error: updated.error.message };
  return { ok: true, message: 'Password changed.' };
}
