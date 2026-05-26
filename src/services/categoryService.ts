import api from '@/lib/api';

export interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  parentId?: string;
}

export interface UpdateCategoryRequest {
  name: string;
  description?: string;
  parentId?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string>;
  path?: string;
  timestamp: string;
}

export const categoryService = {
  // Public APIs
  getAllCategories: async (): Promise<ApiResponse<Category[]>> => {
    const response = await api.get('/api/v1/categories');
    return response.data;
  },

  getRootCategories: async (): Promise<ApiResponse<Category[]>> => {
    const response = await api.get('/api/v1/categories/root');
    return response.data;
  },

  getCategoryById: async (id: string): Promise<ApiResponse<Category>> => {
    const response = await api.get(`/api/v1/categories/${id}`);
    return response.data;
  },

  getChildCategories: async (id: string): Promise<ApiResponse<Category[]>> => {
    const response = await api.get(`/api/v1/categories/${id}/children`);
    return response.data;
  },

  // Admin APIs
  createCategory: async (data: CreateCategoryRequest): Promise<ApiResponse<Category>> => {
    const response = await api.post('/api/v1/categories', data);
    return response.data;
  },

  updateCategory: async (id: string, data: UpdateCategoryRequest): Promise<ApiResponse<Category>> => {
    const response = await api.put(`/api/v1/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/api/v1/categories/${id}`);
    return response.data;
  },
};
