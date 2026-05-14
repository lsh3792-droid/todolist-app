import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  return () => {
    clearAuth();
    queryClient.clear();
    navigate('/login');
  };
}
