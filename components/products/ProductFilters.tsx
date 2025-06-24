'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { supabase, Category } from '@/lib/supabase';

interface ProductFiltersProps {
  onFiltersChange: (filters: any) => void;
  initialFilters?: any;
}

export function ProductFilters({ onFiltersChange, initialFilters }: ProductFiltersProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    categories: initialFilters?.categories || [],
    priceRange: initialFilters?.priceRange || [0, 1000],
    inStock: initialFilters?.inStock || false,
    featured: initialFilters?.featured || false,
    ...initialFilters,
  });

  const [categoryFiltersOpen, setCategoryFiltersOpen] = useState(true);
  const [priceFiltersOpen, setPriceFiltersOpen] = useState(true);
  const [otherFiltersOpen, setOtherFiltersOpen] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

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
    }
  };

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    setFilters((prev: { categories: string[]; priceRange: number[]; inStock: boolean; featured: boolean }) => ({
      ...prev,
      categories: checked 
        ? [...prev.categories, categoryId]
        : prev.categories.filter((id: string) => id !== categoryId)
    }));
  };

  const handlePriceRangeChange = (value: number[]) => {
    setFilters((prev: { categories: string[]; priceRange: number[]; inStock: boolean; featured: boolean }) => ({
      ...prev,
      priceRange: value
    }));
  };

  const handleBooleanFilterChange = (key: string, checked: boolean) => {
    setFilters((prev: { categories: string[]; priceRange: number[]; inStock: boolean; featured: boolean }) => ({
      ...prev,
      [key]: checked
    }));
  };

  const clearFilters = () => {
    setFilters({
      categories: [],
      priceRange: [0, 1000],
      inStock: false,
      featured: false,
    });
  };

  const hasActiveFilters = 
    filters.categories.length > 0 ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 1000 ||
    filters.inStock ||
    filters.featured;

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.categories.length > 0) count += filters.categories.length;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) count += 1;
    if (filters.inStock) count += 1;
    if (filters.featured) count += 1;
    return count;
  };

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-4">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full justify-between"
        >
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                {getActiveFiltersCount()}
              </Badge>
            )}
          </div>
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </Button>
      </div>

      {/* Filters Content */}
      <AnimatePresence>
        {(isOpen || window.innerWidth >= 1024) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:opacity-100 lg:h-auto"
          >
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Filters</CardTitle>
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      <X className="h-4 w-4 mr-1" />
                      Clear All
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Categories */}
                <Collapsible open={categoryFiltersOpen} onOpenChange={setCategoryFiltersOpen}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between p-0 font-semibold">
                      Categories
                      <ChevronDown className={`h-4 w-4 transition-transform ${categoryFiltersOpen ? 'rotate-180' : ''}`} />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-3 mt-3">
                    {categories.map((category) => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={category.id}
                          checked={filters.categories.includes(category.id)}
                          onCheckedChange={(checked) => 
                            handleCategoryChange(category.id, checked as boolean)
                          }
                        />
                        <label 
                          htmlFor={category.id} 
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {category.name}
                        </label>
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>

                {/* Price Range */}
                <Collapsible open={priceFiltersOpen} onOpenChange={setPriceFiltersOpen}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between p-0 font-semibold">
                      Price Range
                      <ChevronDown className={`h-4 w-4 transition-transform ${priceFiltersOpen ? 'rotate-180' : ''}`} />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-3 mt-3">
                    <div className="px-2">
                      <Slider
                        value={filters.priceRange}
                        onValueChange={handlePriceRangeChange}
                        max={1000}
                        min={0}
                        step={10}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground mt-2">
                        <span>${filters.priceRange[0]}</span>
                        <span>${filters.priceRange[1]}</span>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Other Filters */}
                <Collapsible open={otherFiltersOpen} onOpenChange={setOtherFiltersOpen}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between p-0 font-semibold">
                      Other Filters
                      <ChevronDown className={`h-4 w-4 transition-transform ${otherFiltersOpen ? 'rotate-180' : ''}`} />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-3 mt-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="inStock"
                        checked={filters.inStock}
                        onCheckedChange={(checked) => 
                          handleBooleanFilterChange('inStock', checked as boolean)
                        }
                      />
                      <label htmlFor="inStock" className="text-sm font-medium leading-none cursor-pointer">
                        In Stock Only
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="featured"
                        checked={filters.featured}
                        onCheckedChange={(checked) => 
                          handleBooleanFilterChange('featured', checked as boolean)
                        }
                      />
                      <label htmlFor="featured" className="text-sm font-medium leading-none cursor-pointer">
                        Featured Products
                      </label>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}