import api from '@/lib/api';

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface VerifyEmailRequest {
  email: string;
  otp: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

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

export interface UpdateProfileRequest {
  fullName: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string>;
  path?: string;
  timestamp: string;
}

export const authService = {
  register: async (data: RegisterRequest): Promise<ApiResponse<void>> => {
    const response = await api.post('/api/v1/auth/register', data);
    return response.data;
  },

  verifyEmail: async (data: VerifyEmailRequest): Promise<ApiResponse<void>> => {
    const response = await api.post('/api/v1/auth/verify-email', data);
    return response.data;
  },

  resendVerificationOtp: async (email: string): Promise<ApiResponse<void>> => {
    const response = await api.post('/api/v1/auth/resend-verification-otp', { email });
    return response.data;
  },

  login: async (data: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post('/api/v1/auth/login', data);
    return response.data;
  },

  refreshToken: async (data: RefreshTokenRequest): Promise<ApiResponse<RefreshTokenResponse>> => {
    const response = await api.post('/api/v1/auth/refresh-token', data);
    return response.data;
  },

  logout: async (data: LogoutRequest): Promise<ApiResponse<void>> => {
    const response = await api.post('/api/v1/auth/logout', data);
    return response.data;
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<ApiResponse<void>> => {
    const response = await api.post('/api/v1/auth/forgot-password', data);
    return response.data;
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<ApiResponse<void>> => {
    const response = await api.post('/api/v1/auth/reset-password', data);
    return response.data;
  },

  getMyProfile: async (): Promise<ApiResponse<UserProfile>> => {
    const response = await api.get('/api/v1/users/me');
    return response.data;
  },

  updateMyProfile: async (data: UpdateProfileRequest): Promise<ApiResponse<UserProfile>> => {
    const response = await api.put('/api/v1/users/me', data);
    return response.data;
  },

  changePassword: async (data: ChangePasswordRequest): Promise<ApiResponse<void>> => {
    const response = await api.post('/api/v1/auth/change-password', data);
    return response.data;
  },
};
