import { useTranslation } from 'react-i18next';
import { Modal } from '../../components/Modal';
import { TodoForm } from './TodoForm';
import { useCreateTodo } from '../../hooks/todo/useCreateTodo';
import { useUpdateTodo } from '../../hooks/todo/useUpdateTodo';
import type { Todo, CreateTodoRequest, UpdateTodoRequest } from '../../types/todo.types';

type TodoModalProps =
  | { mode: 'create'; onClose: () => void }
  | { mode: 'edit'; todo: Todo; onClose: () => void };

export function TodoModal(props: TodoModalProps) {
  const { t } = useTranslation();
  const createTodo = useCreateTodo();
  const updateTodo = useUpdateTodo();

  const isCreate = props.mode === 'create';
  const loading = isCreate ? createTodo.isPending : updateTodo.isPending;

  function handleSubmit(data: CreateTodoRequest | UpdateTodoRequest) {
    if (isCreate) {
      createTodo.mutate(data as CreateTodoRequest, { onSuccess: props.onClose });
    } else {
      updateTodo.mutate(
        { id: (props as { mode: 'edit'; todo: Todo; onClose: () => void }).todo.id, data },
        { onSuccess: props.onClose }
      );
    }
  }

  return (
    <Modal title={isCreate ? t('todo.addModal') : t('todo.editModal')} onClose={props.onClose}>
      <TodoForm
        initial={props.mode === 'edit' ? props.todo : undefined}
        onSubmit={handleSubmit}
        loading={loading}
      />
    </Modal>
  );
}
