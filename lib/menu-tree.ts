export type MenuLink = {
  id: number;
  parent_id: number | null;
  visible: number;
  position: number;
};

/** Ids of every menu nested inside rootId, at any depth. Does not include rootId. */
export function descendantIds(menus: { id: number; parent_id: number | null }[], rootId: number): number[] {
  const children = new Map<number, number[]>();
  for (const menu of menus) {
    if (menu.parent_id == null) continue;
    const list = children.get(menu.parent_id) ?? [];
    list.push(menu.id);
    children.set(menu.parent_id, list);
  }

  const out: number[] = [];
  const seen = new Set<number>();
  const stack = [...(children.get(rootId) ?? [])];
  while (stack.length > 0) {
    const id = stack.pop() as number;
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(id);
    for (const child of children.get(id) ?? []) stack.push(child);
  }
  return out;
}

/** A menu is public only when it, and every menu above it, is visible. */
export function isPublicMenu(menu: MenuLink, byId: Map<number, MenuLink>): boolean {
  const seen = new Set<number>();
  let current: MenuLink | undefined = menu;
  while (current) {
    if (current.visible !== 1) return false;
    if (seen.has(current.id)) return false;
    seen.add(current.id);
    if (current.parent_id == null) return true;
    current = byId.get(current.parent_id);
    if (!current) return false;
  }
  return false;
}

export function ancestorChain<T extends { id: number; parent_id: number | null; name: string; slug: string }>(
  menu: T,
  byId: Map<number, T>
): { name: string; slug: string }[] {
  const chain: { name: string; slug: string }[] = [];
  const seen = new Set<number>();
  let parentId = menu.parent_id;
  while (parentId != null) {
    if (seen.has(parentId)) break;
    seen.add(parentId);
    const parent = byId.get(parentId);
    if (!parent) break;
    chain.push({ name: parent.name, slug: parent.slug });
    parentId = parent.parent_id;
  }
  return chain.reverse();
}

/** Parents first, then their submenus, ordered by position. */
export function flattenMenus<T extends { id: number; parent_id: number | null; position: number }>(
  menus: T[]
): (T & { depth: number })[] {
  const byParent = new Map<number | null, T[]>();
  for (const menu of menus) {
    const list = byParent.get(menu.parent_id) ?? [];
    list.push(menu);
    byParent.set(menu.parent_id, list);
  }
  for (const list of byParent.values()) {
    list.sort((a, b) => a.position - b.position || a.id - b.id);
  }

  const out: (T & { depth: number })[] = [];
  const seen = new Set<number>();
  const walk = (parentId: number | null, depth: number) => {
    for (const menu of byParent.get(parentId) ?? []) {
      if (seen.has(menu.id)) continue;
      seen.add(menu.id);
      out.push({ ...menu, depth });
      walk(menu.id, depth + 1);
    }
  };
  walk(null, 0);
  for (const menu of menus) {
    if (!seen.has(menu.id)) out.push({ ...menu, depth: 0 });
  }
  return out;
}
