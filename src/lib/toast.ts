import { toast } from 'sonner';

export const toastUtils = {
  success: (message: string) => {
    toast.success(message);
  },

  error: (message: string) => {
    toast.error(message);
  },

  warning: (message: string) => {
    toast.warning(message);
  },

  info: (message: string) => {
    toast.info(message);
  },

  // Auth-specific toast messages
  auth: {
    loginSuccess: () => {
      toast.success('Login successful! Redirecting to dashboard...');
    },

    loginFailed: (message?: string) => {
      toast.error(message || 'Invalid credentials. Please verify your email and password and try again.');
    },

    registerSuccess: () => {
      toast.success('Registration successful! Please check your email for verification.');
    },

    registerFailed: (message?: string) => {
      toast.error(message || 'Registration failed. Please try again.');
    },

    logoutSuccess: () => {
      toast.success('Logged out successfully.');
    },

    forgotPasswordSuccess: () => {
      toast.success('OTP code successfully sent to your email address!');
    },

    forgotPasswordFailed: (message?: string) => {
      toast.error(message || 'Failed to send OTP. Please verify your email and try again.');
    },

    resetPasswordSuccess: () => {
      toast.success('Password reset successful! Please login again.');
    },

    resetPasswordFailed: (message?: string) => {
      toast.error(message || 'Password reset failed. Please try again.');
    },

    changePasswordSuccess: () => {
      toast.success('Password changed successfully! Logging you out of all active sessions...');
    },

    changePasswordFailed: (message?: string) => {
      toast.error(message || 'Password change failed. Please verify your current password and try again.');
    },

    sessionExpired: () => {
      toast.error('Your session has expired because your password was changed from another device. Please re-authenticate.');
    },

    tokenRefreshFailed: () => {
      toast.error('Session expired. Please login again.');
    },
  },

  // Product-related toast messages
  product: {
    loadSuccess: () => {
      toast.success('Products loaded successfully.');
    },

    loadFailed: (message?: string) => {
      toast.error(message || 'Failed to load products. Please try again.');
    },
  },
};
