-- Add missing columns to production properties table
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/jvklqoapjhqdmhlfmiyw/sql

-- Add area column (replaces sqft)
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS area INTEGER;

-- Add main_image column
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS main_image TEXT;

-- Add published column
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT true;

-- Verify all columns exist
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'properties'
ORDER BY ordinal_position;
