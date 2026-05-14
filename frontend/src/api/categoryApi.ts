import client from './client';
import type { ApiResponse } from '../types/api.types';
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../types/category.types';

export const categoryApi = {
  getAll: (): Promise<ApiResponse<Category[]>> =>
    client.get('/api/categories').then((r) => r.data),

  create: (data: CreateCategoryRequest): Promise<ApiResponse<Category>> =>
    client.post('/api/categories', data).then((r) => r.data),

  update: (id: string, data: UpdateCategoryRequest): Promise<ApiResponse<Category>> =>
    client.patch(`/api/categories/${id}`, data).then((r) => r.data),

  remove: (id: string): Promise<void> =>
    client.delete(`/api/categories/${id}`).then(() => undefined),
};
