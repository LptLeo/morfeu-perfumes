import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Product, ProductSize } from '@/types/store';
import { buildProductMessage, buildWhatsAppUrl } from '@/utils/whatsapp';
import styles from './Catalog.module.scss';

const CATEGORY_LABEL: Record<Product['categoria'], string> = {
  importado: 'Importado',
  arabe: 'Árabe',
  nacional: 'Nacional',
};

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter((word) => /^[a-zA-ZÀ-ÿ]/.test(word))
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');
}

interface ProductCardProps {
  product: Product;
  whatsappNumber: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, whatsappNumber }) => {
  const hasSizes = Boolean(product.sizes && product.sizes.length > 0);
  const [selectedSize, setSelectedSize] = useState<ProductSize | undefined>(
    hasSizes ? product.sizes[0] : undefined
  );

  const message = buildProductMessage(product, selectedSize);
  const waUrl = buildWhatsAppUrl(whatsappNumber, message);

  const genderLabel = product.genero
    ? product.genero.charAt(0).toUpperCase() + product.genero.slice(1)
    : null;

  return (
    <article className={styles.productCard}>
      <div className={styles.productMedia}>
        {product.image ? (
          <img
            src={product.image.startsWith('/') ? product.image : `/${product.image}`}
            alt={`${product.name} — ${product.brand}`}
            loading="lazy"
          />
        ) : (
          <span className={styles.phMonogram} aria-hidden="true">
            {getInitials(product.name)}
          </span>
        )}
        <span className={styles.productBadge}>{CATEGORY_LABEL[product.categoria]}</span>
      </div>

      <div className={styles.productBody}>
        <div className={styles.productBrandRow}>
          <span className={styles.productBrand}>{product.brand || '[Marca]'}</span>
          {genderLabel && <span className={styles.productGender}>· {genderLabel}</span>}
        </div>
        <h3 className={styles.productName}>{product.name || '[Nome do perfume]'}</h3>

        {product.description && (
          <p className={styles.productDesc}>{product.description}</p>
        )}

        {hasSizes ? (
          <div
            className={styles.productSizes}
            role="group"
            aria-label={`Escolha o tamanho do decant ${product.name}`}
          >
            {product.sizes.map((s, idx) => {
              const isSelected = selectedSize === s;
              return (
                <button
                  key={idx}
                  type="button"
                  className={styles.productSizeRow}
                  aria-pressed={isSelected}
                  onClick={() => setSelectedSize(s)}
                >
                  <span className={styles.sz}>{s.size}</span>
                  <span className={styles.pr}>{s.price}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <p className={styles.productPriceNote}>
            Tamanhos e preços sob consulta pelo WhatsApp.
          </p>
        )}

        <div className={styles.productFooter}>
          <Button
            variant="primary"
            href={waUrl}
            target="_blank"
            isBlock
            isCompact
          >
            Comprar pelo WhatsApp
          </Button>
        </div>
      </div>
    </article>
  );
};
