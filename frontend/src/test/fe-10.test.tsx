import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import MockAdapter from 'axios-mock-adapter';
import client from '../api/client';

const mock = new MockAdapter(client);

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  NavLink: ({ children }: { children: React.ReactNode }) => createElement('a', {}, children),
  Link: ({ children }: { children: React.ReactNode }) => createElement('a', {}, children),
}));

function makeWrapper(qc: QueryClient) {
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: qc }, children);
}

const fakeCategories = [
  { id: 'c1', userId: null, name: '업무', isDefault: true, createdAt: '' },
  { id: 'c2', userId: 'u1', name: '개인', isDefault: false, createdAt: '' },
];

const fakeTodo = {
  id: 't1',
  userId: 'u1',
  categoryId: 'c1',
  title: '테스트 할일',
  description: null,
  startDate: '2026-05-14',
  dueDate: '2026-05-20',
  isCompleted: false,
  createdAt: '',
  updatedAt: '',
};

beforeEach(() => {
  mock.reset();
  mock.onGet('/api/categories').reply(200, { data: fakeCategories });
});

describe('FE-10: 할일 기능 화면', () => {
  describe('TodoFilterBar', () => {
    it('카테고리 드롭다운 렌더링', async () => {
      const { TodoFilterBar } = await import('../features/todo/TodoFilterBar');
      const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
      const { container } = render(
        createElement(makeWrapper(qc), {}, createElement(TodoFilterBar, { filters: {}, onChange: vi.fn() }))
      );
      await waitFor(() => expect(container.querySelector('select')).toBeTruthy());
    });

    it('필터 초기화 버튼 클릭 시 onChange 호출', async () => {
      const onChange = vi.fn();
      const { TodoFilterBar } = await import('../features/todo/TodoFilterBar');
      const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
      render(
        createElement(makeWrapper(qc), {}, createElement(TodoFilterBar, { filters: { categoryId: 'c1' }, onChange }))
      );
      fireEvent.click(screen.getByText('초기화'));
      expect(onChange).toHaveBeenCalledWith({});
    });
  });

  describe('TodoCard', () => {
    it('제목, 카테고리, 날짜 표시', async () => {
      mock.onPatch('/api/todos/t1').reply(200, { data: fakeTodo });
      const { TodoCard } = await import('../features/todo/TodoCard');
      const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
      render(
        createElement(
          makeWrapper(qc),
          {},
          createElement(TodoCard, {
            todo: fakeTodo,
            categories: fakeCategories,
            onEdit: vi.fn(),
            onDelete: vi.fn(),
          })
        )
      );
      expect(screen.getByText('테스트 할일')).toBeTruthy();
      expect(screen.getByText('업무')).toBeTruthy();
    });

    it('삭제 버튼 클릭 시 onDelete 호출', async () => {
      mock.onPatch('/api/todos/t1').reply(200, { data: fakeTodo });
      const onDelete = vi.fn();
      const { TodoCard } = await import('../features/todo/TodoCard');
      const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
      render(
        createElement(
          makeWrapper(qc),
          {},
          createElement(TodoCard, {
            todo: fakeTodo,
            categories: fakeCategories,
            onEdit: vi.fn(),
            onDelete,
          })
        )
      );
      fireEvent.click(screen.getByLabelText('삭제'));
      expect(onDelete).toHaveBeenCalledWith('t1');
    });
  });

  describe('TodoForm', () => {
    it('제목 미입력 시 에러 표시', async () => {
      const { TodoForm } = await import('../features/todo/TodoForm');
      const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
      render(
        createElement(makeWrapper(qc), {}, createElement(TodoForm, { onSubmit: vi.fn() }))
      );
      fireEvent.click(screen.getByText('등록'));
      await waitFor(() => expect(screen.getByText('제목을 입력하세요.')).toBeTruthy());
    });

    it('dueDate < startDate 시 에러 표시', async () => {
      const { TodoForm } = await import('../features/todo/TodoForm');
      const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
      render(
        createElement(makeWrapper(qc), {}, createElement(TodoForm, { onSubmit: vi.fn() }))
      );
      fireEvent.change(screen.getByLabelText('제목'), { target: { value: '테스트' } });
      fireEvent.change(screen.getByLabelText('시작일'), { target: { value: '2026-05-20' } });
      fireEvent.change(screen.getByLabelText('종료 예정일'), { target: { value: '2026-05-15' } });
      fireEvent.click(screen.getByText('등록'));
      await waitFor(() =>
        expect(screen.getByText('종료 예정일은 시작일 이후여야 합니다.')).toBeTruthy()
      );
    });
  });

  describe('TodoList', () => {
    it('로딩 중 스켈레톤 표시', async () => {
      const { TodoList } = await import('../features/todo/TodoList');
      const { container } = render(
        createElement(TodoList, {
          todos: undefined,
          categories: [],
          isLoading: true,
          onEdit: vi.fn(),
          onDelete: vi.fn(),
        })
      );
      expect(container.querySelectorAll('[class*="skeleton"]').length).toBeGreaterThan(0);
    });

    it('빈 목록 메시지 표시', async () => {
      const { TodoList } = await import('../features/todo/TodoList');
      render(
        createElement(TodoList, {
          todos: [],
          categories: [],
          isLoading: false,
          onEdit: vi.fn(),
          onDelete: vi.fn(),
        })
      );
      expect(screen.getByText('할일이 없습니다.')).toBeTruthy();
    });
  });
});
