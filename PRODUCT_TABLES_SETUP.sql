-- Product Types Table (matching your actual structure)
CREATE TABLE IF NOT EXISTS productypes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(255) NOT NULL,
  youtube_url TEXT,
  card_name VARCHAR(255),
  bank_name VARCHAR(255),
  benefits TEXT[],
  payout JSONB,
  terms TEXT[],
  card_benefits JSONB,
  application_process_url TEXT,
  eligibility JSONB,
  faqs JSONB,
  joining_fees VARCHAR(255),
  renewal_fees VARCHAR(255),
  payout_str TEXT,
  Image_url TEXT,
  popular_product BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_products_type ON products(type);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE productypes ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policies for productypes
CREATE POLICY "Allow public read access to productypes" ON productypes
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to insert productypes" ON productypes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update productypes" ON productypes
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete productypes" ON productypes
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for products
CREATE POLICY "Allow public read access to products" ON products
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to insert products" ON products
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update products" ON products
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete products" ON products
  FOR DELETE USING (auth.role() = 'authenticated');

-- Insert some sample product types
INSERT INTO productypes (type) VALUES
  ('Credit Cards'),
  ('Personal Loans'),
  ('Business Loans'),
  ('Investment Products')
ON CONFLICT DO NOTHING; 