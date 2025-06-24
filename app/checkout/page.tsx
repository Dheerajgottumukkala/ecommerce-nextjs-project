'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CreditCard, MapPin, User, Phone, Mail, CheckCircle, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { createOrder } from '@/lib/orders';
import { toast } from 'sonner';

interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export default function CheckoutPage() {
  const { user, profile } = useAuth();
  const { items, loading, getTotalPrice, clearCart } = useCart();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: profile?.full_name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
  });

  const [paymentMethod, setPaymentMethod] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
  });

  useEffect(() => {
    if (profile?.full_name) {
      setShippingAddress(prev => ({
        ...prev,
        fullName: profile.full_name || '',
      }));
    }
    if (user?.email) {
      setShippingAddress(prev => ({
        ...prev,
        email: user.email || '',
      }));
    }
  }, [profile, user]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const subtotal = getTotalPrice();
  const shippingCost = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shippingCost + tax;

  const handleInputChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePaymentChange = (field: string, value: string) => {
    setPaymentMethod(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    const requiredFields: (keyof ShippingAddress)[] = [
      'fullName', 'email', 'phone', 'address', 'city', 'state', 'zipCode'
    ];
    
    for (const field of requiredFields) {
      if (!shippingAddress[field].trim()) {
        toast.error(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }

    const requiredPaymentFields = ['cardNumber', 'expiryDate', 'cvv', 'cardholderName'];
    for (const field of requiredPaymentFields) {
      if (!paymentMethod[field as keyof typeof paymentMethod].trim()) {
        toast.error(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(shippingAddress.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    // Basic phone validation
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    if (!phoneRegex.test(shippingAddress.phone)) {
      toast.error('Please enter a valid phone number');
      return false;
    }

    return true;
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error('Please log in to place an order');
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create the order
      const newOrderId = await createOrder({
        userId: user.id,
        items: items.map(item => ({
          productId: item.product_id,
          quantity: item.quantity,
          price: item.products.price,
        })),
        totalAmount: total,
        shippingAddress,
        paymentMethod: {
          type: 'card',
          last4: paymentMethod.cardNumber.slice(-4),
        },
      });

      // Clear the cart
      await clearCart();

      // Show success
      setOrderId(newOrderId);
      setOrderPlaced(true);
      toast.success('Order placed successfully!');

    } catch (error: any) {
      console.error('Order placement error:', error);
      toast.error(error.message || 'Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <CreditCard className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-4">Please sign in to checkout</h1>
            <Button asChild>
              <Link href="/auth/signin">Sign In</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto text-center py-12"
          >
            <div className="mb-8">
              <CheckCircle className="h-20 w-20 mx-auto text-green-500 mb-4" />
              <h1 className="text-4xl font-bold text-green-600 mb-2">Order Placed Successfully!</h1>
              <p className="text-xl text-muted-foreground">
                Thank you for your purchase. Your order has been confirmed.
              </p>
            </div>

            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Order Number:</span>
                    <span className="font-mono text-primary">#{orderId?.slice(-8).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Amount:</span>
                    <span className="text-xl font-bold text-primary">{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Delivery Address:</span>
                    <span className="text-right text-sm">
                      {shippingAddress.fullName}<br />
                      {shippingAddress.address}<br />
                      {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <p className="text-muted-foreground">
                We've sent a confirmation email to <strong>{shippingAddress.email}</strong>
              </p>
              <p className="text-muted-foreground">
                Your order will be processed within 1-2 business days and you'll receive tracking information once it ships.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <Button asChild>
                  <Link href="/orders">View My Orders</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/products">Continue Shopping</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading || items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <CreditCard className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
            <p className="text-muted-foreground mb-6">
              Add some items to your cart before checking out.
            </p>
            <Button asChild>
              <Link href="/products">Start Shopping</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <div className="flex items-center space-x-4 mb-8">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/cart">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">Checkout</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5" />
                    <span>Shipping Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={shippingAddress.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={shippingAddress.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={shippingAddress.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={shippingAddress.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="123 Main Street"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={shippingAddress.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="New York"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={shippingAddress.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        placeholder="NY"
                      />
                    </div>
                    <div>
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        value={shippingAddress.zipCode}
                        onChange={(e) => handleInputChange('zipCode', e.target.value)}
                        placeholder="10001"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Select value={shippingAddress.country} onValueChange={(value) => handleInputChange('country', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="US">United States</SelectItem>
                        <SelectItem value="CA">Canada</SelectItem>
                        <SelectItem value="UK">United Kingdom</SelectItem>
                        <SelectItem value="AU">Australia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5" />
                    <span>Payment Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="cardholderName">Cardholder Name</Label>
                    <Input
                      id="cardholderName"
                      value={paymentMethod.cardholderName}
                      onChange={(e) => handlePaymentChange('cardholderName', e.target.value)}
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      value={paymentMethod.cardNumber}
                      onChange={(e) => handlePaymentChange('cardNumber', e.target.value)}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input
                        id="expiryDate"
                        value={paymentMethod.expiryDate}
                        onChange={(e) => handlePaymentChange('expiryDate', e.target.value)}
                        placeholder="MM/YY"
                        maxLength={5}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        value={paymentMethod.cvv}
                        onChange={(e) => handlePaymentChange('cvv', e.target.value)}
                        placeholder="123"
                        maxLength={4}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Order Items */}
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-3">
                        <div className="relative w-12 h-12 bg-muted rounded overflow-hidden flex-shrink-0">
                          <Image
                            src={item.products.image_url || '/placeholder-product.jpg'}
                            alt={item.products.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-1">{item.products.name}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-semibold">
                          {formatPrice(item.products.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Pricing Breakdown */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span>
                        {shippingCost === 0 ? (
                          <span className="text-green-600">FREE</span>
                        ) : (
                          formatPrice(shippingCost)
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax</span>
                      <span>{formatPrice(tax)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>

                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handlePlaceOrder}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Processing...</span>
                      </div>
                    ) : (
                      `Place Order - ${formatPrice(total)}`
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    By placing your order, you agree to our Terms of Service and Privacy Policy.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
}