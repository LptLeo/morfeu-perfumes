import React from 'react';
import { Button } from '@/components/ui/Button';
import { WhatsAppIcon, CheckIcon } from '@/assets/icons';
import { StoreData, ImageWithFocus } from '@/types/store';
import { buildWhatsAppUrl } from '@/utils/whatsapp';
import styles from './Hero.module.scss';

interface HeroProps {
  data: StoreData['hero'];
  whatsapp: StoreData['storeInfo']['whatsapp'];
}

const getImageUrl = (image: ImageWithFocus | undefined): string | null => {
  if (!image?.url) return null;
  const url = image.url;
  return url.startsWith('/') ? url : `/${url}`;
};

const getObjectPosition = (image: ImageWithFocus | undefined): string => {
  if (!image?.focus) return '50% 50%';
  return `${image.focus.x}% ${image.focus.y}%`;
};

const getTransform = (image: ImageWithFocus | undefined): string => {
  if (!image?.focus) return 'scale(1)';
  return `scale(${image.focus.zoom})`;
};

export const Hero: React.FC<HeroProps> = ({ data, whatsapp }) => {
  const waUrl = buildWhatsAppUrl(whatsapp.number, whatsapp.defaultMessage);

  // Render title with emphasis word highlighted
  const renderTitle = (title: string, emphasis: string) => {
    if (!emphasis || !title.includes(emphasis)) {
      return <span>{title}</span>;
    }
    const parts = title.split(emphasis);
    return (
      <>
        {parts[0]}
        <em>{emphasis}</em>
        {parts[1]}
      </>
    );
  };

  const heroImageUrl = getImageUrl(data.image);
  const heroLogoUrl = getImageUrl(data.logoImage);

  return (
    <section className={styles.hero} id="topo">
      <div className={styles.container}>
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}>{data.eyebrow}</span>
          <h1 className={styles.title}>
            {renderTitle(data.title, data.titleEmphasis)}
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
          {heroImageUrl ? (
            <img
              className={styles.heroImg}
              src={heroImageUrl}
              alt="Decants de perfumes Elixir n°7"
              style={{
                objectPosition: getObjectPosition(data.image),
                transform: getTransform(data.image),
              }}
            />
          ) : heroLogoUrl ? (
            <img
              className={styles.heroLogo}
              src={heroLogoUrl}
              alt="Logomarca Elixir n°7"
              style={{
                objectPosition: getObjectPosition(data.logoImage),
                transform: getTransform(data.logoImage),
              }}
            />
          ) : (
            <span className={styles.heroFallback}>{data.fallbackText}</span>
          )}
        </div>
      </div>
    </section>
  );
};
