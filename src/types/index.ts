export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest';
export type CheckoutStep = 'shipping' | 'payment' | 'confirmation';
export type CategoryFilter = string; // Changed to string to support dynamic category IDs

// Backend DTO Types - Module 1 (Auth)
export interface AuthResponse {
  userId: string;
  fullName: string;
  email: string;
  role: 'CUSTOMER' | 'SELLER' | 'ADMIN';
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  tokenType: string;
}

export interface UserProfile {
  userId: string;
  fullName: string;
  email: string;
  role: 'CUSTOMER' | 'SELLER' | 'ADMIN';
  verified: boolean;
}

// Backend DTO Types - Module 2 (Product Catalog)
export interface BackendProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrls: string[];
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE';
  categoryId: string;
  sellerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface BackendProductResponse {
  id: string;
  sellerId: string;
  categoryId: string;
  categoryName: string;
  name: string;
  description: string;
  price: number;
  averageRating: number;
  reviewCount: number;
  imageUrls: string[];
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface BackendCategory {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BackendCartItem {
  id: string;
  productId: string;
  productName: string;
  productPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface BackendCart {
  id: string;
  customerId: string;
  status: 'ACTIVE' | 'CHECKOUT' | 'ABANDONED';
  items: BackendCartItem[];
  createdAt: string;
  updatedAt: string;
}

export interface BackendOrderItem {
  id: string;
  productId: string;
  productName: string;
  productPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface BackendOrder {
  id: string;
  customerId: string;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  items: BackendOrderItem[];
  totalAmount: number;
  shippingAddress: string;
  customerNote?: string;
  createdAt: string;
  updatedAt: string;
}

// Frontend-specific types
export interface Product {
  id: string;
  name: string;
  slug: string;
  category: CategoryFilter;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  images: string[];
  description: string;
  inStock: boolean;
  stock?: number; // Available stock quantity
  tags: string[];
  specs: Record<string, string>;
  featured?: boolean;
  isNew?: boolean;
  badge?: string;
  // Backend fields for API integration
  imageUrls?: string[];
  averageRating?: number;
  status?: 'DRAFT' | 'ACTIVE' | 'INACTIVE';
  categoryId?: string;
  sellerId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

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

export interface User {
  userId: string;
  fullName: string;
  email: string;
  role: 'CUSTOMER' | 'SELLER' | 'ADMIN';
  verified?: boolean;
}

export interface FilterState {
  category: CategoryFilter;
  priceRange: [number, number];
  minRating: number;
  inStockOnly: boolean;
  sortBy: SortOption;
  search: string;
}

export interface ShippingInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  province: string;
  city: string;
  area: string;
  address: string;
  zipCode: string;
  landmark?: string;
}

export interface PaymentInfo {
  method: 'CARD' | 'CASH_ON_DELIVERY' | 'WALLET' | 'BANK_TRANSFER' | 'ESEWA' | 'KHALTI';
  cardNumber?: string;
  cardName?: string;
  expiry?: string;
  cvv?: string;
}

// Backend DTO Types - Module 3 (Inventory)
export type InventoryStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
export type AdjustmentType = 'INCREASE' | 'DECREASE';

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
