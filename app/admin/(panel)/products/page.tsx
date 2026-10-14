import Link from 'next/link';
import DeleteForm from '@/components/admin/DeleteForm';
import { deleteProduct } from '@/lib/actions/products';
import { getAllMenus, getAllProducts } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  const [products, menus] = await Promise.all([getAllProducts(), getAllMenus()]);
  const hasMenus = menus.length > 0;

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Products</h1>
          <p>Create products inside your menus.</p>
        </div>
        {hasMenus ? (
          <Link href="/admin/products/new" className="adm-btn primary">
            + Add product
          </Link>
        ) : (
          <Link href="/admin/menus" className="adm-btn primary">
            Create a menu first
          </Link>
        )}
      </div>

      {products.length === 0 ? (
        <p className="adm-empty">No products yet.</p>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Menu</th>
                <th>Status</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>
                    <strong>{p.name}</strong>
                    {p.tagline && (
                      <div style={{ color: 'var(--a-muted)', fontSize: '0.85rem' }}>{p.tagline}</div>
                    )}
                  </td>
                  <td>{p.menu_name}</td>
                  <td>
                    <span className={p.published ? 'adm-pill ok' : 'adm-pill off'}>
                      {p.published ? 'Published' : 'Hidden'}
                    </span>{' '}
                    {p.featured === 1 && <span className="adm-pill">Homepage</span>}
                  </td>
                  <td>
                    <div className="adm-row-actions">
                      <Link href={`/admin/products/${p.id}`} className="adm-btn small">
                        Edit
                      </Link>
                      <DeleteForm
                        action={deleteProduct.bind(null, p.id)}
                        confirmText={`Delete "${p.name}"? This cannot be undone.`}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
