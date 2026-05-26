import api from '@/lib/api';

export interface WishlistItem {
  id: string;
  productId: string;
  productName: string;
  productPrice: number;
  productImageUrl?: string;
  createdAt: string;
}

export interface WishlistPageResponse {
  items: WishlistItem[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface WishlistStatusResponse {
  productId: string;
  wishlisted: boolean;
  wishlistCount: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const wishlistService = {
  getMyWishlist: async (params?: {
    page?: number;
    size?: number;
  }): Promise<ApiResponse<WishlistPageResponse>> => {
    const response = await api.get('/api/v1/wishlist', { params });
    return response.data;
  },

  addToWishlist: async (productId: string): Promise<ApiResponse<WishlistItem>> => {
    const response = await api.post('/api/v1/wishlist', { productId });
    return response.data;
  },

  removeFromWishlist: async (productId: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/api/v1/wishlist/products/${productId}`);
    return response.data;
  },

  toggleWishlist: async (productId: string): Promise<ApiResponse<WishlistStatusResponse>> => {
    const response = await api.post(`/api/v1/wishlist/toggle/${productId}`);
    return response.data;
  },

  getWishlistStatus: async (productId: string): Promise<ApiResponse<WishlistStatusResponse>> => {
    const response = await api.get(`/api/v1/wishlist/products/${productId}/status`);
    return response.data;
  },

  getWishlistCount: async (): Promise<ApiResponse<number>> => {
    const response = await api.get('/api/v1/wishlist/count');
    return response.data;
  },
};
