/**
 * Sreality.cz API Client
 * Uses official Sreality API v2 to fetch property listings with images
 */

export interface SrealityProperty {
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
}

interface SrealityAPIResponse {
  _embedded: {
    estates: Array<{
      hash_id: number
      name: string
      locality: string
      price_czk?: {
        value_raw: number
      }
      items?: Array<{
        name: string
        value: string
      }>
      _links: {
        self: {
          href: string
        }
        images?: Array<{
          href: string
        }>
      }
      map?: {
        lat: number
        lon: number
      }
    }>
  }
  _links?: {
    next?: {
      href: string
    }
  }
}

/**
 * Fetch properties from Sreality API
 * @param categoryMain - 1=byty, 2=domy, 3=pozemky, 4=komerční, 5=ostatní
 * @param categoryType - 1=prodej, 2=pronájem, 3=dražby
 * @param perPage - Number of results per page (default: 20, max: 100)
 */
export async function fetchSrealityProperties(
  categoryMain: number = 1, // byty
  categoryType: number = 1, // prodej
  perPage: number = 20,
  region: number = 14 // 14 = Jihomoravský kraj
): Promise<SrealityProperty[]> {
  try {
    // Add region filter for Jihomoravský kraj (Brno and surroundings)
    const url = `https://www.sreality.cz/api/cs/v2/estates?category_main_cb=${categoryMain}&category_type_cb=${categoryType}&region=${region}&per_page=${Math.min(perPage, 100)}`

    console.log(`Fetching from Sreality API: ${url}`)

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: SrealityAPIResponse = await response.json()
    const estates = data._embedded?.estates || []

    console.log(`Fetched ${estates.length} properties from Sreality API`)

    // Convert to our format
    const properties: SrealityProperty[] = estates.map(estate => {
      const name = estate.name || 'Bez názvu'
      const locality = estate.locality || ''
      const price = estate.price_czk?.value_raw || 0

      // Extract images (convert to full URLs)
      const images = (estate._links.images || []).map(img => {
        // Convert relative URL to absolute if needed
        const href = img.href
        if (href.startsWith('http')) {
          return href
        }
        return `https://d18-a.sdn.cz${href}`
      })

      // Parse area from items
      const items = estate.items || []
      const areaItem = items.find(item => item.name === 'Užitná plocha')
      const area = areaItem ? parseInt(areaItem.value.replace(/\D/g, '')) : undefined

      // Parse bedrooms from name
      const bedroomsMatch = name.match(/(\d)\s*\+\s*(kk|\d)/)
      const bedrooms = bedroomsMatch ? parseInt(bedroomsMatch[1]) : undefined

      // Extract city from locality
      const cityMatch = locality.match(/(Praha|Brno|Ostrava|Plzeň|Liberec|Olomouc|České Budějovice|Hradec Králové|Ústí nad Labem|Pardubice)/i)
      const city = cityMatch ? cityMatch[1] : locality.split(',')[0] || 'Neznámé město'

      // Determine property type
      let type = 'apartment'
      if (categoryMain === 2) type = 'house'
      else if (categoryMain === 3) type = 'land'
      else if (categoryMain === 4) type = 'commercial'

      return {
        id: `sreality-${estate.hash_id}`,
        title: name,
        description: locality,
        price,
        address: locality,
        city,
        bedrooms,
        bathrooms: bedrooms ? Math.max(1, Math.floor(bedrooms / 2)) : undefined,
        area,
        images,
        lat: estate.map?.lat,
        lng: estate.map?.lon,
        type,
        status: categoryType === 1 ? 'sale' : 'rent',
        link: `https://www.sreality.cz/detail${estate._links.self.href.replace('/cs/v2', '')}`
      }
    })

    return properties

  } catch (error) {
    console.error('Error fetching from Sreality API:', error)
    return []
  }
}

/**
 * Fetch properties from multiple categories (Jihomoravský kraj only)
 */
export async function fetchAllCategories(maxPerCategory: number = 10): Promise<SrealityProperty[]> {
  const categories = [
    { main: 1, type: 1, name: 'byty-prodej-jmk' },
    { main: 2, type: 1, name: 'domy-prodej-jmk' }
  ]

  const allProperties: SrealityProperty[] = []

  for (const category of categories) {
    console.log(`\nFetching ${category.name}...`)
    const properties = await fetchSrealityProperties(category.main, category.type, maxPerCategory)
    allProperties.push(...properties)

    // Rate limiting
    if (category !== categories[categories.length - 1]) {
      console.log('Waiting 1 second before next category...')
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  return allProperties
}
