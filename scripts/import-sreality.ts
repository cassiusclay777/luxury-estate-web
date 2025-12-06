import { Client } from 'pg'
import { fetchSrealityRSS, type SrealityListing } from '../src/lib/sreality-scraper'

// Initialize PostgreSQL client
const client = new Client({
  host: '127.0.0.1',
  port: 54322,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres'
})

/**
 * Generate slug from title
 */
function generateSlug(title: string, id: string): string {
  const slug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return `${slug}-${id.replace('sreality-', '')}`
}

/**
 * Import listings to Supabase
 */
async function importListings(listings: SrealityListing[]) {
  console.log(`\nImporting ${listings.length} listings to Supabase...`)

  let successCount = 0
  let errorCount = 0

  for (const listing of listings) {
    try {
      const slug = generateSlug(listing.title, listing.id)

      // Prepare property data
      const propertyData = {
        title: listing.title,
        description: listing.description,
        price: listing.price,
        address: listing.address,
        city: listing.city,
        bedrooms: listing.bedrooms || null,
        bathrooms: listing.bathrooms || null,
        area: listing.area || null,
        images: listing.images,
        lat: listing.lat || null,
        lng: listing.lng || null,
        type: listing.type,
        status: listing.status,
        published: true,
        slug,
        main_image: listing.images[0] || null,
        features: [] // Could be extracted from description in the future
      }

      // Insert or update (upsert based on slug) using direct SQL
      const query = `
        INSERT INTO properties (
          title, description, price, address, city, bedrooms, bathrooms, area,
          images, lat, lng, type, status, published, slug, main_image, features
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
        )
        ON CONFLICT (slug) DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          price = EXCLUDED.price,
          address = EXCLUDED.address,
          city = EXCLUDED.city,
          bedrooms = EXCLUDED.bedrooms,
          bathrooms = EXCLUDED.bathrooms,
          area = EXCLUDED.area,
          images = EXCLUDED.images,
          lat = EXCLUDED.lat,
          lng = EXCLUDED.lng,
          type = EXCLUDED.type,
          status = EXCLUDED.status,
          published = EXCLUDED.published,
          main_image = EXCLUDED.main_image,
          features = EXCLUDED.features,
          updated_at = NOW()
      `

      const values = [
        propertyData.title,
        propertyData.description,
        propertyData.price,
        propertyData.address,
        propertyData.city,
        propertyData.bedrooms,
        propertyData.bathrooms,
        propertyData.area,
        propertyData.images,
        propertyData.lat,
        propertyData.lng,
        propertyData.type,
        propertyData.status,
        propertyData.published,
        propertyData.slug,
        propertyData.main_image,
        propertyData.features
      ]

      await client.query(query, values)
      console.log(`✓ Imported: ${listing.title}`)
      successCount++

    } catch (error) {
      console.error(`Exception importing ${listing.title}:`, error)
      errorCount++
    }
  }

  console.log(`\nImport complete:`)
  console.log(`  ✓ Success: ${successCount}`)
  console.log(`  ✗ Errors: ${errorCount}`)
}

/**
 * Main import function
 */
async function main() {
  console.log('='.repeat(60))
  console.log('Sreality.cz Import Script')
  console.log('='.repeat(60))

  // Connect to database
  await client.connect()
  console.log('Connected to database')

  try {
    const categories: Array<'byty' | 'domy'> = ['byty', 'domy']
    const types: Array<'prodej' | 'pronajem'> = ['prodej']

    for (const category of categories) {
      for (const type of types) {
        console.log(`\nFetching ${category} - ${type}...`)

        // Fetch without geocoding (faster, GPS coords will be null)
        const allListings = await fetchSrealityRSS(category, type)
        const listings = allListings.slice(0, 10) // Limit to 10 per category

        if (listings.length > 0) {
          await importListings(listings)
        }

        // Wait a bit between categories to be nice to the APIs
        if (category !== 'domy' || type !== 'prodej') {
          console.log('\nWaiting 2 seconds before next category...')
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
      }
    }

    console.log('\n' + '='.repeat(60))
    console.log('Import finished!')
    console.log('='.repeat(60))
  } finally {
    await client.end()
    console.log('Database connection closed')
  }
}

// Run the script
main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
