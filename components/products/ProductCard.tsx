'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingCart, Eye, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { Product } from '@/lib/supabase';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error('Please log in to add items to cart');
      return;
    }
    
    await addToCart(product.id);
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error('Please log in to manage wishlist');
      return;
    }
    
    await toggleWishlist(product.id);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const inWishlist = isInWishlist(product.id);

  return (
    <Link href={`/products/${product.slug}`}>
      <motion.div
        className="group perspective-1000"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ 
          y: -10,
          rotateY: 5,
          scale: 1.02,
          transition: { type: "spring", stiffness: 300, damping: 20 }
        }}
        whileTap={{ scale: 0.98 }}
      >
        <Card className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 glass magnetic transform-3d">
          <CardContent className="p-0 relative">
            {/* Image Container */}
            <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
              {/* Badges */}
              <AnimatePresence>
                {product.is_featured && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="absolute top-2 left-2 z-10"
                  >
                    <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 animate-gradient pulse-glow">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  </motion.div>
                )}
                
                {product.stock_quantity === 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
                    className="absolute top-2 right-2 z-10"
                  >
                    <Badge variant="destructive" className="animate-pulse">
                      Out of Stock
                    </Badge>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Product Image */}
              <motion.div
                className="relative w-full h-full"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <Image
                  src={product.image_url || '/placeholder-product.jpg'}
                  alt={product.name}
                  fill
                  className="object-cover transition-all duration-700"
                  onError={() => setImageError(true)}
                />
                
                {/* Gradient Overlay */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={false}
                />
              </motion.div>

              {/* Floating Action Buttons */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 flex items-center justify-center space-x-2"
                  >
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-10 w-10 rounded-full glass magnetic pulse-glow"
                        onClick={handleWishlistToggle}
                      >
                        <Heart 
                          className={`h-4 w-4 transition-colors ${inWishlist ? 'fill-red-500 text-red-500' : ''}`} 
                        />
                      </Button>
                    </motion.div>
                    
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-10 w-10 rounded-full glass magnetic"
                        asChild
                      >
                        <Link href={`/products/${product.slug}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </motion.div>
                    
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Button
                        size="icon"
                        className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 magnetic pulse-glow"
                        onClick={handleAddToCart}
                        disabled={product.stock_quantity === 0}
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Stock Indicator */}
              {product.stock_quantity > 0 && product.stock_quantity <= 10 && (
                <motion.div
                  className="absolute bottom-2 left-2"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300 animate-pulse">
                    <Zap className="w-3 h-3 mr-1" />
                    Only {product.stock_quantity} left
                  </Badge>
                </motion.div>
              )}
            </div>

            {/* Product Info */}
            <motion.div 
              className="p-4 space-y-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="space-y-2">
                <motion.h3 
                  className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors duration-300"
                  whileHover={{ scale: 1.02 }}
                >
                  {product.name}
                </motion.h3>
                {product.description && (
                  <motion.p 
                    className="text-xs text-muted-foreground line-clamp-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {product.description}
                  </motion.p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <motion.div 
                  className="space-y-1"
                  whileHover={{ scale: 1.05 }}
                >
                  <motion.p 
                    className="text-lg font-bold text-primary holographic"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
                  >
                    {formatPrice(product.price)}
                  </motion.p>
                </motion.div>

                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Button
                        size="sm"
                        onClick={handleAddToCart}
                        disabled={product.stock_quantity === 0}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 magnetic"
                      >
                        {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Rating Stars (placeholder) */}
              <motion.div 
                className="flex items-center space-x-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + i * 0.1, type: "spring", stiffness: 300 }}
                  >
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  </motion.div>
                ))}
                <motion.span 
                  className="text-xs text-muted-foreground ml-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  (4.8)
                </motion.span>
              </motion.div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
}