import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Package,
  Truck,
  Mail,
  ArrowRight,
  Home,
  ShoppingBag,
  CreditCard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useOrderStore } from '@/store/orderStore';
import { toast } from 'sonner';

const statusConfig: Record<string, { color: string; label: string }> = {
  PENDING: { color: 'bg-yellow-500', label: 'Pending' },
  CONFIRMED: { color: 'bg-blue-500', label: 'Confirmed' },
  PROCESSING: { color: 'bg-purple-500', label: 'Processing' },
  SHIPPED: { color: 'bg-indigo-500', label: 'Shipped' },
  DELIVERED: { color: 'bg-green-500', label: 'Delivered' },
  CANCELLED: { color: 'bg-red-500', label: 'Cancelled' },
};

const paymentStatusConfig: Record<string, { color: string; label: string }> = {
  PENDING: { color: 'bg-yellow-500', label: 'Pending' },
  SUCCESS: { color: 'bg-green-500', label: 'Paid' },
  FAILED: { color: 'bg-red-500', label: 'Failed' },
  CANCELLED: { color: 'bg-gray-500', label: 'Cancelled' },
  REFUNDED: { color: 'bg-orange-500', label: 'Refunded' },
};

export function OrderSuccessPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { currentOrder, getOrderDetails, getPaymentByOrder, currentPayment, isLoading, error } = useOrderStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (orderId) {
      getOrderDetails(orderId).catch((err) => {
        toast.error(err.message || 'Failed to load order details');
      });
      getPaymentByOrder(orderId).catch((err) => {
        // Payment might not be available yet, don't show error
        console.warn('Payment details not available:', err.message);
      });
    }
  }, [orderId, getOrderDetails, getPaymentByOrder]);

  if (!mounted) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="container-page py-24 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !currentOrder) {
    return (
      <div className="container-page py-24 text-center">
        <p className="text-heading-lg mb-3">Order not found</p>
        <p className="text-muted-foreground mb-6">{error || 'Unable to load order details'}</p>
        <Button onClick={() => navigate('/orders')}>View My Orders</Button>
      </div>
    );
  }

  const statusInfo = statusConfig[currentOrder.status] || { color: 'bg-gray-500', label: currentOrder.status || 'Unknown' };

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
    <div className="container-page py-8">
      <div className="max-w-3xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-success" />
          </div>
          <h1 className="text-heading-xl mb-2">Order Placed Successfully!</h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Thank you for your order. We've received your request and will begin processing it shortly.
          </p>
          <div className="flex items-center justify-center gap-2 mt-3 text-sm text-success">
            <Mail className="w-4 h-4" />
            <span>Seller has been notified</span>
          </div>
        </div>

        {/* Order ID Badge */}
        <div className="flex justify-center mb-6">
          <Badge className="bg-muted text-foreground border border-border font-mono text-sm px-4 py-2">
            Order #{currentOrder.id}
          </Badge>
        </div>

        {/* Order Details Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Order Summary</h2>
              <Badge className={`${statusInfo.color} text-white`}>
                {statusInfo.label}
              </Badge>
            </div>

            <Separator className="mb-4" />

            {/* Order Items */}
            <div className="space-y-4 mb-6">
              {currentOrder.items?.map((item) => {
                const unitPrice = Number(item.unitPrice || 0);
                const quantity = Number(item.quantity || 0);
                const lineTotal = Number(item.lineTotal || 0);
                // Calculate unit price from lineTotal if unitPrice is 0
                const displayUnitPrice = unitPrice > 0 ? unitPrice : (quantity > 0 ? lineTotal / quantity : 0);

                return (
                  <div key={item.id} className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-lg bg-muted border border-border flex items-center justify-center shrink-0">
                      <Package className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-1">{item.productName || 'Unknown Product'}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Qty: {quantity} × ${displayUnitPrice.toFixed(2)}
                      </p>
                    </div>
                    <p className="font-semibold text-sm">
                      ${lineTotal.toFixed(2)}
                    </p>
                  </div>
                );
              })}
            </div>

            <Separator className="mb-4" />

            {/* Totals */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>
                  ${Number(currentOrder.items?.reduce((sum, item) => sum + Number(item.lineTotal || 0), 0) || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-success">FREE</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-base">
                <span>Total</span>
                <span>${Number(currentOrder.totalAmount || 0).toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shipping Information */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Truck className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Shipping Information</h3>
            </div>
            <div className="text-sm text-muted-foreground whitespace-pre-line">
              {currentOrder.shippingAddress}
            </div>
            {currentOrder.customerNote && (
              <>
                <Separator className="my-4" />
                <div>
                  <p className="text-sm font-medium mb-1">Customer Note</p>
                  <p className="text-sm text-muted-foreground">{currentOrder.customerNote}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Payment Information */}
        {currentPayment && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Payment Information</h3>
                <Badge className={`${paymentStatusConfig[currentPayment.status]?.color || 'bg-gray-500'} text-white ml-auto`}>
                  {paymentStatusConfig[currentPayment.status]?.label || currentPayment.status}
                </Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span className="font-medium">
                    {currentPayment.paymentMethod === 'CARD' ? 'Credit/Debit Card' :
                     currentPayment.paymentMethod === 'CASH_ON_DELIVERY' ? 'Cash on Delivery' :
                     currentPayment.paymentMethod === 'WALLET' ? 'Digital Wallet' :
                     currentPayment.paymentMethod === 'BANK_TRANSFER' ? 'Bank Transfer' :
                     currentPayment.paymentMethod === 'ESEWA' ? 'eSewa' :
                     currentPayment.paymentMethod === 'KHALTI' ? 'Khalti' :
                     currentPayment.paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-medium">${Number(currentPayment.amount || 0).toFixed(2)}</span>
                </div>
                {currentPayment.transactionReference && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Transaction Reference</span>
                    <span className="font-medium font-mono">{currentPayment.transactionReference}</span>
                  </div>
                )}
                {currentPayment.paidAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Paid At</span>
                    <span className="font-medium">{formatDate(currentPayment.paidAt)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Order Timeline */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Order Timeline</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-sm">Order Placed</p>
                  <p className="text-xs text-muted-foreground">{formatDate(currentOrder.createdAt)}</p>
                </div>
              </div>
              {currentOrder.status && currentOrder.status !== 'PENDING' && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Order Confirmed</p>
                    <p className="text-xs text-muted-foreground">{formatDate(currentOrder.updatedAt)}</p>
                  </div>
                </div>
              )}
              {currentOrder.status === 'SHIPPED' && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <Truck className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Order Shipped</p>
                    <p className="text-xs text-muted-foreground">Your order is on the way</p>
                  </div>
                </div>
              )}
              {currentOrder.status === 'DELIVERED' && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center shrink-0">
                    <Package className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Order Delivered</p>
                    <p className="text-xs text-muted-foreground">Your order has been delivered</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/orders">
            <Button className="gap-2 bg-primary hover:bg-primary/90 w-full sm:w-auto">
              <ShoppingBag className="w-4 h-4" />
              View My Orders
            </Button>
          </Link>
          <Link to="/products">
            <Button variant="outline" className="gap-2 w-full sm:w-auto">
              Continue Shopping
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link to="/">
            <Button variant="ghost" className="gap-2 w-full sm:w-auto">
              <Home className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
