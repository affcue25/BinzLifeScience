import Link from 'next/link';
import AdminForm from '@/components/admin/AdminForm';
import DeleteForm from '@/components/admin/DeleteForm';
import { CheckField, SelectField, TextArea, TextField } from '@/components/admin/Fields';
import { createMenu, deleteMenu, updateMenu } from '@/lib/actions/menus';
import { descendantIds } from '@/lib/menu-tree';
import { getAllMenus, type AdminMenu } from '@/lib/queries';

export const dynamic = 'force-dynamic';

function parentOptions(menus: AdminMenu[], excludeId?: number) {
  const blocked = new Set<number>();
  if (excludeId) {
    blocked.add(excludeId);
    for (const id of descendantIds(menus, excludeId)) blocked.add(id);
  }
  return [
    { value: 0, label: 'None — top level' },
    ...menus
      .filter((menu) => !blocked.has(menu.id))
      .map((menu) => ({
        value: menu.id,
        label: `${menu.depth ? `${'— '.repeat(menu.depth)}` : ''}${menu.name}`,
      })),
  ];
}

function deleteWarning(menu: AdminMenu) {
  const bits: string[] = [];
  if (menu.descendant_count) {
    bits.push(`${menu.descendant_count} submenu${menu.descendant_count === 1 ? '' : 's'}`);
  }
  if (menu.subtree_product_count) {
    bits.push(`${menu.subtree_product_count} product${menu.subtree_product_count === 1 ? '' : 's'}`);
  }
  const extra = bits.length ? `, including ${bits.join(' and ')}` : '';
  return `Delete the menu "${menu.name}"${extra}? This cannot be undone.`;
}

function MenuCard({ menu, menus }: { menu: AdminMenu; menus: AdminMenu[] }) {
  const children = menus.filter((item) => item.parent_id === menu.id);
  return (
    <div className="adm-branch" style={{ marginLeft: menu.depth ? '1.25rem' : 0 }}>
      <div className="adm-card">
        <div className="adm-head" style={{ marginBottom: '0.75rem' }}>
          <h2 style={{ margin: 0 }}>
            {menu.depth > 0 && <span className="adm-kicker">Submenu · </span>}
            {menu.name}
          </h2>
          <span className={menu.visible ? 'adm-pill ok' : 'adm-pill off'}>
            {menu.visible ? 'Visible' : 'Hidden'}
          </span>
        </div>

        <AdminForm action={updateMenu.bind(null, menu.id)} submitLabel="Save menu">
          <TextField name="name" label="Menu name" defaultValue={menu.name} required />
          <SelectField
            name="parent_id"
            label="Inside menu"
            defaultValue={menu.parent_id ?? 0}
            options={parentOptions(menus, menu.id)}
            hint="Choose a parent to make this a submenu. Nesting can go as deep as you need."
          />
          <TextField name="slug" label="Web address" defaultValue={menu.slug} hint={`Appears as /products/${menu.slug}`} />
          <TextArea name="description" label="Short description" defaultValue={menu.description} rows={2} />
          <TextField name="position" label="Order" type="number" defaultValue={menu.position} />
          <CheckField
            name="visible"
            label="Visible on the website"
            defaultChecked={menu.visible === 1}
            hint="A submenu stays off the website when a menu above it is hidden."
          />
        </AdminForm>

        <div className="adm-row-actions" style={{ marginTop: '0.5rem' }}>
          <Link href="/admin/products" className="adm-btn">
            {menu.product_count} {menu.product_count === 1 ? 'product' : 'products'}
          </Link>
          <DeleteForm action={deleteMenu.bind(null, menu.id)} label="Delete menu" confirmText={deleteWarning(menu)} />
        </div>
      </div>

      {children.map((child) => (
        <MenuCard key={child.id} menu={child} menus={menus} />
      ))}
    </div>
  );
}

export default async function MenusPage() {
  const menus = await getAllMenus();
  const roots = menus.filter((menu) => menu.parent_id == null);

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Menus</h1>
          <p>Each menu can contain products and more menus. A submenu can contain its own submenus, with no limit on depth.</p>
        </div>
      </div>

      <div className="adm-card">
        <h2>Add a menu</h2>
        <AdminForm action={createMenu} submitLabel="Add menu">
          <TextField name="name" label="Menu name" required placeholder="e.g. Crop Nutrition" />
          <SelectField
            name="parent_id"
            label="Inside menu"
            defaultValue={0}
            options={parentOptions(menus)}
            hint="Leave this as top level, or place the new menu inside an existing one."
          />
          <TextArea name="description" label="Short description (optional)" rows={2} />
          <TextField name="position" label="Order" type="number" defaultValue={0} hint="Lower numbers appear first." />
        </AdminForm>
      </div>

      {menus.length === 0 && <p className="adm-empty">No menus yet. Add your first menu above.</p>}

      {roots.map((menu) => (
        <MenuCard key={menu.id} menu={menu} menus={menus} />
      ))}
    </>
  );
}
