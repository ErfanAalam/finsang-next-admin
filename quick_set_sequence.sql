-- Quick sequence setter for testing
-- Just change the number in the setval() function to set the sequence

-- Create sequence if it doesn't exist
CREATE SEQUENCE IF NOT EXISTS finsang_id_sequence START 1001;

-- Initialize sequence if it hasn't been used yet
DO $$
BEGIN
    -- Try to get current value, if it fails, initialize
    BEGIN
        PERFORM currval('finsang_id_sequence');
    EXCEPTION WHEN OTHERS THEN
        PERFORM nextval('finsang_id_sequence');
    END;
END $$;

-- Set sequence to your desired value (change 1000 to any number you want)
SELECT setval('finsang_id_sequence', 1000);

-- Verify the setting
SELECT 'Sequence set to: ' || currval('finsang_id_sequence') as current_value;
SELECT 'Next finsang_id will be: ' || (currval('finsang_id_sequence') + 1) as next_value;

-- Show existing finsang_ids in table
SELECT 'Existing finsang_ids:' as info;
SELECT finsang_id, user_name, created_at 
FROM shared_product_leads 
ORDER BY finsang_id;
