import api from '@/lib/api';

export interface Review {
  id: string;
  customerId: string;
  productId: string;
  orderId: string;
  rating: number;
  title: string;
  comment: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewRequest {
  productId: string;
  orderId?: string;
  rating?: number;
  title?: string;
  comment?: string;
}

export interface UpdateReviewRequest {
  rating?: number;
  title?: string;
  comment?: string;
}

export interface ReviewPageResponse {
  content: Review[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface ProductReviewSummaryResponse {
  productId: string;
  averageRating: number;
  totalReviews: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const reviewService = {
  createReview: async (data: CreateReviewRequest): Promise<ApiResponse<Review>> => {
    console.log('[ReviewService] Creating review with payload:', JSON.stringify(data, null, 2));
    const response = await api.post('/api/v1/reviews', data);
    console.log('[ReviewService] Review created successfully:', response.data);
    return response.data;
  },

  updateReview: async (reviewId: string, data: UpdateReviewRequest): Promise<ApiResponse<Review>> => {
    console.log('[ReviewService] Updating review:', reviewId, 'with payload:', data);
    const response = await api.put(`/api/v1/reviews/${reviewId}`, data);
    console.log('[ReviewService] Review updated successfully:', response.data);
    return response.data;
  },

  deleteReview: async (reviewId: string): Promise<ApiResponse<Review>> => {
    console.log('[ReviewService] Deleting review:', reviewId);
    const response = await api.delete(`/api/v1/reviews/${reviewId}`);
    console.log('[ReviewService] Review deleted successfully:', response.data);
    return response.data;
  },

  getMyReviews: async (params?: {
    status?: string;
    page?: number;
    size?: number;
  }): Promise<ApiResponse<ReviewPageResponse>> => {
    console.log('[ReviewService] Getting my reviews with params:', params);
    const response = await api.get('/api/v1/reviews/my-reviews', { params });
    console.log('[ReviewService] My reviews response:', response.data);
    return response.data;
  },

  getProductReviews: async (productId: string, params?: {
    page?: number;
    size?: number;
  }): Promise<ApiResponse<ReviewPageResponse>> => {
    console.log('[ReviewService] Getting product reviews for:', productId, 'with params:', params);
    const response = await api.get(`/api/v1/reviews/products/${productId}`, { params });
    console.log('[ReviewService] Product reviews response:', response.data);
    return response.data;
  },

  getProductReviewSummary: async (productId: string): Promise<ApiResponse<ProductReviewSummaryResponse>> => {
    console.log('[ReviewService] Getting product review summary for:', productId);
    const response = await api.get(`/api/v1/reviews/products/${productId}/summary`);
    console.log('[ReviewService] Product review summary response:', response.data);
    return response.data;
  },
};
