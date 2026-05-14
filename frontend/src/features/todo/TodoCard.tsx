import { useTranslation } from 'react-i18next';
import { useUpdateTodo } from '../../hooks/todo/useUpdateTodo';
import type { Todo } from '../../types/todo.types';
import type { Category } from '../../types/category.types';
import styles from './TodoCard.module.css';

type TodoCardProps = {
  todo: Todo;
  categories: Category[];
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
};

export function TodoCard({ todo, categories, onEdit, onDelete }: TodoCardProps) {
  const { t } = useTranslation();
  const updateTodo = useUpdateTodo();

  const category = categories.find((c) => c.id === todo.categoryId);

  function toggleComplete() {
    updateTodo.mutate({ id: todo.id, data: { isCompleted: !todo.isCompleted } });
  }

  return (
    <div className={`${styles.card} ${todo.isCompleted ? styles.completed : ''}`}>
      <input
        type="checkbox"
        className={styles.checkbox}
        checked={todo.isCompleted}
        onChange={toggleComplete}
        aria-label={t('todo.ariaLabel.toggleComplete', { title: todo.title })}
      />
      <div className={styles.content}>
        <span className={styles.title}>{todo.title}</span>
        <div className={styles.meta}>
          {category && <span className={styles.category}>{category.name}</span>}
          <span className={styles.date}>
            {todo.startDate} ~ {todo.dueDate}
          </span>
        </div>
      </div>
      <div className={styles.actions}>
        <button
          className={styles.actionBtn}
          onClick={() => onEdit(todo)}
          aria-label={t('todo.actions.edit')}
        >
          {t('todo.actions.edit')}
        </button>
        <button
          className={`${styles.actionBtn} ${styles.deleteBtn}`}
          onClick={() => onDelete(todo.id)}
          aria-label={t('todo.actions.delete')}
        >
          {t('todo.actions.delete')}
        </button>
      </div>
    </div>
  );
}
