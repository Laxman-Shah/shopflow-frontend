import api from '@/lib/api';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const uploadService = {
  uploadProductImages: async (files: File[]): Promise<ApiResponse<string[]>> => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    const response = await api.post('/api/v1/uploads/product-images', formData);
    return response.data;
  },
};
