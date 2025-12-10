# Import nemovitostí ze Sreality.cz

## Přehled

Aplikace nyní používá **oficiální Sreality API v2** pro import nemovitostí s reálnými obrázky.

## Co bylo opraveno

### Původní problém
- RSS feed ze Sreality neobsahoval obrázky
- V databázi byly jen placeholder obrázky z Unsplash
- Nemovitosti neměly reálné fotky

### Řešení
Vytvořen nový modul `src/lib/sreality-api.ts`, který:
- Používá Sreality API v2 místo RSS feedu
- Stahuje reálné obrázky nemovitostí z CDN Sreality (d18-a.sdn.cz)
- Podporuje různé kategorie (byty, domy, pozemky, komerční)
- Automaticky parsuje metadata (cena, plocha, pokoje, lokace)

## Použití

### Import nemovitostí
```bash
npm run import:sreality
```

Tento příkaz:
1. Načte 15 bytů na prodej z Sreality API
2. Načte 15 domů na prodej z Sreality API
3. Pro každou nemovitost stáhne metadata + odkazy na obrázky
4. Uloží vše do databáze

### Přizpůsobení importu

Můžeš upravit počet nemovitostí a kategorie v `scripts/import-sreality.ts`:

```typescript
// Načíst více nemovitostí (až 100 na kategorii)
const listings = await fetchAllCategories(50)

// Nebo použít konkrétní parametry
const properties = await fetchSrealityProperties(
  1,  // categoryMain: 1=byty, 2=domy, 3=pozemky, 4=komerční
  1,  // categoryType: 1=prodej, 2=pronájem
  20  // perPage: počet výsledků
)
```

## Struktura dat

### SrealityProperty
```typescript
interface SrealityProperty {
  id: string              // "sreality-12345"
  title: string          // "Prodej bytu 3+1 130 m²"
  description: string    // Lokalita
  price: number          // 6500000
  address: string        // Celá adresa
  city: string          // Praha, Brno, ...
  bedrooms?: number     // 3
  bathrooms?: number    // 2
  area?: number         // 130
  images: string[]      // Array obrázků z CDN
  lat?: number          // GPS souřadnice
  lng?: number
  type: string          // apartment, house, land, commercial
  status: 'sale' | 'rent'
  link: string          // URL na Sreality detail
}
```

## Obrázky

### CDN Sreality
Obrázky se načítají přímo z `https://d18-a.sdn.cz/`

Next.js Image komponentu je nakonfigurována pro povolení tohoto CDN v `next.config.js`:

```javascript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'd18-a.sdn.cz',
      port: '',
      pathname: '/**',
    },
  ],
}
```

### Formát URL obrázků
```
https://d18-a.sdn.cz/d_18/c_img_oe_E/kOzmiQlmfoQAuLGUwExThV8/38f8.jpeg?fl=res,400,300,3|shr,,20|jpg,90
```

Parametry URL umožňují různé velikosti:
- `res,400,300,3` - rozlišení 400x300
- `shr,,20` - sharpening
- `jpg,90` - kvalita JPEG

## API Limity

Sreality API:
- ✅ Veřejné API, nevyžaduje autentizaci
- ✅ Až 100 výsledků na požadavek
- ⚠️ Rate limiting: doporučeno 1 požadavek/sekundu
- 📍 GPS souřadnice jsou přímo v API

## Soubory

### Nové
- `src/lib/sreality-api.ts` - Klient pro Sreality API v2
- `README-SREALITY.md` - Tato dokumentace

### Upravené
- `scripts/import-sreality.ts` - Používá nové API místo RSS
- `next.config.js` - Přidána doména d18-a.sdn.cz
- `src/components/ui/PropertyCard.tsx` - Zjednodušeno načítání obrázků

### Odstraněné
- `scripts/download-images.ts` - Už není potřeba (obrázky jsou v API)
- `src/lib/image-utils.ts` - Zjednodušeno

## Kategorie Sreality

```typescript
categoryMain:
  1 = Byty
  2 = Domy
  3 = Pozemky
  4 = Komerční
  5 = Ostatní

categoryType:
  1 = Prodej
  2 = Pronájem
  3 = Dražby
```

## Výhody nového řešení

✅ **Reálné obrázky** - nemovitosti mají skutečné fotky ze Sreality
✅ **Více dat** - GPS souřadnice, přesné parametry
✅ **Rychlejší** - přímé API místo scrapování
✅ **Spolehlivější** - oficiální API, ne RSS feed
✅ **Automatizace** - můžeš nastavit cron job pro pravidelný import

## Automatický import

Pro pravidelný import můžeš nastavit cron job:

```bash
# Každý den ve 3:00 ráno
0 3 * * * cd /path/to/project && npm run import:sreality
```

Nebo použít Next.js API Route s Vercel Cron:

```typescript
// src/app/api/cron/import-properties/route.ts
export async function GET() {
  // Import logic here
  return Response.json({ success: true })
}
```

## Troubleshooting

### Obrázky se nenačítají
1. Zkontroluj `next.config.js` - musí obsahovat `d18-a.sdn.cz`
2. Restartuj dev server po změně next.config.js
3. Zkontroluj browser console pro CORS errors

### Import selhal
1. Zkontroluj připojení k databázi (Supabase musí běžet)
2. Zkontroluj internet connection
3. Zkus snížit počet nemovitostí na požadavek

### Chybí GPS souřadnice
- Některé nemovitosti nemají GPS v API
- Můžeš použít geocoding (Nominatim) jako backup
