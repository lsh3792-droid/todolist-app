import client from './client';
import type { ApiResponse } from '../types/api.types';
import type { LoginRequest, RegisterRequest, TokenResponse, RefreshResponse } from '../types/auth.types';

export const authApi = {
  register: (data: RegisterRequest): Promise<ApiResponse<TokenResponse>> =>
    client.post('/api/auth/register', data).then((r) => r.data),

  login: (data: LoginRequest): Promise<ApiResponse<TokenResponse>> =>
    client.post('/api/auth/login', data).then((r) => r.data),

  refresh: (refreshToken: string): Promise<ApiResponse<RefreshResponse>> =>
    client.post('/api/auth/refresh', { refreshToken }).then((r) => r.data),
};
