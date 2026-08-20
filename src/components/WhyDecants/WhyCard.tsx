import React from 'react';
import { ICON_MAP, FlaskIcon } from '@/assets/icons';
import { WhyItem } from '@/types/store';
import styles from './WhyDecants.module.scss';

interface WhyCardProps {
  item: WhyItem;
}

export const WhyCard: React.FC<WhyCardProps> = ({ item }) => {
  // Busca o ícone pelo nome definido no JSON. Se não existir, usa FlaskIcon como padrão.
  const IconComponent = ICON_MAP[item.icon] ?? FlaskIcon;

  return (
    <div className={styles.whyCard}>
      <div className={styles.whyIcon}>
        <IconComponent />
      </div>
      <h3>{item.title}</h3>
      <p>{item.description}</p>
    </div>
  );
};
