'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Grid, List, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductFilters } from '@/components/products/ProductFilters';
import { supabase, Product } from '@/lib/supabase';
import { useSearchParams } from 'next/navigation';

type ViewType = 'grid' | 'list';
type SortOption = 'newest' | 'price-low' | 'price-high' | 'name';

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<ViewType>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filters, setFilters] = useState<any>({
    categories: [],
    priceRange: [0, 1000],
    inStock: false,
    featured: false,
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('products')
        .select('*, categories(*)')
        .eq('is_active', true);

      // Apply filters
      if (filters.categories.length > 0) {
        query = query.in('category_id', filters.categories);
      }

      if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) {
        query = query
          .gte('price', filters.priceRange[0])
          .lte('price', filters.priceRange[1]);
      }

      if (filters.inStock) {
        query = query.gt('stock_quantity', 0);
      }

      if (filters.featured) {
        query = query.eq('is_featured', true);
      }

      // Apply search query
      const searchQuery = searchParams.get('q');
      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      // Apply sorting
      switch (sortBy) {
        case 'price-low':
          query = query.order('price', { ascending: true });
          break;
        case 'price-high':
          query = query.order('price', { ascending: false });
          break;
        case 'name':
          query = query.order('name', { ascending: true });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;

      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy, searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const searchQuery = searchParams.get('q');

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {searchQuery ? `Search results for "${searchQuery}"` : 'All Products'}
          </h1>
          <p className="text-muted-foreground">
            {loading ? 'Loading...' : `${products.length} products found`}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <ProductFilters 
              onFiltersChange={handleFiltersChange}
              initialFilters={filters}
            />
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-muted-foreground">
                  {products.length} products
                </span>
              </div>

              <div className="flex items-center space-x-4">
                {/* Sort */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">Sort by:</span>
                  <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="name">Name: A to Z</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* View Toggle */}
                <div className="flex items-center space-x-1 border rounded-md p-1">
                  <Button
                    variant={viewType === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewType('grid')}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewType === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewType('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="bg-muted animate-pulse rounded-lg h-80" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl text-muted-foreground mb-4">
                  No products found
                </p>
                <p className="text-muted-foreground">
                  Try adjusting your filters or search query
                </p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`grid gap-6 ${
                  viewType === 'grid'
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                    : 'grid-cols-1'
                }`}
              >
                {products.map((product) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}