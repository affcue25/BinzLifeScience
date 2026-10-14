import { dbError, getSupabase } from './db';
import { parseJson } from './json';
import { ancestorChain, descendantIds, flattenMenus, isPublicMenu } from './menu-tree';
import type { Feature, PdfItem } from './types';

/* ------------------------------ Types ------------------------------ */

export type Menu = {
  id: number;
  name: string;
  slug: string;
  description: string;
  position: number;
  visible: number;
  parent_id: number | null;
};

export type AdminMenu = Menu & {
  product_count: number;
  depth: number;
  descendant_count: number;
  subtree_product_count: number;
};

type MenuEmbed = { id?: number; name: string; slug: string; position?: number };

type ProductRow = {
  id: number;
  menu_id: number;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  banner: string;
  overview: string;
  features: unknown;
  pdfs: unknown;
  featured: number;
  published: number;
  position: number;
  created_at: string;
  menus: MenuEmbed | MenuEmbed[] | null;
};

export type Product = {
  id: number;
  menu_id: number;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  banner: string;
  overview: string;
  features: Feature[];
  pdfs: PdfItem[];
  featured: number;
  published: number;
  position: number;
  created_at: string;
  menu_name: string;
  menu_slug: string;
  menu_ancestors: { name: string; slug: string }[];
};

export type NavMenu = {
  id: number;
  name: string;
  slug: string;
  products: { name: string; slug: string }[];
  children: NavMenu[];
};

export type CatalogMenu = Menu & {
  products: Product[];
  children: CatalogMenu[];
};

export type Message = {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  body: string;
  is_read: number;
  created_at: string;
};

const PRODUCT_COLUMNS =
  'id, menu_id, name, slug, tagline, description, banner, overview, features, pdfs, featured, published, position, created_at, menus!inner(name, slug)';

function menuOf(menus: MenuEmbed | MenuEmbed[] | null): MenuEmbed | undefined {
  if (!menus) return undefined;
  return Array.isArray(menus) ? menus[0] : menus;
}

function toMenu(row: Menu): Menu {
  return {
    id: Number(row.id),
    name: row.name,
    slug: row.slug,
    description: row.description ?? '',
    position: Number(row.position),
    visible: Number(row.visible),
    parent_id: row.parent_id == null ? null : Number(row.parent_id),
  };
}

function toProduct(row: ProductRow): Product {
  const menu = menuOf(row.menus);
  return {
    id: Number(row.id),
    menu_id: Number(row.menu_id),
    name: row.name,
    slug: row.slug,
    tagline: row.tagline ?? '',
    description: row.description ?? '',
    banner: row.banner ?? '',
    overview: row.overview ?? '',
    features: parseJson<Feature[]>(row.features, []),
    pdfs: parseJson<PdfItem[]>(row.pdfs, []),
    featured: Number(row.featured),
    published: Number(row.published),
    position: Number(row.position),
    created_at: row.created_at,
    menu_name: menu?.name ?? '',
    menu_slug: menu?.slug ?? '',
    menu_ancestors: [],
  };
}

const MENU_COLUMNS = 'id, name, slug, description, position, visible, parent_id';

async function fetchMenus(): Promise<Menu[]> {
  const { data, error } = await getSupabase()
    .from('menus')
    .select(MENU_COLUMNS)
    .order('position', { ascending: true })
    .order('id', { ascending: true });
  if (error) dbError(error, 'Could not load menus');
  return ((data ?? []) as Menu[]).map(toMenu);
}

function publicMenus(menus: Menu[]): Menu[] {
  const byId = new Map(menus.map((menu) => [menu.id, menu]));
  return menus.filter((menu) => isPublicMenu(menu, byId));
}

async function publishedProducts(): Promise<Product[]> {
  const { data, error } = await getSupabase()
    .from('products')
    .select(PRODUCT_COLUMNS)
    .eq('published', 1)
    .order('position', { ascending: true })
    .order('id', { ascending: true });
  if (error) dbError(error, 'Could not load products');
  return ((data ?? []) as ProductRow[]).map(toProduct);
}

