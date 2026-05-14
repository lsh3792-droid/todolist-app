import { useMutation, useQueryClient } from '@tanstack/react-query';
import { todoApi } from '../../api/todoApi';
import type { CreateTodoRequest } from '../../types/todo.types';

export function useCreateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTodoRequest) => todoApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}
