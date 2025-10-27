-- Fix script for finsang_id sequence
-- Run this if the sequence is generating incorrect numbers

-- First, let's see what we have
SELECT '=== CURRENT STATE ===' as info;

-- Check if sequence exists and get its current value safely
DO $$
DECLARE
    seq_exists BOOLEAN;
    current_seq_val INTEGER;
    max_table_val INTEGER;
BEGIN
    -- Check if sequence exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.sequences 
        WHERE sequence_name = 'finsang_id_sequence'
    ) INTO seq_exists;
    
    IF seq_exists THEN
        -- Try to get current value, if it fails, use nextval to initialize
        BEGIN
            SELECT currval('finsang_id_sequence') INTO current_seq_val;
        EXCEPTION WHEN OTHERS THEN
            -- Sequence hasn't been used yet, initialize it
            SELECT nextval('finsang_id_sequence') INTO current_seq_val;
        END;
        
        RAISE NOTICE 'Current sequence value: %', current_seq_val;
    ELSE
        RAISE NOTICE 'Sequence does not exist yet';
    END IF;
    
    -- Get maximum value from table
    SELECT COALESCE(MAX(finsang_id), 0) INTO max_table_val FROM shared_product_leads;
    RAISE NOTICE 'Maximum finsang_id in table: %', max_table_val;
    
    -- Get record count
    RAISE NOTICE 'Total records: %', (SELECT COUNT(*) FROM shared_product_leads);
    
    -- Reset sequence to exactly match the maximum finsang_id in the table
    IF seq_exists THEN
        PERFORM setval('finsang_id_sequence', GREATEST(max_table_val, 1000));
        RAISE NOTICE 'Sequence reset to: %', GREATEST(max_table_val, 1000);
        RAISE NOTICE 'Next finsang_id will be: %', GREATEST(max_table_val, 1000) + 1;
    END IF;
END $$;
