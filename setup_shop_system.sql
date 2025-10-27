-- Create shops table
CREATE TABLE IF NOT EXISTS user_shops (
    id SERIAL PRIMARY KEY,
    shop_id VARCHAR(255) UNIQUE NOT NULL,
    shop_name VARCHAR(255) NOT NULL,
    owner_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    description TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product categories table
CREATE TABLE IF NOT EXISTS product_categories (
    id SERIAL PRIMARY KEY,
    shop_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (shop_id) REFERENCES user_shops(shop_id) ON DELETE CASCADE
);

-- Create products table
CREATE TABLE IF NOT EXISTS shop_products (
    id SERIAL PRIMARY KEY,
    product_id VARCHAR(255) UNIQUE NOT NULL,
    shop_id VARCHAR(255) NOT NULL,
    category_id INTEGER,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    stock_quantity INTEGER DEFAULT 0,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (shop_id) REFERENCES user_shops(shop_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES product_categories(id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_shops_shop_id ON user_shops(shop_id);
CREATE INDEX IF NOT EXISTS idx_user_shops_phone ON user_shops(phone);
CREATE INDEX IF NOT EXISTS idx_user_shops_email ON user_shops(email);
CREATE INDEX IF NOT EXISTS idx_shop_products_shop_id ON shop_products(shop_id);
CREATE INDEX IF NOT EXISTS idx_shop_products_category_id ON shop_products(category_id);
CREATE INDEX IF NOT EXISTS idx_shop_products_active ON shop_products(is_active);
CREATE INDEX IF NOT EXISTS idx_product_categories_shop_id ON product_categories(shop_id);

-- Grant necessary permissions
GRANT ALL ON user_shops TO authenticated;
GRANT ALL ON user_shops TO anon;
GRANT ALL ON shop_products TO authenticated;
GRANT ALL ON shop_products TO anon;
GRANT ALL ON product_categories TO authenticated;
GRANT ALL ON product_categories TO anon;
GRANT USAGE, SELECT ON SEQUENCE user_shops_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE user_shops_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE shop_products_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE shop_products_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE product_categories_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE product_categories_id_seq TO anon; 