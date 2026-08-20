import React from 'react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { StoreData } from '@/types/store';
import { TestimonialCard } from './TestimonialCard';
import { TrustItem } from './TrustItem';
import styles from './Testimonials.module.scss';

interface TestimonialsProps {
  data: StoreData['testimonials'];
}

export const Testimonials: React.FC<TestimonialsProps> = ({ data }) => {
  return (
    <section className={styles.sectionLight} id="depoimentos">
      <div className={styles.container}>
        <SectionHeading
          eyebrow={data.eyebrow}
          title={data.title}
          description={data.description}
        />

        <div className={styles.testimonialGrid}>
          {data.items.map((item) => (
            <TestimonialCard key={item.id} item={item} />
          ))}
        </div>

        <div className={styles.trustStrip}>
          {data.trustItems.map((item) => (
            <TrustItem key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
};
