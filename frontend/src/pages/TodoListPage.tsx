import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTodos } from '../hooks/todo/useTodos';
import { useDeleteTodo } from '../hooks/todo/useDeleteTodo';
import { useCategories } from '../hooks/category/useCategories';
import { TodoFilterBar } from '../features/todo/TodoFilterBar';
import { TodoList } from '../features/todo/TodoList';
import { TodoModal } from '../features/todo/TodoModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Button } from '../components/Button';
import type { TodoFilters, Todo } from '../types/todo.types';
import styles from './TodoListPage.module.css';

export function TodoListPage() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<TodoFilters>({});
  const [modalMode, setModalMode] = useState<null | 'create' | { todo: Todo }>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: todos, isLoading } = useTodos(filters);
  const { data: categories = [] } = useCategories();
  const deleteTodo = useDeleteTodo();

  function handleDelete() {
    if (!deleteId) return;
    deleteTodo.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t('todo.title')}</h1>
        <Button variant="primary" onClick={() => setModalMode('create')}>
          {t('todo.add')}
        </Button>
      </div>

      <TodoFilterBar filters={filters} onChange={setFilters} />

      <TodoList
        todos={todos}
        categories={categories}
        isLoading={isLoading}
        onEdit={(todo) => setModalMode({ todo })}
        onDelete={(id) => setDeleteId(id)}
      />

      {modalMode === 'create' && (
        <TodoModal mode="create" onClose={() => setModalMode(null)} />
      )}

      {modalMode !== null && modalMode !== 'create' && (
        <TodoModal mode="edit" todo={modalMode.todo} onClose={() => setModalMode(null)} />
      )}

      {deleteId && (
        <ConfirmDialog
          message={t('todo.confirm.delete')}
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
          loading={deleteTodo.isPending}
        />
      )}
    </div>
  );
}
