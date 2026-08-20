import React from 'react';
import { FaqItemData } from '@/types/store';
import styles from './Faq.module.scss';

interface FaqItemProps {
  item: FaqItemData;
  isOpen: boolean;
  onToggle: () => void;
}

export const FaqItem: React.FC<FaqItemProps> = ({ item, isOpen, onToggle }) => {
  return (
    <div className={`${styles.faqItem} ${isOpen ? styles.open : ''}`}>
      <button
        type="button"
        className={styles.faqQ}
        aria-expanded={isOpen}
        onClick={onToggle}
      >
        <span>{item.question}</span>
        <span className={styles.plus} aria-hidden="true">+</span>
      </button>

      {/* A animação é feita por CSS com grid-template-rows — sem necessidade de useRef */}
      <div className={styles.faqA}>
        <div className={styles.faqAInner}>{item.answer}</div>
      </div>
    </div>
  );
};
