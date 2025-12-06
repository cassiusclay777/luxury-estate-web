# Sreality.cz Import Documentation

## Přehled

Tento projekt obsahuje automatický scraper a import system pro načítání nemovitostí ze Sreality.cz do vaší Supabase databáze.

## 🚀 Rychlý start

### Manuální import

```bash
# Import nemovitostí ze Sreality.cz
npm run import:sreality
```

Tento příkaz:
1. Načte RSS feed ze Sreality.cz (byty + domy na prodej)
2. Extrahuje data (cena, popis, obrázky...)
3. Provede geocoding (převede adresy na GPS souřadnice)
4. Uloží data do Supabase databáze

### Co se importuje

- **Byty na prodej** - max 20 nejnovějších
- **Domy na prodej** - max 10 nejnovějších

Celkem cca 30 nemovitostí při každém importu.

## ⚙️ Konfigurace

### Požadované ENV proměnné

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Volitelné ENV proměnné

```bash
# Pro zabezpečení cron jobu
CRON_SECRET=your-random-secret-key
```

## 🔄 Automatické aktualizace

### Vercel Cron (Production)

Projekt obsahuje `vercel.json` s nastavením:
- Automatický import každý den ve 3:00 UTC
- API endpoint: `/api/cron/import-properties`

**Nastavení:**
1. Nasaďte na Vercel
2. Přidejte `CRON_SECRET` do Vercel Environment Variables
3. Cron job se aktivuje automaticky

### GitHub Actions (Alternative)

Soubor `.github/workflows/import-properties.yml`:
- Spouští se každý den ve 3:00 UTC
- Můžete trigger manuálně z GitHub UI

**Nastavení:**
1. Přidejte `CRON_SECRET` do GitHub Secrets
2. Upravte URL v workflow souboru na vaši doménu

### Lokální vývoj

Pro testování můžete spustit:

```bash
# Jednorázový import
npm run import:sreality

# Nebo zavolejte API endpoint lokálně
curl http://localhost:3000/api/cron/import-properties
```

## 📊 Importovaná data

### Co se ukládá:

```typescript
{
  title: string          // Název nemovitosti
  description: string    // Popis
  price: number         // Cena v Kč
  address: string       // Adresa
  city: string          // Město
  bedrooms: number      // Počet pokojů (1+kk = 1, 2+1 = 2...)
  bathrooms: number     // Počet koupelen (odhadnuto)
  area: number          // Plocha v m²
  images: string[]      // URLs obrázků
  lat: number           // GPS šířka
  lng: number           // GPS délka
  type: string          // 'apartment' | 'house'
  status: string        // 'sale' | 'rent'
  slug: string          // URL-friendly identifikátor
  main_image: string    // Hlavní obrázek
}
```

## 🔧 Přizpůsobení

### Změna počtu importovaných nemovitostí

Editujte `scripts/import-sreality.ts`:

```typescript
const listings = await fetchAndGeocodeListings({
  categoryMain: 'byty',
  categoryType: 'prodej',
  maxListings: 50  // Změňte tento počet
})
```

### Přidání více kategorií

```typescript
const categories = ['byty', 'domy', 'pozemky', 'komercni']
const types = ['prodej', 'pronajem']
```

### Filtrování podle regionu

```typescript
const listings = await fetchAndGeocodeListings({
  categoryMain: 'byty',
  categoryType: 'prodej',
  regionId: '10',  // ID regionu (např. Praha)
  maxListings: 20
})
```

## ⚠️ Limity a poznámky

### Rate Limiting

**Geocoding (Nominatim):**
- Max 1 request/sekunda
- User-Agent je povinný
- Použití: FREE, ale respektujte limits

**Sreality RSS:**
- Žádné oficiální limity
- Buďte ohleduplní (nepřetěžujte server)

### Duplicity

Script používá `slug` jako unikátní identifikátor:
- Při re-importu se existující záznamy **aktualizují**
- Nebudou se vytvářet duplicity

### Geocoding úspěšnost

Ne všechny adresy se podaří geokódovat:
- Neúplné adresy
- Špatný formát
- API limitace

Nemovitosti bez GPS souřadnic se stejně uloží (lat/lng = null).

## 🐛 Troubleshooting

### "SUPABASE_SERVICE_ROLE_KEY is required"

Zkontrolujte `.env.local`:
```bash
SUPABASE_SERVICE_ROLE_KEY=your-actual-key
```

### Geocoding je pomalý

Je to normální - respektujeme rate limit 1 req/sec.
Pro 30 nemovitostí = cca 30 sekund.

### Import selhal

Zkontrolujte logy:
```bash
npm run import:sreality
```

Běžné problémy:
- Špatné Supabase credentials
- Databáze neběží (lokálně `supabase start`)
- Network problémy

## 📝 Struktura souborů

```
src/lib/sreality-scraper.ts           # Scraper logika
scripts/import-sreality.ts             # CLI import script
src/app/api/cron/import-properties/    # API endpoint pro cron
.github/workflows/import-properties.yml # GitHub Actions
vercel.json                            # Vercel Cron config
```

## 🎯 Další možnosti

### Přidat více portálů

Můžete vytvořit podobné scrapery pro:
- Bezrealitky.cz
- RealityMix.cz
- Další...

### Monitoring

Přidejte notifikace při selhání importu:
- Email
- Slack webhook
- Discord webhook

### Caching

Implementujte cache pro geocoding:
- Redis
- Lokální JSON soubor
- Supabase tabulka

## 📚 Reference

- [Sreality RSS API](https://www.sreality.cz/api/cs/v1/estates/rss)
- [Nominatim Geocoding](https://nominatim.openstreetmap.org/)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
- [Supabase Documentation](https://supabase.com/docs)
