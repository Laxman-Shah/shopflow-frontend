import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ProductRating } from './ProductRating';
import { useCartStore } from '@/store/cartStore';
import { useProductStore } from '@/store/productStore';
import { inventoryService } from '@/services/inventoryService';
import { wishlistService } from '@/services/wishlistService';
import type { Product } from '@/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { resolveImageUrl } from '@/lib/imageUrl';
import { useState, useEffect } from 'react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const items = useCartStore((s) => s.items);
  const getProductById = useProductStore((s) => s.getProductById);
  
  // State for real-time inventory from backend
  const [realTimeStock, setRealTimeStock] = useState<number | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);

  // Fetch real-time inventory from backend
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await inventoryService.getInventoryByProduct(product.id);
        if (response.success && response.data) {
          setRealTimeStock(response.data.availableQuantity);
        }
      } catch (error) {
        console.error('Failed to fetch inventory:', error);
        // Fallback to product store or product data
        const currentProduct = getProductById(product.id);
        if (currentProduct?.stock !== undefined) {
          setRealTimeStock(currentProduct.stock);
        } else if (product.stock !== undefined) {
          setRealTimeStock(product.stock);
        }
      }
    };

    fetchInventory();
  }, [product.id, getProductById]);

  // Fetch wishlist status
  useEffect(() => {
    const fetchWishlistStatus = async () => {
      try {
        const response = await wishlistService.getWishlistStatus(product.id);
        if (response.success && response.data) {
          setIsWishlisted(response.data.wishlisted);
        }
      } catch (error) {
        // If user is not authenticated, just ignore the error
        console.log('Not authenticated or failed to fetch wishlist status');
      }
    };

    fetchWishlistStatus();
  }, [product.id]);

  // Get the current product from store to get real-time stock (for guest users)
  const currentProduct = getProductById(product.id);
  
  // Use real-time inventory from backend, fallback to product store, then product data
  const displayStock = realTimeStock !== null ? realTimeStock : (currentProduct?.stock ?? product.stock);
  const displayInStock = displayStock !== undefined && displayStock > 0;
  const displayProduct = {
    ...product,
    stock: displayStock,
    inStock: displayInStock
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();

    // Check if product is out of stock
    if (!displayProduct.inStock || displayProduct.stock === 0) {
      toast.error('This product is currently out of stock');
      return;
    }

    // Check stock before adding
    const existingItem = items.find((i) => i.product.id === displayProduct.id);
    const currentQuantity = existingItem?.quantity || 0;
    const newQuantity = currentQuantity + 1;

    if (displayProduct.stock !== undefined && newQuantity > displayProduct.stock) {
      toast.error(`Only ${displayProduct.stock} items available in stock`);
      return;
    }

    // Explicitly pass quantity 1 to ensure correct value is sent
    addItem(displayProduct, 1).then(() => {
      toast.success(`${displayProduct.name} added to cart`, {
        action: {
          label: 'View Cart',
          onClick: openCart,
        },
      });
    }).catch((err) => {
      toast.error(err.message || 'Failed to add to cart');
    });
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
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
    } catch (error: any) {
      console.error('Failed to toggle wishlist:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error('Please login to add items to wishlist');
      } else {
        toast.error(error.response?.data?.message || 'Failed to update wishlist');
      }
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  const discount =
    displayProduct.originalPrice
      ? Math.round((1 - displayProduct.price / displayProduct.originalPrice) * 100)
      : null;

  return (
    <Card className="group overflow-hidden border border-gray-200 hover:border-orange-300 hover:shadow-lg transition-all duration-300 bg-white rounded-2xl">
      <Link to={`/products/${product.slug}`} className="block">
        {/* Image container */}
        <div className="relative overflow-hidden bg-gray-50 aspect-square">
          {product.images && product.images.length > 0 && product.images[0] ? (
            <img
              src={resolveImageUrl(product.images[0])}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
              onError={(e) => {
                console.error('Image failed to load:', product.images[0]);
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
                <ShoppingCart className="w-8 h-8 text-orange-500" />
              </div>
            </div>
          )}
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.badge && (
              <Badge className="bg-orange-500 text-white text-xs font-semibold shadow-md">
                {product.badge}
              </Badge>
            )}
            {product.isNew && (
              <Badge className="bg-green-500 text-white text-xs shadow-md">
                New
              </Badge>
            )}
            {!product.inStock && (
              <Badge variant="secondary" className="bg-gray-800 text-white text-xs shadow-md">
                Out of Stock
              </Badge>
            )}
          </div>
          {/* Wishlist */}
          <button
            className={cn(
              'absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center transition-all hover:bg-white shadow-md hover:scale-110',
              isWishlisted ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            )}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            onClick={handleToggleWishlist}
            disabled={isTogglingWishlist}
          >
            <Heart
              className={cn(
                'w-5 h-5 transition-colors',
                isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600 hover:text-red-500'
              )}
            />
          </button>
        </div>

        <CardContent className="p-4 space-y-3">
          {/* Category */}
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{product.category}</p>

          {/* Name */}
          <h3 className="font-semibold text-base leading-snug line-clamp-2 group-hover:text-orange-500 transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          <ProductRating rating={displayProduct.rating} reviewCount={displayProduct.reviewCount} />

          {/* Stock */}
          {displayProduct.stock !== undefined && (
            <div className="flex items-center gap-1.5 text-sm">
              <Package className="w-4 h-4 text-gray-500" />
              <span className={cn(
                'font-medium',
                displayProduct.stock <= 3 ? 'text-red-500' : 'text-gray-600'
              )}>
                {displayProduct.stock > 0 ? `${displayProduct.stock} in stock` : 'Out of stock'}
              </span>
            </div>
          )}

          {/* Price row */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-lg text-gray-900">${displayProduct.price.toFixed(2)}</span>
              {displayProduct.originalPrice && (
                <span className="text-sm text-gray-400 line-through">
                  ${displayProduct.originalPrice.toFixed(2)}
                </span>
              )}
              {discount && (
                <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">{discount}% off</span>
              )}
            </div>
          </div>
        </CardContent>
      </Link>

      {/* Add to cart button */}
      <div className="px-4 pb-4">
        <Button
          className={cn(
            'w-full gap-2 text-sm font-semibold h-11 rounded-xl',
            displayProduct.inStock
              ? 'bg-orange-500 hover:bg-orange-600 shadow-md shadow-orange-500/20'
              : 'opacity-50 cursor-not-allowed bg-gray-300'
          )}
          disabled={!displayProduct.inStock}
          onClick={handleAddToCart}
        >
          <ShoppingCart className="w-4 h-4" />
          {displayProduct.inStock ? 'Add to Cart' : 'Out of Stock'}
        </Button>
      </div>
    </Card>
  );
}