function toMessage(row: Message): Message {
  return {
    ...row,
    id: Number(row.id),
    phone: row.phone ?? '',
    subject: row.subject ?? '',
    is_read: Number(row.is_read),
  };
}

/* --------------------------- Public site --------------------------- */

export async function getNavMenus(): Promise<NavMenu[]> {
  const menus = publicMenus(await fetchMenus());
  const { data, error } = await getSupabase()
    .from('products')
    .select('menu_id, name, slug')
    .eq('published', 1)
    .order('position', { ascending: true })
    .order('id', { ascending: true });
  if (error) dbError(error, 'Could not load products');

  const products = (data ?? []) as { menu_id: number; name: string; slug: string }[];
  const allowed = new Set(menus.map((menu) => menu.id));

  const branch = (parentId: number | null): NavMenu[] =>
    menus
      .filter((menu) => menu.parent_id === parentId)
      .sort((a, b) => a.position - b.position || a.id - b.id)
      .map((menu) => ({
        id: menu.id,
        name: menu.name,
        slug: menu.slug,
        products: products
          .filter((product) => allowed.has(Number(product.menu_id)) && Number(product.menu_id) === menu.id)
          .map(({ name, slug }) => ({ name, slug })),
        children: branch(menu.id),
      }));

  return branch(null);
}

export async function getVisibleMenusWithCounts(): Promise<(Menu & { product_count: number })[]> {
  const menus = publicMenus(await fetchMenus());
  const { data, error } = await getSupabase().from('products').select('menu_id').eq('published', 1);
  if (error) dbError(error, 'Could not count products');

  const counts = new Map<number, number>();
  for (const product of (data ?? []) as { menu_id: number }[]) {
    const id = Number(product.menu_id);
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }

  const subtreeCount = (id: number): number => {
    const childIds = menus.filter((menu) => menu.parent_id === id).map((menu) => menu.id);
    return (counts.get(id) ?? 0) + childIds.reduce((sum, childId) => sum + subtreeCount(childId), 0);
  };

  return menus
    .filter((menu) => menu.parent_id == null)
    .sort((a, b) => a.position - b.position || a.id - b.id)
    .map((menu) => ({ ...menu, product_count: subtreeCount(menu.id) }));
}

export async function getCatalog(): Promise<CatalogMenu[]> {
  const menus = publicMenus(await fetchMenus());
  const allowed = new Set(menus.map((menu) => menu.id));
  const products = (await publishedProducts()).filter((product) => allowed.has(product.menu_id));

  const branch = (parentId: number | null): CatalogMenu[] =>
    menus
      .filter((menu) => menu.parent_id === parentId)
      .sort((a, b) => a.position - b.position || a.id - b.id)
      .map((menu) => ({
        ...menu,
        products: products.filter((product) => product.menu_id === menu.id),
        children: branch(menu.id),
      }));

  return branch(null);
}

export function findCatalogMenu(
  nodes: CatalogMenu[],
  slug: string,
  ancestors: { name: string; slug: string }[] = []
): { menu: CatalogMenu; ancestors: { name: string; slug: string }[] } | undefined {
  for (const node of nodes) {
    if (node.slug === slug) return { menu: node, ancestors };
    const found = findCatalogMenu(node.children, slug, [...ancestors, { name: node.name, slug: node.slug }]);
    if (found) return found;
  }
  return undefined;
}

export function countCatalogProducts(menu: CatalogMenu): number {
  return menu.products.length + menu.children.reduce((sum, child) => sum + countCatalogProducts(child), 0);
}

