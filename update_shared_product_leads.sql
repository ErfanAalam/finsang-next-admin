-- Update script for existing shared_product_leads table
-- Run this if the table already exists and you need to add the new fields

-- Create sequence for auto-incrementing finsangId starting from 1001
CREATE SEQUENCE IF NOT EXISTS finsang_id_sequence START 1001;

-- Add new columns to existing table
ALTER TABLE shared_product_leads 
ADD COLUMN IF NOT EXISTS finsang_id INTEGER DEFAULT nextval('finsang_id_sequence') UNIQUE NOT NULL,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS pancard TEXT,
ADD COLUMN IF NOT EXISTS employment_status TEXT CHECK (employment_status IN ('employed', 'unemployed')),
ADD COLUMN IF NOT EXISTS company_name TEXT;

-- Add constraint for employment_status if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'shared_product_leads_employment_status_check'
    ) THEN
        ALTER TABLE shared_product_leads 
        ADD CONSTRAINT shared_product_leads_employment_status_check 
        CHECK (employment_status IN ('employed', 'unemployed'));
    END IF;
END $$;

-- Create index for finsang_id if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_shared_product_leads_finsang_id ON shared_product_leads(finsang_id);

-- Create trigger to automatically update updated_at timestamp if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if it exists and recreate
DROP TRIGGER IF EXISTS update_shared_product_leads_updated_at ON shared_product_leads;
CREATE TRIGGER update_shared_product_leads_updated_at 
    BEFORE UPDATE ON shared_product_leads 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Update existing records to have finsang_id if they don't have one
-- This will assign finsang_id starting from 1001 to existing records
UPDATE shared_product_leads 
SET finsang_id = nextval('finsang_id_sequence') 
WHERE finsang_id IS NULL;

-- Reset sequence to continue from the highest finsang_id (not +1, since nextval will add 1)
SELECT setval('finsang_id_sequence', COALESCE((SELECT MAX(finsang_id) FROM shared_product_leads), 1000));
