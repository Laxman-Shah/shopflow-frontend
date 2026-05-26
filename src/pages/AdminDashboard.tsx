import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { Users, Package, FolderTree, TrendingUp, DollarSign, ShoppingCart, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { analyticsService, type AdminDashboardMetrics } from '@/services/analyticsService';
import { toast } from 'sonner';

export function AdminDashboard() {
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        setIsLoading(true);
        const response = await analyticsService.getAdminDashboardMetrics();
        if (response.success && response.data) {
          setMetrics(response.data);
        }
      } catch (error) {
        console.error('Failed to load admin dashboard metrics:', error);
        toast.error('Failed to load admin analytics');
      } finally {
        setIsLoading(false);
      }
    };

    loadMetrics();
  }, []);

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }),
    []
  );

  const numberFormatter = useMemo(
    () =>
      new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 0,
      }),
    []
  );

  const statValue = (value?: number, asCurrency = false) => {
    if (isLoading) return '...';
    if (typeof value !== 'number') return asCurrency ? '$0' : '0';
    return asCurrency ? currencyFormatter.format(value) : numberFormatter.format(value);
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage users, categories, products, and monitor platform performance.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-gray-200 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-gray-900">{statValue(metrics?.totalUsers)}</div>
              <Users className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-gray-900">{statValue(metrics?.totalProducts)}</div>
              <Package className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-gray-900">{statValue(metrics?.totalRevenue, true)}</div>
              <DollarSign className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-gray-900">{statValue(metrics?.totalOrders)}</div>
              <ShoppingCart className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link to="/admin/users">
            <Button className="w-full h-20 text-base font-semibold bg-orange-500 hover:bg-orange-600 flex items-center justify-between px-6">
              <span>Manage Users</span>
              <Users className="w-5 h-5" />
            </Button>
          </Link>
          <Link to="/admin/categories">
            <Button variant="outline" className="w-full h-20 text-base font-semibold border-2 border-gray-300 hover:border-orange-500 hover:text-orange-500 flex items-center justify-between px-6">
              <span>Categories</span>
              <FolderTree className="w-5 h-5" />
            </Button>
          </Link>
          <Link to="/admin/analytics">
            <Button variant="outline" className="w-full h-20 text-base font-semibold border-2 border-gray-300 hover:border-orange-500 hover:text-orange-500 flex items-center justify-between px-6">
              <span>Analytics</span>
              <TrendingUp className="w-5 h-5" />
            </Button>
          </Link>
          <Link to="/settings">
            <Button variant="outline" className="w-full h-20 text-base font-semibold border-2 border-gray-300 hover:border-orange-500 hover:text-orange-500 flex items-center justify-between px-6">
              <span>Settings</span>
              <CheckCircle className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-xl">Recent Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  name: 'New customer signups',
                  email: `${statValue(metrics?.totalUsers)} total users`,
                  role: 'CUSTOMER',
                  time: `${statValue(metrics?.recentRegistrations)} recent`,
                },
                {
                  name: 'Seller base overview',
                  email: `${statValue(metrics?.totalSellers)} registered sellers`,
                  role: 'SELLER',
                  time: `${statValue(metrics?.activeSellers)} active`,
                },
              ].map((user, index) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <Users className="w-5 h-5 text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-orange-600">{user.role}</p>
                    <p className="text-xs text-gray-500">{user.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-xl">System Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  type: metrics?.pendingOrders ? 'warning' : 'success',
                  message: `${statValue(metrics?.pendingOrders)} orders pending fulfillment`,
                  time: 'Live',
                },
                {
                  type: 'success',
                  message: `${statValue(metrics?.totalRevenue, true)} gross platform revenue`,
                  time: 'Live',
                },
              ].map((alert, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    alert.type === 'warning' ? 'bg-yellow-100' : 
                    alert.type === 'error' ? 'bg-red-100' : 'bg-green-100'
                  }`}>
                    {alert.type === 'warning' ? (
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    ) : alert.type === 'error' ? (
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{alert.message}</p>
                    <p className="text-sm text-gray-500">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
