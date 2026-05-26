import api from '@/lib/api';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface Order {
  id: string;
  customerId: string;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: string;
  customerNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlaceOrderRequest {
  shippingAddress: string;
  customerNote?: string;
}

export interface OrderPageResponse {
  content: Order[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const orderService = {
  placeOrder: async (data: PlaceOrderRequest): Promise<ApiResponse<Order>> => {
    console.log('[OrderService] Placing order with payload:', JSON.stringify(data, null, 2));
    const response = await api.post('/api/v1/orders', data);
    console.log('[OrderService] Order placed successfully:', response.data);
    return response.data;
  },

  getMyOrders: async (params?: {
    status?: string;
    page?: number;
    size?: number;
  }): Promise<ApiResponse<OrderPageResponse>> => {
    console.log('[OrderService] Getting my orders with params:', params);
    const response = await api.get('/api/v1/orders/my-orders', { params });
    console.log('[OrderService] My orders response:', response.data);
    return response.data;
  },

  getOrderDetails: async (orderId: string): Promise<ApiResponse<Order>> => {
    const response = await api.get(`/api/v1/orders/${orderId}`);
    return response.data;
  },

  getSellerOrders: async (params?: {
    status?: string;
    page?: number;
    size?: number;
  }): Promise<ApiResponse<OrderPageResponse>> => {
    console.log('[OrderService] Getting seller orders with params:', params);
    const response = await api.get('/api/v1/orders/seller-orders', { params });
    console.log('[OrderService] Seller orders response:', response.data);
    return response.data;
  },

  updateOrderStatus: async (orderId: string, status: string): Promise<ApiResponse<Order>> => {
    console.log('[OrderService] Updating order status:', orderId, 'to', status);
    const response = await api.put(`/api/v1/orders/${orderId}/status`, { status });
    console.log('[OrderService] Order status updated successfully:', response.data);
    return response.data;
  },
};
