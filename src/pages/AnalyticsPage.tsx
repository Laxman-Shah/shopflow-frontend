import { useEffect, useState } from 'react';
import {
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Loader2,
  Store,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  analyticsService,
  type AdminDashboardMetrics,
  type SellerDashboardMetrics,
} from '@/services/analyticsService';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value);
}

export function AnalyticsPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';
  const [adminMetrics, setAdminMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [sellerMetrics, setSellerMetrics] = useState<SellerDashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        if (isAdmin) {
          const response = await analyticsService.getAdminDashboardMetrics();
          if (response.success && response.data) {
            setAdminMetrics(response.data);
          }
        } else {
          const response = await analyticsService.getSellerDashboardMetrics();
          if (response.success && response.data) {
            setSellerMetrics(response.data);
          }
        }
      } catch (error) {
        console.error('Failed to load analytics:', error);
        toast.error('Failed to load analytics');
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [isAdmin]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
      </div>
    );
  }

  if (isAdmin && adminMetrics) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Platform Analytics</h1>
          <p className="text-gray-600">Live metrics across users, sellers, products, and revenue.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <MetricCard title="Total Users" value={formatNumber(adminMetrics.totalUsers)} icon={Users} />
          <MetricCard title="Active Sellers" value={formatNumber(adminMetrics.activeSellers)} icon={Store} />
          <MetricCard title="Total Products" value={formatNumber(adminMetrics.totalProducts)} icon={Package} />
          <MetricCard title="Total Orders" value={formatNumber(adminMetrics.totalOrders)} icon={ShoppingCart} />
          <MetricCard title="Total Revenue" value={formatCurrency(adminMetrics.totalRevenue)} icon={DollarSign} />
          <MetricCard title="Pending Orders" value={formatNumber(adminMetrics.pendingOrders)} icon={Clock} />
          <MetricCard title="Registered Sellers" value={formatNumber(adminMetrics.totalSellers)} icon={TrendingUp} />
          <MetricCard
            title="Recent Registrations"
            value={formatNumber(adminMetrics.recentRegistrations)}
            icon={AlertCircle}
          />
        </div>
      </div>
    );
  }

  if (sellerMetrics) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sales Analytics</h1>
          <p className="text-gray-600">Your store performance and inventory insights.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          <MetricCard title="Total Products" value={formatNumber(sellerMetrics.totalProducts)} icon={Package} />
          <MetricCard title="Total Revenue" value={formatCurrency(sellerMetrics.totalRevenue)} icon={DollarSign} />
          <MetricCard title="Total Orders" value={formatNumber(sellerMetrics.totalOrders)} icon={ShoppingCart} />
          <MetricCard title="Pending Orders" value={formatNumber(sellerMetrics.pendingOrders)} icon={Clock} />
          <MetricCard title="Delivered Orders" value={formatNumber(sellerMetrics.deliveredOrders)} icon={TrendingUp} />
          <MetricCard title="Low Stock Items" value={formatNumber(sellerMetrics.lowStockProducts)} icon={AlertCircle} />
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="py-12 text-center text-gray-500">No analytics data available.</CardContent>
    </Card>
  );
}

function MetricCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: typeof Users;
}) {
  return (
    <Card className="border-gray-200 hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-2xl sm:text-3xl font-bold text-gray-900">{value}</div>
          <Icon className="w-8 h-8 text-orange-500 shrink-0" />
        </div>
      </CardContent>
    </Card>
  );
}
