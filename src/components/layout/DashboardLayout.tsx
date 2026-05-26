import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  Users,
  Settings,
  LogOut,
  Menu,
  Footprints,
  ShoppingCart,
  Heart,
  TrendingUp,
  FolderTree,
  Box,
  ChevronRight,
  ClipboardList,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { CartSheet } from '@/components/cart/CartSheet';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface NavItem {
  title: string;
  icon: any;
  path: string;
  roles: ('CUSTOMER' | 'SELLER' | 'ADMIN')[];
}

const NAV_ITEMS: NavItem[] = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard',
    roles: ['CUSTOMER', 'SELLER', 'ADMIN'],
  },
  {
    title: 'Browse Products',
    icon: Footprints,
    path: '/products',
    roles: ['CUSTOMER'],
  },
  {
    title: 'My Orders',
    icon: ShoppingCart,
    path: '/orders',
    roles: ['CUSTOMER'],
  },
  {
    title: 'Wishlist',
    icon: Heart,
    path: '/wishlist',
    roles: ['CUSTOMER'],
  },
  {
    title: 'Profile',
    icon: Users,
    path: '/profile',
    roles: ['CUSTOMER', 'SELLER', 'ADMIN'],
  },
  {
    title: 'Manage Products',
    icon: Package,
    path: '/seller/products',
    roles: ['SELLER'],
  },
  {
    title: 'Manage Orders',
    icon: ClipboardList,
    path: '/seller/orders',
    roles: ['SELLER'],
  },
  {
    title: 'Inventory',
    icon: Box,
    path: '/seller/inventory',
    roles: ['SELLER'],
  },
  {
    title: 'Categories',
    icon: FolderTree,
    path: '/admin/categories',
    roles: ['ADMIN'],
  },
  {
    title: 'Users',
    icon: Users,
    path: '/admin/users',
    roles: ['ADMIN'],
  },
  {
    title: 'Analytics',
    icon: TrendingUp,
    path: '/admin/analytics',
    roles: ['ADMIN', 'SELLER'],
  },
  {
    title: 'Settings',
    icon: Settings,
    path: '/settings',
    roles: ['ADMIN'],
  },
];

export function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuthStore();
  const { openCart, totalItems, loadFromBackend } = useCartStore();

  // Load cart from backend when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user?.role === 'CUSTOMER') {
      loadFromBackend();
    }
  }, [isAuthenticated, user, loadFromBackend]);

  const cartItemCount = totalItems();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      logout();
      navigate('/');
    }
  };

  const filteredNavItems = NAV_ITEMS.filter((item) =>
    item.roles.includes(user?.role || 'CUSTOMER')
  );

  const getDashboardTitle = () => {
    if (user?.role === 'ADMIN') return 'Admin Dashboard';
    if (user?.role === 'SELLER') return 'Seller Dashboard';
    return 'Customer Dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-50 lg:flex">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
              <Footprints className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg">ShoeFlow</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {user?.role === 'CUSTOMER' && (
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={openCart}
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-orange-500 text-white text-xs rounded-full">
                  {cartItemCount}
                </Badge>
              )}
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <Footprints className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-xl text-gray-900">ShoeFlow</h1>
                <p className="text-xs text-gray-500">{getDashboardTitle()}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {filteredNavItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setSidebarOpen(false);
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all',
                    isActive
                      ? 'bg-orange-50 text-orange-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="flex-1 text-left">{item.title}</span>
                  {isActive && <ChevronRight className="w-4 h-4" />}
                </button>
              );
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-gray-200">
            {user?.role === 'CUSTOMER' && (
              <button
                onClick={openCart}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all bg-orange-50 text-orange-600 hover:bg-orange-100 mb-2"
              >
                <ShoppingCart className="w-5 h-5" />
                <span className="flex-1 text-left">Cart</span>
                {cartItemCount > 0 && (
                  <Badge className="bg-orange-500 text-white rounded-full h-5 min-w-5 px-1.5 text-xs">
                    {cartItemCount}
                  </Badge>
                )}
              </button>
            )}
            <div className="mb-4 px-4">
              <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
              <p className="text-xs text-orange-600 font-medium mt-1">
                {user?.role}
              </p>
            </div>
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>

      {/* Cart Sheet */}
      {user?.role === 'CUSTOMER' && <CartSheet />}
    </div>
  );
}
