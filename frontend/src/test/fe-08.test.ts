import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import MockAdapter from 'axios-mock-adapter';
import client from '../api/client';

const mock = new MockAdapter(client);

function makeWrapper(qc: QueryClient) {
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: qc }, children);
}

function makeQC() {
  return new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
}

const fakeTodo = {
  id: 't1',
  userId: 'u1',
  categoryId: 'c1',
  title: '테스트 할일',
  description: null,
  startDate: '2026-05-14',
  dueDate: '2026-05-15',
  isCompleted: false,
  createdAt: '',
  updatedAt: '',
};

beforeEach(() => {
  mock.reset();
});

describe('FE-08: Todo·Category 커스텀 훅', () => {
  describe('useTodos', () => {
    it('todoApi.getAll 을 호출하고 data 반환', async () => {
      mock.onGet(/\/api\/todos/).reply(200, { data: [fakeTodo] });
      const { useTodos } = await import('../hooks/todo/useTodos');
      const qc = makeQC();
      const { result } = renderHook(() => useTodos(), { wrapper: makeWrapper(qc) });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toHaveLength(1);
      expect(result.current.data![0].id).toBe('t1');
    });

    it('필터가 queryKey에 포함됨', async () => {
      mock.onGet(/\/api\/todos/).reply(200, { data: [] });
      const { useTodos } = await import('../hooks/todo/useTodos');
      const qc = makeQC();
      const { result } = renderHook(() => useTodos({ categoryId: 'c1' }), { wrapper: makeWrapper(qc) });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      const queries = qc.getQueryCache().getAll();
      expect(JSON.stringify(queries[0].queryKey)).toContain('c1');
    });
  });

  describe('useCreateTodo', () => {
    it('성공 시 todos 캐시 무효화', async () => {
      mock.onGet(/\/api\/todos/).reply(200, { data: [] });
      mock.onPost('/api/todos').reply(201, { data: fakeTodo });

      const { useTodos } = await import('../hooks/todo/useTodos');
      const { useCreateTodo } = await import('../hooks/todo/useCreateTodo');
      const qc = makeQC();
      const wrapper = makeWrapper(qc);

      const todosHook = renderHook(() => useTodos(), { wrapper });
      await waitFor(() => expect(todosHook.result.current.isSuccess).toBe(true));

      const invalidateSpy = vi.spyOn(qc, 'invalidateQueries');
      const createHook = renderHook(() => useCreateTodo(), { wrapper });

      act(() => {
        createHook.result.current.mutate({
          title: '새 할일',
          categoryId: 'c1',
          startDate: '2026-05-14',
          dueDate: '2026-05-15',
        });
      });

      await waitFor(() => expect(createHook.result.current.isSuccess).toBe(true));
      expect(invalidateSpy).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ['todos'] }));
    });
  });

  describe('useUpdateTodo', () => {
    it('성공 시 todos 캐시 무효화', async () => {
      mock.onPatch('/api/todos/t1').reply(200, { data: { ...fakeTodo, isCompleted: true } });

      const { useUpdateTodo } = await import('../hooks/todo/useUpdateTodo');
      const qc = makeQC();
      const invalidateSpy = vi.spyOn(qc, 'invalidateQueries');
      const { result } = renderHook(() => useUpdateTodo(), { wrapper: makeWrapper(qc) });

      act(() => {
        result.current.mutate({ id: 't1', data: { isCompleted: true } });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(invalidateSpy).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ['todos'] }));
    });
  });

  describe('useDeleteTodo', () => {
    it('성공 시 todos 캐시 무효화', async () => {
      mock.onDelete('/api/todos/t1').reply(204);

      const { useDeleteTodo } = await import('../hooks/todo/useDeleteTodo');
      const qc = makeQC();
      const invalidateSpy = vi.spyOn(qc, 'invalidateQueries');
      const { result } = renderHook(() => useDeleteTodo(), { wrapper: makeWrapper(qc) });

      act(() => {
        result.current.mutate('t1');
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(invalidateSpy).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ['todos'] }));
    });
  });

  describe('useCategories', () => {
    it('categoryApi.getAll 을 호출하고 data 반환', async () => {
      mock.onGet('/api/categories').reply(200, {
        data: [{ id: 'c1', userId: null, name: '업무', isDefault: true, createdAt: '' }],
      });

      const { useCategories } = await import('../hooks/category/useCategories');
      const qc = makeQC();
      const { result } = renderHook(() => useCategories(), { wrapper: makeWrapper(qc) });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data![0].name).toBe('업무');
    });
  });

  describe('useCreateCategory', () => {
    it('성공 시 categories 캐시 무효화', async () => {
      mock.onPost('/api/categories').reply(201, {
        data: { id: 'c2', userId: 'u1', name: '신규', isDefault: false, createdAt: '' },
      });

      const { useCreateCategory } = await import('../hooks/category/useCreateCategory');
      const qc = makeQC();
      const invalidateSpy = vi.spyOn(qc, 'invalidateQueries');
      const { result } = renderHook(() => useCreateCategory(), { wrapper: makeWrapper(qc) });

      act(() => {
        result.current.mutate({ name: '신규' });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(invalidateSpy).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ['categories'] }));
    });
  });

  describe('useDeleteCategory', () => {
    it('성공 시 categories 및 todos 캐시 무효화', async () => {
      mock.onDelete('/api/categories/c2').reply(204);

      const { useDeleteCategory } = await import('../hooks/category/useDeleteCategory');
      const qc = makeQC();
      const invalidateSpy = vi.spyOn(qc, 'invalidateQueries');
      const { result } = renderHook(() => useDeleteCategory(), { wrapper: makeWrapper(qc) });

      act(() => {
        result.current.mutate('c2');
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(invalidateSpy).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ['categories'] }));
      expect(invalidateSpy).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ['todos'] }));
    });
  });
});
