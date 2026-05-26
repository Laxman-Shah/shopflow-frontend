import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Banknote,
  Truck,
  Package,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useCartStore } from '@/store/cartStore';
import { useOrderStore } from '@/store/orderStore';
import type { CheckoutStep, ShippingInfo, PaymentInfo } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { paymentService } from '@/services/paymentService';

const STEPS: { key: CheckoutStep; label: string; icon: React.ElementType }[] = [
  { key: 'shipping', label: 'Shipping', icon: Truck },
  { key: 'payment', label: 'Payment', icon: CreditCard },
  { key: 'confirmation', label: 'Confirm', icon: Package },
];

function StepIndicator({ current }: { current: CheckoutStep }) {
  const idx = STEPS.findIndex((s) => s.key === current);
  const progress = ((idx + 1) / STEPS.length) * 100;

  return (
    <div className="mb-8">
      <Progress value={progress} className="h-1.5 mb-4" />
      <div className="flex justify-between">
        {STEPS.map(({ key, label, icon: Icon }, i) => {
          const done = i < idx;
          const active = key === current;
          return (
            <div key={key} className="flex flex-col items-center gap-1.5 flex-1">
              <div
                className={cn(
                  'w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all',
                  done
                    ? 'bg-success border-success text-success-foreground'
                    : active
                    ? 'bg-primary border-primary text-primary-foreground'
                    : 'bg-muted border-border text-muted-foreground'
                )}
              >
                {done ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
              </div>
              <span
                className={cn(
                  'text-xs font-medium',
                  active ? 'text-primary' : done ? 'text-success' : 'text-muted-foreground'
                )}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ShippingStep({
  data,
  onChange,
}: {
  data: Partial<ShippingInfo>;
  onChange: (d: Partial<ShippingInfo>) => void;
}) {
  const field = (key: keyof ShippingInfo) => ({
    value: data[key] ?? '',
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...data, [key]: e.target.value }),
  });

  return (
    <div className="space-y-4">
      <h2 className="text-heading-md">Customer Information</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="firstName">Full Name *</Label>
          <Input id="firstName" placeholder="John Doe" {...field('firstName')} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email Address *</Label>
          <Input id="email" type="email" placeholder="john@example.com" {...field('email')} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="phone">Phone Number *</Label>
        <Input id="phone" type="tel" placeholder="+977 9800000000" {...field('phone')} />
      </div>

      <Separator className="my-6" />

      <h2 className="text-heading-md">Shipping Information</h2>
      <div className="space-y-1.5">
        <Label htmlFor="province">Province/State *</Label>
        <Input id="province" placeholder="Bagmati Province" {...field('province')} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="city">City *</Label>
          <Input id="city" placeholder="Kathmandu" {...field('city')} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="area">Area *</Label>
          <Input id="area" placeholder="Thamel" {...field('area')} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="address">Full Address *</Label>
        <Input id="address" placeholder="Street address, building name, house number" {...field('address')} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="zipCode">ZIP/Postal Code *</Label>
          <Input id="zipCode" placeholder="44600" {...field('zipCode')} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="landmark">Landmark (Optional)</Label>
          <Input id="landmark" placeholder="Near hospital, bank, etc." {...field('landmark')} />
        </div>
      </div>
    </div>
  );
}

function PaymentStep({
  data,
  onChange,
}: {
  data: Partial<PaymentInfo>;
  onChange: (d: Partial<PaymentInfo>) => void;
}) {
  const method = data.method ?? 'CASH_ON_DELIVERY';
  return (
    <div className="space-y-5">
      <h2 className="text-heading-md">Payment Method</h2>
      <RadioGroup
        value={method}
        onValueChange={(v) => onChange({ ...data, method: v as PaymentInfo['method'] })}
        className="space-y-3"
      >
        {[
          { value: 'CASH_ON_DELIVERY', label: 'Cash on Delivery', icon: Package, description: 'Pay when you receive your order' },
          { value: 'ESEWA', label: 'eSewa', icon: Banknote, description: 'Pay with eSewa mobile wallet' },
          { value: 'KHALTI', label: 'Khalti', icon: Banknote, description: 'Pay with Khalti mobile wallet' },
          { value: 'CARD', label: 'Credit / Debit Card', icon: CreditCard, description: 'Visa, Mastercard, or other cards' },
          { value: 'BANK_TRANSFER', label: 'Bank Transfer', icon: Banknote, description: 'Direct bank transfer' },
        ].map(({ value, label, icon: Icon, description }) => (
          <div
            key={value}
            className={cn(
              'flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all',
              method === value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
            )}
            onClick={() => onChange({ ...data, method: value as PaymentInfo['method'] })}
          >
            <RadioGroupItem value={value} id={value} className="mt-1" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Icon className="w-5 h-5 text-muted-foreground" />
                <Label htmlFor={value} className="cursor-pointer font-medium">{label}</Label>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            </div>
            {method === value && (
              <CheckCircle2 className="w-4 h-4 text-primary mt-1" />
            )}
          </div>
        ))}
      </RadioGroup>

      {method === 'CARD' && (
        <div className="space-y-4 p-4 rounded-xl bg-muted border border-border">
          <div className="space-y-1.5">
            <Label htmlFor="cardNumber">Card Number</Label>
            <Input
              id="cardNumber"
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              value={data.cardNumber ?? ''}
              onChange={(e) => onChange({ ...data, cardNumber: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cardName">Cardholder Name</Label>
            <Input
              id="cardName"
              placeholder="John Doe"
              value={data.cardName ?? ''}
              onChange={(e) => onChange({ ...data, cardName: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="expiry">Expiry Date</Label>
              <Input id="expiry" placeholder="MM / YY" maxLength={7}
                value={data.expiry ?? ''}
                onChange={(e) => onChange({ ...data, expiry: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cvv">CVV</Label>
              <Input id="cvv" placeholder="•••" maxLength={4} type="password"
                value={data.cvv ?? ''}
                onChange={(e) => onChange({ ...data, cvv: e.target.value })}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ConfirmationStep({
  shipping,
  payment,
  subtotal,
  shippingCost,
  total,
  customerNote,
  onCustomerNoteChange,
}: {
  shipping: Partial<ShippingInfo>;
  payment: Partial<PaymentInfo>;
  subtotal: number;
  shippingCost: number;
  total: number;
  customerNote: string;
  onCustomerNoteChange: (note: string) => void;
}) {
  return (
    <div className="space-y-5">
      <h2 className="text-heading-md">Review Your Order</h2>

      <div className="rounded-xl border border-border overflow-hidden">
        <div className="bg-muted/50 px-4 py-2.5 flex items-center gap-2">
          <Truck className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">Shipping Address</span>
        </div>
        <div className="px-4 py-3 text-sm text-muted-foreground space-y-0.5">
          <p className="font-medium text-foreground">{shipping.firstName} {shipping.lastName}</p>
          <p>{shipping.email}</p>
          <p>{shipping.phone}</p>
          <p>{shipping.address}, {shipping.area}</p>
          <p>{shipping.city}, {shipping.province}</p>
          <p>{shipping.zipCode}</p>
          {shipping.landmark && <p>Landmark: {shipping.landmark}</p>}
        </div>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <div className="bg-muted/50 px-4 py-2.5 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">Payment Method</span>
        </div>
        <div className="px-4 py-3 text-sm text-muted-foreground">
          {payment.method === 'CARD'
            ? `Credit Card ending in ${(payment.cardNumber ?? '').slice(-4) || '****'}`
            : payment.method === 'WALLET'
            ? 'Digital Wallet'
            : payment.method === 'BANK_TRANSFER'
            ? 'Bank Transfer'
            : payment.method === 'ESEWA'
            ? 'eSewa'
            : payment.method === 'KHALTI'
            ? 'Khalti'
            : 'Cash on Delivery'}
        </div>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <div className="bg-muted/50 px-4 py-2.5">
          <span className="text-sm font-semibold">Order Summary</span>
        </div>
        <div className="px-4 py-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span className={shippingCost === 0 ? 'text-success' : ''}>{shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-bold text-base">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="customerNote">Customer Note (Optional)</Label>
        <Textarea
          id="customerNote"
          placeholder="Add any special instructions for your order..."
          value={customerNote}
          onChange={(e) => onCustomerNoteChange(e.target.value)}
          rows={3}
        />
      </div>
    </div>
  );
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCartStore();
  const { placeOrder } = useOrderStore();
  const [step, setStep] = useState<CheckoutStep>('shipping');
  const [shipping, setShipping] = useState<Partial<ShippingInfo>>({});
  const [payment, setPayment] = useState<Partial<PaymentInfo>>({ method: 'CASH_ON_DELIVERY' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerNote, setCustomerNote] = useState('');

  const subtotal = Number(totalPrice() || 0);
  const shippingCost = subtotal >= 75 ? 0 : 9.99;
  const total = subtotal + shippingCost;

  if (items.length === 0) {
    return (
      <div className="container-page py-24 text-center">
        <p className="text-heading-lg mb-3">Your cart is empty</p>
        <Button onClick={() => navigate('/products')}>Browse Products</Button>
      </div>
    );
  }

  const validateShipping = () => {
    if (!shipping.firstName || !shipping.email || !shipping.phone ||
        !shipping.province || !shipping.city || !shipping.area ||
        !shipping.address || !shipping.zipCode) {
      toast.error('Please fill in all required shipping fields');
      return false;
    }
    if (!shipping.email.includes('@')) {
      toast.error('Please enter a valid email address');
      return false;
    }
    if (!shipping.phone || shipping.phone.length < 10) {
      toast.error('Please enter a valid phone number');
      return false;
    }
    return true;
  };

  const formatShippingAddress = () => {
    return `${shipping.firstName} ${shipping.lastName || ''}\n${shipping.email}\n${shipping.phone}\n${shipping.address}, ${shipping.area}\n${shipping.city}, ${shipping.province}\n${shipping.zipCode}${shipping.landmark ? `\nLandmark: ${shipping.landmark}` : ''}`;
  };

  const handleNext = async () => {
    if (step === 'shipping') {
      if (!validateShipping()) return;
      setStep('payment');
    } else if (step === 'payment') {
      setStep('confirmation');
    } else {
      // Place order and process payment
      if (!validateShipping()) return;

      setIsProcessing(true);
      try {
        const shippingAddress = formatShippingAddress();

        console.log('[CheckoutPage] Starting checkout process');
        console.log('[CheckoutPage] Shipping address:', shippingAddress);
        console.log('[CheckoutPage] Payment method:', payment.method);

        // Step 1: Place the order
        const order = await placeOrder(shippingAddress, customerNote || undefined);

        console.log('[CheckoutPage] Order placed successfully:', order);
        console.log('[CheckoutPage] Order ID:', order.id);
        console.log('[CheckoutPage] Order status:', order.status);

        // Step 2: Start payment
        const paymentMethod = payment.method as 'CARD' | 'CASH_ON_DELIVERY' | 'WALLET' | 'BANK_TRANSFER' | 'ESEWA' | 'KHALTI';
        console.log('[CheckoutPage] Starting payment with method:', paymentMethod);

        const paymentResponse = await paymentService.startPayment({
          orderId: order.id,
          paymentMethod
        });

        if (paymentResponse.success && paymentResponse.data) {
          // Step 3: Complete payment for non-COD methods
          if (paymentMethod !== 'CASH_ON_DELIVERY') {
            // For demo purposes, we'll auto-complete the payment
            // In a real app, you would redirect to a payment gateway (eSewa, Khalti, etc.)
            const transactionReference = `TXN-${Date.now()}-${order.id.slice(0, 8)}`;
            await paymentService.completePayment(paymentResponse.data.id, {
              transactionReference
            });
          }

          // Clear cart after successful order and payment
          await clearCart();

          toast.success('Order placed successfully! Seller has been notified.');

          // Navigate to order success page
          navigate(`/order-success/${order.id}`);
        } else {
          throw new Error(paymentResponse.message || 'Failed to process payment');
        }
      } catch (error: any) {
        toast.error(error.message || 'Failed to place order');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleBack = () => {
    if (step === 'payment') setStep('shipping');
    else if (step === 'confirmation') setStep('payment');
    else navigate('/products');
  };

  return (
    <div className="container-page py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-label-xs text-muted-foreground mb-6">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link to="/products" className="hover:text-foreground">Products</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground font-medium">Checkout</span>
      </nav>

      <h1 className="text-heading-xl mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: form */}
        <div className="lg:col-span-2">
          <StepIndicator current={step} />

          <div className="bg-card border border-border rounded-xl p-6 mb-5">
            {step === 'shipping' && (
              <ShippingStep data={shipping} onChange={setShipping} />
            )}
            {step === 'payment' && (
              <PaymentStep data={payment} onChange={setPayment} />
            )}
            {step === 'confirmation' && (
              <ConfirmationStep
                shipping={shipping}
                payment={payment}
                subtotal={subtotal}
                shippingCost={shippingCost}
                total={total}
                customerNote={customerNote}
                onCustomerNoteChange={setCustomerNote}
              />
            )}
          </div>

          <div className="flex justify-between">
            <Button variant="outline" className="gap-2" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4" />
              {step === 'shipping' ? 'Back to Cart' : 'Back'}
            </Button>
            <Button 
              className="gap-2 bg-primary hover:bg-primary/90 min-w-36" 
              onClick={handleNext}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : step === 'confirmation' ? (
                <>Place Order</>
              ) : (
                <>
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Right: order summary */}
        <aside>
          <div className="bg-card border border-border rounded-xl overflow-hidden sticky top-24">
            <div className="bg-muted/50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-sm">Order Summary</h3>
            </div>
            <div className="p-5 space-y-4">
              {/* Items */}
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-surface border border-border shrink-0">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name || 'Product'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                          <Package className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium line-clamp-2">{product.name || 'Unknown Product'}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Qty: {Number(quantity || 0)}</p>
                    </div>
                    <p className="text-xs font-bold shrink-0">
                      ${(Number(product.price || 0) * Number(quantity || 0)).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className={shippingCost === 0 ? 'text-success font-medium' : ''}>
                    {shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="text-xs text-muted-foreground text-center">
                🔒 Secured by SSL encryption
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
