import { createClient } from '@supabase/supabase-js'
import { fetchAllCategories, type SrealityProperty } from '../src/lib/sreality-api'

// PRODUCTION Supabase credentials
const SUPABASE_URL = 'https://jvklqoapjhqdmhlfmiyw.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2a2xxb2FwamhxZG1obGZtaXl3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDg0Nzg3NiwiZXhwIjoyMDgwNDIzODc2fQ.pM3xjSW7GrH89FEDcEb1MMfDpw58lrZMijXxPeLsqCA'

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

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
 * Import listings to PRODUCTION Supabase
 */
async function importListings(listings: SrealityProperty[]) {
  console.log(`\nImporting ${listings.length} listings to PRODUCTION Supabase...`)

  let successCount = 0
  let errorCount = 0

  for (const listing of listings) {
    try {
      const slug = generateSlug(listing.title, listing.id)

      // Prepare property data (using property_type instead of type for production)
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
        property_type: listing.type, // Production uses property_type, not type
        status: listing.status,
        published: true,
        slug,
        main_image: listing.images[0] || null,
        features: []
      }

      // Upsert to Supabase
      const { error } = await supabase
        .from('properties')
        .upsert(propertyData, {
          onConflict: 'slug'
        })

      if (error) {
        throw error
      }

      console.log(`✓ Imported: ${listing.title}`)
      successCount++

    } catch (error) {
      console.error(`✗ Failed importing ${listing.title}:`, error)
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
  console.log('Sreality.cz → PRODUCTION Supabase Import')
  console.log('='.repeat(60))
  console.log(`Target: ${SUPABASE_URL}`)
  console.log('='.repeat(60))

  try {
    // Fetch properties from Sreality API
    console.log('\nFetching properties from Sreality API...')
    const listings = await fetchAllCategories(15) // 15 per category

    if (listings.length > 0) {
      await importListings(listings)
    } else {
      console.log('⚠️  No listings fetched from Sreality API!')
    }

    console.log('\n' + '='.repeat(60))
    console.log('✅ Import finished successfully!')
    console.log('='.repeat(60))
    console.log('\nNext steps:')
    console.log('1. Open https://luxestate-a5857nobs-cashi777s-projects.vercel.app')
    console.log('2. Verify properties are visible')
    console.log('3. Check "Via Sreality.cz" badge')
    console.log('4. Ready to send email to Sreality! 📧')

  } catch (error) {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  }
}

// Run the script
main()
