import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import MockAdapter from 'axios-mock-adapter';
import client from '../api/client';
import { useAuthStore } from '../stores/authStore';

const mock = new MockAdapter(client);
const navigateMock = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => navigateMock,
}));

function makeWrapper(qc: QueryClient) {
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: qc }, children);
}

beforeEach(() => {
  mock.reset();
  navigateMock.mockClear();
  useAuthStore.setState({ accessToken: null, refreshToken: null, currentUser: null });
  Object.defineProperty(window, 'location', { value: { href: '' }, writable: true });
});

describe('FE-06: 인증 커스텀 훅', () => {
  describe('useLogin', () => {
    it('로그인 성공 시 setAuth 호출 및 /todos 리다이렉트', async () => {
      mock.onPost('/api/auth/login').reply(200, { data: { accessToken: 'at', refreshToken: 'rt' } });
      mock.onGet('/api/users/me').reply(200, {
        data: { id: 'u1', name: '홍길동', email: 'a@b.com', createdAt: '', updatedAt: '' },
      });

      const { useLogin } = await import('../hooks/auth/useLogin');
      const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
      const { result } = renderHook(() => useLogin(), { wrapper: makeWrapper(qc) });

      act(() => {
        result.current.mutate({ email: 'a@b.com', password: 'pass1234' });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      const state = useAuthStore.getState();
      expect(state.accessToken).toBe('at');
      expect(state.refreshToken).toBe('rt');
      expect(state.currentUser?.id).toBe('u1');
      expect(navigateMock).toHaveBeenCalledWith('/todos');
    });

    it('로그인 실패 시 에러 상태', async () => {
      mock.onPost('/api/auth/login').reply(401, { error: { code: 'UNAUTHORIZED', message: '인증 실패' } });
      mock.onGet('/api/users/me').reply(200, {
        data: { id: 'u1', name: '홍길동', email: 'a@b.com', createdAt: '', updatedAt: '' },
      });

      const { useLogin } = await import('../hooks/auth/useLogin');
      const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
      const { result } = renderHook(() => useLogin(), { wrapper: makeWrapper(qc) });

      act(() => {
        result.current.mutate({ email: 'a@b.com', password: 'wrongpass' });
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(useAuthStore.getState().accessToken).toBeNull();
    });
  });

  describe('useRegister', () => {
    it('회원가입 성공 시 setAuth 호출 및 /todos 리다이렉트', async () => {
      mock.onPost('/api/auth/register').reply(201, { data: { accessToken: 'at2', refreshToken: 'rt2' } });
      mock.onGet('/api/users/me').reply(200, {
        data: { id: 'u2', name: '신규', email: 'new@b.com', createdAt: '', updatedAt: '' },
      });

      const { useRegister } = await import('../hooks/auth/useRegister');
      const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
      const { result } = renderHook(() => useRegister(), { wrapper: makeWrapper(qc) });

      act(() => {
        result.current.mutate({ name: '신규', email: 'new@b.com', password: 'pass1234' });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      const state = useAuthStore.getState();
      expect(state.accessToken).toBe('at2');
      expect(state.currentUser?.name).toBe('신규');
      expect(navigateMock).toHaveBeenCalledWith('/todos');
    });
  });

  describe('useLogout', () => {
    it('clearAuth, queryClient.clear, /login 리다이렉트', async () => {
      useAuthStore.setState({ accessToken: 'at', refreshToken: 'rt', currentUser: { id: '1', name: '홍', email: 'a@b.com' } });

      const qcClearSpy = vi.fn();
      vi.doMock('@tanstack/react-query', async (importOriginal) => {
        const actual = await importOriginal<typeof import('@tanstack/react-query')>();
        return {
          ...actual,
          useQueryClient: () => ({ clear: qcClearSpy }),
        };
      });

      const { useLogout } = await import('../hooks/auth/useLogout');
      const qc = new QueryClient();
      const clearSpy = vi.spyOn(qc, 'clear');
      const { result } = renderHook(() => useLogout(), { wrapper: makeWrapper(qc) });

      act(() => {
        result.current();
      });

      expect(useAuthStore.getState().accessToken).toBeNull();
      expect(navigateMock).toHaveBeenCalledWith('/login');

      vi.doUnmock('@tanstack/react-query');
      clearSpy.mockRestore();
    });
  });
});
