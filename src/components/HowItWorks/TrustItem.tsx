import React from 'react';
import { ICON_MAP, ShieldCheckIcon } from '@/assets/icons';
import { TrustItemData } from '@/types/store';
import styles from './HowItWorks.module.scss';

interface TrustItemProps {
  item: TrustItemData;
}

export const TrustItem: React.FC<TrustItemProps> = ({ item }) => {
  // Busca o ícone pelo nome definido no JSON. Se não existir, usa ShieldCheckIcon como padrão.
  const IconComponent = ICON_MAP[item.icon] ?? ShieldCheckIcon;

  return (
    <div className={styles.trustItem}>
      <IconComponent />
      <div>
        <h4>{item.title}</h4>
        <p>{item.description}</p>
      </div>
    </div>
  );
};
