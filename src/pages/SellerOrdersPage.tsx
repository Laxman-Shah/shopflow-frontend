import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Loader2, Truck, PackageCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { orderService, type Order } from '@/services/orderService';
import { toast } from 'sonner';

export function SellerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadSellerOrders();
  }, []);

  const loadSellerOrders = async () => {
    try {
      setIsLoading(true);
      console.log('[SellerOrdersPage] Loading seller orders...');
      const response = await orderService.getSellerOrders({ page: 0, size: 50 });
      console.log('[SellerOrdersPage] Response:', response);
      if (response.success && response.data) {
        const ordersList = response.data.content || [];
        console.log('[SellerOrdersPage] Fixed array extraction:', ordersList);
        setOrders(ordersList);
      }
    } catch (error) {
      console.error('[SellerOrdersPage] Failed to load seller orders:', error);
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

  const getPrimaryStatusAction = (status: string): { label: string; next: string; icon: typeof CheckCircle } | null => {
    switch (status) {
      case 'PENDING':
        return { label: 'Confirm Order', next: 'CONFIRMED', icon: PackageCheck };
      case 'CONFIRMED':
        return { label: 'Mark Shipped', next: 'SHIPPED', icon: Truck };
      case 'SHIPPED':
        return { label: 'Mark Delivered', next: 'DELIVERED', icon: CheckCircle };
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Orders</h1>
        <p className="text-gray-600">View and manage customer orders for your products.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Order Management</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No orders found
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="font-semibold text-gray-900">Order #{order.id.slice(0, 8)}</span>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <p className="font-medium text-gray-900">Customer ID</p>
                          <p>{order.customerId}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Total Amount</p>
                          <p className="font-semibold">${order.totalAmount.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Items</p>
                          <p>{order.items.length}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Order Date</p>
                          <p>{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      {order.shippingAddress && (
                        <div className="mt-3 text-sm">
                          <p className="font-medium text-gray-900">Shipping Address</p>
                          <p className="text-gray-600">{order.shippingAddress}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mb-4 pl-4 border-l-2 border-gray-200">
                    <p className="text-sm font-medium text-gray-900 mb-2">Order Items</p>
                    {order.items.map((item) => (
                      <div key={item.id} className="text-sm py-2 flex items-center gap-4">
                        <div className="flex-1">
                          <span className="font-medium">{item.productName}</span>
                        </div>
                        <div className="flex items-center gap-4 text-gray-600">
                          <span>Qty: {item.quantity}</span>
                          <span>@ ${item.unitPrice.toFixed(2)}</span>
                          <span className="font-semibold">= ${item.lineTotal.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  {canModifyOrder(order.status) && (
                    <div className="flex flex-col sm:flex-row gap-3 mt-4 pt-4 border-t border-gray-200">
                      {(() => {
                        const primary = getPrimaryStatusAction(order.status);
                        if (!primary) return null;
                        const Icon = primary.icon;
                        return (
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleUpdateStatus(order.id, primary.next)}
                        disabled={isUpdating === order.id}
                      >
                        {isUpdating === order.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Icon className="w-4 h-4 mr-2" />
                            {primary.label}
                          </>
                        )}
                      </Button>
                        );
                      })()}
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
                            <XCircle className="w-4 h-4 mr-2" />
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
