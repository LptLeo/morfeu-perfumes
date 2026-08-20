import React, { useState, useMemo } from 'react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';
import { ProductCategory, StoreData } from '@/types/store';
import { buildWhatsAppUrl } from '@/utils/whatsapp';
import { FilterToolbar } from './FilterToolbar';
import { ProductCard } from './ProductCard';
import styles from './Catalog.module.scss';

interface CatalogProps {
  catalogData: StoreData['catalog'];
  products: StoreData['products'];
  whatsapp: StoreData['storeInfo']['whatsapp'];
}

export const Catalog: React.FC<CatalogProps> = ({
  catalogData,
  products,
  whatsapp,
}) => {
  const [activeFilter, setActiveFilter] = useState<ProductCategory>('todos');

  const filteredProducts = useMemo(() => {
    if (activeFilter === 'todos') {
      return products;
    }
    return products.filter((p) => p.categoria === activeFilter);
  }, [products, activeFilter]);

  const suggestionWaUrl = buildWhatsAppUrl(
    whatsapp.number,
    whatsapp.suggestionMessage
  );

  return (
    <section className={styles.sectionTint} id="catalogo">
      <div className={styles.container}>
        <SectionHeading
          eyebrow={catalogData.eyebrow}
          title={catalogData.title}
          description={catalogData.description}
        />

        <FilterToolbar
          categories={catalogData.categories}
          activeFilter={activeFilter}
          onSelectFilter={setActiveFilter}
        />

        <div className={styles.productGrid}>
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              whatsappNumber={whatsapp.number}
            />
          ))}
        </div>

        <div className={styles.catalogNote}>
          <h3>{catalogData.fallbackNote.title}</h3>
          <p>{catalogData.fallbackNote.description}</p>
          <Button
            variant="outline"
            href={suggestionWaUrl}
            target="_blank"
            className={styles.sugestaoBtn}
          >
            {catalogData.fallbackNote.ctaText}
          </Button>
        </div>
      </div>
    </section>
  );
};
