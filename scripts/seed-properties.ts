import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const sampleProperties = [
  {
    title: 'Luxusní penthouse s terasou',
    description: 'Nádherný penthouse v centru Prahy s výhledem na Pražský hrad. Kompletně zařízený, s privátní terasou 80m² a dvěma parkovacími místy.',
    price: 15900000,
    address: 'Pařížská 15',
    city: 'Praha 1',
    bedrooms: 3,
    bathrooms: 2,
    area: 180,
    type: 'apartment',
    status: 'sale',
    published: true,
    features: ['Terasa', 'Parkování', 'Výtah', 'Klimatizace', 'Smart Home'],
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800'
    ],
    lat: 50.0875,
    lng: 14.4213,
    slug: 'luxusni-penthouse-terasa-praha1'
  },
  {
    title: 'Moderní vila s bazénem',
    description: 'Architektonicky unikátní vila s infinity bazénem, wellness zónou a panoramatickým výhledem. Pozemek 1200m².',
    price: 42500000,
    address: 'Na Vyhlídce 8',
    city: 'Praha 6',
    bedrooms: 5,
    bathrooms: 4,
    area: 420,
    type: 'house',
    status: 'sale',
    published: true,
    features: ['Bazén', 'Zahrada', 'Garáž', 'Wellness', 'Vinný sklep', 'Smart Home'],
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800',
      'https://images.unsplash.com/photo-1613553507747-5f8d62ad5904?w=800'
    ],
    lat: 50.0755,
    lng: 14.4378,
    slug: 'moderni-vila-bazen-praha6'
  },
  {
    title: 'Investiční byt 2+kk',
    description: 'Nový byt v developerském projektu s vysokou návratností investice. Dokončení Q2 2024. Vhodný pro pronájem.',
    price: 4200000,
    address: 'Lidická 25',
    city: 'Brno',
    bedrooms: 2,
    bathrooms: 1,
    area: 55,
    type: 'apartment',
    status: 'sale',
    published: true,
    features: ['Balkon', 'Sklep', 'Parkování'],
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
      'https://images.unsplash.com/photo-1560448075-cbc16bb4af8e?w=800'
    ],
    lat: 49.1951,
    lng: 16.6068,
    slug: 'investicni-byt-2kk-brno'
  },
  {
    title: 'Rodinný dům se zahradou',
    description: 'Komfortní rodinný dům v klidné lokalitě s velkou zahradou a dětským hřištěm. Ideální pro rodiny s dětmi.',
    price: 12500000,
    address: 'Pod Strání 45',
    city: 'Brno',
    bedrooms: 4,
    bathrooms: 2,
    area: 180,
    type: 'house',
    status: 'sale',
    published: true,
    features: ['Zahrada', 'Garáž', 'Sklep', 'Krb'],
    images: [
      'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800',
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800'
    ],
    lat: 49.2109,
    lng: 16.6155,
    slug: 'rodinny-dum-zahrada-brno'
  },
  {
    title: 'Kancelářské prostory',
    description: 'Moderní kancelářské prostory v business centru. Vhodné pro firmy do 20 zaměstnanců.',
    price: 8500000,
    address: 'Pobřežní 34',
    city: 'Praha 8',
    bedrooms: null,
    bathrooms: 3,
    area: 220,
    type: 'commercial',
    status: 'sale',
    published: true,
    features: ['Klimatizace', 'Parkování', 'Recepce', 'Meeting room'],
    images: [
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'
    ],
    lat: 50.0974,
    lng: 14.4376,
    slug: 'kancelarske-prostory-praha8'
  },
  {
    title: 'Byt k pronájmu v centru',
    description: 'Elegantní byt 1+kk v historickém centru. Plně zařízený, včetně internetu a energií.',
    price: 18000,
    address: 'Karlova 12',
    city: 'Praha 1',
    bedrooms: 1,
    bathrooms: 1,
    area: 45,
    type: 'apartment',
    status: 'rent',
    published: true,
    features: ['Vybavený', 'Internet', 'Energie v ceně', 'Výtah'],
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
      'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=800'
    ],
    lat: 50.0865,
    lng: 14.4176,
    slug: 'byt-pronajem-praha1'
  },
  {
    title: 'Prodejna v nákupním centru',
    description: 'Výhodná prodejní plocha v rušném nákupním centru. Vysoká frekvence zákazníků.',
    price: 9500000,
    address: 'Nákupní 1',
    city: 'Ostrava',
    bedrooms: null,
    bathrooms: 2,
    area: 120,
    type: 'commercial',
    status: 'sale',
    published: true,
    features: ['Vysoká frekvence', 'Parkování', 'Klimatizace'],
    images: [
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800'
    ],
    lat: 49.8209,
    lng: 18.2625,
    slug: 'prodejna-ostrava'
  },
  {
    title: 'Luxusní byt s výhledem na řeku',
    description: 'Prvorepublikový byt s renovovaným interiérem a výhledem na Vltavu. Luxusní vybavení.',
    price: 28500000,
    address: 'Rašínovo nábřeží 42',
    city: 'Praha 2',
    bedrooms: 4,
    bathrooms: 3,
    area: 210,
    type: 'apartment',
    status: 'sale',
    published: true,
    features: ['Výhled na řeku', 'Parkování', 'Výtah', 'Klimatizace', 'Bezpečnostní systém'],
    images: [
      'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800',
      'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800'
    ],
    lat: 50.0745,
    lng: 14.4158,
    slug: 'luxusni-byt-vyhled-reka-praha2'
  }
];

async function seedDatabase() {
  console.log('🚀 Starting database seeding...');

  try {
    // Check if properties table exists and has data
    const { data: existingProperties, error: checkError } = await supabase
      .from('properties')
      .select('id')
      .limit(1);

    if (checkError) {
      console.error('❌ Error checking properties table:', checkError.message);
      console.log('⚠️  Make sure you have run the SQL schema from supabase-schema.sql first!');
      return;
    }

    // Clear existing data if needed
    if (existingProperties && existingProperties.length > 0) {
      console.log(`📊 Found ${existingProperties.length} existing properties`);
      const shouldClear = process.argv.includes('--clear');
      
      if (shouldClear) {
        console.log('🗑️  Clearing existing properties...');
        const { error: deleteError } = await supabase
          .from('properties')
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
        
        if (deleteError) {
          console.error('❌ Error clearing properties:', deleteError.message);
          return;
        }
        console.log('✅ Existing properties cleared');
      } else {
        console.log('⚠️  Skipping seeding - properties already exist. Use --clear flag to clear and reseed.');
        return;
      }
    }

    // Insert sample properties
    console.log(`📝 Inserting ${sampleProperties.length} properties...`);
    
    for (const property of sampleProperties) {
      const propertyData = {
        ...property,
        main_image: property.images[0] || null
      };

      const { error: insertError } = await supabase
        .from('properties')
        .insert([propertyData]);

      if (insertError) {
        console.error(`❌ Error inserting property "${property.title}":`, insertError.message);
      } else {
        console.log(`✅ Added: ${property.title}`);
      }
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log(`📊 Total properties seeded: ${sampleProperties.length}`);

    // Verify the data
    const { data: finalCount, error: countError } = await supabase
      .from('properties')
      .select('id', { count: 'exact' });

    if (!countError) {
      console.log(`🔍 Total properties in database: ${finalCount?.length || 0}`);
    }

  } catch (error) {
    console.error('❌ Unexpected error during seeding:', error);
  }
}

// Run the seeding
seedDatabase();
