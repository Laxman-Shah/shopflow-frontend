import api from '@/lib/api';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface AdminDashboardMetrics {
  totalUsers: number;
  totalSellers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  activeSellers: number;
  recentRegistrations: number;
}

export interface SellerDashboardMetrics {
  totalProducts: number;
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  lowStockProducts: number;
  deliveredOrders: number;
}

export const analyticsService = {
  getAdminDashboardMetrics: async (): Promise<ApiResponse<AdminDashboardMetrics>> => {
    const response = await api.get('/api/v1/analytics/admin/dashboard');
    return response.data;
  },

  getSellerDashboardMetrics: async (): Promise<ApiResponse<SellerDashboardMetrics>> => {
    const response = await api.get('/api/v1/analytics/seller/dashboard');
    return response.data;
  },
};