export async function getProduct(menuSlug: string, productSlug: string): Promise<Product | undefined> {
  const { data, error } = await getSupabase()
    .from('products')
    .select(PRODUCT_COLUMNS)
    .eq('slug', productSlug)
    .eq('published', 1)
    .eq('menus.slug', menuSlug)
    .eq('menus.visible', 1)
    .maybeSingle();
  if (error) dbError(error, 'Could not load product');
  if (!data) return undefined;

  const product = toProduct(data as ProductRow);
  const menus = await fetchMenus();
  const byId = new Map(menus.map((menu) => [menu.id, menu]));
  const menu = byId.get(product.menu_id);
  if (!menu || !isPublicMenu(menu, byId) || menu.slug !== menuSlug) return undefined;
  product.menu_ancestors = ancestorChain(menu, byId);
  return product;
}

export async function getHomeProducts(limit = 6): Promise<Product[]> {
  const allowed = new Set(publicMenus(await fetchMenus()).map((menu) => menu.id));
  const products = (await publishedProducts()).filter((product) => allowed.has(product.menu_id));
  const featured = products.filter((product) => product.featured === 1);
  if (featured.length > 0) return featured.slice(0, limit);
  return [...products].sort((a, b) => b.id - a.id).slice(0, limit);
}

/* ------------------------------ Admin ------------------------------ */

export async function getAllMenus(): Promise<AdminMenu[]> {
  const menus = await fetchMenus();
  const { data, error } = await getSupabase().from('products').select('menu_id');
  if (error) dbError(error, 'Could not count products');

  const counts = new Map<number, number>();
  for (const product of (data ?? []) as { menu_id: number }[]) {
    const id = Number(product.menu_id);
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }

  return flattenMenus(menus).map((menu) => {
    const descendants = descendantIds(menus, menu.id);
    const subtree_product_count = [menu.id, ...descendants].reduce(
      (sum, id) => sum + (counts.get(id) ?? 0),
      0
    );
    return {
      ...menu,
      product_count: counts.get(menu.id) ?? 0,
      descendant_count: descendants.length,
      subtree_product_count,
    };
  });
}

export async function getAllProducts(): Promise<Product[]> {
  const { data, error } = await getSupabase()
    .from('products')
    .select(
      'id, menu_id, name, slug, tagline, description, banner, overview, features, pdfs, featured, published, position, created_at, menus!inner(id, name, slug, position)'
    );
  if (error) dbError(error, 'Could not load products');

  const rows = ((data ?? []) as (ProductRow & { menus: MenuEmbed | MenuEmbed[] | null })[]).map(toProduct);
  const menus = new Map<number, { position: number; id: number }>();
  for (const row of (data ?? []) as ProductRow[]) {
    const menu = menuOf(row.menus);
    if (menu?.id != null) menus.set(Number(row.id), { position: Number(menu.position ?? 0), id: Number(menu.id) });
  }

  rows.sort((a, b) => {
    const am = menus.get(a.id);
    const bm = menus.get(b.id);
    return (
      (am?.position ?? 0) - (bm?.position ?? 0) ||
      (am?.id ?? 0) - (bm?.id ?? 0) ||
      a.position - b.position ||
      a.id - b.id
    );
  });
  return rows;
}

export async function getProductById(id: number): Promise<Product | undefined> {
  const { data, error } = await getSupabase()
    .from('products')
    .select(PRODUCT_COLUMNS)
    .eq('id', id)
    .maybeSingle();
  if (error) dbError(error, 'Could not load product');
  return data ? toProduct(data as ProductRow) : undefined;
}

export async function getMessages(): Promise<Message[]> {
  const { data, error } = await getSupabase()
    .from('messages')
    .select('*')
    .order('id', { ascending: false });
  if (error) dbError(error, 'Could not load messages');
  return ((data ?? []) as Message[]).map(toMessage);
}

export async function unreadCount(): Promise<number> {
  const { count, error } = await getSupabase()
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('is_read', 0);
  if (error) dbError(error, 'Could not count unread messages');
  return count ?? 0;
}

export async function countRows(table: 'menus' | 'products' | 'messages'): Promise<number> {
  const { count, error } = await getSupabase().from(table).select('*', { count: 'exact', head: true });
  if (error) dbError(error, `Could not count ${table}`);
  return count ?? 0;
}
