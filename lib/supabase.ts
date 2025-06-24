import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}
if (!supabaseAnonKey) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'admin' | 'customer';
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  slug: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  images: string[] | null;
  category_id: string | null;
  stock_quantity: number;
  sku: string | null;
  slug: string;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  categories?: Category;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  products?: Product;
}

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address: any;
  payment_intent_id: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  created_at: string;
  products?: Product;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  products?: Product;
}