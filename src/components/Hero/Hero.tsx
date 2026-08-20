import React from 'react';
import { Button } from '@/components/ui/Button';
import { WhatsAppIcon, CheckIcon } from '@/assets/icons';
import { StoreData } from '@/types/store';
import { buildWhatsAppUrl } from '@/utils/whatsapp';
import styles from './Hero.module.scss';

interface HeroProps {
  data: StoreData['hero'];
  whatsapp: StoreData['storeInfo']['whatsapp'];
}

export const Hero: React.FC<HeroProps> = ({ data, whatsapp }) => {
  const waUrl = buildWhatsAppUrl(whatsapp.number, whatsapp.defaultMessage);

  return (
    <section className={styles.hero} id="topo">
      <div className={styles.container}>
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}>{data.eyebrow}</span>
          <h1 className={styles.title}>
            Descubra seu próximo perfume favorito <em>{data.titleEmphasis}</em> de investir no frasco inteiro.
          </h1>
          <p className={styles.lede}>{data.description}</p>

          <div className={styles.heroActions}>
            <Button
              variant="primary"
              href={waUrl}
              target="_blank"
              icon={<WhatsAppIcon size={18} />}
            >
              {data.primaryCta}
            </Button>
            <Button variant="outline" href="#catalogo">
              {data.secondaryCta}
            </Button>
          </div>

          <ul className={styles.heroTrust}>
            {data.trustBadges.map((badge, idx) => (
              <li key={idx}>
                <CheckIcon size={16} />
                <span>{badge}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.heroVisual}>
          <span className={styles.phLabel}>
            FOTO DOS DECANTS / FRASCOS
            <br />
            (envie as imagens para substituir este espaço)
          </span>
        </div>
      </div>
    </section>
  );
};
