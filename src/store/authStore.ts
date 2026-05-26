import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '@/services/authService';
import type { ChangePasswordRequest } from '@/services/authService';
import { toastUtils } from '@/lib/toast';

export interface User {
  userId: string;
  fullName: string;
  email: string;
  role: 'CUSTOMER' | 'SELLER' | 'ADMIN';
  verified?: boolean;
}

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  refreshAccessToken: () => Promise<void>;
  changePassword: (data: ChangePasswordRequest) => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (user, accessToken, refreshToken) => {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        set({ user, accessToken, refreshToken, isAuthenticated: true });
      },

      logout: async () => {
        const { refreshToken } = get();
        try {
          if (refreshToken) {
            await authService.logout({ refreshToken });
          }
        } catch (error) {
          console.error('Logout API call failed:', error);
        } finally {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
        }
      },

      updateUser: (userData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        try {
          const response = await authService.refreshToken({ refreshToken });
          if (response.success && response.data) {
            localStorage.setItem('accessToken', response.data.accessToken);
            set({ accessToken: response.data.accessToken });
          }
        } catch (error) {
          console.error('Token refresh failed:', error);
          // If refresh fails, logout the user
          await get().logout();
          throw error;
        }
      },

      changePassword: async (data: ChangePasswordRequest) => {
        try {
          const response = await authService.changePassword(data);
          if (response.success) {
            // Password changed successfully - logout user (backend already revoked all tokens)
            toastUtils.auth.changePasswordSuccess();
            await get().logout();
            // Redirect to login page will be handled by the logout method
          }
        } catch (error) {
          console.error('Password change failed:', error);
          toastUtils.auth.changePasswordFailed();
          throw error;
        }
      },
    }),
    {
      name: 'shopflow-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
