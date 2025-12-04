import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for admin operations

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials!')
  console.error('Please ensure .env.local contains:')
  console.error('  NEXT_PUBLIC_SUPABASE_URL=your_url')
  console.error('  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

interface RawProperty {
  id?: string
  name: string
  description?: string
  price: number
  location: {
    address: string
    city: string
    district?: string
    lat: number
    lng: number
  }
  details: {
    bedrooms?: number
    bathrooms?: number
    sqft?: number
    property_type?: string
  }
  images: string[]
  features?: string[]
}

async function fetchBrnoProperties(): Promise<RawProperty[]> {
  console.log('📡 Fetching Brno real estate data...')

  try {
    // Try the Czech real estate dataset
    const response = await fetch(
      'https://raw.githubusercontent.com/patrikspacek/czech-real-estate-dataset/main/brno-south-moravia-2025.json'
    )

    if (response.ok) {
      const data = await response.json()
      console.log(`✅ Fetched ${data.length} properties from dataset`)
      return data
    }
  } catch (error) {
    console.log('⚠️ Dataset not available, using fallback data')
  }

  // Fallback: Generate sample Brno data
  return generateBrnoSampleData()
}

function generateBrnoSampleData(): RawProperty[] {
  const cities = ['Brno', 'Kuřim', 'Blansko', 'Vyškov', 'Hodonín', 'Znojmo']
  const districts = ['Brno-střed', 'Brno-sever', 'Brno-jih', 'Vinohrady', 'Žabovřesky', 'Královo Pole']
  const types = ['Byt', 'Rodinný dům', 'Vila', 'Penthouse', 'Loft']
  const features = [
    'Balkon', 'Terasa', 'Sklep', 'Garáž', 'Parkování', 'Výtah',
    'Klimatizace', 'Nový', 'Po rekonstrukci', 'Ihned k nastěhování'
  ]

  const properties: RawProperty[] = []

  for (let i = 0; i < 50; i++) {
    const city = cities[Math.floor(Math.random() * cities.length)]
    const district = districts[Math.floor(Math.random() * districts.length)]
    const propertyType = types[Math.floor(Math.random() * types.length)]
    const bedrooms = Math.floor(Math.random() * 5) + 1
    const bathrooms = Math.floor(Math.random() * 3) + 1
    const sqft = Math.floor(Math.random() * 200) + 50
    const price = Math.floor(Math.random() * 20000000) + 3000000

    // Brno coordinates with some randomization
    const baseLat = 49.1951
    const baseLng = 16.6068
    const lat = baseLat + (Math.random() - 0.5) * 0.1
    const lng = baseLng + (Math.random() - 0.5) * 0.1

    const selectedFeatures = features
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 5) + 2)

    properties.push({
      name: `${propertyType} ${bedrooms}+${bathrooms > 1 ? 'kk' : '1'}`,
      description: `Krásný ${propertyType.toLowerCase()} v klidné části města. Prostorný a světlý byt s moderním vybavením. Výborná dostupnost MHD, obchody a služby v blízkosti.`,
      price,
      location: {
        address: `Ulice ${Math.floor(Math.random() * 100) + 1}`,
        city,
        district,
        lat,
        lng
      },
      details: {
        bedrooms,
        bathrooms,
        sqft,
        property_type: propertyType
      },
      images: [
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
        'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800'
      ],
      features: selectedFeatures
    })
  }

  return properties
}

async function seedDatabase() {
  console.log('🌱 Starting database seed...')

  // Fetch properties
  const rawProperties = await fetchBrnoProperties()

  // Transform to database schema
  const properties = rawProperties.map(prop => ({
    title: prop.name,
    description: prop.description || null,
    price: prop.price,
    address: prop.location.address,
    city: prop.location.city,
    bedrooms: prop.details?.bedrooms || null,
    bathrooms: prop.details?.bathrooms || null,
    sqft: prop.details?.sqft || null,
    images: prop.images || [],
    lat: prop.location.lat,
    lng: prop.location.lng,
    features: prop.features || null,
    property_type: prop.details?.property_type || null
  }))

  console.log(`📦 Prepared ${properties.length} properties for import`)

  // Check if table is empty
  const { count } = await supabase
    .from('properties')
    .select('*', { count: 'exact', head: true })

  if (count && count > 0) {
    console.log(`⚠️ Database already contains ${count} properties`)
    console.log('🧹 Clearing existing data...')

    const { error: deleteError } = await supabase
      .from('properties')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

    if (deleteError) {
      console.error('❌ Error clearing data:', deleteError)
      return
    }
  }

  // Insert in batches
  const batchSize = 100
  let inserted = 0

  for (let i = 0; i < properties.length; i += batchSize) {
    const batch = properties.slice(i, i + batchSize)

    const { data, error } = await supabase
      .from('properties')
      .insert(batch)
      .select()

    if (error) {
      console.error(`❌ Error inserting batch ${i / batchSize + 1}:`, error)
      continue
    }

    inserted += batch.length
    console.log(`✅ Inserted ${inserted}/${properties.length} properties`)
  }

  console.log('🎉 Database seed completed!')
  console.log(`📊 Total properties in database: ${inserted}`)
}

// Run seed
seedDatabase()
  .then(() => {
    console.log('✨ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  })
