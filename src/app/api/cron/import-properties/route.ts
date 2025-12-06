import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { fetchAndGeocodeListings, type SrealityListing } from '@/lib/sreality-scraper'

/**
 * API Route for automated property import
 * Can be called by cron services like Vercel Cron or GitHub Actions
 */

function generateSlug(title: string, id: string): string {
  const slug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return `${slug}-${id.replace('sreality-', '')}`
}

export async function GET(request: Request) {
  try {
    // Verify authorization (optional but recommended)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Starting automated property import...')

    // Initialize Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

    if (!supabaseKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is required')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    let totalImported = 0
    let totalErrors = 0

    // Import apartments for sale
    const apartments = await fetchAndGeocodeListings({
      categoryMain: 'byty',
      categoryType: 'prodej',
      maxListings: 15
    })

    for (const listing of apartments) {
      try {
        const slug = generateSlug(listing.title, listing.id)

        const { error } = await supabase.from('properties').upsert({
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
          features: []
        }, {
          onConflict: 'slug'
        })

        if (error) {
          console.error(`Error importing ${listing.title}:`, error)
          totalErrors++
        } else {
          totalImported++
        }
      } catch (error) {
        console.error('Import error:', error)
        totalErrors++
      }
    }

    // Import houses for sale
    const houses = await fetchAndGeocodeListings({
      categoryMain: 'domy',
      categoryType: 'prodej',
      maxListings: 10
    })

    for (const listing of houses) {
      try {
        const slug = generateSlug(listing.title, listing.id)

        const { error } = await supabase.from('properties').upsert({
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
          features: []
        }, {
          onConflict: 'slug'
        })

        if (error) {
          console.error(`Error importing ${listing.title}:`, error)
          totalErrors++
        } else {
          totalImported++
        }
      } catch (error) {
        console.error('Import error:', error)
        totalErrors++
      }
    }

    return NextResponse.json({
      success: true,
      imported: totalImported,
      errors: totalErrors,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      { error: 'Import failed', message: String(error) },
      { status: 500 }
    )
  }
}

// Allow POST as well for manual triggers
export async function POST(request: Request) {
  return GET(request)
}
