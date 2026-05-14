import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCategories } from '../hooks/category/useCategories';
import { useCreateCategory } from '../hooks/category/useCreateCategory';
import { useDeleteCategory } from '../hooks/category/useDeleteCategory';
import { useUiStore } from '../stores/uiStore';
import { CategoryList } from '../features/category/CategoryList';
import { CategoryForm } from '../features/category/CategoryForm';
import { ConfirmDialog } from '../components/ConfirmDialog';
import styles from './CategoryPage.module.css';

export function CategoryPage() {
  const { t } = useTranslation();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const addToast = useUiStore((s) => s.addToast);

  const { data: categories = [], isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();

  function handleCreate(name: string) {
    createCategory.mutate(
      { name },
      {
        onError: (err) => {
          const code =
            (err as { response?: { data?: { error?: { code?: string } } } })?.response?.data?.error?.code;
          if (code === 'CONFLICT') {
            addToast(t('category.errors.conflict'), 'error');
          } else {
            addToast(t('category.errors.addFailed'), 'error');
          }
        },
      }
    );
  }

  function handleDelete() {
    if (!deleteId) return;
    deleteCategory.mutate(deleteId, {
      onSuccess: () => setDeleteId(null),
      onError: (err) => {
        const code =
          (err as { response?: { data?: { error?: { code?: string } } } })?.response?.data?.error?.code;
        if (code === 'CONFLICT') {
          addToast(t('category.errors.hasTodos'), 'error');
        } else if (code === 'FORBIDDEN') {
          addToast(t('category.errors.isDefault'), 'error');
        } else {
          addToast(t('category.errors.deleteFailed'), 'error');
        }
        setDeleteId(null);
      },
    });
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{t('category.title')}</h1>

      <div className={styles.addSection}>
        <h2 className={styles.addTitle}>{t('category.addTitle')}</h2>
        <CategoryForm onSubmit={handleCreate} loading={createCategory.isPending} />
      </div>

      {isLoading ? (
        <p className={styles.loading}>{t('category.loading')}</p>
      ) : (
        <CategoryList categories={categories} onDelete={(id) => setDeleteId(id)} />
      )}

      {deleteId && (
        <ConfirmDialog
          message={t('category.confirm.delete')}
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
          loading={deleteCategory.isPending}
        />
      )}
    </div>
  );
}
