import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowLeft, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { wishlistService, type WishlistItem } from '@/services/wishlistService';

export function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    loadWishlist();
  }, [page]);

  const loadWishlist = async () => {
    try {
      const response = await wishlistService.getMyWishlist({ page, size: 10 });
      console.log('[WishlistPage] API Response:', response);
      setWishlistItems(response.data?.items || []);
      setTotalPages(response.data?.totalPages || 0);
    } catch (error: any) {
      console.error('[WishlistPage] Failed to load wishlist:', error);
      toast.error(error.response?.data?.message || 'Failed to load wishlist');
      setWishlistItems([]);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleWishlist = async (productId: string) => {
    try {
      const response = await wishlistService.toggleWishlist(productId);
      if (response.success) {
        toast.success(response.data.wishlisted ? 'Added to wishlist' : 'Removed from wishlist');
        loadWishlist();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update wishlist');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="container-page py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">Loading wishlist...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-heading-xl mb-2">My Wishlist</h1>
          <p className="text-muted-foreground">Items you've saved for later</p>
        </div>

        {wishlistItems.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Your wishlist is empty</h3>
              <p className="text-muted-foreground mb-6">Save items you love to your wishlist.</p>
              <Link to="/products">
                <Button>Browse Products</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {wishlistItems.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="aspect-square rounded-lg bg-muted mb-3 overflow-hidden">
                      {item.productImageUrl ? (
                        <img
                          src={item.productImageUrl}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <ShoppingBag className="w-12 h-12" />
                        </div>
                      )}
                    </div>
                    <h3 className="font-medium text-sm mb-1 line-clamp-2">{item.productName}</h3>
                    <p className="font-bold text-sm mb-3">{formatPrice(item.productPrice)}</p>
                    <div className="flex gap-2">
                      <Link to={`/products/${item.productId}`} className="flex-1">
                        <Button size="sm" className="w-full">
                          View
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleWishlist(item.productId)}
                        className="px-3"
                      >
                        <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

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
    </div>
  );
}
