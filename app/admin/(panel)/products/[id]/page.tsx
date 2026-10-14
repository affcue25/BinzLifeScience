import Link from 'next/link';
import { notFound } from 'next/navigation';
import ProductForm from '@/components/admin/ProductForm';
import { getAllMenus, getProductById } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const { id } = await params;
  const { created } = await searchParams;

  const product = await getProductById(Number(id));
  if (!product) notFound();

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Edit product</h1>
          <p>
            <Link href="/admin/products">&larr; All products</Link>
          </p>
        </div>
        {product.published === 1 && (
          <a
            href={`/products/${product.menu_slug}/${product.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="adm-btn"
          >
            View on website &#8599;
          </a>
        )}
      </div>

      {created && <div className="adm-notice">Product created.</div>}

      <ProductForm product={product} menus={await getAllMenus()} />
    </>
  );
}
