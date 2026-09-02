import React, { useState, useEffect, useCallback } from 'react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';
import { Product } from '@/types/store';
import { buildWhatsAppUrl } from '@/utils/whatsapp';
import { FilterToolbar } from './FilterToolbar';
import { ProductCard } from './ProductCard';
import { listProducts, listCategories, isFirebaseConfigured } from '@/lib/productsRepository';
import styles from './Catalog.module.scss';

interface CatalogProps {
  catalogData: {
    eyebrow: string;
    title: string;
    description: string;
    fallbackNote: { title: string; description: string; ctaText: string };
  };
  whatsapp: { number: string; suggestionMessage: string; productMessage?: string };
}

interface State {
  status: 'loading' | 'error' | 'ready';
  products: Product[];
  categories: string[];
  error?: string;
}

export const Catalog: React.FC<CatalogProps> = ({ catalogData, whatsapp }) => {
  const [state, setState] = useState<State>({
    status: isFirebaseConfigured() ? 'loading' : 'error',
    products: [],
    categories: ['Todos'],
    error: isFirebaseConfigured() ? undefined : 'Firebase não configurado',
  });

  const [activeFilter, setActiveFilter] = useState('Todos');

  // Carrega produtos e categorias do Firestore
  const load = useCallback(async () => {
    try {
      const [products, categories] = await Promise.all([
        listProducts(),
        listCategories(),
      ]);
      setState({ status: 'ready', products, categories, error: undefined });
    } catch (err) {
      setState((s) => ({
        status: 'error',
        products: s.products, // mantém o que tinha (pode ser vazio no primeiro load)
        categories: s.categories,
        error: err instanceof Error ? err.message : 'Falha ao carregar catálogo',
      }));
    }
  }, []);

  // Carrega na montagem
  useEffect(() => {
    if (isFirebaseConfigured()) {
      load();
    }
  }, [load]);

  // Filtro
  const filteredProducts = state.products.filter((p) =>
    activeFilter === 'Todos' || p.category === activeFilter
  );

  const suggestionWaUrl = buildWhatsAppUrl(
    whatsapp.number,
    whatsapp.suggestionMessage
  );

  if (state.status === 'error') {
    return (
      <section className={styles.sectionTint} id="catalogo">
        <div className={styles.container}>
          <SectionHeading
            eyebrow={catalogData.eyebrow}
            title={catalogData.title}
            description={catalogData.description}
          />
          <div className={styles.errorState}>
            <p>{state.error}</p>
            <Button variant="outline" onClick={load}>
              Tentar novamente
            </Button>
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
  }

  // Skeleton / Loading
  if (state.status === 'loading') {
    return (
      <section className={styles.sectionTint} id="catalogo">
        <div className={styles.container}>
          <SectionHeading
            eyebrow={catalogData.eyebrow}
            title={catalogData.title}
            description={catalogData.description}
          />
          <div className={styles.filtersWrap}>
            <FilterToolbar categories={['Todos']} activeFilter="Todos" onSelectFilter={() => {}} disabled />
          </div>
          <div className={styles.productGrid}>
            {[...Array(9)].map((_, i) => (
              <div key={i} className={styles.skeletonCard}>
                <div className={styles.skeletonMedia} />
                <div className={styles.skeletonTitle} />
                <div className={styles.skeletonSizes}>
                  <div className={styles.skeletonRow} />
                  <div className={styles.skeletonRow} />
                  <div className={styles.skeletonRow} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Ready
  const suggestionWaUrlReady = buildWhatsAppUrl(
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

        <div className={styles.filtersWrap}>
          <FilterToolbar
            categories={state.categories}
            activeFilter={activeFilter}
            onSelectFilter={setActiveFilter}
          />
        </div>

        <div className={styles.productGrid}>
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              whatsappNumber={whatsapp.number}
              productMessageTemplate={whatsapp.productMessage}
            />
          ))}
        </div>

        <div className={styles.catalogNote}>
          <h3>{catalogData.fallbackNote.title}</h3>
          <p>{catalogData.fallbackNote.description}</p>
          <Button
            variant="outline"
            href={suggestionWaUrlReady}
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

export default Catalog;