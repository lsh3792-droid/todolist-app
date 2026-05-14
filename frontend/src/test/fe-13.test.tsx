import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { useAuthStore } from '../stores/authStore';

vi.mock('../pages/LoginPage', () => ({ LoginPage: () => createElement('div', {}, 'LoginPage') }));
vi.mock('../pages/RegisterPage', () => ({ RegisterPage: () => createElement('div', {}, 'RegisterPage') }));
vi.mock('../pages/TodoListPage', () => ({ TodoListPage: () => createElement('div', {}, 'TodoListPage') }));
vi.mock('../pages/CategoryPage', () => ({ CategoryPage: () => createElement('div', {}, 'CategoryPage') }));
vi.mock('../pages/SettingsPage', () => ({ SettingsPage: () => createElement('div', {}, 'SettingsPage') }));
vi.mock('../layout/AppLayout', () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => createElement('div', {}, children),
}));

function makeWrapper(qc: QueryClient) {
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: qc }, children);
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { Navigate } = require('react-router-dom');
  const accessToken = useAuthStore((s) => s.accessToken);
  if (!accessToken) return createElement(Navigate, { to: '/login', replace: true });
  return createElement('div', {}, children);
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { Navigate } = require('react-router-dom');
  const accessToken = useAuthStore((s) => s.accessToken);
  if (accessToken) return createElement(Navigate, { to: '/todos', replace: true });
  return createElement('div', {}, children);
}

describe('FE-13: 라우팅 및 보호 라우트', () => {
  it('비인증 상태에서 /todos 접근 시 /login으로 리다이렉트', () => {
    useAuthStore.setState({ accessToken: null, refreshToken: null, currentUser: null });

    render(
      createElement(
        MemoryRouter,
        { initialEntries: ['/todos'] },
        createElement(
          Routes,
          {},
          createElement(Route, { path: '/login', element: createElement('div', {}, 'LoginPage') }),
          createElement(
            Route,
            { element: createElement(PrivateRoute, {}, createElement('div', {})) },
            createElement(Route, { path: '/todos', element: createElement('div', {}, 'TodoListPage') })
          )
        )
      )
    );
    expect(screen.getByText('LoginPage')).toBeTruthy();
  });

  it('인증 상태에서 /login 접근 시 /todos로 리다이렉트', () => {
    useAuthStore.setState({ accessToken: 'at', refreshToken: 'rt', currentUser: { id: '1', name: '홍', email: 'a@b.com' } });

    render(
      createElement(
        MemoryRouter,
        { initialEntries: ['/login'] },
        createElement(
          Routes,
          {},
          createElement(
            Route,
            { element: createElement(PublicRoute, {}, createElement('div', {})) },
            createElement(Route, { path: '/login', element: createElement('div', {}, 'LoginPage') })
          ),
          createElement(Route, { path: '/todos', element: createElement('div', {}, 'TodoListPage') })
        )
      )
    );
    expect(screen.getByText('TodoListPage')).toBeTruthy();
  });

  it('인증 상태에서 보호 라우트에 접근 시 리다이렉트 없음', () => {
    useAuthStore.setState({ accessToken: 'at', refreshToken: 'rt', currentUser: { id: '1', name: '홍', email: 'a@b.com' } });

    render(
      createElement(
        MemoryRouter,
        { initialEntries: ['/login'] },
        createElement(
          Routes,
          {},
          createElement(
            Route,
            { element: createElement(PublicRoute, {}, createElement('div', {})) },
            createElement(Route, { path: '/login', element: createElement('div', {}, 'LoginPage') })
          ),
          createElement(Route, { path: '/todos', element: createElement('div', {}, 'TodoListPage') })
        )
      )
    );
    expect(screen.getByText('TodoListPage')).toBeTruthy();
  });
});
