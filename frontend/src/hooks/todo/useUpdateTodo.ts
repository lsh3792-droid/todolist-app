import { useMutation, useQueryClient } from '@tanstack/react-query';
import { todoApi } from '../../api/todoApi';
import type { UpdateTodoRequest } from '../../types/todo.types';

export function useUpdateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTodoRequest }) =>
      todoApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}
