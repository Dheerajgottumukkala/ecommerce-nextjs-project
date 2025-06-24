'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Grid, List, Package, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { supabase, Category } from '@/lib/supabase';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          {/* Page Header */}
          <div className="text-center mb-12">
            <motion.h1 
              className="text-4xl md:text-5xl font-bold mb-4 holographic"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              Shop by Category
            </motion.h1>
            <motion.p 
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Explore our diverse range of product categories, each carefully curated 
              to meet your specific needs and preferences.
            </motion.p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.div 
                  key={i} 
                  className="bg-muted animate-pulse rounded-lg h-64 animate-breathe"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <motion.div 
              className="text-center py-12"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-bold mb-4">No categories found</h2>
              <p className="text-muted-foreground mb-6">
                Categories will appear here once they are added to the system.
              </p>
              <Button asChild className="magnetic">
                <Link href="/products">Browse All Products</Link>
              </Button>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {categories.map((category, index) => (
                <motion.div 
                  key={category.id} 
                  variants={itemVariants}
                  className={`stagger-${index + 1}`}
                  whileHover={{ 
                    y: -15, 
                    rotateY: 10, 
                    scale: 1.05,
                    transition: { type: "spring", stiffness: 300 }
                  }}
                >
                  <Link href={`/products?category=${category.slug}`}>
                    <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer glass tilt perspective-1000 h-full">
                      <CardContent className="p-0 relative h-full">
                        <div className="relative h-64 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 overflow-hidden">
                          {category.image_url && (
                            <motion.div
                              className="relative w-full h-full"
                              whileHover={{ scale: 1.1 }}
                              transition={{ duration: 0.6, ease: "easeOut" }}
                            >
                              <Image
                                src={category.image_url}
                                alt={category.name}
                                fill
                                className="object-cover transition-transform duration-700"
                              />
                            </motion.div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          
                          {/* Hover Overlay */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            initial={false}
                          />
                          
                          <motion.div 
                            className="absolute bottom-4 left-4 right-4 text-white"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                          >
                            <h3 className="text-2xl font-bold mb-2 neon-text">{category.name}</h3>
                            {category.description && (
                              <p className="text-sm text-white/80 line-clamp-2 mb-3">{category.description}</p>
                            )}
                            
                            <motion.div
                              className="flex items-center text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                              whileHover={{ x: 5 }}
                            >
                              <span>Explore Category</span>
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </motion.div>
                          </motion.div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
}