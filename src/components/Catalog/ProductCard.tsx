import React, { useRef, useEffect, useState } from 'react';
import { Product } from '@/types/store';
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
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, whatsappNumber }) => {
  const [showScrollHint, setShowScrollHint] = useState(false);
  const sizesRef = useRef<HTMLDivElement>(null);

  // Detecta necessidade de scroll hint (após layout)
  useEffect(() => {
    if (!sizesRef.current) return;
    const el = sizesRef.current;
    const needsScroll = el.scrollWidth > el.clientWidth + 4;
    setShowScrollHint(needsScroll);
  }, []);

  return (
    <article className={styles.productCard}>
      <div className={styles.productMedia}>
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={`${product.name} — ${product.brand}`}
            loading="lazy"
            style={{
              objectFit: 'cover',
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
            ref={sizesRef}
            className={styles.productSizes}
            role="group"
            aria-label={`Escolha o tamanho do decant ${product.name}`}
          >
            {product.sizes.map((s) => (
              <button
                key={`${s.size}-${s.priceCents}`}
                type="button"
                className={styles.productSizeRow}
                aria-pressed={false}
                onClick={() => {}}
                disabled
              >
                <span className={styles.sz}>{s.size}</span>
                <span className={styles.pr}>
                  {typeof s.priceCents === 'number'
                    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(s.priceCents / 100)
                    : 'Preço sob consulta'}
                </span>
              </button>
            ))}
            {/* Indicador de scroll quando necessário */}
            {showScrollHint && (
              <button
                type="button"
                className={styles.scrollHint}
                aria-label="Rolar tamanhos"
                onClick={() => {
                  const el = sizesRef.current;
                  if (el) {
                    const step = Math.min(el.clientWidth, 200);
                    el.scrollBy({ left: step, behavior: 'smooth' });
                    setShowScrollHint(false);
                  }
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v4l2 2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>
        ) : (
          <p className={styles.productPriceNote}>
            Tamanhos e preços sob consulta pelo WhatsApp.
          </p>
        )}

        <div className={styles.productFooter}>
          <a
            className={styles.whatsappLink}
            href={buildWhatsAppUrl(whatsappNumber, buildProductMessage(product, product.sizes?.[0]))}
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M20.52 3.48A11.924 11.924 0 0 1 12 22.08c-5.68 0-10.5-4.14-11.52-9.52a11.88 11.88 0 0 1 3.54-7.08 11.92 11.92 0 0 1 14.46 7.56 11.95 11.95 0 0 1-.54 7.5c-1.62 2.94-3.66 5.34-7.92 5.34-2.34 0-4.38-.96-6.12-2.58L2.04 21.96l5.16-1.44c-2.28-1.32-3.84-3.48-4.98-6.18a11.92 11.92 0 0 1 7.5-11.46 11.92 11.92 0 0 1 11.46 7.5c1.98 2.46 2.64 5.52 1.74 7.56-.6 1.2-1.8 2.16-3.36 2.76-2.22.84-4.92.84-7.14 0-1.26-.48-2.58-1.38-3.54-2.46-2.16-2.46-3.78-5.34-3.54-8.1.36-1.74 2.28-3.36 4.8-3.42a11.95 11.95 0 0 1 6.84 1.8z"/>
            </svg>
            Encomendar no WhatsApp
          </a>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;