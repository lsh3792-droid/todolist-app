import { useTranslation } from 'react-i18next';
import { TodoCard } from './TodoCard';
import type { Todo } from '../../types/todo.types';
import type { Category } from '../../types/category.types';
import styles from './TodoList.module.css';

type TodoListProps = {
  todos: Todo[] | undefined;
  categories: Category[];
  isLoading: boolean;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
};

export function TodoList({ todos, categories, isLoading, onEdit, onDelete }: TodoListProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className={styles.list}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={styles.skeleton} />
        ))}
      </div>
    );
  }

  if (!todos || todos.length === 0) {
    return <p className={styles.empty}>{t('todo.empty')}</p>;
  }

  return (
    <div className={styles.list}>
      {todos.map((todo) => (
        <TodoCard
          key={todo.id}
          todo={todo}
          categories={categories}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
