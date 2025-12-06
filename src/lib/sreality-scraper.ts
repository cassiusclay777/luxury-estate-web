import { parseStringPromise } from 'xml2js'

export interface SrealityListing {
  id: string
  title: string
  description: string
  price: number
  address: string
  city: string
  bedrooms?: number
  bathrooms?: number
  area?: number
  images: string[]
  lat?: number
  lng?: number
  type: string
  status: 'sale' | 'rent'
  link: string
  published_date: string
}

interface RSSItem {
  title: string[]
  link: string[]
  description: string[]
  pubDate: string[]
  'media:content'?: Array<{ $: { url: string } }>
  'media:thumbnail'?: Array<{ $: { url: string } }>
}

interface RSSFeed {
  rss: {
    channel: Array<{
      item: RSSItem[]
    }>
  }
}

/**
 * Fetch and parse Sreality.cz RSS feed
 */
export async function fetchSrealityRSS(
  categoryMain: 'byty' | 'domy' | 'pozemky' | 'komercni' | 'ostatni' = 'byty',
  categoryType: 'prodej' | 'pronajem' | 'drazby' = 'prodej',
  regionId?: string
): Promise<SrealityListing[]> {
  try {
    // Build RSS URL
    let url = `https://www.sreality.cz/api/cs/v1/estates/rss?category_main_cb=${categoryMain}&category_type_cb=${categoryType}`

    if (regionId) {
      url += `&locality_region_id=${regionId}`
    }

    console.log(`Fetching RSS from: ${url}`)

    // Fetch RSS feed
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const xmlText = await response.text()
    const parsed = await parseStringPromise(xmlText) as RSSFeed

    // Extract items from RSS
    const items = parsed.rss.channel[0].item || []

    // Parse each item
    const listings: SrealityListing[] = items.map(item => {
      const title = item.title?.[0] || 'Bez názvu'
      const description = item.description?.[0] || ''
      const link = item.link?.[0] || ''
      const pubDate = item.pubDate?.[0] || new Date().toISOString()

      // Extract ID from link
      const idMatch = link.match(/detail\/[^/]+\/([0-9]+)/)
      const id = idMatch ? idMatch[1] : `sreality-${Date.now()}-${Math.random()}`

      // Parse price from title or description
      const priceMatch = title.match(/(\d[\d\s]*)\s*(Kč|CZK)/i) ||
                        description.match(/(\d[\d\s]*)\s*(Kč|CZK)/i)
      const price = priceMatch
        ? parseInt(priceMatch[1].replace(/\s/g, ''))
        : 0

      // Parse area (m²)
      const areaMatch = title.match(/(\d+)\s*m²/) ||
                       description.match(/(\d+)\s*m²/)
      const area = areaMatch ? parseInt(areaMatch[1]) : undefined

      // Parse bedrooms (1+kk, 2+1, etc.)
      const bedroomsMatch = title.match(/(\d)\s*\+\s*(kk|\d)/) ||
                           description.match(/(\d)\s*\+\s*(kk|\d)/)
      const bedrooms = bedroomsMatch ? parseInt(bedroomsMatch[1]) : undefined

      // Extract city from title
      const cityMatch = title.match(/,\s*([^,]+)$/) ||
                       title.match(/(Praha|Brno|Ostrava|Plzeň|Liberec|Olomouc|České Budějovice|Hradec Králové|Ústí nad Labem|Pardubice)/i)
      const city = cityMatch ? cityMatch[1].trim() : 'Neznámé město'

      // Extract address (everything before last comma or city)
      const addressMatch = title.match(/^([^,]+)/)
      const address = addressMatch ? addressMatch[1].trim() : title

      // Extract images
      const images: string[] = []
      if (item['media:content']) {
        item['media:content'].forEach(media => {
          if (media.$.url) {
            images.push(media.$.url)
          }
        })
      }
      if (item['media:thumbnail']) {
        item['media:thumbnail'].forEach(media => {
          if (media.$.url && !images.includes(media.$.url)) {
            images.push(media.$.url)
          }
        })
      }

      // Determine property type
      let type = 'apartment'
      if (categoryMain === 'domy') type = 'house'
      else if (categoryMain === 'pozemky') type = 'land'
      else if (categoryMain === 'komercni') type = 'commercial'

      return {
        id: `sreality-${id}`,
        title,
        description,
        price,
        address,
        city,
        bedrooms,
        bathrooms: bedrooms ? Math.max(1, Math.floor(bedrooms / 2)) : undefined,
        area,
        images,
        type,
        status: categoryType === 'prodej' ? 'sale' : 'rent',
        link,
        published_date: pubDate
      }
    })

    console.log(`Parsed ${listings.length} listings from RSS`)
    return listings

  } catch (error) {
    console.error('Error fetching Sreality RSS:', error)
    return []
  }
}

/**
 * Geocode address to GPS coordinates using free Nominatim API
 */
export async function geocodeAddress(address: string, city: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const query = encodeURIComponent(`${address}, ${city}, Czech Republic`)
    const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'LuxEstate-RealityApp/1.0'
      }
    })

    if (!response.ok) return null

    const data = await response.json()

    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      }
    }

    return null
  } catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}

/**
 * Fetch and geocode listings (with rate limiting)
 */
export async function fetchAndGeocodeListings(
  options: {
    categoryMain?: 'byty' | 'domy' | 'pozemky' | 'komercni'
    categoryType?: 'prodej' | 'pronajem'
    regionId?: string
    maxListings?: number
  } = {}
): Promise<SrealityListing[]> {
  const {
    categoryMain = 'byty',
    categoryType = 'prodej',
    regionId,
    maxListings = 50
  } = options

  const listings = await fetchSrealityRSS(categoryMain, categoryType, regionId)
  const limitedListings = listings.slice(0, maxListings)

  console.log(`Geocoding ${limitedListings.length} listings...`)

  // Geocode with rate limiting (1 request per second to respect Nominatim's policy)
  const geocodedListings: SrealityListing[] = []

  for (let i = 0; i < limitedListings.length; i++) {
    const listing = limitedListings[i]

    console.log(`Geocoding ${i + 1}/${limitedListings.length}: ${listing.address}, ${listing.city}`)

    const coords = await geocodeAddress(listing.address, listing.city)

    if (coords) {
      listing.lat = coords.lat
      listing.lng = coords.lng
    }

    geocodedListings.push(listing)

    // Rate limiting: wait 1 second between requests
    if (i < limitedListings.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  console.log(`Geocoded ${geocodedListings.filter(l => l.lat && l.lng).length}/${geocodedListings.length} listings`)

  return geocodedListings
}
