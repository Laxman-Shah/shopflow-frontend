import api from '@/lib/api';

export type InventoryStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
export type AdjustmentType = 'INCREASE' | 'DECREASE';

export interface CreateInventoryRequest {
  productId: string;
  totalQuantity: number;
  lowStockThreshold: number;
}

export interface UpdateInventoryRequest {
  totalQuantity: number;
  lowStockThreshold: number;
}

export interface AdjustInventoryRequest {
  type: AdjustmentType;
  quantity: number;
  reason: string;
}

export interface Inventory {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productThumbnailUrl?: string;
  sellerId: string;
  totalQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  lowStockThreshold: number;
  status: InventoryStatus;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryPageResponse {
  inventories: Inventory[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string>;
  path?: string;
  timestamp: string;
}

export const inventoryService = {
  createInventory: async (data: CreateInventoryRequest): Promise<ApiResponse<Inventory>> => {
    const response = await api.post('/api/v1/inventories', data);
    return response.data;
  },

  updateInventory: async (productId: string, data: UpdateInventoryRequest): Promise<ApiResponse<Inventory>> => {
    const response = await api.put(`/api/v1/inventories/${productId}`, data);
    return response.data;
  },

  adjustInventory: async (productId: string, data: AdjustInventoryRequest): Promise<ApiResponse<Inventory>> => {
    const response = await api.patch(`/api/v1/inventories/${productId}/adjust`, data);
    return response.data;
  },

  getMyInventory: async (params?: {
    page?: number;
    size?: number;
    sort?: string;
    status?: InventoryStatus;
  }): Promise<ApiResponse<InventoryPageResponse>> => {
    const response = await api.get('/api/v1/inventories/my-inventory', { params });
    return response.data;
  },

  getInventoryByProduct: async (productId: string): Promise<ApiResponse<Inventory>> => {
    const response = await api.get(`/api/v1/inventories/public/products/${productId}`);
    return response.data;
  },
};
