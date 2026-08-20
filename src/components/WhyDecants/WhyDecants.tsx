import React from 'react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { StoreData } from '@/types/store';
import { WhyCard } from './WhyCard';
import styles from './WhyDecants.module.scss';

interface WhyDecantsProps {
  data: StoreData['whyDecants'];
}

export const WhyDecants: React.FC<WhyDecantsProps> = ({ data }) => {
  return (
    <section className={styles.sectionLight} id="por-que">
      <div className={styles.container}>
        <SectionHeading
          eyebrow={data.eyebrow}
          title={data.title}
          description={data.description}
        />
        <div className={styles.whyGrid}>
          {data.items.map((item) => (
            <WhyCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
};
