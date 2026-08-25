import React from 'react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { StoreData } from '@/types/store';
import { StepItem } from './StepItem';
import { TrustItem } from './TrustItem';
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
          description={data.description}
          isDark
        />
        <div className={styles.steps}>
          {data.steps.map((step) => (
            <StepItem key={step.step} item={step} />
          ))}
        </div>

        {data.trustItems && data.trustItems.length > 0 && (
          <div className={styles.trustStrip}>
            {data.trustItems.map((item) => (
              <TrustItem key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
