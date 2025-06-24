'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductFilters } from '@/components/products/ProductFilters';
import { supabase, Product } from '@/lib/supabase';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<any>({
    categories: [],
    priceRange: [0, 1000],
    inStock: false,
    featured: false,
  });

  useEffect(() => {
    if (query) {
      searchProducts();
    }
  }, [query, filters]);

  const searchProducts = async () => {
    setLoading(true);
    try {
      let supabaseQuery = supabase
        .from('products')
        .select('*, categories(*)')
        .eq('is_active', true);

      // Apply search query
      if (query) {
        supabaseQuery = supabaseQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
      }

      // Apply filters
      if (filters.categories.length > 0) {
        supabaseQuery = supabaseQuery.in('category_id', filters.categories);
      }

      if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) {
        supabaseQuery = supabaseQuery
          .gte('price', filters.priceRange[0])
          .lte('price', filters.priceRange[1]);
      }

      if (filters.inStock) {
        supabaseQuery = supabaseQuery.gt('stock_quantity', 0);
      }

      if (filters.featured) {
        supabaseQuery = supabaseQuery.eq('is_featured', true);
      }

      const { data, error } = await supabaseQuery.order('created_at', { ascending: false });
      
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error searching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
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
          <div className="mb-8">
            <motion.h1 
              className="text-3xl font-bold mb-2 flex items-center"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Search className="mr-3 h-8 w-8 text-primary" />
              Search Results
            </motion.h1>
            <motion.p 
              className="text-muted-foreground"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              {query ? `Results for "${query}"` : 'Enter a search term to find products'}
              {!loading && ` - ${products.length} products found`}
            </motion.p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <aside className="lg:w-64 flex-shrink-0">
              <ProductFilters 
                onFiltersChange={handleFiltersChange}
                initialFilters={filters}
              />
            </aside>

            {/* Search Results */}
            <div className="flex-1">
              {!query ? (
                <motion.div 
                  className="text-center py-12"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Search className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h2 className="text-2xl font-bold mb-4">Start Your Search</h2>
                  <p className="text-muted-foreground">
                    Use the search bar above to find products you're looking for.
                  </p>
                </motion.div>
              ) : loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <motion.div 
                      key={i} 
                      className="bg-muted animate-pulse rounded-lg h-80"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05, duration: 0.3 }}
                    />
                  ))}
                </div>
              ) : products.length === 0 ? (
                <motion.div 
                  className="text-center py-12"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Search className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h2 className="text-2xl font-bold mb-4">No Results Found</h2>
                  <p className="text-muted-foreground mb-6">
                    We couldn't find any products matching "{query}". 
                    Try adjusting your search terms or filters.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                >
                  {products.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      whileHover={{ 
                        y: -10, 
                        scale: 1.02,
                        transition: { type: "spring", stiffness: 300 }
                      }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
}