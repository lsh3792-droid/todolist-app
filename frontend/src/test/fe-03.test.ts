import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../stores/authStore';
import { useUiStore } from '../stores/uiStore';

const mockUser = { id: 'user-1', name: '홍길동', email: 'user@example.com' };

beforeEach(() => {
  useAuthStore.setState({ accessToken: null, refreshToken: null, currentUser: null });
  useUiStore.setState({ toasts: [] });
});

describe('FE-03: Zustand 스토어', () => {
  describe('authStore', () => {
    it('초기 상태는 모두 null이다', () => {
      const { accessToken, refreshToken, currentUser } = useAuthStore.getState();
      expect(accessToken).toBeNull();
      expect(refreshToken).toBeNull();
      expect(currentUser).toBeNull();
    });

    it('setAuth로 토큰과 사용자 정보를 저장한다', () => {
      useAuthStore.getState().setAuth('access-token', 'refresh-token', mockUser);
      const { accessToken, refreshToken, currentUser } = useAuthStore.getState();
      expect(accessToken).toBe('access-token');
      expect(refreshToken).toBe('refresh-token');
      expect(currentUser).toEqual(mockUser);
    });

    it('setAccessToken으로 accessToken만 갱신된다', () => {
      useAuthStore.getState().setAuth('old-access', 'refresh-token', mockUser);
      useAuthStore.getState().setAccessToken('new-access');
      const { accessToken, refreshToken, currentUser } = useAuthStore.getState();
      expect(accessToken).toBe('new-access');
      expect(refreshToken).toBe('refresh-token');
      expect(currentUser).toEqual(mockUser);
    });

    it('clearAuth로 모든 상태가 초기화된다', () => {
      useAuthStore.getState().setAuth('access-token', 'refresh-token', mockUser);
      useAuthStore.getState().clearAuth();
      const { accessToken, refreshToken, currentUser } = useAuthStore.getState();
      expect(accessToken).toBeNull();
      expect(refreshToken).toBeNull();
      expect(currentUser).toBeNull();
    });

    it('토큰을 localStorage에 저장하지 않는다', () => {
      useAuthStore.getState().setAuth('access-token', 'refresh-token', mockUser);
      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
    });
  });

  describe('uiStore', () => {
    it('초기 toasts는 빈 배열이다', () => {
      expect(useUiStore.getState().toasts).toEqual([]);
    });

    it('addToast로 토스트가 추가된다', () => {
      useUiStore.getState().addToast('저장되었습니다', 'success');
      const { toasts } = useUiStore.getState();
      expect(toasts).toHaveLength(1);
      expect(toasts[0].message).toBe('저장되었습니다');
      expect(toasts[0].type).toBe('success');
      expect(toasts[0].id).toBeDefined();
    });

    it('addToast 여러 번 호출 시 누적된다', () => {
      useUiStore.getState().addToast('첫 번째', 'info');
      useUiStore.getState().addToast('두 번째', 'error');
      expect(useUiStore.getState().toasts).toHaveLength(2);
    });

    it('removeToast로 해당 id의 토스트가 제거된다', () => {
      useUiStore.getState().addToast('메시지', 'success');
      const id = useUiStore.getState().toasts[0].id;
      useUiStore.getState().removeToast(id);
      expect(useUiStore.getState().toasts).toHaveLength(0);
    });

    it('removeToast는 다른 토스트에 영향을 주지 않는다', () => {
      useUiStore.getState().addToast('첫 번째', 'info');
      useUiStore.getState().addToast('두 번째', 'error');
      const firstId = useUiStore.getState().toasts[0].id;
      useUiStore.getState().removeToast(firstId);
      const { toasts } = useUiStore.getState();
      expect(toasts).toHaveLength(1);
      expect(toasts[0].message).toBe('두 번째');
    });
  });
});
