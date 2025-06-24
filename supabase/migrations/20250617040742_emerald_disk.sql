/*
  # E-commerce Database Schema

  1. New Tables
    - `profiles` - User profiles extending Supabase auth
      - `id` (uuid, references auth.users)
      - `full_name` (text)
      - `avatar_url` (text)
      - `role` (text, default 'customer')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `categories` - Product categories
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `image_url` (text)
      - `slug` (text, unique)
      - `created_at` (timestamp)

    - `products` - Product catalog
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `price` (decimal)
      - `image_url` (text)
      - `images` (text array)
      - `category_id` (uuid, foreign key)
      - `stock_quantity` (integer)
      - `sku` (text, unique)
      - `slug` (text, unique)
      - `is_featured` (boolean)
      - `is_active` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `cart_items` - Shopping cart items
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `product_id` (uuid, foreign key)
      - `quantity` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `orders` - Order records
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `total_amount` (decimal)
      - `status` (text)
      - `shipping_address` (jsonb)
      - `payment_intent_id` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `order_items` - Order line items
      - `id` (uuid, primary key)
      - `order_id` (uuid, foreign key)
      - `product_id` (uuid, foreign key)
      - `quantity` (integer)
      - `price` (decimal)
      - `created_at` (timestamp)

    - `wishlists` - User wishlist items
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `product_id` (uuid, foreign key)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add admin policies for product and order management
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name text,
  avatar_url text,
  role text DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  image_url text,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price decimal(10,2) NOT NULL,
  image_url text,
  images text[],
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  stock_quantity integer DEFAULT 0,
  sku text UNIQUE,
  slug text UNIQUE NOT NULL,
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  total_amount decimal(10,2) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  shipping_address jsonb,
  payment_intent_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  quantity integer NOT NULL,
  price decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create wishlists table
CREATE TABLE IF NOT EXISTS wishlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Categories policies (public read, admin write)
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);
CREATE POLICY "Only admins can manage categories" ON categories FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Products policies (public read, admin write)
CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Only admins can manage products" ON products FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Cart items policies
CREATE POLICY "Users can manage own cart items" ON cart_items FOR ALL USING (auth.uid() = user_id);

-- Orders policies
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all orders" ON orders FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);
CREATE POLICY "Admins can update orders" ON orders FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Order items policies
CREATE POLICY "Users can view own order items" ON order_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
  )
);
CREATE POLICY "Users can create order items for own orders" ON order_items FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
  )
);
CREATE POLICY "Admins can view all order items" ON order_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Wishlists policies
CREATE POLICY "Users can manage own wishlist" ON wishlists FOR ALL USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_cart_items_user ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_user ON wishlists(user_id);

-- Insert sample categories
INSERT INTO categories (name, description, slug, image_url) VALUES
('Electronics', 'Latest gadgets and electronic devices', 'electronics', 'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg'),
('Clothing', 'Fashion and apparel for all occasions', 'clothing', 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg'),
('Home & Garden', 'Everything for your home and garden', 'home-garden', 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg'),
('Sports', 'Sports equipment and accessories', 'sports', 'https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg'),
('Books', 'Books and educational materials', 'books', 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg');

-- Insert sample products
INSERT INTO products (name, description, price, image_url, images, category_id, stock_quantity, sku, slug, is_featured) VALUES
(
'Premium Wireless Headphones',
'High-quality wireless headphones with noise cancellation and premium sound quality. Perfect for music lovers and professionals.',
299.99,
'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg',
ARRAY['https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg', 'https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg'],
(SELECT id FROM categories WHERE slug = 'electronics'),
50,
'WH-001',
'premium-wireless-headphones',
true
),
(
'Smart Fitness Watch',
'Advanced fitness tracking with heart rate monitoring, GPS, and smartphone integration.',
199.99,
'https://images.pexels.com/photos/393047/pexels-photo-393047.jpeg',
ARRAY['https://images.pexels.com/photos/393047/pexels-photo-393047.jpeg'],
(SELECT id FROM categories WHERE slug = 'electronics'),
75,
'SW-002',
'smart-fitness-watch',
true
),
(
'Designer Cotton T-Shirt',
'Premium cotton t-shirt with modern design. Comfortable and stylish for everyday wear.',
39.99,
'https://images.pexels.com/photos/1018911/pexels-photo-1018911.jpeg',
ARRAY['https://images.pexels.com/photos/1018911/pexels-photo-1018911.jpeg'],
(SELECT id FROM categories WHERE slug = 'clothing'),
100,
'TS-003',
'designer-cotton-t-shirt',
false
),
(
'Modern Table Lamp',
'Elegant table lamp with adjustable brightness and contemporary design.',
89.99,
'https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg',
ARRAY['https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg'],
(SELECT id FROM categories WHERE slug = 'home-garden'),
30,
'TL-004',
'modern-table-lamp',
false
),
(
'Professional Basketball',
'Official size basketball perfect for indoor and outdoor play.',
29.99,
'https://images.pexels.com/photos/1661950/pexels-photo-1661950.jpeg',
ARRAY['https://images.pexels.com/photos/1661950/pexels-photo-1661950.jpeg'],
(SELECT id FROM categories WHERE slug = 'sports'),
200,
'BB-005',
'professional-basketball',
false
),
(
'Programming Handbook',
'Comprehensive guide to modern programming languages and best practices.',
49.99,
'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg',
ARRAY['https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg'],
(SELECT id FROM categories WHERE slug = 'books'),
150,
'BK-006',
'programming-handbook',
true
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();