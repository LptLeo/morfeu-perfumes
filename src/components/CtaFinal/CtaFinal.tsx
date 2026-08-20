import React from 'react';
import { Button } from '@/components/ui/Button';
import { StoreData } from '@/types/store';
import { buildWhatsAppUrl } from '@/utils/whatsapp';
import styles from './CtaFinal.module.scss';

interface CtaFinalProps {
  data: StoreData['ctaFinal'];
  whatsapp: StoreData['storeInfo']['whatsapp'];
}

export const CtaFinal: React.FC<CtaFinalProps> = ({ data, whatsapp }) => {
  const waUrl = buildWhatsAppUrl(whatsapp.number, whatsapp.defaultMessage);

  return (
    <section className={styles.ctaFinal}>
      <div className={styles.container}>
        <h2>{data.title}</h2>
        <p>{data.description}</p>
        <Button
          variant="gold"
          href={waUrl}
          target="_blank"
          className={styles.ctaBtn}
        >
          {data.buttonText}
        </Button>
      </div>
    </section>
  );
};
