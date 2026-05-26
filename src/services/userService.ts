import api from '@/lib/api';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: 'CUSTOMER' | 'SELLER' | 'ADMIN';
  verified: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const userService = {
  getMyProfile: async (): Promise<ApiResponse<UserProfile>> => {
    const response = await api.get('/api/v1/users/me');
    return response.data;
  },

  updateMyProfile: async (data: UpdateProfileRequest): Promise<ApiResponse<UserProfile>> => {
    const response = await api.put('/api/v1/users/me', data);
    return response.data;
  },
};
