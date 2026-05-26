import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ArrowLeft, Calendar, MapPin, CheckCircle, Clock, XCircle, Truck, Search, Filter, Star, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useOrderStore } from '@/store/orderStore';
import { toast } from 'sonner';
import { reviewService, type CreateReviewRequest } from '@/services/reviewService';

const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
  PENDING: { icon: Clock, color: 'bg-yellow-500', label: 'Pending' },
  CONFIRMED: { icon: CheckCircle, color: 'bg-blue-500', label: 'Confirmed' },
  PROCESSING: { icon: Package, color: 'bg-purple-500', label: 'Processing' },
  SHIPPED: { icon: Truck, color: 'bg-indigo-500', label: 'Shipped' },
  DELIVERED: { icon: CheckCircle, color: 'bg-green-500', label: 'Delivered' },
  CANCELLED: { icon: XCircle, color: 'bg-red-500', label: 'Cancelled' },
};

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const SORT_OPTIONS = [
  { value: 'date-desc', label: 'Newest First' },
  { value: 'date-asc', label: 'Oldest First' },
  { value: 'total-desc', label: 'Highest Total' },
  { value: 'total-asc', label: 'Lowest Total' },
];

export function OrdersPage() {
  const navigate = useNavigate();
  const { orders, isLoading, getMyOrders, totalElements, totalPages } = useOrderStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [page, setPage] = useState(0);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedOrderItem, setSelectedOrderItem] = useState<any>(null);
  const [rating, setRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [page, statusFilter, sortBy]);

  const loadOrders = async () => {
    try {
      console.log('[OrdersPage] Loading orders with params:', { statusFilter, page });
      await getMyOrders({
        status: statusFilter || undefined,
        page,
        size: 10
      });
      console.log('[OrdersPage] Orders loaded successfully:', orders.length);
    } catch (error: any) {
      console.error('[OrdersPage] Failed to load orders:', error);
      toast.error(error.message || 'Failed to load orders');
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      order.id.toLowerCase().includes(query) ||
      order.items.some((item) => item.productName.toLowerCase().includes(query))
    );
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    switch (sortBy) {
      case 'date-desc':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'date-asc':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'total-desc':
        return b.totalAmount - a.totalAmount;
      case 'total-asc':
        return a.totalAmount - b.totalAmount;
      default:
        return 0;
    }
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatPrice = (price: number | undefined | null) => {
    const safePrice = Number(price || 0);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(safePrice);
  };

  const handleOrderClick = (orderId: string) => {
    navigate(`/orders/${orderId}`);
  };

  const handleOpenReviewDialog = (order: any, item: any) => {
    setSelectedOrderItem({ order, item });
    setRating(0);
    setReviewTitle('');
    setReviewComment('');
    setReviewDialogOpen(true);
  };

  const handleCloseReviewDialog = () => {
    setReviewDialogOpen(false);
    setSelectedOrderItem(null);
    setRating(0);
    setReviewTitle('');
    setReviewComment('');
  };

  const handleSubmitReview = async () => {
    if (!selectedOrderItem) return;
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    if (!reviewTitle.trim() || !reviewComment.trim()) {
      toast.error('Please provide both title and comment');
      return;
    }

    setIsSubmittingReview(true);
    try {
      const reviewRequest: CreateReviewRequest = {
        productId: selectedOrderItem.item.productId,
        orderId: selectedOrderItem.order.id,
        rating,
        title: reviewTitle.trim(),
        comment: reviewComment.trim(),
      };

      await reviewService.createReview(reviewRequest);
      toast.success('Review submitted successfully');
      handleCloseReviewDialog();
    } catch (error: any) {
      console.error('[OrdersPage] Failed to submit review:', error);
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading && orders.length === 0) {
    return (
      <div className="container-page py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" className="mb-4" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-heading-xl mb-2">My Orders</h1>
          <p className="text-muted-foreground">Track and manage your orders ({totalElements} total)</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search orders by ID or product name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="sm:w-48">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setPage(0);
                    }}
                    className="w-full pl-10 pr-4 py-2 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sort */}
              <div className="sm:w-48">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {sortedOrders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No orders found</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery || statusFilter
                  ? 'Try adjusting your filters or search query.'
                  : "You haven't placed any orders yet."}
              </p>
              <Button onClick={() => navigate('/products')}>Start Shopping</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {sortedOrders.map((order) => {
              const StatusIcon = statusConfig[order.status]?.icon || Package;
              const statusColor = statusConfig[order.status]?.color || 'bg-gray-500';
              const statusLabel = statusConfig[order.status]?.label || order.status;

              return (
                <Card 
                  key={order.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleOrderClick(order.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">Order #{order.id.slice(0, 8)}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(order.createdAt)}
                        </CardDescription>
                      </div>
                      <Badge className={`${statusColor} text-white`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusLabel}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Items */}
                    <div className="space-y-3">
                      {order.items?.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-sm">
                          <div className="flex-1">
                            <p className="font-medium">{item.productName || 'Unknown Product'}</p>
                            <p className="text-muted-foreground">Qty: {Number(item.quantity || 0)}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <p className="font-medium">{formatPrice(item.lineTotal)}</p>
                            {order.status === 'DELIVERED' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenReviewDialog(order, item);
                                }}
                              >
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Write Review
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                      {(order.items?.length || 0) > 3 && (
                        <p className="text-sm text-muted-foreground">
                          +{(order.items?.length || 0) - 3} more items
                        </p>
                      )}
                    </div>

                    <Separator />

                    {/* Shipping Address */}
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium">Shipping Address</p>
                        <p className="text-muted-foreground whitespace-pre-line line-clamp-2">
                          {order.shippingAddress || 'N/A'}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    {/* Total */}
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold">Total</span>
                      <span className="text-lg font-bold">{formatPrice(order.totalAmount)}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  Previous
                </Button>
                <span className="flex items-center px-3 text-sm">
                  Page {page + 1} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page === totalPages - 1}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Review Dialog */}
      {reviewDialogOpen && selectedOrderItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Write a Review</CardTitle>
              <CardDescription>
                Review: {selectedOrderItem.item.productName}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Star Rating */}
              <div>
                <label className="block text-sm font-medium mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Title */}
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <Input
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="Summarize your experience"
                  maxLength={150}
                />
              </div>

              {/* Review Comment */}
              <div>
                <label className="block text-sm font-medium mb-2">Comment</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Tell us more about your experience"
                  className="w-full min-h-[120px] px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  maxLength={2000}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={handleCloseReviewDialog}
                  disabled={isSubmittingReview}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitReview}
                  disabled={isSubmittingReview}
                >
                  {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
