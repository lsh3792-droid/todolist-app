import { describe, it, expect, beforeEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import client from '../api/client';
import { authApi } from '../api/authApi';
import { userApi } from '../api/userApi';
import { todoApi } from '../api/todoApi';
import { categoryApi } from '../api/categoryApi';
import { useAuthStore } from '../stores/authStore';

const mock = new MockAdapter(client);

beforeEach(() => {
  mock.reset();
  useAuthStore.setState({ accessToken: null, refreshToken: null, currentUser: null });
  Object.defineProperty(window, 'location', { value: { href: '' }, writable: true });
});

describe('FE-05: API 함수 레이어', () => {
  describe('authApi', () => {
    it('register — POST /api/auth/register', async () => {
      mock.onPost('/api/auth/register').reply(201, {
        data: { accessToken: 'at', refreshToken: 'rt' },
      });
      const res = await authApi.register({ email: 'a@b.com', password: 'pass1234', name: '홍길동' });
      expect(res.data.accessToken).toBe('at');
      expect(res.data.refreshToken).toBe('rt');
    });

    it('login — POST /api/auth/login', async () => {
      mock.onPost('/api/auth/login').reply(200, {
        data: { accessToken: 'at', refreshToken: 'rt' },
      });
      const res = await authApi.login({ email: 'a@b.com', password: 'pass1234' });
      expect(res.data.accessToken).toBe('at');
    });

    it('refresh — POST /api/auth/refresh with refreshToken in body', async () => {
      mock.onPost('/api/auth/refresh', { refreshToken: 'rt' }).reply(200, {
        data: { accessToken: 'new-at' },
      });
      const res = await authApi.refresh('rt');
      expect(res.data.accessToken).toBe('new-at');
    });
  });

  describe('userApi', () => {
    it('getMe — GET /api/users/me', async () => {
      mock.onGet('/api/users/me').reply(200, {
        data: { id: 'u1', email: 'a@b.com', name: '홍길동', createdAt: '', updatedAt: '' },
      });
      const res = await userApi.getMe();
      expect(res.data.id).toBe('u1');
    });

    it('updateMe — PATCH /api/users/me', async () => {
      mock.onPatch('/api/users/me').reply(200, {
        data: { id: 'u1', email: 'a@b.com', name: '새이름' },
      });
      const res = await userApi.updateMe({ name: '새이름' });
      expect(res.data.name).toBe('새이름');
    });

    it('deleteMe — DELETE /api/users/me, 반환값 없음', async () => {
      mock.onDelete('/api/users/me').reply(204);
      const res = await userApi.deleteMe();
      expect(res).toBeUndefined();
    });
  });

  describe('todoApi', () => {
    it('getAll — GET /api/todos (필터 없음)', async () => {
      mock.onGet(/\/api\/todos/).reply(200, { data: [] });
      const res = await todoApi.getAll();
      expect(res.data).toEqual([]);
    });

    it('getAll — 필터 쿼리스트링 포함', async () => {
      let capturedUrl = '';
      mock.onGet(/\/api\/todos/).reply((config) => {
        capturedUrl = config.url ?? '';
        return [200, { data: [] }];
      });
      await todoApi.getAll({ categoryId: 'cat-1', isCompleted: false });
      expect(capturedUrl).toContain('categoryId=cat-1');
      expect(capturedUrl).toContain('isCompleted=false');
    });

    it('getById — GET /api/todos/:id', async () => {
      mock.onGet('/api/todos/todo-1').reply(200, { data: { id: 'todo-1', title: '할일' } });
      const res = await todoApi.getById('todo-1');
      expect(res.data.id).toBe('todo-1');
    });

    it('create — POST /api/todos', async () => {
      mock.onPost('/api/todos').reply(201, {
        data: { id: 'new-todo', title: '새 할일' },
      });
      const res = await todoApi.create({
        title: '새 할일',
        categoryId: 'cat-1',
        startDate: '2026-05-14',
        dueDate: '2026-05-15',
      });
      expect(res.data.id).toBe('new-todo');
    });

    it('update — PATCH /api/todos/:id', async () => {
      mock.onPatch('/api/todos/todo-1').reply(200, {
        data: { id: 'todo-1', isCompleted: true },
      });
      const res = await todoApi.update('todo-1', { isCompleted: true });
      expect(res.data.isCompleted).toBe(true);
    });

    it('remove — DELETE /api/todos/:id, 반환값 없음', async () => {
      mock.onDelete('/api/todos/todo-1').reply(204);
      const res = await todoApi.remove('todo-1');
      expect(res).toBeUndefined();
    });
  });

  describe('categoryApi', () => {
    it('getAll — GET /api/categories', async () => {
      mock.onGet('/api/categories').reply(200, { data: [{ id: 'c1', name: '업무' }] });
      const res = await categoryApi.getAll();
      expect(res.data[0].name).toBe('업무');
    });

    it('create — POST /api/categories', async () => {
      mock.onPost('/api/categories').reply(201, { data: { id: 'c2', name: '마케팅' } });
      const res = await categoryApi.create({ name: '마케팅' });
      expect(res.data.name).toBe('마케팅');
    });

    it('update — PATCH /api/categories/:id', async () => {
      mock.onPatch('/api/categories/c1').reply(200, { data: { id: 'c1', name: '영업' } });
      const res = await categoryApi.update('c1', { name: '영업' });
      expect(res.data.name).toBe('영업');
    });

    it('remove — DELETE /api/categories/:id, 반환값 없음', async () => {
      mock.onDelete('/api/categories/c1').reply(204);
      const res = await categoryApi.remove('c1');
      expect(res).toBeUndefined();
    });
  });
});
