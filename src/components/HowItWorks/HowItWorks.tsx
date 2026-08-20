import React from 'react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { StoreData } from '@/types/store';
import { StepItem } from './StepItem';
import styles from './HowItWorks.module.scss';

interface HowItWorksProps {
  data: StoreData['howItWorks'];
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ data }) => {
  return (
    <section className={styles.sectionDark} id="como-funciona">
      <div className={styles.container}>
        <SectionHeading
          eyebrow={data.eyebrow}
          title={data.title}
          isDark
        />
        <div className={styles.steps}>
          {data.steps.map((step) => (
            <StepItem key={step.step} item={step} />
          ))}
        </div>
      </div>
    </section>
  );
};
