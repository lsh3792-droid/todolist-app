import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/Button';
import styles from './CategoryForm.module.css';

type CategoryFormProps = {
  initial?: string;
  onSubmit: (name: string) => void;
  onCancel?: () => void;
  loading?: boolean;
};

export function CategoryForm({ initial = '', onSubmit, onCancel, loading }: CategoryFormProps) {
  const { t } = useTranslation();
  const [name, setName] = useState(initial);
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError(t('category.errors.nameRequired'));
      return;
    }
    setError('');
    onSubmit(name.trim());
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <input
        className={`${styles.input} ${error ? styles.inputError : ''}`}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t('category.namePlaceholder')}
        autoFocus
      />
      {error && <span className={styles.error}>{error}</span>}
      <div className={styles.actions}>
        <Button type="submit" variant="primary" loading={loading}>
          {initial ? t('category.actions.edit') : t('category.actions.add')}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
            {t('category.actions.cancel')}
          </Button>
        )}
      </div>
    </form>
  );
}
