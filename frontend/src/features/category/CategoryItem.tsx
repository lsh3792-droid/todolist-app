import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUpdateCategory } from '../../hooks/category/useUpdateCategory';
import { CategoryForm } from './CategoryForm';
import type { Category } from '../../types/category.types';
import styles from './CategoryItem.module.css';

type CategoryItemProps = {
  category: Category;
  onDelete: (id: string) => void;
};

export function CategoryItem({ category, onDelete }: CategoryItemProps) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const updateCategory = useUpdateCategory();

  function handleUpdate(name: string) {
    updateCategory.mutate(
      { id: category.id, data: { name } },
      { onSuccess: () => setEditing(false) }
    );
  }

  if (editing) {
    return (
      <div className={styles.item}>
        <CategoryForm
          initial={category.name}
          onSubmit={handleUpdate}
          onCancel={() => setEditing(false)}
          loading={updateCategory.isPending}
        />
      </div>
    );
  }

  return (
    <div className={styles.item}>
      <span className={styles.name}>{category.name}</span>
      {category.isDefault && <span className={styles.badge}>{t('category.badge')}</span>}
      <div className={styles.actions}>
        <button
          className={styles.actionBtn}
          onClick={() => setEditing(true)}
          disabled={category.isDefault}
          aria-label={t('category.ariaLabel.edit')}
        >
          {t('category.actions.edit')}
        </button>
        <button
          className={`${styles.actionBtn} ${styles.deleteBtn}`}
          onClick={() => onDelete(category.id)}
          disabled={category.isDefault}
          aria-label={t('category.ariaLabel.delete')}
        >
          {t('category.actions.delete')}
        </button>
      </div>
    </div>
  );
}
