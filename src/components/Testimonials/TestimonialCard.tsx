import React from 'react';
import { TestimonialItem } from '@/types/store';
import styles from './Testimonials.module.scss';

interface TestimonialCardProps {
  item: TestimonialItem;
}

export const TestimonialCard: React.FC<TestimonialCardProps> = ({ item }) => {
  const starsString = '★'.repeat(item.stars);

  return (
    <div className={styles.testimonialCard}>
      <div className={styles.stars}>{starsString}</div>
      <p>"{item.comment}"</p>
      <div className={styles.testimonialPerson}>
        <div className={styles.avatarPh}>FOTO</div>
        <div>
          <strong>{item.author}</strong>
          <span>{item.sub}</span>
        </div>
      </div>
    </div>
  );
};
