import { useTranslation } from 'react-i18next';
import { CategoryItem } from './CategoryItem';
import type { Category } from '../../types/category.types';
import styles from './CategoryList.module.css';

type CategoryListProps = {
  categories: Category[];
  onDelete: (id: string) => void;
};

export function CategoryList({ categories, onDelete }: CategoryListProps) {
  const { t } = useTranslation();
  const defaults = categories.filter((c) => c.isDefault);
  const custom = categories.filter((c) => !c.isDefault);

  return (
    <div className={styles.container}>
      {defaults.length > 0 && (
        <section>
          <h3 className={styles.sectionTitle}>{t('category.defaultSection')}</h3>
          <div className={styles.list}>
            {defaults.map((c) => (
              <CategoryItem key={c.id} category={c} onDelete={onDelete} />
            ))}
          </div>
        </section>
      )}
      <section>
        <h3 className={styles.sectionTitle}>{t('category.customSection')}</h3>
        {custom.length === 0 ? (
          <p className={styles.empty}>{t('category.empty')}</p>
        ) : (
          <div className={styles.list}>
            {custom.map((c) => (
              <CategoryItem key={c.id} category={c} onDelete={onDelete} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
