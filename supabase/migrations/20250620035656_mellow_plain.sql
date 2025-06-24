/*
  # Fix category relationship for products table

  1. Changes
    - Make category_id NOT NULL to establish clear relationship
    - This allows PostgREST to properly infer the foreign key relationship
    - Update existing products to have valid category references

  2. Security
    - Maintains existing RLS policies
*/

-- First, ensure all products have a valid category_id
-- Set any NULL category_id to the first available category
UPDATE products 
SET category_id = (SELECT id FROM categories LIMIT 1)
WHERE category_id IS NULL;

-- Now make the column NOT NULL to establish the relationship
ALTER TABLE products 
ALTER COLUMN category_id SET NOT NULL;

-- Recreate the foreign key constraint to ensure it's properly recognized
ALTER TABLE products 
DROP CONSTRAINT IF EXISTS products_category_id_fkey;

ALTER TABLE products 
ADD CONSTRAINT products_category_id_fkey 
FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT;