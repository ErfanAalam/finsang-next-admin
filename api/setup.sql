-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  type text NOT NULL,
  youtube_url text NULL,
  card_name text NULL,
  bank_name text NULL,
  benefits text[] NULL,
  payout jsonb NULL,
  terms text[] NULL,
  card_benefits jsonb NULL,
  application_process_url text NULL,
  eligibility jsonb NULL,
  faqs jsonb NULL,
  created_at timestamp with time zone NULL DEFAULT timezone('utc'::text, now()),
  joining_fees text NULL,
  renewal_fees text NULL,
  payout_str text NULL,
  "Image_url" text NULL,
  popular_product boolean NULL DEFAULT false,
  updated_at timestamp with time zone NULL,
  CONSTRAINT products_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

-- Create productypes table (for product categories)
CREATE TABLE IF NOT EXISTS public.productypes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  type text NOT NULL UNIQUE,
  created_at timestamp with time zone NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT productypes_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

-- Insert some default product types
INSERT INTO public.productypes (type) VALUES 
  ('Credit Cards'),
  ('Debit Cards'),
  ('Prepaid Cards'),
  ('Business Cards')
ON CONFLICT (type) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_type ON public.products(type);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at);
CREATE INDEX IF NOT EXISTS idx_products_popular ON public.products(popular_product) WHERE popular_product = true; 