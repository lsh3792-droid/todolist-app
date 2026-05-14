import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
});

describe('FE-12: 사용자 설정 화면', () => {
  it('현재 사용자 이메일 읽기 전용으로 표시', async () => {
    mock.onGet('/api/users/me').reply(200, {
      data: { id: 'u1', name: '홍길동', email: 'test@example.com', createdAt: '', updatedAt: '' },
    });

    const { SettingsPage } = await import('../pages/SettingsPage');
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(createElement(makeWrapper(qc), {}, createElement(SettingsPage)));

    await waitFor(() => {
      const emailInput = screen.getByLabelText('이메일') as HTMLInputElement;
      expect(emailInput.readOnly).toBe(true);
    });
  });

  it('이름 수정 폼 - 빈 이름 제출 시 에러', async () => {
    mock.onGet('/api/users/me').reply(200, {
      data: { id: 'u1', name: '홍길동', email: 'test@example.com', createdAt: '', updatedAt: '' },
    });

    const { SettingsPage } = await import('../pages/SettingsPage');
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(createElement(makeWrapper(qc), {}, createElement(SettingsPage)));

    await waitFor(() => screen.getByLabelText('이름'));
    const nameInput = screen.getByLabelText('이름') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: '' } });
    fireEvent.click(screen.getByText('이름 수정'));

    await waitFor(() => expect(screen.getByText('이름을 입력하세요.')).toBeTruthy());
  });

  it('회원탈퇴 버튼 클릭 시 ConfirmDialog 표시', async () => {
    mock.onGet('/api/users/me').reply(200, {
      data: { id: 'u1', name: '홍길동', email: 'test@example.com', createdAt: '', updatedAt: '' },
    });

    const { SettingsPage } = await import('../pages/SettingsPage');
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(createElement(makeWrapper(qc), {}, createElement(SettingsPage)));

    await waitFor(() => screen.getByText('회원 탈퇴'));
    fireEvent.click(screen.getByText('회원 탈퇴'));

    await waitFor(() => expect(screen.getByText('정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')).toBeTruthy());
  });

  it('회원탈퇴 확인 시 clearAuth 및 /login 리다이렉트', async () => {
    useAuthStore.setState({ accessToken: 'at', refreshToken: 'rt', currentUser: { id: 'u1', name: '홍', email: 'a@b.com' } });
    mock.onGet('/api/users/me').reply(200, {
      data: { id: 'u1', name: '홍길동', email: 'test@example.com', createdAt: '', updatedAt: '' },
    });
    mock.onDelete('/api/users/me').reply(204);

    const { SettingsPage } = await import('../pages/SettingsPage');
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(createElement(makeWrapper(qc), {}, createElement(SettingsPage)));

    await waitFor(() => screen.getByText('회원 탈퇴'));
    fireEvent.click(screen.getByText('회원 탈퇴'));
    await waitFor(() => screen.getByText('확인'));
    fireEvent.click(screen.getByText('확인'));

    await waitFor(() => {
      expect(useAuthStore.getState().accessToken).toBeNull();
      expect(navigateMock).toHaveBeenCalledWith('/login');
    });
  });
});
