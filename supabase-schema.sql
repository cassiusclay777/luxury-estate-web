-- LuxEstate Database Schema
-- Run this in your Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search

-- Drop existing table if needed (be careful in production!)
-- DROP TABLE IF EXISTS properties CASCADE;

-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  bedrooms INTEGER,
  bathrooms INTEGER,
  sqft INTEGER,
  images TEXT[] DEFAULT '{}',
  lat NUMERIC,
  lng NUMERIC,
  features TEXT[],
  property_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_property_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_lat ON properties(lat);
CREATE INDEX IF NOT EXISTS idx_properties_lng ON properties(lng);

-- Create GIN index for full-text search
CREATE INDEX IF NOT EXISTS idx_properties_search ON properties USING gin(
  to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(address, '') || ' ' || coalesce(city, ''))
);

-- Create trigram index for fuzzy search
CREATE INDEX IF NOT EXISTS idx_properties_title_trgm ON properties USING gin(title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_properties_address_trgm ON properties USING gin(address gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_properties_city_trgm ON properties USING gin(city gin_trgm_ops);

-- Create function for full-text search
CREATE OR REPLACE FUNCTION search_properties(search_query TEXT)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  price NUMERIC,
  address TEXT,
  city TEXT,
  bedrooms INTEGER,
  bathrooms INTEGER,
  sqft INTEGER,
  images TEXT[],
  lat NUMERIC,
  lng NUMERIC,
  features TEXT[],
  property_type TEXT,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.title,
    p.description,
    p.price,
    p.address,
    p.city,
    p.bedrooms,
    p.bathrooms,
    p.sqft,
    p.images,
    p.lat,
    p.lng,
    p.features,
    p.property_type,
    ts_rank(
      to_tsvector('simple', coalesce(p.title, '') || ' ' || coalesce(p.description, '') || ' ' || coalesce(p.address, '') || ' ' || coalesce(p.city, '')),
      plainto_tsquery('simple', search_query)
    ) as rank
  FROM properties p
  WHERE
    to_tsvector('simple', coalesce(p.title, '') || ' ' || coalesce(p.description, '') || ' ' || coalesce(p.address, '') || ' ' || coalesce(p.city, ''))
    @@ plainto_tsquery('simple', search_query)
    OR similarity(p.title, search_query) > 0.3
    OR similarity(p.address, search_query) > 0.3
    OR similarity(p.city, search_query) > 0.3
  ORDER BY rank DESC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql;

-- Create function for nearby properties (Haversine distance)
CREATE OR REPLACE FUNCTION nearby_properties(
  user_lat NUMERIC,
  user_lng NUMERIC,
  radius_km NUMERIC DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  price NUMERIC,
  address TEXT,
  city TEXT,
  bedrooms INTEGER,
  bathrooms INTEGER,
  sqft INTEGER,
  images TEXT[],
  lat NUMERIC,
  lng NUMERIC,
  features TEXT[],
  property_type TEXT,
  distance_km NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.title,
    p.description,
    p.price,
    p.address,
    p.city,
    p.bedrooms,
    p.bathrooms,
    p.sqft,
    p.images,
    p.lat,
    p.lng,
    p.features,
    p.property_type,
    (
      6371 * acos(
        cos(radians(user_lat)) * cos(radians(p.lat::float8)) *
        cos(radians(p.lng::float8) - radians(user_lng)) +
        sin(radians(user_lat)) * sin(radians(p.lat::float8))
      )
    )::NUMERIC as distance_km
  FROM properties p
  WHERE p.lat IS NOT NULL AND p.lng IS NOT NULL
  HAVING (
    6371 * acos(
      cos(radians(user_lat)) * cos(radians(p.lat::float8)) *
      cos(radians(p.lng::float8) - radians(user_lng)) +
      sin(radians(user_lat)) * sin(radians(p.lat::float8))
    )
  ) <= radius_km
  ORDER BY distance_km
  LIMIT 50;
END;
$$ LANGUAGE plpgsql;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_properties_updated_at
BEFORE UPDATE ON properties
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Allow public read access" ON properties
  FOR SELECT
  USING (true);

-- Create policy for authenticated insert (for admin/seed scripts)
CREATE POLICY "Allow authenticated insert" ON properties
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Create policy for authenticated update
CREATE POLICY "Allow authenticated update" ON properties
  FOR UPDATE
  USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Create policy for authenticated delete
CREATE POLICY "Allow authenticated delete" ON properties
  FOR DELETE
  USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Sample data (optional - remove if using seed script)
INSERT INTO properties (title, price, address, city, bedrooms, bathrooms, sqft, images, lat, lng, property_type, features) VALUES
('Luxusní penthouse s výhledem', 25000000, 'Pařížská 15', 'Praha 1', 4, 3, 280, ARRAY['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'], 50.0875, 14.4213, 'Penthouse', ARRAY['terasa', 'výtah', 'garáž']),
('Moderní vila s bazénem', 45000000, 'Na Vyhlídce 8', 'Praha 6', 6, 4, 450, ARRAY['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800'], 50.0755, 14.4378, 'Vila', ARRAY['bazén', 'zahrada', 'smart home'])
ON CONFLICT DO NOTHING;
