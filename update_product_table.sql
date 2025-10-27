-- SQL Query to update the product table with enhanced fields
-- This query adds all the new fields that were added to the Product interface

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS sku VARCHAR(100),
ADD COLUMN IF NOT EXISTS weight DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS dimensions VARCHAR(100),
ADD COLUMN IF NOT EXISTS brand VARCHAR(100),
ADD COLUMN IF NOT EXISTS tags TEXT[], -- Array of strings for tags
ADD COLUMN IF NOT EXISTS specifications JSONB, -- JSON object for specifications
ADD COLUMN IF NOT EXISTS warranty TEXT,
ADD COLUMN IF NOT EXISTS shipping_info TEXT,
ADD COLUMN IF NOT EXISTS return_policy TEXT,
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS discount_percentage DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS min_order_quantity INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS max_order_quantity INTEGER,
ADD COLUMN IF NOT EXISTS supplier_info TEXT,
ADD COLUMN IF NOT EXISTS expiry_date DATE,
ADD COLUMN IF NOT EXISTS barcode VARCHAR(100),
ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2),
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- Add indexes for better performance on commonly queried fields
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_discount_percentage ON products(discount_percentage);
CREATE INDEX IF NOT EXISTS idx_products_rating ON products(rating);
CREATE INDEX IF NOT EXISTS idx_products_expiry_date ON products(expiry_date);

-- Add comments to document the new fields
COMMENT ON COLUMN products.sku IS 'Stock Keeping Unit - unique product identifier';
COMMENT ON COLUMN products.weight IS 'Product weight in grams';
COMMENT ON COLUMN products.dimensions IS 'Product dimensions in format LxWxH cm';
COMMENT ON COLUMN products.brand IS 'Product brand name';
COMMENT ON COLUMN products.tags IS 'Array of tags for product categorization';
COMMENT ON COLUMN products.specifications IS 'JSON object containing product specifications';
COMMENT ON COLUMN products.warranty IS 'Warranty information';
COMMENT ON COLUMN products.shipping_info IS 'Shipping information and policies';
COMMENT ON COLUMN products.return_policy IS 'Return policy information';
COMMENT ON COLUMN products.featured IS 'Whether the product is featured/promoted';
COMMENT ON COLUMN products.discount_percentage IS 'Discount percentage (0-100)';
COMMENT ON COLUMN products.min_order_quantity IS 'Minimum order quantity';
COMMENT ON COLUMN products.max_order_quantity IS 'Maximum order quantity';
COMMENT ON COLUMN products.supplier_info IS 'Supplier or manufacturer information';
COMMENT ON COLUMN products.expiry_date IS 'Product expiry date';
COMMENT ON COLUMN products.barcode IS 'Product barcode';
COMMENT ON COLUMN products.rating IS 'Average product rating (0-5)';
COMMENT ON COLUMN products.review_count IS 'Number of reviews for the product'; 