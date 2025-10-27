-- Create user_websites table
CREATE TABLE IF NOT EXISTS user_websites (
    id SERIAL PRIMARY KEY,
    website_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    shop_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on website_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_websites_website_id ON user_websites(website_id);

-- Create index on email for potential future features
CREATE INDEX IF NOT EXISTS idx_user_websites_email ON user_websites(email);

-- Add RLS (Row Level Security) policies if needed
-- ALTER TABLE user_websites ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON user_websites TO authenticated;
GRANT ALL ON user_websites TO anon;
GRANT USAGE, SELECT ON SEQUENCE user_websites_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE user_websites_id_seq TO anon; 