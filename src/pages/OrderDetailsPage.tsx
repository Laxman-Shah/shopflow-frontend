import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Calendar,
  FileText,
  Copy,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useOrderStore } from '@/store/orderStore';
import { toast } from 'sonner';

const statusConfig: Record<string, { icon: any; color: string; label: string; description: string }> = {
  PENDING: { 
    icon: Clock, 
    color: 'bg-yellow-500', 
    label: 'Pending', 
    description: 'Your order is waiting to be confirmed' 
  },
  CONFIRMED: { 
    icon: CheckCircle2, 
    color: 'bg-blue-500', 
    label: 'Confirmed', 
    description: 'Your order has been confirmed' 
  },
  PROCESSING: { 
    icon: Package, 
    color: 'bg-purple-500', 
    label: 'Processing', 
    description: 'Your order is being prepared' 
  },
  SHIPPED: { 
    icon: Truck, 
    color: 'bg-indigo-500', 
    label: 'Shipped', 
    description: 'Your order is on the way' 
  },
  DELIVERED: { 
    icon: CheckCircle2, 
    color: 'bg-green-500', 
    label: 'Delivered', 
    description: 'Your order has been delivered' 
  },
  CANCELLED: { 
    icon: Clock, 
    color: 'bg-red-500', 
    label: 'Cancelled', 
    description: 'Your order has been cancelled' 
  },
};

export function OrderDetailsPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { currentOrder, getOrderDetails, isLoading, error } = useOrderStore();
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (orderId) {
      getOrderDetails(orderId).catch((err) => {
        toast.error(err.message || 'Failed to load order details');
      });
    }
  }, [orderId, getOrderDetails]);

  const copyOrderId = () => {
    if (currentOrder?.id) {
      navigator.clipboard.writeText(currentOrder.id);
      setCopied(true);
      toast.success('Order ID copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!mounted) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="container-page py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <Button variant="ghost" size="sm" onClick={() => navigate('/orders')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Orders
            </Button>
          </div>
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !currentOrder) {
    return (
      <div className="container-page py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <Button variant="ghost" size="sm" onClick={() => navigate('/orders')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Orders
            </Button>
          </div>
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Order not found</h3>
              <p className="text-muted-foreground mb-6">{error || 'Unable to load order details'}</p>
              <Button onClick={() => navigate('/orders')}>View My Orders</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const statusInfo = statusConfig[currentOrder.status] || {
    icon: Clock,
    color: 'bg-gray-500',
    label: currentOrder.status || 'Unknown',
    description: 'Order status unknown',
  };

  const StatusIcon = statusInfo.icon;

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Invalid Date';
    }
  };

  return (
    <div className="container-page py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/orders')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Button>
        </div>

        <div className="mb-6">
          <h1 className="text-heading-xl mb-2">Order Details</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Order ID:</span>
            <Badge variant="outline" className="font-mono text-sm">
              {currentOrder.id}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={copyOrderId}
            >
              {copied ? (
                <Check className="w-3 h-3 text-success" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </Button>
          </div>
        </div>

        {/* Status Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-full ${statusInfo.color} flex items-center justify-center shrink-0`}>
                <StatusIcon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold mb-1">{statusInfo.label}</h2>
                <p className="text-sm text-muted-foreground">{statusInfo.description}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(currentOrder.createdAt)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Order Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Order Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentOrder.items?.map((item) => (
                  <div key={item.id}>
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-20 rounded-lg bg-muted border border-border flex items-center justify-center shrink-0">
                        <Package className="w-10 h-10 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium line-clamp-2">{item.productName || 'Unknown Product'}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Product ID: {item.productId || 'N/A'}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="text-muted-foreground">Qty: {Number(item.quantity || 0)}</span>
                          <span className="text-muted-foreground">
                            ${Number(item.unitPrice || 0).toFixed(2)} each
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${Number(item.lineTotal || 0).toFixed(2)}</p>
                      </div>
                    </div>
                    {item !== currentOrder.items[currentOrder.items.length - 1] && (
                      <Separator className="mt-4" />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Order Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Order Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Order Placed</p>
                      <p className="text-xs text-muted-foreground">{formatDate(currentOrder.createdAt)}</p>
                    </div>
                  </div>

                  {currentOrder.status && currentOrder.status !== 'PENDING' && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">Order Confirmed</p>
                        <p className="text-xs text-muted-foreground">{formatDate(currentOrder.updatedAt)}</p>
                      </div>
                    </div>
                  )}

                  {currentOrder.status === 'PROCESSING' && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <Package className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">Order Processing</p>
                        <p className="text-xs text-muted-foreground">Your order is being prepared</p>
                      </div>
                    </div>
                  )}

                  {currentOrder.status === 'SHIPPED' && (
                    <>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">Order Processing</p>
                          <p className="text-xs text-muted-foreground">Your order was prepared</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                          <Truck className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">Order Shipped</p>
                          <p className="text-xs text-muted-foreground">Your order is on the way</p>
                        </div>
                      </div>
                    </>
                  )}

                  {currentOrder.status === 'DELIVERED' && (
                    <>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">Order Processing</p>
                          <p className="text-xs text-muted-foreground">Your order was prepared</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">Order Shipped</p>
                          <p className="text-xs text-muted-foreground">Your order was shipped</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">Order Delivered</p>
                          <p className="text-xs text-muted-foreground">Your order has been delivered</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Summary & Shipping */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>
                    ${Number(currentOrder.items?.reduce((sum, item) => sum + Number(item.lineTotal || 0), 0) || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-success">FREE</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>${Number(currentOrder.totalAmount || 0).toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground whitespace-pre-line">
                  {currentOrder.shippingAddress || 'N/A'}
                </div>
              </CardContent>
            </Card>

            {/* Customer Note */}
            {currentOrder.customerNote && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Customer Note
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{currentOrder.customerNote}</p>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <Card>
              <CardContent className="p-4 space-y-2">
                <Button className="w-full" onClick={() => navigate('/orders')}>
                  View All Orders
                </Button>
                <Button variant="outline" className="w-full" onClick={() => navigate('/products')}>
                  Continue Shopping
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
