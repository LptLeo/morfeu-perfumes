import React from 'react';
import { CategoryOption, ProductCategory } from '@/types/store';
import styles from './Catalog.module.scss';

interface FilterToolbarProps {
  categories: CategoryOption[];
  activeFilter: ProductCategory;
  onSelectFilter: (category: ProductCategory) => void;
}

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  categories,
  activeFilter,
  onSelectFilter,
}) => {
  return (
    <div className={styles.catalogToolbar} role="group" aria-label="Filtrar por categoria">
      {categories.map((category) => {
        const isActive = activeFilter === category.id;

        return (
          <button
            key={category.id}
            type="button"
            // Concatenação direta de classes — sem biblioteca extra
            className={`${styles.filterChip} ${isActive ? styles.active : ''}`}
            aria-pressed={isActive}
            onClick={() => onSelectFilter(category.id)}
          >
            {category.label}
          </button>
        );
      })}
    </div>
  );
};
