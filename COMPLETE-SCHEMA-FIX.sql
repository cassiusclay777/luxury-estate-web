-- Complete Production Supabase Schema Fix
-- Run this in SQL Editor: https://supabase.com/dashboard/project/jvklqoapjhqdmhlfmiyw/sql

-- Add ALL missing columns
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS area INTEGER,
ADD COLUMN IF NOT EXISTS main_image TEXT,
ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'sale',
ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb;

-- Create index on slug for faster lookups
CREATE INDEX IF NOT EXISTS properties_slug_idx ON properties(slug);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS properties_status_idx ON properties(status);

-- Create index on published for filtering
CREATE INDEX IF NOT EXISTS properties_published_idx ON properties(published);

-- Verify all columns
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'properties'
ORDER BY ordinal_position;
