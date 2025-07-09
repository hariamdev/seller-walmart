/*
  # Create Walmart Tokens Table

  1. New Tables
    - `walmart_tokens`
      - `id` (uuid, primary key)
      - `seller_id` (uuid, references auth.users)
      - `access_token` (text, encrypted)
      - `refresh_token` (text, encrypted)
      - `token_type` (text, default 'Bearer')
      - `expires_in` (integer, seconds until expiration)
      - `expires_at` (timestamptz, calculated expiration time)
      - `scope` (text, token permissions)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `walmart_tokens` table
    - Add policy for users to manage their own tokens only
    - Add indexes for performance

  3. Functions
    - Trigger to automatically update `updated_at` timestamp
    - Function to calculate `expires_at` from `expires_in`
*/

-- Create the walmart_tokens table
CREATE TABLE IF NOT EXISTS walmart_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  access_token text NOT NULL,
  refresh_token text,
  token_type text DEFAULT 'Bearer',
  expires_in integer NOT NULL,
  expires_at timestamptz NOT NULL,
  seller_id text,
  scope text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Ensure one token per seller
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE walmart_tokens ENABLE ROW LEVEL SECURITY;

-- Create policy for users to access only their own tokens
CREATE POLICY "Users can manage own walmart tokens"
  ON walmart_tokens
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_walmart_tokens_seller_id ON walmart_tokens(seller_id);
CREATE INDEX IF NOT EXISTS idx_walmart_tokens_expires_at ON walmart_tokens(expires_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_walmart_tokens_updated_at ON walmart_tokens;
CREATE TRIGGER update_walmart_tokens_updated_at
  BEFORE UPDATE ON walmart_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to calculate expires_at from expires_in
CREATE OR REPLACE FUNCTION calculate_expires_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.expires_at = now() + (NEW.expires_in || ' seconds')::interval;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically calculate expires_at
DROP TRIGGER IF EXISTS calculate_walmart_token_expires_at ON walmart_tokens;
CREATE TRIGGER calculate_walmart_token_expires_at
  BEFORE INSERT OR UPDATE ON walmart_tokens
  FOR EACH ROW
  EXECUTE FUNCTION calculate_expires_at();