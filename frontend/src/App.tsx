import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
} from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { ToastContainer } from './components/ToastContainer';
import { AppLayout } from './layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { TodoListPage } from './pages/TodoListPage';
import { CategoryPage } from './pages/CategoryPage';
import { SettingsPage } from './pages/SettingsPage';

const queryClient = new QueryClient();

function PrivateRoute() {
  const accessToken = useAuthStore((s) => s.accessToken);
  if (!accessToken) return <Navigate to="/login" replace />;
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

function PublicRoute() {
  const accessToken = useAuthStore((s) => s.accessToken);
  if (accessToken) return <Navigate to="/todos" replace />;
  return <Outlet />;
}

const router = createBrowserRouter([
  {
    element: <PublicRoute />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },
  {
    element: <PrivateRoute />,
    children: [
      { path: '/todos', element: <TodoListPage /> },
      { path: '/categories', element: <CategoryPage /> },
      { path: '/settings', element: <SettingsPage /> },
    ],
  },
  { path: '/', element: <Navigate to="/todos" replace /> },
  { path: '*', element: <Navigate to="/todos" replace /> },
]);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ToastContainer />
    </QueryClientProvider>
  );
}

export default App;
