import api from '@/lib/api';

export interface Product {
  id: string;
  sellerId: string;
  categoryId: string;
  categoryName?: string;
  name: string;
  price: number;
  thumbnailUrl?: string;
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  description?: string;
}

export interface ProductPageResponse {
  products: Product[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  imageUrls: string[];
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE';
}

export interface UpdateProductRequest {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  imageUrls: string[];
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE';
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string>;
  path?: string;
  timestamp: string;
}

export const productService = {
  // Public APIs
  getProducts: async (params?: {
    keyword?: string;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<ApiResponse<ProductPageResponse>> => {
    console.log('getProducts called with params:', params);
    const response = await api.get('/api/v1/products', { params });
    console.log('getProducts response:', response.data);
    console.log('getProducts status:', response.status);
    return response.data;
  },

  getProductById: async (id: string): Promise<ApiResponse<Product>> => {
    console.log('getProductById called with id:', id);
    const response = await api.get(`/api/v1/products/${id}`);
    console.log('getProductById response:', response.data);
    return response.data;
  },

  // Seller APIs
  createProductWithImages: async (
    data: CreateProductRequest,
    files: File[] = []
  ): Promise<ApiResponse<Product>> => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('price', String(data.price));
    formData.append('categoryId', data.categoryId);
    formData.append('status', data.status);
    data.imageUrls?.forEach((url) => formData.append('imageUrls', url));
    files.forEach((file) => formData.append('files', file));

    const response = await api.post('/api/v1/products/with-images', formData);
    return response.data;
  },

  updateProductWithImages: async (
    id: string,
    data: UpdateProductRequest,
    files: File[] = []
  ): Promise<ApiResponse<Product>> => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('price', String(data.price));
    formData.append('categoryId', data.categoryId);
    formData.append('status', data.status);
    data.imageUrls?.forEach((url) => formData.append('imageUrls', url));
    files.forEach((file) => formData.append('files', file));

    const response = await api.put(`/api/v1/products/${id}/with-images`, formData);
    return response.data;
  },

  createProduct: async (data: CreateProductRequest): Promise<ApiResponse<Product>> => {
    console.log('createProduct called with data:', data);
    console.log('imageUrls in request:', data.imageUrls);
    console.log('imageUrls length:', data.imageUrls?.length || 0);
    console.log('Request payload JSON:', JSON.stringify(data, null, 2));

    const response = await api.post('/api/v1/products', data);

    console.log('createProduct response:', response.data);
    console.log('createProduct status:', response.status);
    console.log('createProduct response data:', response.data.data);

    return response.data;
  },

  updateProduct: async (id: string, data: UpdateProductRequest): Promise<ApiResponse<Product>> => {
    console.log('updateProduct called with id:', id, 'data:', data);
    console.log('imageUrls in request:', data.imageUrls);
    console.log('imageUrls length:', data.imageUrls?.length || 0);
    console.log('Request payload JSON:', JSON.stringify(data, null, 2));

    const response = await api.put(`/api/v1/products/${id}`, data);

    console.log('updateProduct response:', response.data);
    console.log('updateProduct status:', response.status);
    console.log('updateProduct response data:', response.data.data);

    return response.data;
  },

  deleteProduct: async (id: string): Promise<ApiResponse<void>> => {
    console.log('deleteProduct called with id:', id);
    const response = await api.delete(`/api/v1/products/${id}`);
    console.log('deleteProduct response:', response.data);
    console.log('deleteProduct status:', response.status);
    return response.data;
  },

  getMyProducts: async (params?: {
    page?: number;
    size?: number;
    status?: 'DRAFT' | 'ACTIVE' | 'INACTIVE';
  }): Promise<ApiResponse<ProductPageResponse>> => {
    console.log('getMyProducts called with params:', params);
    const response = await api.get('/api/v1/products/my-products', { params });
    console.log('getMyProducts response:', response.data);
    console.log('getMyProducts status:', response.status);
    return response.data;
  },

  getMyProductById: async (id: string): Promise<ApiResponse<Product>> => {
    console.log('getMyProductById called with id:', id);
    const response = await api.get(`/api/v1/products/my-products/${id}`);
    console.log('getMyProductById response:', response.data);
    return response.data;
  },
};
