import api from '@/lib/api';

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface Cart {
  id: string;
  customerId: string;
  status: 'ACTIVE' | 'CHECKOUT' | 'ABANDONED';
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const cartService = {
  getMyCart: async (): Promise<ApiResponse<Cart>> => {
    const response = await api.get('/api/v1/cart');
    return response.data;
  },

  addToCart: async (data: AddToCartRequest): Promise<ApiResponse<Cart>> => {
    const response = await api.post('/api/v1/cart/items', data);
    return response.data;
  },

  updateCartItem: async (
    productId: string,
    data: UpdateCartItemRequest
  ): Promise<ApiResponse<Cart>> => {
    const response = await api.put(`/api/v1/cart/items/${productId}`, data);
    return response.data;
  },

  removeCartItem: async (productId: string): Promise<ApiResponse<Cart>> => {
    const response = await api.delete(`/api/v1/cart/items/${productId}`);
    return response.data;
  },

  clearCart: async (): Promise<ApiResponse<Cart>> => {
    const response = await api.delete('/api/v1/cart/clear');
    return response.data;
  },
};
