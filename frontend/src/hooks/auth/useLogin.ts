import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { userApi } from '../../api/userApi';
import { useAuthStore } from '../../stores/authStore';
import type { LoginRequest } from '../../types/auth.types';

export function useLogin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((s) => s.setAuth);
  const setAccessToken = useAuthStore((s) => s.setAccessToken);

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: async (res) => {
      const { accessToken, refreshToken } = res.data;
      setAccessToken(accessToken);
      const meRes = await userApi.getMe();
      const { id, name, email } = meRes.data;
      setAuth(accessToken, refreshToken, { id, name, email });
      queryClient.clear();
      navigate('/todos');
    },
  });
}
