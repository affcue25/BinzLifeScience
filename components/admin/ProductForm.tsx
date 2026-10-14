import { saveProduct } from '@/lib/actions/products';
import type { AdminMenu, Product } from '@/lib/queries';
import AdminForm from './AdminForm';
import { CheckField, RICH_HINT, SelectField, Section, TextArea, TextField } from './Fields';
import ImageField from './ImageField';
import ListField from './ListField';
import PdfField from './PdfField';

export default function ProductForm({ product, menus }: { product?: Product; menus: AdminMenu[] }) {
  return (
    <AdminForm action={saveProduct} submitLabel={product ? 'Save product' : 'Create product'}>
      {product && <input type="hidden" name="id" value={product.id} />}

      <Section title="Basics">
        <SelectField
          name="menu_id"
          label="Menu"
          defaultValue={product?.menu_id ?? menus[0]?.id}
          options={menus.map((m) => ({
            value: m.id,
            label: `${m.depth ? `${'— '.repeat(m.depth)}` : ''}${m.name}`,
          }))}
        />
        <TextField name="name" label="Product name" defaultValue={product?.name} required />
        <TextField
          name="slug"
          label="Web address (optional)"
          defaultValue={product?.slug}
          hint="Leave empty to create it from the product name."
        />
        <TextField
          name="tagline"
          label="Short tagline"
          defaultValue={product?.tagline}
          hint="One line shown under the name and on product cards."
        />
      </Section>

      <Section title="Banner and description">
        <ImageField
          name="banner"
          label="Banner image"
          initial={product?.banner}
          hint="Wide image shown at the top of the product page (about 1600 x 500 px works well)."
        />
        <TextArea
          name="description"
          label="Description"
          defaultValue={product?.description}
          rows={6}
          hint={RICH_HINT}
        />
        <PdfField
          name="pdfs"
          label="PDF files"
          initial={product?.pdfs ?? []}
          hint="Datasheets, labels or brochures. Shown next to the Contact Us button."
        />
      </Section>

      <Section title="Tabs">
        <TextArea
          name="overview"
          label="Overview tab"
          defaultValue={product?.overview}
          rows={10}
          hint={RICH_HINT}
        />
        <ListField
          name="features"
          label="Key Features tab"
          initial={product?.features ?? []}
          fields={[
            { key: 'title', label: 'Feature' },
            { key: 'text', label: 'Details', multiline: true },
          ]}
          addLabel="Add feature"
        />
      </Section>

      <Section title="Visibility">
        <CheckField
          name="published"
          label="Published"
          defaultChecked={product ? product.published === 1 : true}
          hint="Untick to hide this product from the website."
        />
        <CheckField
          name="featured"
          label="Show on homepage"
          defaultChecked={product ? product.featured === 1 : false}
        />
        <TextField
          name="position"
          label="Order"
          type="number"
          defaultValue={product?.position ?? 0}
          hint="Lower numbers appear first."
        />
      </Section>
    </AdminForm>
  );
}
