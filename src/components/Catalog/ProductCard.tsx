import React from 'react';
import { Button } from '@/components/ui/Button';
import { Product } from '@/types/store';
import { buildProductMessage, buildWhatsAppUrl } from '@/utils/whatsapp';
import styles from './Catalog.module.scss';

interface ProductCardProps {
  product: Product;
  whatsappNumber: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, whatsappNumber }) => {
  const message = buildProductMessage(product);
  const waUrl = buildWhatsAppUrl(whatsappNumber, message);

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
          <span className={styles.phLabel}>
            FOTO DO PRODUTO
            <br />
            (envie a imagem para substituir)
          </span>
        )}
        {product.genero && (
          <span className={styles.productBadge}>{product.genero}</span>
        )}
      </div>

      <div className={styles.productBody}>
        <span className={styles.productBrand}>{product.brand || '[Marca]'}</span>
        <h3 className={styles.productName}>{product.name || '[Nome do perfume]'}</h3>

        {product.description && (
          <p className={styles.productDesc}>{product.description}</p>
        )}

        {product.sizes && product.sizes.length > 0 ? (
          <div className={styles.productSizes}>
            {product.sizes.map((s, idx) => (
              <div key={idx} className={styles.productSizeRow}>
                <span className={styles.sz}>{s.size}</span>
                <span className={styles.pr}>{s.price}</span>
              </div>
            ))}
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
