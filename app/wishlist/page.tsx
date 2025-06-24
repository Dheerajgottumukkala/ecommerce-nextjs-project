'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';

export default function WishlistPage() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { items, loading, removeFromWishlist } = useWishlist();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const handleAddToCart = async (productId: string) => {
    await addToCart(productId);
  };

  const handleRemoveFromWishlist = async (itemId: string) => {
    await removeFromWishlist(itemId);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-4">Please sign in to view your wishlist</h1>
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
          <div className="flex items-center space-x-3 mb-8">
            <Heart className="h-8 w-8 text-red-500" />
            <h1 className="text-3xl font-bold">My Wishlist</h1>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-muted animate-pulse rounded-lg h-80" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-bold mb-4">Your wishlist is empty</h2>
              <p className="text-muted-foreground mb-6">
                Save items you love to your wishlist and never lose track of them.
              </p>
              <Button asChild>
                <Link href="/products">
                  Start Shopping
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <p className="text-muted-foreground">
                  {items.length} {items.length === 1 ? 'item' : 'items'} in your wishlist
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="group"
                  >
                    <Card className="overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300">
                      <CardContent className="p-0">
                        {/* Image Container */}
                        <div className="relative aspect-square overflow-hidden bg-muted">
                          <Link href={`/products/${item.products.slug}`}>
                            <Image
                              src={item.products.image_url || '/placeholder-product.jpg'}
                              alt={item.products.name}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          </Link>

                          {/* Remove Button */}
                          <Button
                            size="icon"
                            variant="secondary"
                            className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleRemoveFromWishlist(item.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>

                          {/* Stock Status */}
                          {item.products.stock_quantity === 0 && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <span className="text-white font-semibold">Out of Stock</span>
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="p-4 space-y-3">
                          <div>
                            <Link
                              href={`/products/${item.products.slug}`}
                              className="font-semibold text-sm line-clamp-2 hover:text-primary transition-colors"
                            >
                              {item.products.name}
                            </Link>
                            {item.products.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                {item.products.description}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center justify-between">
                            <p className="text-lg font-bold text-primary">
                              {formatPrice(item.products.price)}
                            </p>
                            
                            {item.products.stock_quantity > 0 && item.products.stock_quantity <= 10 && (
                              <p className="text-xs text-orange-600">
                                Only {item.products.stock_quantity} left
                              </p>
                            )}
                          </div>

                          <Button
                            className="w-full"
                            onClick={() => handleAddToCart(item.products.id)}
                            disabled={item.products.stock_quantity === 0}
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            {item.products.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Continue Shopping */}
              <div className="mt-12 text-center">
                <Button variant="outline" asChild>
                  <Link href="/products">
                    Continue Shopping
                  </Link>
                </Button>
              </div>
            </>
          )}
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
}