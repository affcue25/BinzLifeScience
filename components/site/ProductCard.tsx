import Link from 'next/link';
import type { Product } from '@/lib/queries';

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.menu_slug}/${product.slug}`} className="product-card">
      <div className="product-card-media">
        {product.banner ? (
          <img src={product.banner} alt={product.name} loading="lazy" />
        ) : (
          <div className="ph" aria-hidden="true">
            {product.name.charAt(0)}
          </div>
        )}
      </div>
      <div className="product-card-body">
        <span className="tag">{product.menu_name}</span>
        <h3>{product.name}</h3>
        {product.tagline && <p>{product.tagline}</p>}
        <span className="more">View product &rarr;</span>
      </div>
    </Link>
  );
}
