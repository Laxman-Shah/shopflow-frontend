import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Package } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function CartSheet() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    totalItems,
    totalPrice,
    clearCart,
  } = useCartStore();

  const count = totalItems();
  const subtotal = totalPrice();
  const shipping = subtotal >= 75 ? 0 : 9.99;
  const total = subtotal + shipping;

  return (
    <Sheet open={isOpen} onOpenChange={(v) => !v && closeCart()}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="px-5 pt-5 pb-4 border-b border-border">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" />
              Your Cart
              {count > 0 && (
                <Badge className="bg-primary text-primary-foreground rounded-full h-5 min-w-5 px-1.5 text-xs">
                  {count}
                </Badge>
              )}
            </SheetTitle>
            {items.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground h-7"
                onClick={clearCart}
              >
                Clear all
              </Button>
            )}
          </div>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <ShoppingBag className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold text-lg mb-1">Your cart is empty</p>
              <p className="text-sm text-muted-foreground">
                Add items to your cart to see them here
              </p>
            </div>
            <Link to="/products" onClick={closeCart}>
              <Button className="mt-2 bg-primary hover:bg-primary/90 w-full">Start Shopping</Button>
            </Link>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 px-5">
              <div className="space-y-4 py-4">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex gap-3">
                    <Link
                      to={`/products/${product.slug}`}
                      onClick={closeCart}
                      className="shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-border bg-surface"
                    >
                      {product.images && product.images.length > 0 && product.images[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <ShoppingBag className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </Link>
                    <div className="flex-1 min-w-0 space-y-1">
                      <Link
                        to={`/products/${product.slug}`}
                        onClick={closeCart}
                        className="text-sm font-medium line-clamp-2 hover:text-primary transition-colors"
                      >
                        {product.name}
                      </Link>
                      <p className="text-xs text-muted-foreground capitalize">{product.category}</p>
                      
                      {/* Stock display */}
                      {product.stock !== undefined && (
                        <div className="flex items-center gap-1.5 text-xs">
                          <Package className="w-3 h-3 text-gray-500" />
                          <span className={cn(
                            product.stock <= 3 ? 'text-red-500 font-medium' : 'text-gray-600'
                          )}>
                            {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mt-2">
                        {/* Qty controls */}
                        <div className="flex items-center border border-border rounded-md h-7">
                          <button
                            className="px-2 h-full hover:bg-muted transition-colors rounded-l-md"
                            onClick={() => updateQuantity(product.id, quantity - 1)}
                            aria-label="Decrease"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-medium min-w-6 text-center">{quantity}</span>
                          <button
                            className="px-2 h-full hover:bg-muted transition-colors rounded-r-md"
                            onClick={() => {
                              const newQty = quantity + 1;
                              if (product.stock !== undefined && newQty > product.stock) {
                                toast.error(`Only ${product.stock} items available in stock`);
                                return;
                              }
                              updateQuantity(product.id, newQty).catch((err) => {
                                toast.error(err.message || 'Failed to update quantity');
                              });
                            }}
                            aria-label="Increase"
                            disabled={product.stock !== undefined && quantity >= product.stock}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold">
                            ${(product.price * quantity).toFixed(2)}
                          </span>
                          <button
                            className="text-muted-foreground hover:text-destructive transition-colors p-1"
                            onClick={() => removeItem(product.id)}
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <SheetFooter className="flex-col gap-0 p-5 border-t border-border bg-card">
              {/* Order summary */}
              <div className="space-y-2 mb-4 w-full">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className={shipping === 0 ? 'text-success font-medium' : ''}>
                    {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Add ${(75 - subtotal).toFixed(2)} more for free shipping
                  </p>
                )}
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <Link to="/checkout" onClick={closeCart}>
                <Button className="w-full gap-2 bg-primary hover:bg-primary/90 h-11">
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/products" onClick={closeCart}>
                <Button variant="ghost" className="w-full mt-2">Continue Shopping</Button>
              </Link>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
