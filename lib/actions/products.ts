'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { getSupabase } from '@/lib/db';
import { asset, bool, int, list, str, text } from '@/lib/forms';
import { slugify } from '@/lib/slug';
import type { FormState } from '@/lib/types';

async function uniqueProductSlug(menuId: number, base: string, excludeId: number): Promise<string> {
  const supabase = getSupabase();
  let slug = base;
  let n = 2;
  while (n < 100) {
    const { data, error } = await supabase
      .from('products')
      .select('id')
      .eq('menu_id', menuId)
      .eq('slug', slug)
      .neq('id', excludeId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return slug;
    slug = `${base}-${n++}`;
  }
  return `${base}-${Date.now().toString(36)}`;
}

export async function saveProduct(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const supabase = getSupabase();

  const id = int(fd, 'id', 0);
  const menuId = int(fd, 'menu_id', 0);
  const name = str(fd, 'name');

  if (!name) return { error: 'Product name is required.' };
  const menu = await supabase.from('menus').select('id').eq('id', menuId).maybeSingle();
  if (menu.error) return { error: menu.error.message };
  if (!menu.data) return { error: 'Choose a menu for this product.' };

  const base = slugify(str(fd, 'slug') || name) || `product-${Date.now().toString(36)}`;
  const slug = await uniqueProductSlug(menuId, base, id);

  const features = JSON.stringify(
    list(fd, 'features')
      .map((f) => ({ title: f.title ?? '', text: f.text ?? '' }))
      .filter((f) => f.title || f.text)
  );
  const pdfs = JSON.stringify(
    list(fd, 'pdfs')
      .map((p) => ({ title: p.title || 'Download', url: asset(p.url ?? '') }))
      .filter((p) => p.url)
  );

  const values = {
    menu_id: menuId,
    name,
    slug,
    tagline: str(fd, 'tagline'),
    description: text(fd, 'description'),
    banner: asset(str(fd, 'banner')),
    overview: text(fd, 'overview'),
    features,
    pdfs,
    featured: bool(fd, 'featured') ? 1 : 0,
    published: bool(fd, 'published') ? 1 : 0,
    position: int(fd, 'position', 0),
  };

  if (id) {
    const { error } = await supabase.from('products').update(values).eq('id', id);
    if (error) {
      if (error.code === '23505') return { error: 'Another product in this menu already uses that address.' };
      return { error: error.message };
    }
    revalidatePath('/', 'layout');
    return { ok: true, message: 'Product saved.' };
  }

  const inserted = await supabase.from('products').insert(values).select('id').single();
  if (inserted.error || !inserted.data) {
    if (inserted.error?.code === '23505') {
      return { error: 'Another product in this menu already uses that address.' };
    }
    return { error: inserted.error?.message ?? 'Could not create the product.' };
  }

  revalidatePath('/', 'layout');
  redirect(`/admin/products/${Number(inserted.data.id)}?created=1`);
}

export async function deleteProduct(id: number): Promise<void> {
  await requireAdmin();
  const { error } = await getSupabase().from('products').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/', 'layout');
}
