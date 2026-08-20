import React from 'react';
import styles from './SectionHeading.module.scss';

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
  isDark?: boolean;
  className?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  eyebrow,
  title,
  description,
  isDark = false,
  className = '',
}) => {
  const darkClass = isDark ? styles.dark : '';

  return (
    <div className={`${styles.sectionHead} ${darkClass} ${className}`.trim()}>
      <span className={styles.eyebrow}>{eyebrow}</span>
      <h2 className={styles.title}>{title}</h2>
      {description && <p className={styles.description}>{description}</p>}
    </div>
  );
};
