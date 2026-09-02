import React, { useState } from 'react';
import { Product, ProductSize } from '@/types/store';
import { buildProductMessage, buildWhatsAppUrl } from '@/utils/whatsapp';
import styles from './Catalog.module.scss';

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
  productMessageTemplate?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, whatsappNumber, productMessageTemplate }) => {
  const [selectedSizes, setSelectedSizes] = useState<ProductSize[]>([]);

  const toggleSize = (size: ProductSize) => {
    setSelectedSizes((prev) =>
      prev.some((s) => s.size === size.size && s.priceCents === size.priceCents)
        ? prev.filter((s) => s !== size)
        : [...prev, size],
    );
  };

  return (
    <article className={styles.productCard}>
      <div className={styles.productMedia}>
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={`${product.name} — ${product.brand}`}
            loading="lazy"
            style={{
              objectFit:
                product.imageFocus?.zoom && product.imageFocus.zoom < 1
                  ? 'contain'
                  : product.imageFocus?.fitMode ?? 'contain',
              objectPosition:
                product.imageFocus
                  ? `${product.imageFocus.x * 100}% ${product.imageFocus.y * 100}%`
                  : 'center',
              transform: product.imageFocus?.zoom
                ? `scale(${product.imageFocus.zoom})`
                : undefined,
            }}
          />
        ) : (
          <span className={styles.phMonogram} aria-hidden="true">
            {getInitials(product.name)}
          </span>
        )}
        <span className={styles.productBadge}>{product.category || 'Produto'}</span>
      </div>

      <div className={styles.productBody}>
        <div className={styles.productBrandRow}>
          <span className={styles.productBrand}>{product.brand || '[Marca]'}</span>
          {product.genero && (
            <span className={styles.productGender}>
              · {product.genero.charAt(0).toUpperCase() + product.genero.slice(1)}
            </span>
          )}
        </div>
        <h3 className={styles.productName}>{product.name || '[Nome do perfume]'}</h3>

        {product.description && (
          <p className={styles.productDesc}>{product.description}</p>
        )}

        {product.sizes && product.sizes.length > 0 ? (
          <div
            className={styles.productSizes}
            role="group"
            aria-label={`Escolha o tamanho do decant ${product.name}`}
          >
            {product.sizes.map((s) => {
              const isSelected = selectedSizes.some((sel) => sel.size === s.size && sel.priceCents === s.priceCents);
              return (
                <button
                  key={`${s.size}-${s.priceCents}`}
                  type="button"
                  className={`${styles.productSizeRow} ${isSelected ? styles.selected : ''}`}
                  aria-pressed={isSelected}
                  onClick={() => toggleSize(s)}
                >
                  <span className={styles.sz}>{s.size}</span>
                  <span className={styles.pr}>
                    {typeof s.priceCents === 'number'
                      ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(s.priceCents / 100)
                      : 'Preço sob consulta'}
                  </span>
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
          <a
            className={styles.whatsappLink}
            href={buildWhatsAppUrl(whatsappNumber, buildProductMessage(product, selectedSizes.length > 0 ? selectedSizes : product.sizes?.length ? [product.sizes[0]] : undefined, productMessageTemplate))}
            target="_blank"
            rel="noopener noreferrer"
          >
            Encomendar no WhatsApp
          </a>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;