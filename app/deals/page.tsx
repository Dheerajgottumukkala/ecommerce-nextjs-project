'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Percent, Clock, Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/products/ProductCard';
import { supabase, Product } from '@/lib/supabase';

export default function DealsPage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [discountedProducts, setDiscountedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      // Fetch featured products as "deals"
      const { data: featured, error: featuredError } = await supabase
        .from('products')
        .select('*, categories(*)')
        .eq('is_featured', true)
        .eq('is_active', true)
        .limit(8);

      if (featuredError) throw featuredError;

      // Fetch products with lower prices as "discounted"
      const { data: discounted, error: discountedError } = await supabase
        .from('products')
        .select('*, categories(*)')
        .eq('is_active', true)
        .lte('price', 100)
        .neq('is_featured', true)
        .limit(8);

      if (discountedError) throw discountedError;

      setFeaturedProducts(featured || []);
      setDiscountedProducts(discounted || []);
    } catch (error) {
      console.error('Error fetching deals:', error);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="relative mb-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 animate-gradient opacity-90" />
          <div className="absolute inset-0 particles" />
          
          <div className="relative z-10 text-center py-16 text-white">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <Badge variant="secondary" className="mb-4 bg-white/10 text-white border-white/20 glass animate-bounce-in">
                <Zap className="w-4 h-4 mr-2" />
                🔥 Limited Time Offers
              </Badge>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6 neon-text">
                Incredible Deals
              </h1>
              
              <p className="text-xl md:text-2xl mb-8 text-orange-100 max-w-2xl mx-auto">
                Don't miss out on these amazing offers! Limited time deals with up to 70% off.
              </p>
              
              <div className="flex items-center justify-center space-x-4 text-sm">
                <div className="flex items-center space-x-2 glass rounded-lg p-3">
                  <Clock className="h-5 w-5" />
                  <span>Ends in 2 days</span>
                </div>
                <div className="flex items-center space-x-2 glass rounded-lg p-3">
                  <Percent className="h-5 w-5" />
                  <span>Up to 70% off</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Featured Deals */}
        <section className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <Badge variant="secondary" className="mb-4 animate-bounce-in">
              <Star className="w-4 h-4 mr-2" />
              ⭐ Staff Picks
            </Badge>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-4 holographic">
              Featured Deals
            </h2>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our top picks for the best deals this week. Handpicked by our experts 
              for exceptional value and quality.
            </p>
          </motion.div>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.div 
                  key={i} 
                  className="bg-muted animate-pulse rounded-lg h-80 animate-breathe"
                  initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                />
              ))}
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {featuredProducts.map((product, index) => (
                <motion.div 
                  key={product.id} 
                  variants={itemVariants}
                  className={`stagger-${(index % 6) + 1}`}
                  whileHover={{ 
                    y: -15, 
                    rotateY: 10, 
                    scale: 1.05,
                    transition: { type: "spring", stiffness: 300 }
                  }}
                >
                  <div className="perspective-1000">
                    <ProductCard product={product} />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </section>

        {/* Budget Friendly */}
        <section className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <Badge variant="secondary" className="mb-4 animate-bounce-in">
              <Percent className="w-4 h-4 mr-2" />
              💰 Budget Friendly
            </Badge>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-4 holographic">
              Under $100
            </h2>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Great products that won't break the bank. Quality items at 
              unbeatable prices.
            </p>
          </motion.div>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.div 
                  key={i} 
                  className="bg-muted animate-pulse rounded-lg h-80 animate-breathe"
                  initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                />
              ))}
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {discountedProducts.map((product, index) => (
                <motion.div 
                  key={product.id} 
                  variants={itemVariants}
                  className={`stagger-${(index % 6) + 1}`}
                  whileHover={{ 
                    y: -15, 
                    rotateY: 10, 
                    scale: 1.05,
                    transition: { type: "spring", stiffness: 300 }
                  }}
                >
                  <div className="perspective-1000">
                    <ProductCard product={product} />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </section>

        {/* Call to Action */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center py-16 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 animate-gradient opacity-90" />
          <div className="relative z-10 text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 neon-text">
              Don't Miss Out!
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              These deals won't last forever. Shop now and save big!
            </p>
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 magnetic pulse-glow">
              <ArrowRight className="mr-2 h-5 w-5" />
              Shop All Deals
            </Button>
          </div>
        </motion.section>
      </main>
      
      <Footer />
    </div>
  );
}