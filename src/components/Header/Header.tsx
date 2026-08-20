import React from 'react';
import { Button } from '@/components/ui/Button';
import { StoreInfo } from '@/types/store';
import { buildWhatsAppUrl } from '@/utils/whatsapp';
import styles from './Header.module.scss';

interface HeaderProps {
  storeInfo: StoreInfo;
}

export const Header: React.FC<HeaderProps> = ({ storeInfo }) => {
  const waUrl = buildWhatsAppUrl(
    storeInfo.whatsapp.number,
    storeInfo.whatsapp.defaultMessage
  );

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <a href="#topo" className={styles.brand} aria-label={storeInfo.name}>
          <div className={styles.brandIcon}>E7</div>
          <span className={styles.brandWord}>
            <span className={styles.brandName}>{storeInfo.name}</span>
            <span className={styles.brandTag}>{storeInfo.tagline}</span>
          </span>
        </a>

        <nav className={styles.navLinks} aria-label="Navegação principal">
          <a href="#por-que">Por que decants</a>
          <a href="#catalogo">Catálogo</a>
          <a href="#como-funciona">Como funciona</a>
          <a href="#depoimentos">Avaliações</a>
          <a href="#faq">Dúvidas</a>
        </nav>

        <Button
          variant="gold"
          href={waUrl}
          target="_blank"
          className={styles.headerCta}
        >
          Falar no WhatsApp
        </Button>
      </div>
    </header>
  );
};
