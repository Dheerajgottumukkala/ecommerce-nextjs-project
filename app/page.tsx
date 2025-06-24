'use client';

import { useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { ArrowRight, Star, Shield, Truck, Headphones, AlertCircle, Sparkles, Zap, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/products/ProductCard';
import { supabase, Product, Category } from '@/lib/supabase';
import { checkDatabaseSetup } from '@/lib/database-setup';
import Link from 'next/link';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [databaseError, setDatabaseError] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const { scrollYProgress } = useScroll();
  const yRange = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const pathLength = useSpring(scrollYProgress, { stiffness: 400, damping: 40 });

  useEffect(() => {
    fetchData();
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const fetchData = async () => {
    try {
      const dbChecks = await checkDatabaseSetup();
      const missingTables = dbChecks.filter(check => !check.exists);
      
      if (missingTables.length > 0) {
        setDatabaseError(`Database setup incomplete. Missing tables: ${missingTables.map(t => t.table).join(', ')}`);
        setLoading(false);
        return;
      }

      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*, categories(*)')
        .eq('is_featured', true)
        .eq('is_active', true)
        .limit(8);

      if (productsError) {
        console.error('Products error:', productsError);
        throw productsError;
      }

      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .limit(6);

      if (categoriesError) {
        console.error('Categories error:', categoriesError);
        throw categoriesError;
      }

      setFeaturedProducts(products || []);
      setCategories(categoriesData || []);
      setDatabaseError(null);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      
      if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
        setDatabaseError('Database tables not found. Please run the database migrations.');
      } else if (error.message?.includes('relationship')) {
        setDatabaseError('Database relationship error. Please check your database schema.');
      } else {
        setDatabaseError(`Database error: ${error.message || 'Unknown error'}`);
      }
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

  const floatingVariants = {
    animate: {
      y: [0, -20, 0],
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  if (databaseError) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Alert className="max-w-2xl mx-auto glass">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="ml-2">
                <div className="space-y-4">
                  <p><strong>Database Setup Required</strong></p>
                  <p>{databaseError}</p>
                  <div className="flex space-x-2">
                    <Button asChild size="sm" className="magnetic">
                      <Link href="/setup">Check Database Setup</Link>
                    </Button>
                    <Button variant="outline" size="sm" onClick={fetchData} className="ripple">
                      Retry Connection
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <Header />
      
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full animate-liquid"
          animate={{
            x: mousePosition.x * 0.02,
            y: mousePosition.y * 0.02,
          }}
          transition={{ type: "spring", stiffness: 50 }}
        />
        <motion.div
          className="absolute top-1/2 right-20 w-24 h-24 bg-gradient-to-r from-pink-400/20 to-yellow-400/20 rounded-full animate-float"
          animate={{
            x: mousePosition.x * -0.01,
            y: mousePosition.y * -0.01,
          }}
          transition={{ type: "spring", stiffness: 30 }}
        />
        <motion.div
          className="absolute bottom-20 left-1/3 w-40 h-40 bg-gradient-to-r from-green-400/20 to-blue-400/20 rounded-full animate-morph"
          animate={{
            x: mousePosition.x * 0.015,
            y: mousePosition.y * 0.015,
          }}
          transition={{ type: "spring", stiffness: 40 }}
        />
      </div>
      
      <main className="relative z-10">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 animate-gradient opacity-90" />
          
          {/* Particles Effect */}
          <div className="absolute inset-0 particles" />
          
          {/* 3D Floating Elements */}
          <motion.div
            className="absolute top-1/4 left-1/4 w-16 h-16 bg-white/10 backdrop-blur-sm rounded-lg transform-3d"
            variants={floatingVariants}
            animate="animate"
            style={{ transform: useTransform(scrollYProgress, [0, 1], ['translateZ(0px)', 'translateZ(100px)']) }}
          />
          
          <motion.div
            className="absolute top-1/3 right-1/4 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full transform-3d"
            variants={floatingVariants}
            animate="animate"
            transition={{ delay: 1 }}
          />
          
          <motion.div
            className="absolute bottom-1/4 left-1/3 w-20 h-20 bg-white/10 backdrop-blur-sm rounded-xl transform-3d"
            variants={floatingVariants}
            animate="animate"
            transition={{ delay: 2 }}
          />

          <div className="relative container mx-auto px-4 py-24 lg:py-32 perspective-1000">
            <motion.div
              initial={{ opacity: 0, y: 50, rotateX: 20 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="max-w-4xl mx-auto text-center text-white transform-3d"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              >
                <Badge variant="secondary" className="mb-4 bg-white/10 text-white border-white/20 glass animate-bounce-in">
                  <Sparkles className="w-4 h-4 mr-2" />
                  🎉 Grand Opening Sale - Up to 50% Off
                </Badge>
              </motion.div>
              
              <motion.h1 
                className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 holographic"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                Premium Products
                <br />
                <motion.span 
                  className="text-3xl md:text-5xl lg:text-6xl neon-text"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                >
                  Exceptional Experience
                </motion.span>
              </motion.h1>
              
              <motion.p 
                className="text-xl md:text-2xl mb-8 text-blue-100 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.6 }}
              >
                Discover our curated collection of premium products with unbeatable quality, 
                competitive prices, and world-class customer service.
              </motion.p>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.6 }}
              >
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 magnetic pulse-glow tilt" asChild>
                  <Link href="/products">
                    <Zap className="mr-2 h-5 w-5" />
                    Shop Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 glass ripple" asChild>
                  <Link href="/products">
                    <Globe className="mr-2 h-5 w-5" />
                    Browse Products
                  </Link>
                </Button>
              </motion.div>
              
              <motion.div 
                className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 0.8 }}
              >
                {[
                  { icon: Shield, text: "100% Secure", delay: 0 },
                  { icon: Truck, text: "Free Shipping", delay: 0.1 },
                  { icon: Headphones, text: "24/7 Support", delay: 0.2 }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center justify-center space-x-2 glass rounded-lg p-4 magnetic"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.7 + item.delay, duration: 0.5 }}
                    whileHover={{ scale: 1.05, rotateY: 10 }}
                  >
                    <item.icon className="h-6 w-6 text-blue-200" />
                    <span className="text-blue-100">{item.text}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Featured Categories */}
        <section className="py-16 lg:py-24 relative">
          <motion.div style={{ y: yRange }} className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/50 dark:to-purple-950/50" />
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <motion.h2 
                className="text-3xl md:text-4xl font-bold mb-4 holographic"
                whileInView={{ scale: [0.9, 1.05, 1] }}
                transition={{ duration: 0.6 }}
              >
                Shop by Category
              </motion.h2>
              <motion.p 
                className="text-xl text-muted-foreground max-w-2xl mx-auto"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                Explore our diverse range of product categories, each carefully curated 
                to meet your specific needs and preferences.
              </motion.p>
            </motion.div>
            
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <motion.div 
                    key={i} 
                    className="bg-muted animate-pulse rounded-lg h-48 animate-breathe"
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
                <p className="text-xl text-muted-foreground mb-4">
                  No categories found
                </p>
                <Button asChild className="magnetic">
                  <Link href="/setup">Check Database Setup</Link>
                </Button>
              </motion.div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {categories.map((category, index) => (
                  <motion.div 
                    key={category.id} 
                    variants={itemVariants}
                    className={`stagger-${index + 1}`}
                    whileHover={{ y: -10, rotateY: 5, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Link href={`/products?category=${category.slug}`}>
                      <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer glass tilt perspective-1000">
                        <CardContent className="p-0 relative">
                          <div className="relative h-48 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 overflow-hidden">
                            {category.image_url && (
                              <motion.img
                                src={category.image_url}
                                alt={category.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                whileHover={{ scale: 1.1, rotateZ: 2 }}
                              />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            <motion.div 
                              className="absolute bottom-4 left-4 right-4 text-white"
                              initial={{ opacity: 0, y: 20 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.2, duration: 0.6 }}
                            >
                              <h3 className="text-xl font-semibold mb-2 neon-text">{category.name}</h3>
                              {category.description && (
                                <p className="text-sm text-white/80 line-clamp-2">{category.description}</p>
                              )}
                            </motion.div>
                            
                            {/* Hover Overlay */}
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                              initial={false}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-16 lg:py-24 bg-muted/30 relative overflow-hidden">
          {/* Animated Background Pattern */}
          <motion.div
            className="absolute inset-0 opacity-10"
            animate={{ rotate: 360 }}
            transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-pulse" />
          </motion.div>
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                whileInView={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              >
                <Badge variant="secondary" className="mb-4 animate-bounce-in">
                  <Star className="w-4 h-4 mr-2" />
                  ⭐ Staff Picks
                </Badge>
              </motion.div>
              
              <motion.h2 
                className="text-3xl md:text-4xl font-bold mb-4 holographic"
                whileInView={{ scale: [0.9, 1.05, 1] }}
                transition={{ duration: 0.6 }}
              >
                Featured Products
              </motion.h2>
              
              <motion.p 
                className="text-xl text-muted-foreground max-w-2xl mx-auto"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                Handpicked by our experts, these products represent the perfect 
                blend of quality, innovation, and value.
              </motion.p>
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
            ) : featuredProducts.length === 0 ? (
              <motion.div 
                className="text-center py-12"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
              >
                <p className="text-xl text-muted-foreground mb-4">
                  No featured products found
                </p>
                <Button asChild className="magnetic pulse-glow">
                  <Link href="/setup">Check Database Setup</Link>
                </Button>
              </motion.div>
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
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-center mt-12"
            >
              <Button size="lg" asChild className="magnetic pulse-glow tilt">
                <Link href="/products">
                  View All Products
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-16 lg:py-24 relative">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <motion.h2 
                className="text-3xl md:text-4xl font-bold mb-4 holographic"
                whileInView={{ scale: [0.9, 1.05, 1] }}
                transition={{ duration: 0.6 }}
              >
                Why Choose EliteStore?
              </motion.h2>
              <motion.p 
                className="text-xl text-muted-foreground max-w-2xl mx-auto"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                We're committed to providing you with an exceptional shopping experience 
                that goes beyond just great products.
              </motion.p>
            </motion.div>
            
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {[
                {
                  icon: Shield,
                  title: "Secure Shopping",
                  description: "Your data is protected with bank-level security and encryption.",
                  color: "text-blue-500",
                  gradient: "from-blue-500 to-cyan-500"
                },
                {
                  icon: Truck,
                  title: "Fast Delivery",
                  description: "Free shipping on orders over $50 with express delivery options.",
                  color: "text-green-500",
                  gradient: "from-green-500 to-emerald-500"
                },
                {
                  icon: Star,
                  title: "Premium Quality",
                  description: "Carefully curated products that meet our high standards.",
                  color: "text-yellow-500",
                  gradient: "from-yellow-500 to-orange-500"
                },
                {
                  icon: Headphones,
                  title: "24/7 Support",
                  description: "Our customer service team is always here to help you.",
                  color: "text-purple-500",
                  gradient: "from-purple-500 to-pink-500"
                },
              ].map((feature, index) => (
                <motion.div 
                  key={index} 
                  variants={itemVariants}
                  className={`stagger-${index + 1}`}
                  whileHover={{ 
                    y: -10, 
                    rotateY: 10, 
                    scale: 1.05,
                    transition: { type: "spring", stiffness: 300 }
                  }}
                >
                  <Card className="text-center h-full glass magnetic tilt perspective-1000 group">
                    <CardContent className="p-6 relative overflow-hidden">
                      {/* Animated Background */}
                      <motion.div
                        className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                        initial={false}
                      />
                      
                      <motion.div 
                        className="flex justify-center mb-4"
                        whileHover={{ rotate: 360, scale: 1.2 }}
                        transition={{ duration: 0.6 }}
                      >
                        <div className={`p-3 rounded-full bg-gradient-to-r ${feature.gradient} animate-pulse-glow`}>
                          <feature.icon className={`h-8 w-8 text-white`} />
                        </div>
                      </motion.div>
                      
                      <motion.h3 
                        className="text-xl font-semibold mb-2"
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                      >
                        {feature.title}
                      </motion.h3>
                      
                      <motion.p 
                        className="text-muted-foreground"
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                      >
                        {feature.description}
                      </motion.p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="py-16 lg:py-24 relative overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 animate-gradient"
            style={{ y: useTransform(scrollYProgress, [0, 1], [0, -100]) }}
          />
          
          {/* Floating Elements */}
          <motion.div
            className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-float"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute bottom-10 right-10 w-16 h-16 bg-white/10 rounded-lg animate-liquid"
            animate={{ rotate: -360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          />
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="max-w-2xl mx-auto text-center text-white"
            >
              <motion.h2 
                className="text-3xl md:text-4xl font-bold mb-4 neon-text"
                whileInView={{ scale: [0.9, 1.05, 1] }}
                transition={{ duration: 0.6 }}
              >
                Stay in the Loop
              </motion.h2>
              
              <motion.p 
                className="text-xl mb-8 text-blue-100"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                Subscribe to our newsletter and be the first to know about exclusive deals, 
                new arrivals, and special offers.
              </motion.p>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <motion.input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 glass"
                  whileFocus={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                />
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 magnetic pulse-glow">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Subscribe
                </Button>
              </motion.div>
              
              <motion.p 
                className="text-sm text-blue-200 mt-4"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.6 }}
              >
                We respect your privacy. Unsubscribe at any time.
              </motion.p>
            </motion.div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}