import client from './client';
import type { ApiResponse } from '../types/api.types';
import type { User } from '../types/auth.types';

type UpdateMeRequest = Partial<{
  name: string;
  currentPassword: string;
  newPassword: string;
}>;

export const userApi = {
  getMe: (): Promise<ApiResponse<User>> =>
    client.get('/api/users/me').then((r) => r.data),

  updateMe: (data: UpdateMeRequest): Promise<ApiResponse<Pick<User, 'id' | 'email' | 'name'>>> =>
    client.patch('/api/users/me', data).then((r) => r.data),

  deleteMe: (): Promise<void> =>
    client.delete('/api/users/me').then(() => undefined),
};
