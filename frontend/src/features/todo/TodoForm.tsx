import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCategories } from '../../hooks/category/useCategories';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import type { CreateTodoRequest, UpdateTodoRequest, Todo } from '../../types/todo.types';
import styles from './TodoForm.module.css';

type TodoFormProps = {
  initial?: Todo;
  onSubmit: (data: CreateTodoRequest | UpdateTodoRequest) => void;
  loading?: boolean;
};

type FormErrors = {
  title?: string;
  categoryId?: string;
  startDate?: string;
  dueDate?: string;
};

export function TodoForm({ initial, onSubmit, loading }: TodoFormProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? '');
  const [startDate, setStartDate] = useState(initial?.startDate ?? '');
  const [dueDate, setDueDate] = useState(initial?.dueDate ?? '');
  const [errors, setErrors] = useState<FormErrors>({});

  const { data: categories } = useCategories();

  function validate(): boolean {
    const next: FormErrors = {};
    if (!title.trim()) next.title = t('todo.errors.titleRequired');
    if (!categoryId) next.categoryId = t('todo.errors.categoryRequired');
    if (!startDate) next.startDate = t('todo.errors.startDateRequired');
    if (!dueDate) next.dueDate = t('todo.errors.dueDateRequired');
    if (startDate && dueDate && dueDate < startDate)
      next.dueDate = t('todo.errors.dueDateInvalid');
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ title, description: description || undefined, categoryId, startDate, dueDate });
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>
      <Input
        id="todo-title"
        label={t('todo.fields.title')}
        placeholder={t('todo.fields.titlePlaceholder')}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={errors.title}
      />

      <div className={styles.field}>
        <label className={styles.label} htmlFor="todo-description">
          {t('todo.fields.description')}
        </label>
        <textarea
          id="todo-description"
          className={styles.textarea}
          placeholder={t('todo.fields.descriptionPlaceholder')}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="todo-category">
          {t('todo.fields.category')}
        </label>
        <select
          id="todo-category"
          className={`${styles.select} ${errors.categoryId ? styles.selectError : ''}`}
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="">{t('todo.fields.categoryPlaceholder')}</option>
          {categories?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {errors.categoryId && <span className={styles.error}>{errors.categoryId}</span>}
      </div>

      <Input
        id="todo-startDate"
        type="date"
        label={t('todo.fields.startDate')}
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        error={errors.startDate}
      />

      <Input
        id="todo-dueDate"
        type="date"
        label={t('todo.fields.dueDate')}
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        error={errors.dueDate}
      />

      <Button type="submit" variant="primary" loading={loading} className={styles.submitBtn}>
        {initial ? t('todo.actions.update') : t('todo.actions.submit')}
      </Button>
    </form>
  );
}
