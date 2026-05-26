import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { orderService, type Order } from '@/services/orderService';
import { paymentService, type Payment } from '@/services/paymentService';
import { useAuthStore } from './authStore';

interface OrderStore {
  orders: Order[];
  currentOrder: Order | null;
  currentPayment: Payment | null;
  isLoading: boolean;
  error: string | null;
  totalElements: number;
  totalPages: number;
  currentPage: number;

  placeOrder: (shippingAddress: string, customerNote?: string) => Promise<Order>;
  getMyOrders: (params?: { status?: string; page?: number; size?: number }) => Promise<void>;
  getOrderDetails: (orderId: string) => Promise<void>;
  getPaymentByOrder: (orderId: string) => Promise<Payment>;
  clearCurrentOrder: () => void;
  clearCurrentPayment: () => void;
  clearError: () => void;
  resetOrders: () => void;
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set) => ({
      orders: [],
      currentOrder: null,
      currentPayment: null,
      isLoading: false,
      error: null,
      totalElements: 0,
      totalPages: 0,
      currentPage: 0,

      placeOrder: async (shippingAddress, customerNote) => {
        const { isAuthenticated, user } = useAuthStore.getState();

        if (!isAuthenticated) {
          throw new Error('You must be logged in to place an order');
        }

        if (user?.role !== 'CUSTOMER') {
          throw new Error('Only customers can place orders');
        }

        set({ isLoading: true, error: null });

        try {
          const response = await orderService.placeOrder({ shippingAddress, customerNote });

          if (response.success && response.data) {
            set({
              currentOrder: response.data,
              isLoading: false,
              error: null
            });
            return response.data;
          } else {
            throw new Error(response.message || 'Failed to place order');
          }
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || error?.message || 'Failed to place order';
          set({
            error: errorMessage,
            isLoading: false
          });
          throw new Error(errorMessage);
        }
      },

      getMyOrders: async (params = {}) => {
        const { isAuthenticated, user } = useAuthStore.getState();

        if (!isAuthenticated) {
          throw new Error('You must be logged in to view orders');
        }

        if (user?.role !== 'CUSTOMER') {
          throw new Error('Only customers can view orders');
        }

        set({ isLoading: true, error: null });

        try {
          const response = await orderService.getMyOrders(params);
          console.log('[OrderStore] getMyOrders response:', response);

          if (response.success && response.data) {
            const ordersList = response.data.content || [];
            console.log('[OrderStore] Extracted orders list:', ordersList);
            set({
              orders: ordersList,
              totalElements: response.data.totalElements || 0,
              totalPages: response.data.totalPages || 0,
              currentPage: response.data.number || 0,
              isLoading: false,
              error: null
            });
          } else {
            throw new Error(response.message || 'Failed to load orders');
          }
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load orders';
          set({
            error: errorMessage,
            isLoading: false
          });
          throw new Error(errorMessage);
        }
      },

      getOrderDetails: async (orderId) => {
        const { isAuthenticated, user } = useAuthStore.getState();

        if (!isAuthenticated) {
          throw new Error('You must be logged in to view order details');
        }

        if (user?.role !== 'CUSTOMER') {
          throw new Error('Only customers can view order details');
        }

        set({ isLoading: true, error: null });

        try {
          const response = await orderService.getOrderDetails(orderId);

          if (response.success && response.data) {
            // Verify order ownership
            if (response.data.customerId !== user?.userId) {
              throw new Error('You do not have permission to view this order');
            }

            set({
              currentOrder: response.data,
              isLoading: false,
              error: null
            });
          } else {
            throw new Error(response.message || 'Failed to load order details');
          }
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load order details';
          set({
            error: errorMessage,
            isLoading: false
          });
          throw new Error(errorMessage);
        }
      },

      getPaymentByOrder: async (orderId) => {
        const { isAuthenticated } = useAuthStore.getState();

        if (!isAuthenticated) {
          throw new Error('You must be logged in to view payment details');
        }

        set({ isLoading: true, error: null });

        try {
          const response = await paymentService.getPaymentByOrder(orderId);

          if (response.success && response.data) {
            set({
              currentPayment: response.data,
              isLoading: false,
              error: null
            });
            return response.data;
          } else {
            throw new Error(response.message || 'Failed to load payment details');
          }
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load payment details';
          set({
            error: errorMessage,
            isLoading: false
          });
          throw new Error(errorMessage);
        }
      },

      clearCurrentOrder: () => {
        set({ currentOrder: null });
      },

      clearCurrentPayment: () => {
        set({ currentPayment: null });
      },

      clearError: () => {
        set({ error: null });
      },

      resetOrders: () => {
        set({
          orders: [],
          currentOrder: null,
          currentPayment: null,
          isLoading: false,
          error: null,
          totalElements: 0,
          totalPages: 0,
          currentPage: 0
        });
      }
    }),
    {
      name: 'shopflow-orders',
      partialize: (state) => ({
        orders: state.orders,
        currentOrder: state.currentOrder,
        totalElements: state.totalElements,
        totalPages: state.totalPages,
        currentPage: state.currentPage
      })
    }
  )
);
