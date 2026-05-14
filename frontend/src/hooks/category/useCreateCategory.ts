import { useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryApi } from '../../api/categoryApi';
import type { CreateCategoryRequest } from '../../types/category.types';

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryRequest) => categoryApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}
