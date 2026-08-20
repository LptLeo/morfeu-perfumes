import React from 'react';
import { Button } from '@/components/ui/Button';
import { StoreData } from '@/types/store';
import { buildWhatsAppUrl } from '@/utils/whatsapp';
import styles from './Footer.module.scss';

interface FooterProps {
  footerData: StoreData['footer'];
  whatsapp: StoreData['storeInfo']['whatsapp'];
}

export const Footer: React.FC<FooterProps> = ({ footerData, whatsapp }) => {
  const currentYear = new Date().getFullYear();
  const waUrl = buildWhatsAppUrl(whatsapp.number, whatsapp.defaultMessage);

  return (
    <footer className={styles.siteFooter}>
      <div className={styles.container}>
        <div className={styles.footerTop}>
          <div>
            <div className={styles.footerBrand}>{footerData.brand}</div>
            <p className={styles.footerNote}>{footerData.description}</p>
          </div>
          <Button
            variant="outline"
            href={waUrl}
            target="_blank"
            className={styles.footerCta}
          >
            {footerData.buttonText}
          </Button>
        </div>

        <div className={styles.footerBottom}>
          <span>
            © {currentYear} {footerData.bottomTextLeft}
          </span>
          <span>{footerData.bottomTextRight}</span>
        </div>
      </div>
    </footer>
  );
};
