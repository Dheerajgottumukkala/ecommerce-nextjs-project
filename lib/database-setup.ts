import { supabase } from './supabase';

/**
 * Utility functions to help with database setup and verification
 */

export async function checkDatabaseSetup() {
  try {
    // Check if tables exist by trying to fetch from each one
    const checks = await Promise.allSettled([
      supabase.from('profiles').select('count', { count: 'exact', head: true }),
      supabase.from('categories').select('count', { count: 'exact', head: true }),
      supabase.from('products').select('count', { count: 'exact', head: true }),
      supabase.from('cart_items').select('count', { count: 'exact', head: true }),
      supabase.from('orders').select('count', { count: 'exact', head: true }),
      supabase.from('order_items').select('count', { count: 'exact', head: true }),
      supabase.from('wishlists').select('count', { count: 'exact', head: true }),
    ]);

    const tableNames = ['profiles', 'categories', 'products', 'cart_items', 'orders', 'order_items', 'wishlists'];
    const results = checks.map((check, index) => ({
      table: tableNames[index],
      exists: check.status === 'fulfilled',
      error: check.status === 'rejected' ? check.reason : null,
    }));

    return results;
  } catch (error) {
    console.error('Error checking database setup:', error);
    return [];
  }
}

export async function getSampleData() {
  try {
    const [categoriesResult, productsResult] = await Promise.all([
      supabase.from('categories').select('*').limit(5),
      supabase.from('products').select('*, categories(*)').limit(10),
    ]);

    return {
      categories: categoriesResult.data || [],
      products: productsResult.data || [],
      categoriesError: categoriesResult.error,
      productsError: productsResult.error,
    };
  } catch (error) {
    console.error('Error fetching sample data:', error);
    return {
      categories: [],
      products: [],
      categoriesError: error,
      productsError: error,
    };
  }
}

export async function createSampleDataIfMissing() {
  try {
    // Check if we have categories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id')
      .limit(1);

    if (categoriesError) {
      console.error('Error checking categories:', categoriesError);
      return false;
    }

    // If no categories exist, the migrations haven't been run
    if (!categories || categories.length === 0) {
      console.warn('No categories found. Please run the database migrations first.');
      return false;
    }

    // Check if we have products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id')
      .limit(1);

    if (productsError) {
      console.error('Error checking products:', productsError);
      return false;
    }

    if (!products || products.length === 0) {
      console.warn('No products found. Please run the database migrations first.');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in createSampleDataIfMissing:', error);
    return false;
  }
}