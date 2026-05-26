import api from '@/lib/api';

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: 'CUSTOMER' | 'SELLER' | 'ADMIN';
  verified: boolean;
  accountEnabled: boolean;
  sellerApproved: boolean;
  createdAt: string;
}

export interface UserPageResponse {
  content: AdminUser[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const adminUserService = {
  getUsers: async (params?: {
    role?: string;
    keyword?: string;
    page?: number;
    size?: number;
  }): Promise<ApiResponse<UserPageResponse>> => {
    const response = await api.get('/api/v1/admin/users', { params });
    return response.data;
  },

  approveSeller: async (userId: string): Promise<ApiResponse<AdminUser>> => {
    const response = await api.patch(`/api/v1/admin/users/${userId}/approve-seller`);
    return response.data;
  },

  revokeSeller: async (userId: string): Promise<ApiResponse<AdminUser>> => {
    const response = await api.patch(`/api/v1/admin/users/${userId}/revoke-seller`);
    return response.data;
  },

  banUser: async (userId: string): Promise<ApiResponse<AdminUser>> => {
    const response = await api.patch(`/api/v1/admin/users/${userId}/ban`);
    return response.data;
  },

  unbanUser: async (userId: string): Promise<ApiResponse<AdminUser>> => {
    const response = await api.patch(`/api/v1/admin/users/${userId}/unban`);
    return response.data;
  },
};
