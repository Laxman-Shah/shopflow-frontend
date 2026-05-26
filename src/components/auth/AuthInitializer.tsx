import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export function AuthInitializer() {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only perform auto-redirect on root path
    if (location.pathname === '/' && isAuthenticated && user) {
      // Redirect to appropriate dashboard based on role
      if (user.role === 'ADMIN') {
        navigate('/dashboard', { replace: true });
      } else if (user.role === 'SELLER') {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, location.pathname, navigate]);

  return null;
}
