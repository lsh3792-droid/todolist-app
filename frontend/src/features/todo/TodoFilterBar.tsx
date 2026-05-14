import { useTranslation } from 'react-i18next';
import { useCategories } from '../../hooks/category/useCategories';
import type { TodoFilters } from '../../types/todo.types';
import styles from './TodoFilterBar.module.css';

type TodoFilterBarProps = {
  filters: TodoFilters;
  onChange: (filters: TodoFilters) => void;
};

export function TodoFilterBar({ filters, onChange }: TodoFilterBarProps) {
  const { t } = useTranslation();
  const { data: categories } = useCategories();

  function reset() {
    onChange({});
  }

  return (
    <div className={styles.bar}>
      <select
        className={styles.select}
        value={filters.categoryId ?? ''}
        onChange={(e) => onChange({ ...filters, categoryId: e.target.value || undefined })}
        aria-label={t('category.ariaLabel.filter')}
      >
        <option value="">{t('todo.filter.allCategories')}</option>
        {categories?.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <select
        className={styles.select}
        value={
          filters.isCompleted === undefined ? '' : filters.isCompleted ? 'true' : 'false'
        }
        onChange={(e) => {
          const val = e.target.value;
          onChange({
            ...filters,
            isCompleted: val === '' ? undefined : val === 'true',
          });
        }}
        aria-label={t('todo.filter.all')}
      >
        <option value="">{t('todo.filter.all')}</option>
        <option value="false">{t('todo.filter.incomplete')}</option>
        <option value="true">{t('todo.filter.complete')}</option>
      </select>

      <input
        type="date"
        className={styles.dateInput}
        value={filters.dueDateFrom ?? ''}
        onChange={(e) => onChange({ ...filters, dueDateFrom: e.target.value || undefined })}
        aria-label={t('todo.fields.startDate')}
      />
      <span className={styles.dateSep}>~</span>
      <input
        type="date"
        className={styles.dateInput}
        value={filters.dueDateTo ?? ''}
        onChange={(e) => onChange({ ...filters, dueDateTo: e.target.value || undefined })}
        aria-label={t('todo.fields.dueDate')}
      />

      <button className={styles.resetBtn} onClick={reset} type="button">
        {t('todo.filter.reset')}
      </button>
    </div>
  );
}
