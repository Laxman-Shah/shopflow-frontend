import api from '@/lib/api';

export type PaymentMethod = 'CASH_ON_DELIVERY' | 'CARD' | 'WALLET' | 'BANK_TRANSFER' | 'ESEWA' | 'KHALTI';

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'REFUNDED';

export interface Payment {
  id: string;
  orderId: string;
  customerId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  transactionReference?: string;
  failureReason?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StartPaymentRequest {
  orderId: string;
  paymentMethod: PaymentMethod;
}

export interface CompletePaymentRequest {
  transactionReference: string;
}

export interface FailPaymentRequest {
  failureReason: string;
}

export interface PaymentPageResponse {
  content: Payment[];
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

export const paymentService = {
  startPayment: async (data: StartPaymentRequest): Promise<ApiResponse<Payment>> => {
    console.log('[PaymentService] Starting payment with payload:', JSON.stringify(data, null, 2));
    console.log('[PaymentService] OrderId type:', typeof data.orderId);
    console.log('[PaymentService] OrderId value:', data.orderId);
    console.log('[PaymentService] PaymentMethod:', data.paymentMethod);

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(data.orderId)) {
      console.error('[PaymentService] Invalid UUID format:', data.orderId);
      throw new Error('Invalid order ID format');
    }

    const response = await api.post('/api/v1/payments', data);
    console.log('[PaymentService] Payment started successfully:', response.data);
    return response.data;
  },

  completePayment: async (
    paymentId: string,
    data: CompletePaymentRequest
  ): Promise<ApiResponse<Payment>> => {
    const response = await api.patch(`/api/v1/payments/${paymentId}/complete`, data);
    return response.data;
  },

  failPayment: async (
    paymentId: string,
    data: FailPaymentRequest
  ): Promise<ApiResponse<Payment>> => {
    const response = await api.patch(`/api/v1/payments/${paymentId}/fail`, data);
    return response.data;
  },

  getMyPayments: async (params?: {
    status?: PaymentStatus;
    page?: number;
    size?: number;
  }): Promise<ApiResponse<PaymentPageResponse>> => {
    const response = await api.get('/api/v1/payments/my-payments', { params });
    return response.data;
  },

  getPaymentByOrder: async (orderId: string): Promise<ApiResponse<Payment>> => {
    const response = await api.get(`/api/v1/payments/orders/${orderId}`);
    return response.data;
  },
};
