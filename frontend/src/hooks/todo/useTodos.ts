import { useQuery } from '@tanstack/react-query';
import { todoApi } from '../../api/todoApi';
import type { TodoFilters } from '../../types/todo.types';

export function useTodos(filters: TodoFilters = {}) {
  return useQuery({
    queryKey: ['todos', filters],
    queryFn: () => todoApi.getAll(filters),
    select: (res) => res.data,
  });
}
