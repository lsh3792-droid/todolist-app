import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import MockAdapter from 'axios-mock-adapter';
import client from '../api/client';

const mock = new MockAdapter(client);

function makeWrapper(qc: QueryClient) {
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: qc }, children);
}

const defaultCategory = { id: 'c1', userId: null, name: '업무', isDefault: true, createdAt: '' };
const customCategory = { id: 'c2', userId: 'u1', name: '사이드프로젝트', isDefault: false, createdAt: '' };

beforeEach(() => {
  mock.reset();
});

describe('FE-11: 카테고리 관리 화면', () => {
  describe('CategoryItem', () => {
    it('기본 카테고리 - 수정/삭제 버튼 비활성화', async () => {
      const { CategoryItem } = await import('../features/category/CategoryItem');
      const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
      render(
        createElement(makeWrapper(qc), {}, createElement(CategoryItem, { category: defaultCategory, onDelete: vi.fn() }))
      );
      expect(screen.getByLabelText('카테고리 수정')).toBeDisabled();
      expect(screen.getByLabelText('카테고리 삭제')).toBeDisabled();
    });

    it('사용자 카테고리 - 수정 버튼 클릭 시 편집 폼 표시', async () => {
      mock.onPatch('/api/categories/c2').reply(200, { data: customCategory });
      const { CategoryItem } = await import('../features/category/CategoryItem');
      const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
      render(
        createElement(makeWrapper(qc), {}, createElement(CategoryItem, { category: customCategory, onDelete: vi.fn() }))
      );
      fireEvent.click(screen.getByLabelText('카테고리 수정'));
      await waitFor(() => expect(screen.getByDisplayValue('사이드프로젝트')).toBeTruthy());
    });

    it('삭제 버튼 클릭 시 onDelete 호출', async () => {
      const onDelete = vi.fn();
      const { CategoryItem } = await import('../features/category/CategoryItem');
      const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
      render(
        createElement(makeWrapper(qc), {}, createElement(CategoryItem, { category: customCategory, onDelete }))
      );
      fireEvent.click(screen.getByLabelText('카테고리 삭제'));
      expect(onDelete).toHaveBeenCalledWith('c2');
    });
  });

  describe('CategoryForm', () => {
    it('빈 이름 제출 시 에러 표시', async () => {
      const { CategoryForm } = await import('../features/category/CategoryForm');
      render(createElement(CategoryForm, { onSubmit: vi.fn() }));
      fireEvent.click(screen.getByText('추가'));
      await waitFor(() => expect(screen.getByText('카테고리명을 입력하세요.')).toBeTruthy());
    });

    it('이름 입력 후 제출 시 onSubmit 호출', async () => {
      const onSubmit = vi.fn();
      const { CategoryForm } = await import('../features/category/CategoryForm');
      render(createElement(CategoryForm, { onSubmit }));
      fireEvent.change(screen.getByPlaceholderText('카테고리명'), { target: { value: '새 카테고리' } });
      fireEvent.click(screen.getByText('추가'));
      await waitFor(() => expect(onSubmit).toHaveBeenCalledWith('새 카테고리'));
    });
  });

  describe('CategoryList', () => {
    it('기본 + 사용자 카테고리 렌더링', async () => {
      mock.onPatch('/api/categories/c2').reply(200, { data: customCategory });
      const { CategoryList } = await import('../features/category/CategoryList');
      const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
      render(
        createElement(
          makeWrapper(qc),
          {},
          createElement(CategoryList, {
            categories: [defaultCategory, customCategory],
            onDelete: vi.fn(),
          })
        )
      );
      expect(screen.getByText('업무')).toBeTruthy();
      expect(screen.getByText('사이드프로젝트')).toBeTruthy();
      expect(screen.getByText('기본 카테고리')).toBeTruthy();
      expect(screen.getByText('사용자 정의 카테고리')).toBeTruthy();
    });

    it('사용자 카테고리 없을 때 빈 메시지', async () => {
      mock.onPatch('/api/categories/c1').reply(200, { data: defaultCategory });
      const { CategoryList } = await import('../features/category/CategoryList');
      const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
      render(
        createElement(
          makeWrapper(qc),
          {},
          createElement(CategoryList, { categories: [defaultCategory], onDelete: vi.fn() })
        )
      );
      expect(screen.getByText('추가된 카테고리가 없습니다.')).toBeTruthy();
    });
  });
});
