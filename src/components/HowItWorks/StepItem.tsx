import React from 'react';
import { StepItemData } from '@/types/store';
import styles from './HowItWorks.module.scss';

interface StepItemProps {
  item: StepItemData;
}

export const StepItem: React.FC<StepItemProps> = ({ item }) => {
  return (
    <div className={styles.step}>
      <span className={styles.stepNum}>{item.step}</span>
      <div>
        <h3>{item.title}</h3>
        <p>{item.description}</p>
      </div>
    </div>
  );
};
