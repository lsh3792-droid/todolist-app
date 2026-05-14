import { useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryApi } from '../../api/categoryApi';
import type { UpdateCategoryRequest } from '../../types/category.types';

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryRequest }) =>
      categoryApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}
