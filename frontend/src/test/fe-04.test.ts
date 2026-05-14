import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { useAuthStore } from '../stores/authStore';

const mockUser = { id: 'u1', name: '홍길동', email: 'user@example.com' };

beforeEach(() => {
  useAuthStore.setState({ accessToken: null, refreshToken: null, currentUser: null });
  Object.defineProperty(window, 'location', {
    value: { href: '' },
    writable: true,
  });
});

describe('FE-04: API 클라이언트', () => {
  it('client.ts 파일이 존재한다', async () => {
    const mod = await import('../api/client');
    expect(mod.default).toBeDefined();
  });

  it('axios 인스턴스가 baseURL을 가진다', async () => {
    const { default: client } = await import('../api/client');
    expect(client.defaults.baseURL).toBeDefined();
  });

  it('accessToken이 있으면 Authorization 헤더를 삽입한다', async () => {
    const { default: client } = await import('../api/client');
    const mock = new MockAdapter(client);
    useAuthStore.getState().setAuth('my-access-token', 'my-refresh-token', mockUser);

    let capturedHeader: string | undefined;
    mock.onGet('/api/test').reply((config) => {
      capturedHeader = config.headers?.Authorization;
      return [200, { data: 'ok' }];
    });

    await client.get('/api/test');
    expect(capturedHeader).toBe('Bearer my-access-token');
    mock.restore();
  });

  it('accessToken이 없으면 Authorization 헤더를 삽입하지 않는다', async () => {
    const { default: client } = await import('../api/client');
    const mock = new MockAdapter(client);

    let capturedHeader: string | undefined;
    mock.onGet('/api/test').reply((config) => {
      capturedHeader = config.headers?.Authorization;
      return [200, { data: 'ok' }];
    });

    await client.get('/api/test');
    expect(capturedHeader).toBeUndefined();
    mock.restore();
  });

  it('401 응답 시 refreshToken으로 재발급을 시도한다', async () => {
    const { default: client } = await import('../api/client');
    const mock = new MockAdapter(client);
    const axiosMock = new MockAdapter(axios);

    useAuthStore.getState().setAuth('expired-token', 'valid-refresh', mockUser);

    let callCount = 0;
    mock.onGet('/api/protected').reply(() => {
      callCount++;
      if (callCount === 1) return [401, { error: { code: 'UNAUTHORIZED' } }];
      return [200, { data: 'success' }];
    });

    axiosMock.onPost(`${import.meta.env.VITE_API_BASE_URL}/api/auth/refresh`).reply(200, {
      data: { accessToken: 'new-access-token' },
    });

    const res = await client.get('/api/protected');
    expect(res.data.data).toBe('success');
    expect(useAuthStore.getState().accessToken).toBe('new-access-token');

    mock.restore();
    axiosMock.restore();
  });

  it('refreshToken도 만료되면 clearAuth를 호출한다', async () => {
    const { default: client } = await import('../api/client');
    const mock = new MockAdapter(client);
    const axiosMock = new MockAdapter(axios);

    useAuthStore.getState().setAuth('expired-token', 'expired-refresh', mockUser);

    mock.onGet('/api/protected').reply(401, { error: { code: 'UNAUTHORIZED' } });
    axiosMock
      .onPost(`${import.meta.env.VITE_API_BASE_URL}/api/auth/refresh`)
      .reply(401, { error: { code: 'UNAUTHORIZED' } });

    await expect(client.get('/api/protected')).rejects.toThrow();
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(useAuthStore.getState().refreshToken).toBeNull();

    mock.restore();
    axiosMock.restore();
  });
});
