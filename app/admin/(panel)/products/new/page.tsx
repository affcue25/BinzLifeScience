import Link from 'next/link';
import ProductForm from '@/components/admin/ProductForm';
import { getAllMenus } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export default async function NewProductPage() {
  const menus = await getAllMenus();

  if (menus.length === 0) {
    return (
      <>
        <div className="adm-head">
          <h1>Add product</h1>
        </div>
        <p className="adm-empty">
          Products live inside menus. <Link href="/admin/menus">Create a menu</Link> first.
        </p>
      </>
    );
  }

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Add product</h1>
          <p>
            <Link href="/admin/products">&larr; All products</Link>
          </p>
        </div>
      </div>
      <ProductForm menus={menus} />
    </>
  );
}
