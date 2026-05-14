import { useMutation, useQueryClient } from '@tanstack/react-query';
import { todoApi } from '../../api/todoApi';

export function useDeleteTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => todoApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}
