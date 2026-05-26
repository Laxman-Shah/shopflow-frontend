import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Search,
  Menu,
  X,
  Zap,
  User,
  LogOut,
  Heart,
  Package,
  FolderTree,
  Box,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCartStore } from '@/store/cartStore';
import { useFilterStore } from '@/store/filterStore';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import { CATEGORIES } from '@/data/mockProducts';
import { toast } from 'sonner';
import type { CategoryFilter } from '@/types';

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const openCart = useCartStore((s) => s.openCart);
  const totalItems = useCartStore((s) => s.totalItems);
  const setSearch = useFilterStore((s) => s.setSearch);
  const setCategory = useFilterStore((s) => s.setCategory);
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchValue);
    navigate('/products');
  };

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

  const cartCount = totalItems();

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-200',
        scrolled
          ? 'bg-background/80 backdrop-blur-md border-b border-border shadow-sm'
          : 'bg-background border-b border-border'
      )}
    >
      {/* Top bar */}
      <div className="bg-brand text-brand-foreground py-2 text-center text-label-xs tracking-widest">
        FREE SHIPPING ON ORDERS OVER $75 &nbsp;·&nbsp; USE CODE{' '}
        <span className="font-bold text-amber">SHOPFLOW20</span> FOR 20% OFF
      </div>

      {/* Main header */}
      <div className="container-page">
        <div className="flex items-center gap-4 py-3">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-xl text-foreground shrink-0"
          >
            <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </span>
            <span className="hidden sm:block">ShopFlow</span>
          </Link>

          {/* Nav links — desktop */}
          <nav className="hidden md:flex items-center gap-1 ml-4">
            {CATEGORIES.slice(1).map((cat) => (
              <Button
                key={cat.value}
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setCategory(cat.value as CategoryFilter);
                  navigate('/products');
                }}
              >
                {cat.label}
              </Button>
            ))}
          </nav>

          {/* Search bar */}
          <form
            onSubmit={handleSearch}
            className="flex-1 max-w-md mx-auto hidden sm:flex items-center relative"
          >
            <Search className="absolute left-3 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search products..."
              className="pl-9 pr-4 bg-muted border-transparent focus:border-primary focus:bg-background"
            />
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-1 ml-auto">
            {/* Mobile search trigger */}
            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden"
              onClick={() => navigate('/products')}
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </Button>

            {/* User menu (authenticated) */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button variant="ghost" size="icon" className="relative">
                    <User className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user?.fullName}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  
                  {/* Role-specific menu items */}
                  {user?.role === 'ADMIN' && (
                    <>
                      <DropdownMenuItem onClick={() => navigate('/admin/categories')}>
                        <FolderTree className="w-4 h-4 mr-2" />
                        Manage Categories
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  
                  {user?.role === 'SELLER' && (
                    <>
                      <DropdownMenuItem onClick={() => navigate('/seller/products')}>
                        <Package className="w-4 h-4 mr-2" />
                        Manage Products
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/seller/inventory')}>
                        <Box className="w-4 h-4 mr-2" />
                        Manage Inventory
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/orders')}>
                    <Package className="w-4 h-4 mr-2" />
                    Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/wishlist')}>
                    <Heart className="w-4 h-4 mr-2" />
                    Wishlist
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              /* Login button (not authenticated) */
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                Sign in
              </Button>
            )}

            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={openCart}
              aria-label={`Cart (${cartCount} items)`}
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 min-w-5 px-1 text-xs bg-primary text-primary-foreground flex items-center justify-center rounded-full">
                  {cartCount > 99 ? '99+' : cartCount}
                </Badge>
              )}
            </Button>

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-3 space-y-1">
            <form onSubmit={handleSearch} className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search products..."
                className="pl-9 bg-muted"
              />
            </form>
            <Separator />
            {CATEGORIES.map((cat) => (
              <Button
                key={cat.value}
                variant="ghost"
                className="w-full justify-start text-muted-foreground"
                onClick={() => {
                  setCategory(cat.value as CategoryFilter);
                  navigate('/products');
                  setMobileOpen(false);
                }}
              >
                {cat.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
