-- Properties table for LuxEstate
-- This schema stores all property listings with full details

-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

  -- Basic info
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC NOT NULL,

  -- Location
  location TEXT NOT NULL,
  address TEXT,
  city TEXT NOT NULL,
  district TEXT,
  latitude NUMERIC,
  longitude NUMERIC,

  -- Property details
  type TEXT NOT NULL, -- 'apartment', 'house', 'villa', 'land'
  status TEXT NOT NULL DEFAULT 'sale', -- 'sale', 'rent', 'sold'
  area NUMERIC NOT NULL, -- in m²
  bedrooms INTEGER,
  bathrooms INTEGER,
  floor INTEGER,
  total_floors INTEGER,

  -- Features
  features TEXT[], -- array of feature strings

  -- Images
  images TEXT[] NOT NULL, -- array of image URLs
  main_image TEXT, -- primary image URL

  -- Virtual staging
  ai_staged_images JSONB DEFAULT '[]'::jsonb, -- stored AI staging results

  -- Contact
  agent_name TEXT DEFAULT 'Patrik Jedlička',
  agent_email TEXT DEFAULT 'info@luxestate.cz',
  agent_phone TEXT DEFAULT '+420 777 123 456',

  -- SEO
  slug TEXT UNIQUE,

  -- Visibility
  published BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(type);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_published ON properties(published);
CREATE INDEX IF NOT EXISTS idx_properties_slug ON properties(slug);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO properties (
  title,
  description,
  price,
  location,
  city,
  type,
  status,
  area,
  bedrooms,
  bathrooms,
  features,
  images,
  main_image,
  slug
) VALUES
(
  'Luxusní penthouse s terasou',
  'Nádherný penthouse v centru Prahy s výhledem na Pražský hrad. Kompletně zařízený, s privátní terasou 80m² a dvěma parkovacími místy.',
  15900000,
  'Praha 1 - Staré Město',
  'Praha',
  'apartment',
  'sale',
  180,
  3,
  2,
  ARRAY['Terasa', 'Parkování', 'Výtah', 'Klimatizace', 'Smart Home'],
  ARRAY[
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800'
  ],
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
  'luxusni-penthouse-terasa-praha'
),
(
  'Moderní vila s bazénem',
  'Architektonicky unikátní vila s infinity bazénem, wellness zónou a panoramatickým výhledem. Pozemek 1200m².',
  42500000,
  'Praha 6 - Nebušice',
  'Praha',
  'house',
  'sale',
  420,
  5,
  4,
  ARRAY['Bazén', 'Zahrada', 'Garáž', 'Wellness', 'Vinný sklep', 'Smart Home'],
  ARRAY[
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
    'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800',
    'https://images.unsplash.com/photo-1613553507747-5f8d62ad5904?w=800'
  ],
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
  'moderni-vila-bazen-nebusice'
),
(
  'Investiční byt 2+kk',
  'Nový byt v developerském projektu s vysokou návratností investice. Dokončení Q2 2024. Vhodný pro pronájem.',
  4200000,
  'Brno - Líšeň',
  'Brno',
  'apartment',
  'sale',
  55,
  2,
  1,
  ARRAY['Balkon', 'Sklep', 'Parkování'],
  ARRAY[
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
    'https://images.unsplash.com/photo-1560448075-cbc16bb4af8e?w=800'
  ],
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
  'investicni-byt-2kk-brno-lisen'
);

-- Enable Row Level Security (RLS)
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read published properties
CREATE POLICY "Public properties are viewable by everyone"
  ON properties FOR SELECT
  USING (published = true);

-- Policy: Authenticated users can do everything (for admin)
CREATE POLICY "Authenticated users can do everything"
  ON properties FOR ALL
  USING (auth.role() = 'authenticated');
