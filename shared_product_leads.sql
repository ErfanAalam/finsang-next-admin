-- Create sequence for auto-incrementing finsangId starting from 1001
CREATE SEQUENCE IF NOT EXISTS finsang_id_sequence START 1001;

-- Create table for storing shared product leads
CREATE TABLE IF NOT EXISTS shared_product_leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    finsang_id INTEGER DEFAULT nextval('finsang_id_sequence') UNIQUE NOT NULL,
    product_id UUID NOT NULL,
    product_name TEXT NOT NULL,
    product_image_url TEXT,
    product_benefits TEXT[],
    product_application_url TEXT NOT NULL,
    
    -- Sender details
    sender_id UUID,
    sender_name TEXT,
    sender_phone TEXT,
    sender_email TEXT,
    
    -- User details (person who filled the form)
    user_name TEXT NOT NULL,
    user_mobile TEXT NOT NULL,
    user_email TEXT NOT NULL,
    user_income NUMERIC,
    user_pincode TEXT NOT NULL,
    user_age INTEGER NOT NULL,
    date_of_birth DATE,
    pancard TEXT,
    employment_status TEXT CHECK (employment_status IN ('employed', 'unemployed')),
    company_name TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Status tracking
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'applied', 'rejected')),
    notes TEXT
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_shared_product_leads_product_id ON shared_product_leads(product_id);
CREATE INDEX IF NOT EXISTS idx_shared_product_leads_sender_id ON shared_product_leads(sender_id);
CREATE INDEX IF NOT EXISTS idx_shared_product_leads_created_at ON shared_product_leads(created_at);
CREATE INDEX IF NOT EXISTS idx_shared_product_leads_finsang_id ON shared_product_leads(finsang_id);

-- Enable Row Level Security
ALTER TABLE shared_product_leads ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (since this is for lead collection)
CREATE POLICY "Allow all operations on shared_product_leads" ON shared_product_leads
    FOR ALL USING (true);

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_shared_product_leads_updated_at 
    BEFORE UPDATE ON shared_product_leads 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 