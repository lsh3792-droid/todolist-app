import client from './client';
import type { ApiResponse } from '../types/api.types';
import type { Todo, CreateTodoRequest, UpdateTodoRequest, TodoFilters } from '../types/todo.types';

export const todoApi = {
  getAll: (filters: TodoFilters = {}): Promise<ApiResponse<Todo[]>> => {
    const params = new URLSearchParams();
    if (filters.categoryId) params.set('categoryId', filters.categoryId);
    if (filters.isCompleted !== undefined) params.set('isCompleted', String(filters.isCompleted));
    if (filters.dueDateFrom) params.set('dueDateFrom', filters.dueDateFrom);
    if (filters.dueDateTo) params.set('dueDateTo', filters.dueDateTo);
    return client.get(`/api/todos?${params.toString()}`).then((r) => r.data);
  },

  getById: (id: string): Promise<ApiResponse<Todo>> =>
    client.get(`/api/todos/${id}`).then((r) => r.data),

  create: (data: CreateTodoRequest): Promise<ApiResponse<Todo>> =>
    client.post('/api/todos', data).then((r) => r.data),

  update: (id: string, data: UpdateTodoRequest): Promise<ApiResponse<Todo>> =>
    client.patch(`/api/todos/${id}`, data).then((r) => r.data),

  remove: (id: string): Promise<void> =>
    client.delete(`/api/todos/${id}`).then(() => undefined),
};
