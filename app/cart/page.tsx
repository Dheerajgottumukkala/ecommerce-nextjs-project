'use client';

import { motion } from 'framer-motion';
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';

export default function CartPage() {
  const { user } = useAuth();
  const { items, loading, updateQuantity, removeFromCart, getTotalPrice } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const totalPrice = getTotalPrice();
  const shippingCost = totalPrice > 50 ? 0 : 5.99;
  const finalTotal = totalPrice + shippingCost;

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-4">Please sign in to view your cart</h1>
            <Button asChild>
              <Link href="/auth/signin">Sign In</Link>
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
          <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-muted animate-pulse rounded-lg h-32" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">
                Looks like you haven't added any items to your cart yet.
              </p>
              <Button asChild>
                <Link href="/products">
                  Continue Shopping
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      {items.map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="flex items-center space-x-4"
                        >
                          {/* Product Image */}
                          <div className="relative w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={item.products.image_url || '/placeholder-product.jpg'}
                              alt={item.products.name}
                              fill
                              className="object-cover"
                            />
                          </div>

                          {/* Product Info */}
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/products/${item.products.slug}`}
                              className="text-lg font-semibold hover:text-primary transition-colors line-clamp-1"
                            >
                              {item.products.name}
                            </Link>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {item.products.description}
                            </p>
                            <p className="text-lg font-bold text-primary mt-1">
                              {formatPrice(item.products.price)}
                            </p>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            
                            <span className="w-12 text-center font-semibold">
                              {item.quantity}
                            </span>
                            
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.products.stock_quantity}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Remove Button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Continue Shopping */}
                <div className="mt-6">
                  <Button variant="outline" asChild>
                    <Link href="/products">
                      Continue Shopping
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="sticky top-4">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                        <span>{formatPrice(totalPrice)}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span>Shipping</span>
                        <span>
                          {shippingCost === 0 ? (
                            <span className="text-green-600">FREE</span>
                          ) : (
                            formatPrice(shippingCost)
                          )}
                        </span>
                      </div>
                      
                      {totalPrice > 0 && totalPrice < 50 && (
                        <p className="text-sm text-muted-foreground">
                          Add {formatPrice(50 - totalPrice)} more for free shipping
                        </p>
                      )}
                      
                      <Separator />
                      
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Total</span>
                        <span>{formatPrice(finalTotal)}</span>
                      </div>
                    </div>

                    <Button className="w-full mt-6" size="lg" asChild>
                      <Link href="/checkout">
                        Proceed to Checkout
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>

                    <p className="text-xs text-muted-foreground text-center mt-4">
                      Secure checkout with 256-bit SSL encryption
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
}