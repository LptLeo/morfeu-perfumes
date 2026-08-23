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
          {data.image ? (
            <img
              className={styles.heroImg}
              src={data.image.startsWith('/') ? data.image : `/${data.image}`}
              alt="Decants de perfumes Elixir n°7"
            />
          ) : data.logoImage ? (
            <img
              className={styles.heroLogo}
              src={data.logoImage.startsWith('/') ? data.logoImage : `/${data.logoImage}`}
              alt="Logomarca Elixir n°7"
            />
          ) : (
            <span className={styles.heroFallback}>{data.fallbackText}</span>
          )}
        </div>
      </div>
    </section>
  );
};
