# Products Management Setup

This document explains how to set up and use the new products management system with image upload functionality.

## Database Setup

### 1. Create the Products Table

Run the following SQL commands in your Supabase database:

```sql
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
```

### 2. Set up Supabase Storage

1. Go to your Supabase dashboard
2. Navigate to Storage
3. Create a new bucket called `card-images`
4. Set the bucket to public
5. Configure the storage policies to allow authenticated users to upload images

Example storage policy for the `card-images` bucket:

```sql
-- Allow authenticated users to upload images
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'card-images' AND auth.role() = 'authenticated');

-- Allow public read access to images
CREATE POLICY "Allow public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'card-images');

-- Allow authenticated users to delete their own uploads
CREATE POLICY "Allow authenticated deletes" ON storage.objects
FOR DELETE USING (bucket_id = 'card-images' AND auth.role() = 'authenticated');
```

## Features

### 1. Product Management

The new products system includes the following features:

- **Basic Information**: Type, card name, bank name, YouTube URL, application process URL
- **Fees**: Joining fees, renewal fees, payout string
- **Image Upload**: Upload card images directly to Supabase storage
- **Benefits & Terms**: Dynamic arrays of benefits and terms
- **Payout Structure**: Complex payout structure with basic, bonus, and coins for different levels
- **Card Benefits**: Structured card benefits with title and description
- **Eligibility**: Age and income requirements for salaried and self-employed
- **FAQs**: Dynamic FAQ management
- **Popular Product Toggle**: Mark products as popular

### 2. Image Upload

The system now supports:
- Direct file upload to Supabase storage
- Automatic URL generation for uploaded images
- Image preview in the product list
- Support for common image formats (JPEG, PNG, etc.)

### 3. Edit Functionality

When clicking the edit button:
- All product data loads into the form
- Image upload field replaces the URL field
- Users can upload a new image or keep the existing one
- All complex data structures (payout, benefits, FAQs, etc.) are properly loaded

## API Endpoints

### Products

- `GET /api/products` - Get all products with pagination
- `GET /api/products/:id` - Get a specific product
- `POST /api/products` - Create a new product
- `PUT /api/products/:id` - Update an existing product
- `DELETE /api/products/:id` - Delete a product
- `POST /api/products/upload-image` - Upload product image

### Product Types

- `GET /api/products/types/all` - Get all product types
- `POST /api/products/types` - Create a new product type
- `DELETE /api/products/types/:type` - Delete a product type

## Usage

### Adding a New Product

1. Navigate to the "Add Product" tab
2. Fill in the basic information (type and card name are required)
3. Upload an image using the file upload button
4. Add benefits, terms, and other details as needed
5. Configure the payout structure for different levels
6. Add card benefits with titles and descriptions
7. Set eligibility requirements
8. Add FAQs
9. Toggle "Popular Product" if needed
10. Click "Create Product"

### Editing a Product

1. Go to the "Manage Products" tab
2. Click the edit icon next to the product you want to edit
3. The form will load with all existing data
4. Make your changes
5. Upload a new image if needed
6. Click "Update Product"

### Managing Categories

1. Go to the "Manage Categories" tab
2. Add new product types using the form
3. Delete existing types using the delete button (admin only)

## Data Structure

### Product Object

```typescript
interface Product {
  id: string;
  type: string;
  youtube_url?: string;
  card_name?: string;
  bank_name?: string;
  benefits?: string[];
  payout?: Payout;
  terms?: string[];
  card_benefits?: CardBenefit[];
  application_process_url?: string;
  eligibility?: Eligibility;
  faqs?: Faq[];
  joining_fees?: string;
  renewal_fees?: string;
  payout_str?: string;
  Image_url?: string;
  popular_product?: boolean;
  created_at?: string;
  updated_at?: string;
}
```

### Payout Structure

```typescript
interface Payout {
  basic: Record<PayoutLevel, number>;
  bonus: Record<PayoutLevel, number>;
  coins: Record<PayoutLevel, number>;
}

type PayoutLevel = 'beginner' | 'pro' | 'expert' | 'genius';
```

### Card Benefits

```typescript
interface CardBenefit {
  title: string;
  description: string;
}
```

### Eligibility

```typescript
interface Eligibility {
  salaried: { age: string; income: string };
  self_employed: { age: string; income: string };
}
```

### FAQs

```typescript
interface Faq {
  question: string;
  answer: string;
}
```

## Environment Variables

Make sure you have the following environment variables set in your `.env` file:

```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Permissions

- **Moderators**: Can create, edit, and view products
- **Admins**: Can create, edit, delete products and manage product types
- **Regular Users**: Can only view products

## Troubleshooting

### Image Upload Issues

1. Check that the `card-images` bucket exists in Supabase storage
2. Verify that the storage policies allow authenticated uploads
3. Ensure the bucket is set to public for read access
4. Check that the file size is within acceptable limits

### Database Issues

1. Verify that the products table was created correctly
2. Check that all required indexes are in place
3. Ensure the productypes table exists and has data

### API Issues

1. Check that all environment variables are set correctly
2. Verify that the authentication middleware is working
3. Ensure the validation rules are appropriate for your data 