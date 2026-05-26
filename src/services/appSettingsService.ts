import api from '@/lib/api';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface AppSettings {
  currency: string;
  taxRate: number;
  paymentsEnabled: boolean;
  codEnabled: boolean;
  maintenanceMode: boolean;
}

export const appSettingsService = {
  getSettings: async (): Promise<ApiResponse<AppSettings>> => {
    const response = await api.get('/api/v1/admin/settings');
    return response.data;
  },

  updateSettings: async (payload: AppSettings): Promise<ApiResponse<AppSettings>> => {
    const response = await api.put('/api/v1/admin/settings', payload);
    return response.data;
  },
};
