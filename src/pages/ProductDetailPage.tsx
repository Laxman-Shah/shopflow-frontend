import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  ShoppingCart,
  Heart,
  Share2,
  Shield,
  Truck,
  RotateCcw,
  Minus,
  Plus,
  CheckCircle2,
  Package,
  Star,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ProductImageGallery } from '@/components/product/ProductImageGallery';
import { ProductRating } from '@/components/product/ProductRating';
import { ProductCard } from '@/components/product/ProductCard';
import { useCartStore } from '@/store/cartStore';
import { useProductStore } from '@/store/productStore';
import { productService } from '@/services/productService';
import { inventoryService } from '@/services/inventoryService';
import { reviewService, type Review } from '@/services/reviewService';
import { wishlistService } from '@/services/wishlistService';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Product, CategoryFilter, BackendProductResponse } from '@/types';

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const items = useCartStore((s) => s.items);
  const getProductById = useProductStore((s) => s.getProductById);

  useEffect(() => {
    loadProduct();
  }, [slug]);

  useEffect(() => {
    if (product) {
      loadReviews(product.id);
    }
  }, [product]);

  useEffect(() => {
    if (!product) return;

    const fetchWishlistStatus = async () => {
      try {
        const response = await wishlistService.getWishlistStatus(product.id);
        if (response.success && response.data) {
          setIsWishlisted(response.data.wishlisted);
        }
      } catch {
        // Not authenticated or wishlist unavailable
      }
    };

    fetchWishlistStatus();
  }, [product]);

  const loadReviews = async (productId: string) => {
    setIsLoadingReviews(true);
    try {
      const response = await reviewService.getProductReviews(productId, { page: 0, size: 10 });
      if (response.success && response.data) {
        setReviews(response.data.content || []);
      }
    } catch (error) {
      console.error('[ProductDetailPage] Failed to load reviews:', error);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const handleOpenReviewDialog = () => {
    setEditingReviewId(null);
    setRating(0);
    setReviewTitle('');
    setReviewComment('');
    setReviewDialogOpen(true);
  };

  const handleEditReview = (review: Review) => {
    setEditingReviewId(review.id);
    setRating(review.rating || 0);
    setReviewTitle(review.title || '');
    setReviewComment(review.comment || '');
    setReviewDialogOpen(true);
  };

  const handleCloseReviewDialog = () => {
    setReviewDialogOpen(false);
    setRating(0);
    setReviewTitle('');
    setReviewComment('');
  };

  const handleSubmitReview = async () => {
    if (!product) return;
    if (rating === 0 && !reviewTitle.trim() && !reviewComment.trim()) {
      toast.error('Please provide at least a rating, title, or comment');
      return;
    }

    setIsSubmittingReview(true);
    try {
      if (editingReviewId) {
        // Update existing review
        const updateData = {
          rating: rating > 0 ? rating : undefined,
          title: reviewTitle.trim() || undefined,
          comment: reviewComment.trim() || undefined,
        };
        const response = await reviewService.updateReview(editingReviewId, updateData);
        if (response.success && response.data) {
          toast.success('Review updated successfully!');
          handleCloseReviewDialog();
          // Reload reviews to show the updated one
          if (product) {
            loadReviews(product.id);
          }
        }
      } else {
        // Create new review
        const reviewData = {
          productId: product.id,
          rating: rating > 0 ? rating : undefined,
          title: reviewTitle.trim() || undefined,
          comment: reviewComment.trim() || undefined,
        };

        const response = await reviewService.createReview(reviewData);
        if (response.success && response.data) {
          toast.success('Review submitted successfully!');
          handleCloseReviewDialog();
          // Reload reviews to show the new one
          if (product) {
            loadReviews(product.id);
          }
        }
      }
    } catch (error: any) {
      console.error('[ProductDetailPage] Failed to submit review:', error);
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const loadProduct = async () => {
    if (!slug) return;

    setIsLoading(true);
    try {
      console.log('Loading product with id:', slug);

      // Load product by ID
      const response = await productService.getProductById(slug);

      console.log('Product response:', response);

      if (response.success && response.data) {
        const backendProduct = response.data as BackendProductResponse;

        // Map backend ProductResponse to frontend Product type
        const mappedProduct: Product = {
          id: backendProduct.id,
          name: backendProduct.name,
          slug: backendProduct.id,
          price: backendProduct.price,
          description: backendProduct.description || '',
          category: (backendProduct.categoryName || 'all') as CategoryFilter,
          images: backendProduct.imageUrls && backendProduct.imageUrls.length > 0
            ? backendProduct.imageUrls
            : [],
          inStock: true, // Will be updated with inventory data
          rating: backendProduct.averageRating || 0,
          reviewCount: backendProduct.reviewCount || 0,
          tags: [],
          specs: {},
          sellerId: backendProduct.sellerId,
          categoryId: backendProduct.categoryId,
          status: backendProduct.status,
          createdAt: backendProduct.createdAt,
        };

        console.log('Mapped product:', mappedProduct);

        // Fetch inventory for stock status
        try {
          const inventoryResponse = await inventoryService.getInventoryByProduct(backendProduct.id);
          if (inventoryResponse.success && inventoryResponse.data) {
            const inventory = inventoryResponse.data;
            mappedProduct.inStock = inventory.availableQuantity > 0;
            mappedProduct.stock = inventory.availableQuantity;
          }
        } catch (error) {
          console.error('Failed to load inventory:', error);
        }

        setProduct(mappedProduct);

        // Load related products
        loadRelatedProducts(backendProduct.categoryId);
      } else {
        console.error('Failed to load product');
        setProduct(null);
      }
    } catch (error) {
      console.error('Failed to load product:', error);
      setProduct(null);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRelatedProducts = async (categoryId: string) => {
    try {
      const response = await productService.getProducts({
        categoryId: categoryId as any,
        page: 0,
        size: 4,
      });

      if (response.success && response.data?.products) {
        const mappedRelated: Product[] = response.data.products
          .filter((p) => p.id !== slug)
          .slice(0, 4)
          .map((p) => ({
            id: p.id,
            name: p.name,
            slug: p.id,
            price: p.price,
            description: p.description || '',
            category: (p.categoryName || 'all') as CategoryFilter,
            images: p.thumbnailUrl ? [p.thumbnailUrl] : [],
            inStock: true,
            rating: 0,
            reviewCount: 0,
            tags: [],
            specs: {},
            sellerId: p.sellerId,
            categoryId: p.categoryId,
            status: p.status,
            createdAt: p.createdAt,
          }));

        setRelated(mappedRelated);
      }
    } catch (error) {
      console.error('Failed to load related products:', error);
      setRelated([]);
    }
  };

  const discount = product?.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  const handleAddToCart = () => {
    if (!product) return;
    const displayProduct = getProductById(product.id) || product;

    const existingItem = items.find((i) => i.product.id === displayProduct.id);
    const currentQuantity = existingItem?.quantity || 0;
    const newQuantity = currentQuantity + quantity;
    
    if (displayProduct.stock !== undefined && newQuantity > displayProduct.stock) {
      toast.error(`Only ${displayProduct.stock} items available in stock`);
      return;
    }
    
    addItem(displayProduct, quantity).then(() => {
      toast.success(`${displayProduct.name} added to cart`, {
        action: { label: 'View Cart', onClick: openCart },
      });
    }).catch((err) => {
      toast.error(err.message || 'Failed to add to cart');
    });
  };

  const handleToggleWishlist = async () => {
    if (!product) return;

    setIsTogglingWishlist(true);
    try {
      const response = await wishlistService.toggleWishlist(product.id);
      if (response.success && response.data) {
        setIsWishlisted(response.data.wishlisted);
        toast.success(
          response.data.wishlisted
            ? `${product.name} added to wishlist`
            : `${product.name} removed from wishlist`
        );
      }
    } catch (error: unknown) {
      const err = error as { response?: { status?: number; data?: { message?: string } } };
      if (err.response?.status === 401 || err.response?.status === 403) {
        toast.error('Please login to manage your wishlist');
      } else {
        toast.error(err.response?.data?.message || 'Failed to update wishlist');
      }
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  const handleBuyNow = () => {
    if (!product) return;
    const displayProduct = getProductById(product.id) || product;

    const existingItem = items.find((i) => i.product.id === displayProduct.id);
    const currentQuantity = existingItem?.quantity || 0;
    const newQuantity = currentQuantity + quantity;
    
    if (displayProduct.stock !== undefined && newQuantity > displayProduct.stock) {
      toast.error(`Only ${displayProduct.stock} items available in stock`);
      return;
    }
    
    addItem(displayProduct, quantity).then(() => {
      navigate('/checkout');
    }).catch((err) => {
      toast.error(err.message || 'Failed to add to cart');
    });
  };

  if (isLoading) {
    return (
      <div className="container-page py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
          <div className="aspect-square bg-gray-100 rounded-2xl animate-pulse" />
          <div className="space-y-5">
            <div className="h-8 bg-gray-100 rounded animate-pulse" />
            <div className="h-12 bg-gray-100 rounded animate-pulse" />
            <div className="h-8 bg-gray-100 rounded animate-pulse w-1/2" />
            <div className="h-24 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-page py-24 text-center">
        <h2 className="text-heading-lg mb-3">Product not found</h2>
        <Button onClick={() => navigate('/products')}>Browse Products</Button>
      </div>
    );
  }

  const displayProduct = getProductById(product.id) || product;

  return (
    <div className="container-page py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-label-xs text-muted-foreground mb-6">
        <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link to="/products" className="hover:text-foreground transition-colors">Products</Link>
        <ChevronRight className="w-3 h-3" />
        <Link to={`/products?category=${product.category}`} className="hover:text-foreground transition-colors capitalize">
          {product.category}
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground font-medium line-clamp-1">{product.name}</span>
      </nav>

      {/* Main section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
        {/* Left: image gallery */}
        <ProductImageGallery images={product.images} name={product.name} />

        {/* Right: product info */}
        <div className="space-y-5">
          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            {product.badge && (
              <Badge className="bg-amber text-amber-foreground">{product.badge}</Badge>
            )}
            {product.isNew && (
              <Badge className="bg-primary text-primary-foreground">New Arrival</Badge>
            )}
            <Badge variant="outline" className="text-xs capitalize">{product.category}</Badge>
          </div>

          {/* Name */}
          <h1 className="text-heading-xl leading-tight">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-4">
            <ProductRating rating={product.rating} reviewCount={product.reviewCount} size="md" />
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenReviewDialog}
              className="ml-auto"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Write a Review
            </Button>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold">${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <>
                <span className="text-lg text-muted-foreground line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
                <Badge className="bg-success/10 text-success border-0 font-semibold">
                  Save {discount}%
                </Badge>
              </>
            )}
          </div>

          {/* Stock status */}
          <div className="flex items-center gap-2">
            {displayProduct.inStock ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span className="text-sm text-success font-medium">In Stock</span>
                {displayProduct.stock !== undefined && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <div className="flex items-center gap-1.5 text-sm">
                      <Package className="w-4 h-4 text-gray-500" />
                      <span className={displayProduct.stock <= 3 ? 'text-red-500 font-medium' : 'text-gray-600'}>
                        {displayProduct.stock} available
                      </span>
                    </div>
                  </>
                )}
              </>
            ) : (
              <span className="text-sm text-destructive font-medium">Out of Stock</span>
            )}
          </div>

          <Separator />

          {/* Short description */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            {product.description}
          </p>

          {/* Quantity + Actions */}
          {displayProduct.inStock && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">Quantity:</span>
                <div className="flex items-center border border-border rounded-md">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-none"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </Button>
                  <span className="w-12 text-center text-sm font-medium">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-none"
                    onClick={() => {
                      const maxStock = displayProduct.stock !== undefined ? displayProduct.stock : 99;
                      if (quantity < maxStock) {
                        setQuantity(quantity + 1);
                      }
                    }}
                    aria-label="Increase quantity"
                    disabled={displayProduct.stock !== undefined && quantity >= displayProduct.stock}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  className="flex-1 gap-2 bg-primary hover:bg-primary/90"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  onClick={handleBuyNow}
                >
                  Buy Now
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Add to wishlist"
                  disabled={isTogglingWishlist}
                  onClick={handleToggleWishlist}
                >
                  <Heart
                    className={cn(
                      'w-5 h-5',
                      isWishlisted && 'fill-red-500 text-red-500'
                    )}
                  />
                </Button>
                <Button variant="ghost" size="icon" aria-label="Share">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Trust signals */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            {[
              { icon: Truck, title: 'Free Shipping', sub: 'Orders over $75' },
              { icon: RotateCcw, title: 'Easy Returns', sub: '30-day policy' },
              { icon: Shield, title: 'Secure Pay', sub: '256-bit SSL' },
            ].map(({ icon: Icon, title, sub }) => (
              <div
                key={title}
                className="flex flex-col items-center gap-1 p-3 rounded-xl bg-muted text-center"
              >
                <Icon className="w-5 h-5 text-primary" />
                <span className="text-xs font-semibold">{title}</span>
                <span className="text-xs text-muted-foreground">{sub}</span>
              </div>
            ))}
          </div>

          {/* Tags */}
          {product.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground font-medium">Tags:</span>
              {product.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabs: Description / Specs / Reviews */}
      <Tabs defaultValue="description" className="mb-12">
        <TabsList className="bg-muted w-full justify-start h-auto p-1 gap-1">
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="specs">Specifications</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({product.reviewCount.toLocaleString()})</TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="mt-4 prose prose-sm max-w-none">
          <div className="bg-card border border-border rounded-xl p-6">
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            <div className="mt-4 space-y-2">
              <h4 className="font-semibold text-sm">Key Highlights</h4>
              <ul className="space-y-1.5">
                {Object.entries(product.specs).slice(0, 4).map(([k, v]) => (
                  <li key={k} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" />
                    <span><strong className="text-foreground">{k}:</strong> {v}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="specs" className="mt-4">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                {Object.entries(product.specs).map(([key, value], i) => (
                  <tr
                    key={key}
                    className={i % 2 === 0 ? 'bg-muted/50' : 'bg-card'}
                  >
                    <td className="px-5 py-3 font-medium text-muted-foreground w-1/3">{key}</td>
                    <td className="px-5 py-3">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="mt-4">
          <div className="bg-card border border-border rounded-xl p-6">
            {isLoadingReviews ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading reviews...</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
                <p className="text-muted-foreground">Be the first to review this product!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-border pb-6 last:border-0 last:pb-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium">{review.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditReview(review)}
                          className="h-6 px-2 text-xs"
                        >
                          Edit
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Related products */}

     {related.length > 0 && (
  <section aria-labelledby="related-products">
    <div className="flex items-center justify-between mb-5">
      <h2 id="related-products" className="text-heading-lg">Related Products</h2>
      <Link to={`/products?category=${product.category}`}>
        <Button variant="ghost" size="sm">
          View all
        </Button>
      </Link>
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {related.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  </section>
)}

      {/* Review Dialog */}
      {reviewDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>{editingReviewId ? 'Edit Review' : 'Write a Review'}</CardTitle>
              <CardDescription>
                Review: {product?.name}
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
