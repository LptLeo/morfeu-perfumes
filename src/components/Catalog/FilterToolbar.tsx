import React from 'react';
import styles from './Catalog.module.scss';

interface FilterToolbarProps {
  /** Lista de categorias já vindas do Firestore (inclui 'Todos' como primeiro) */
  categories: string[];
  activeFilter: string;
  onSelectFilter: (category: string) => void;
  disabled?: boolean;
}

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  categories,
  activeFilter,
  onSelectFilter,
  disabled,
}) => {
  return (
    <div className={styles.catalogToolbar} role="group" aria-label="Filtrar por categoria">
      {categories.map((category) => {
        const isActive = activeFilter === category;

        return (
          <button
            key={category}
            type="button"
            className={`${styles.filterChip} ${isActive ? styles.active : ''}`}
            aria-pressed={isActive}
            onClick={() => onSelectFilter(category)}
            disabled={disabled}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
};

export default FilterToolbar;