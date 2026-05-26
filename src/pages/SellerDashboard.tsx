import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Box, TrendingUp, DollarSign, ShoppingCart, AlertCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { orderService, type Order } from '@/services/orderService';
import { toast } from 'sonner';
import { analyticsService, type SellerDashboardMetrics } from '@/services/analyticsService';

export function SellerDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [metrics, setMetrics] = useState<SellerDashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadSellerOrders();
  }, []);

  const loadSellerOrders = async () => {
    try {
      setIsLoading(true);
      const [orderResponse, analyticsResponse] = await Promise.all([
        orderService.getSellerOrders({ page: 0, size: 10 }),
        analyticsService.getSellerDashboardMetrics(),
      ]);
      if (orderResponse.success && orderResponse.data) {
        setOrders(orderResponse.data.content || []);
      }
      if (analyticsResponse.success && analyticsResponse.data) {
        setMetrics(analyticsResponse.data);
      }
    } catch (error) {
      console.error('Failed to load seller orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      setIsUpdating(orderId);
      const response = await orderService.updateOrderStatus(orderId, newStatus);
      if (response.success) {
        toast.success(`Order marked as ${newStatus}`);
        // Refresh orders without page reload
        await loadSellerOrders();
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
      toast.error('Failed to update order status');
    } finally {
      setIsUpdating(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      CONFIRMED: { color: 'bg-blue-100 text-blue-800', label: 'Confirmed' },
      SHIPPED: { color: 'bg-purple-100 text-purple-800', label: 'Shipped' },
      DELIVERED: { color: 'bg-green-100 text-green-800', label: 'Delivered' },
      CANCELLED: { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const canModifyOrder = (status: string) => {
    return status === 'PENDING' || status === 'CONFIRMED' || status === 'SHIPPED';
  };

  const getPrimaryStatusAction = (status: string): { label: string; next: string } | null => {
    switch (status) {
      case 'PENDING':
        return { label: 'Confirm', next: 'CONFIRMED' };
      case 'CONFIRMED':
        return { label: 'Ship', next: 'SHIPPED' };
      case 'SHIPPED':
        return { label: 'Deliver', next: 'DELIVERED' };
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Seller Dashboard</h1>
        <p className="text-gray-600">Manage your products, inventory, and track your sales performance.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-gray-200 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-gray-900">{metrics?.totalProducts ?? 0}</div>
              <Package className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-gray-900">
                ${Number(metrics?.totalRevenue ?? 0).toLocaleString()}
              </div>
              <DollarSign className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-gray-900">{metrics?.totalOrders ?? orders.length}</div>
              <ShoppingCart className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Low Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-orange-600">{metrics?.lowStockProducts ?? 0}</div>
              <AlertCircle className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/seller/products">
            <Button className="w-full h-20 text-base font-semibold bg-orange-500 hover:bg-orange-600 flex items-center justify-between px-6">
              <span>Manage Products</span>
              <Package className="w-5 h-5" />
            </Button>
          </Link>
          <Link to="/seller/inventory">
            <Button variant="outline" className="w-full h-20 text-base font-semibold border-2 border-gray-300 hover:border-orange-500 hover:text-orange-500 flex items-center justify-between px-6">
              <span>Inventory</span>
              <Box className="w-5 h-5" />
            </Button>
          </Link>
          <Link to="/admin/analytics" className="block">
            <Button variant="outline" className="w-full h-20 text-base font-semibold border-2 border-gray-300 hover:border-orange-500 hover:text-orange-500 flex items-center justify-between px-6">
              <span>Analytics</span>
              <TrendingUp className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Order Management */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-xl">Order Management</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No orders found
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold text-gray-900">Order #{order.id.slice(0, 8)}</span>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="text-sm text-gray-500 space-y-1">
                        <p>Customer: {order.customerId}</p>
                        <p>Total: ${order.totalAmount.toFixed(2)}</p>
                        <p>Items: {order.items.length}</p>
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <p>{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mb-3 pl-4 border-l-2 border-gray-200">
                    {order.items.map((item) => (
                      <div key={item.id} className="text-sm py-1">
                        <span className="font-medium">{item.productName}</span>
                        <span className="text-gray-500 ml-2">x{item.quantity}</span>
                        <span className="text-gray-500 ml-2">@ ${item.unitPrice.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  {canModifyOrder(order.status) && (
                    <div className="flex flex-col sm:flex-row gap-2 mt-3">
                      {getPrimaryStatusAction(order.status) && (
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleUpdateStatus(order.id, getPrimaryStatusAction(order.status)!.next)}
                        disabled={isUpdating === order.id}
                      >
                        {isUpdating === order.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            {getPrimaryStatusAction(order.status)!.label}
                          </>
                        )}
                      </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleUpdateStatus(order.id, 'CANCELLED')}
                        disabled={isUpdating === order.id}
                      >
                        {isUpdating === order.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 mr-1" />
                            Cancel Order
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
