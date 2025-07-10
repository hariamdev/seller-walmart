/*
  # Create Products and Walmart Tokens Tables

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `sku` (text, unique, required)
      - `price` (decimal, required)
      - `quantity` (integer, default 0)
      - `description` (text, optional)
      - `category` (text, required)
      - `status` (text, default 'draft')
      - `seller_id` (uuid, references auth.users)
      - `created_at` (timestamptz, default now)
      - `updated_at` (timestamptz, default now)
    
    - `walmart_tokens`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `access_token` (text, encrypted)
      - `refresh_token` (text, encrypted, optional)
      - `token_type` (text, default 'Bearer')
      - `expires_in` (integer)
      - `expires_at` (timestamptz)
      - `scope` (text, optional)
      - `seller_id` (text, optional)
      - `created_at` (timestamptz, default now)
      - `updated_at` (timestamptz, default now)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data
    - Products can only be accessed by their owner
    - Walmart tokens can only be accessed by their owner

  3. Indexes
    - Add indexes for frequently queried columns
    - Unique constraint on product SKU per seller
*/

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  sku text NOT NULL,
  price decimal(10,2) NOT NULL,
  quantity integer NOT NULL DEFAULT 0,
  description text,
  category text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  seller_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create walmart_tokens table
CREATE TABLE IF NOT EXISTS walmart_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token text NOT NULL,
  refresh_token text,
  token_type text DEFAULT 'Bearer',
  expires_in integer NOT NULL,
  expires_at timestamptz NOT NULL,
  scope text,
  seller_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add unique constraint for SKU per seller
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'products_seller_sku_unique' 
    AND table_name = 'products'
  ) THEN
    ALTER TABLE products ADD CONSTRAINT products_seller_sku_unique UNIQUE (seller_id, sku);
  END IF;
END $$;

-- Add unique constraint for one token per user
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'walmart_tokens_user_unique' 
    AND table_name = 'walmart_tokens'
  ) THEN
    ALTER TABLE walmart_tokens ADD CONSTRAINT walmart_tokens_user_unique UNIQUE (user_id);
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
CREATE INDEX IF NOT EXISTS idx_walmart_tokens_user_id ON walmart_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_walmart_tokens_expires_at ON walmart_tokens(expires_at);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE walmart_tokens ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for products table
CREATE POLICY "Users can view own products"
  ON products
  FOR SELECT
  TO authenticated
  USING (auth.uid() = seller_id);

CREATE POLICY "Users can insert own products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can update own products"
  ON products
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can delete own products"
  ON products
  FOR DELETE
  TO authenticated
  USING (auth.uid() = seller_id);

-- Create RLS policies for walmart_tokens table
CREATE POLICY "Users can view own walmart tokens"
  ON walmart_tokens
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own walmart tokens"
  ON walmart_tokens
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own walmart tokens"
  ON walmart_tokens
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own walmart tokens"
  ON walmart_tokens
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_walmart_tokens_updated_at ON walmart_tokens;
CREATE TRIGGER update_walmart_tokens_updated_at
  BEFORE UPDATE ON walmart_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();