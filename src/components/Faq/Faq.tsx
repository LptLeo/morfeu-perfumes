import React, { useState } from 'react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { StoreData } from '@/types/store';
import { FaqItem } from './FaqItem';
import styles from './Faq.module.scss';

interface FaqProps {
  data: StoreData['faq'];
}

export const Faq: React.FC<FaqProps> = ({ data }) => {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <section className={styles.sectionTint} id="faq">
      <div className={styles.container}>
        <SectionHeading eyebrow={data.eyebrow} title={data.title} />

        <div className={styles.faqList} id="faq-list">
          {data.items.map((item) => (
            <FaqItem
              key={item.id}
              item={item}
              isOpen={Boolean(openItems[item.id])}
              onToggle={() => toggleItem(item.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
