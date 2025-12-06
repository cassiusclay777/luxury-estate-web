-- LuxEstate Database Schema
-- Run this in your Supabase SQL Editor

-- Enable required extensions
-- uuid-ossp goes to public (standard practice)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- pg_trgm should be in extensions schema for security
CREATE EXTENSION IF NOT EXISTS "pg_trgm" SCHEMA extensions;

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
  area NUMERIC, -- in m² (changed from sqft)
  images TEXT[] DEFAULT '{}',
  lat NUMERIC,
  lng NUMERIC,
  features TEXT[],
  type TEXT, -- changed from property_type to match API
  status TEXT DEFAULT 'sale', -- 'sale', 'rent', 'sold'
  published BOOLEAN DEFAULT true,
  slug TEXT UNIQUE,
  main_image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(type);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_published ON properties(published);
CREATE INDEX IF NOT EXISTS idx_properties_slug ON properties(slug);
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
  area NUMERIC,
  images TEXT[],
  lat NUMERIC,
  lng NUMERIC,
  features TEXT[],
  type TEXT,
  status TEXT,
  published BOOLEAN,
  slug TEXT,
  main_image TEXT,
  rank REAL
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
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
    p.area,
    p.images,
    p.lat,
    p.lng,
    p.features,
    p.type,
    p.status,
    p.published,
    p.slug,
    p.main_image,
    ts_rank(
      to_tsvector('simple', coalesce(p.title, '') || ' ' || coalesce(p.description, '') || ' ' || coalesce(p.address, '') || ' ' || coalesce(p.city, '')),
      plainto_tsquery('simple', search_query)
    ) as rank
  FROM properties p
  WHERE
    to_tsvector('simple', coalesce(p.title, '') || ' ' || coalesce(p.description, '') || ' ' || coalesce(p.address, '') || ' ' || coalesce(p.city, ''))
    @@ plainto_tsquery('simple', search_query)
    OR extensions.similarity(p.title, search_query) > 0.3
    OR extensions.similarity(p.address, search_query) > 0.3
    OR extensions.similarity(p.city, search_query) > 0.3
  ORDER BY rank DESC
  LIMIT 50;
END;
$$;

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
  area NUMERIC,
  images TEXT[],
  lat NUMERIC,
  lng NUMERIC,
  features TEXT[],
  type TEXT,
  status TEXT,
  published BOOLEAN,
  slug TEXT,
  main_image TEXT,
  distance_km NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
    p.area,
    p.images,
    p.lat,
    p.lng,
    p.features,
    p.type,
    p.status,
    p.published,
    p.slug,
    p.main_image,
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
$$;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_properties_updated_at ON properties;
CREATE TRIGGER update_properties_updated_at
BEFORE UPDATE ON properties
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access" ON properties;
DROP POLICY IF EXISTS "Allow authenticated insert" ON properties;
DROP POLICY IF EXISTS "Allow authenticated update" ON properties;
DROP POLICY IF EXISTS "Allow authenticated delete" ON properties;

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
INSERT INTO properties (title, description, price, address, city, bedrooms, bathrooms, area, images, lat, lng, type, status, features, slug, main_image) VALUES
(
  'Luxusní penthouse s výhledem',
  'Nádherný penthouse v centru Prahy s výhledem na Pražský hrad. Kompletně zařízený, s privátní terasou 80m² a dvěma parkovacími místy.',
  25000000,
  'Pařížská 15',
  'Praha 1',
  4,
  3,
  280,
  ARRAY[
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800'
  ],
  50.0875,
  14.4213,
  'apartment',
  'sale',
  ARRAY['terasa', 'výtah', 'garáž', 'klimatizace', 'smart home'],
  'luxusni-penthouse-vyhledem-praha',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'
),
(
  'Moderní vila s bazénem',
  'Architektonicky unikátní vila s infinity bazénem, wellness zónou a panoramatickým výhledem. Pozemek 1200m².',
  45000000,
  'Na Vyhlídce 8',
  'Praha 6',
  6,
  4,
  450,
  ARRAY[
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
    'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800',
    'https://images.unsplash.com/photo-1613553507747-5f8d62ad5904?w=800'
  ],
  50.0755,
  14.4378,
  'house',
  'sale',
  ARRAY['bazén', 'zahrada', 'garáž', 'wellness', 'vinný sklep', 'smart home'],
  'moderni-vila-bazen-praha6',
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800'
),
(
  'Investiční byt 2+kk',
  'Nový byt v developerském projektu s vysokou návratností investice. Dokončení Q2 2024. Vhodný pro pronájem.',
  4200000,
  'Lidická 25',
  'Brno',
  2,
  1,
  55,
  ARRAY[
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
    'https://images.unsplash.com/photo-1560448075-cbc16bb4af8e?w=800'
  ],
  49.1951,
  16.6068,
  'apartment',
  'sale',
  ARRAY['balkon', 'sklep', 'parkování'],
  'investicni-byt-2kk-brno',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'
)
ON CONFLICT DO NOTHING;
