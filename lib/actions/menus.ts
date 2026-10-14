'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';
import { getSupabase } from '@/lib/db';
import { bool, int, str } from '@/lib/forms';
import { descendantIds } from '@/lib/menu-tree';
import { slugify } from '@/lib/slug';
import type { FormState } from '@/lib/types';

async function uniqueMenuSlug(base: string, excludeId: number): Promise<string> {
  const supabase = getSupabase();
  let slug = base;
  let n = 2;
  while (n < 100) {
    const { data, error } = await supabase
      .from('menus')
      .select('id')
      .eq('slug', slug)
      .neq('id', excludeId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return slug;
    slug = `${base}-${n++}`;
  }
  return `${base}-${Date.now().toString(36)}`;
}

/** parent_id 0 means top level. Rejects a menu being placed inside itself or inside one of its submenus. */
async function resolveParent(
  parentId: number,
  menuId: number
): Promise<{ id: number | null } | { error: string }> {
  if (!parentId) return { id: null };
  if (parentId === menuId) return { error: 'A menu cannot be placed inside itself.' };

  const { data, error } = await getSupabase().from('menus').select('id, parent_id');
  if (error) return { error: error.message };

  const rows = ((data ?? []) as { id: number; parent_id: number | null }[]).map((row) => ({
    id: Number(row.id),
    parent_id: row.parent_id == null ? null : Number(row.parent_id),
  }));
  if (!rows.some((row) => row.id === parentId)) return { error: 'Choose a valid parent menu.' };
  if (menuId && descendantIds(rows, menuId).includes(parentId)) {
    return { error: 'A menu cannot be placed inside one of its own submenus.' };
  }
  return { id: parentId };
}

export async function createMenu(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const name = str(fd, 'name');
  if (!name) return { error: 'Menu name is required.' };

  const parent = await resolveParent(int(fd, 'parent_id', 0), 0);
  if ('error' in parent) return { error: parent.error };

  const base = slugify(str(fd, 'slug') || name) || `menu-${Date.now().toString(36)}`;
  const { error } = await getSupabase().from('menus').insert({
    name,
    slug: await uniqueMenuSlug(base, 0),
    description: str(fd, 'description'),
    parent_id: parent.id,
    position: int(fd, 'position', 0),
    visible: 1,
  });
  if (error) return { error: error.message };

  revalidatePath('/', 'layout');
  return { ok: true, message: 'Menu added.' };
}

export async function updateMenu(id: number, _prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const name = str(fd, 'name');
  if (!name) return { error: 'Menu name is required.' };

  const parent = await resolveParent(int(fd, 'parent_id', 0), id);
  if ('error' in parent) return { error: parent.error };

  const base = slugify(str(fd, 'slug') || name) || `menu-${Date.now().toString(36)}`;
  const { error } = await getSupabase()
    .from('menus')
    .update({
      name,
      slug: await uniqueMenuSlug(base, id),
      description: str(fd, 'description'),
      parent_id: parent.id,
      position: int(fd, 'position', 0),
      visible: bool(fd, 'visible') ? 1 : 0,
    })
    .eq('id', id);
  if (error) return { error: error.message };

  revalidatePath('/', 'layout');
  return { ok: true, message: 'Saved.' };
}

export async function deleteMenu(id: number): Promise<void> {
  await requireAdmin();
  // Submenus and products inside this menu are deleted too (ON DELETE CASCADE).
  const { error } = await getSupabase().from('menus').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/', 'layout');
}
