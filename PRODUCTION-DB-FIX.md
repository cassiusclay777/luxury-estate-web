# Production Database Fix

## Problém
Production Supabase nemá sloupec `area` - používá starší schéma.

Error: `Could not find the 'area' column of 'properties' in the schema cache`

## Řešení

### Krok 1: Aktualizuj Production Supabase schéma

1. **Jdi na Supabase Dashboard:**
   https://supabase.com/dashboard/project/jvklqoapjhqdmhlfmiyw

2. **Otevři SQL Editor:**
   - Levé menu → SQL Editor
   - Klikni "New query"

3. **Spusť tento SQL:**

```sql
-- Add missing columns to properties table
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS area INTEGER,
ADD COLUMN IF NOT EXISTS main_image TEXT;

-- Remove old sqft column if exists (replaced by area)
-- ALTER TABLE properties DROP COLUMN IF EXISTS sqft;

-- Verify schema
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'properties'
ORDER BY ordinal_position;
```

4. **Klikni "Run"**

### Krok 2: Re-run import

Po aktualizaci schématu:

```bash
npm run import:production
```

---

## Alternativa: Manuální update

Pokud nechceš měnit production schéma, můžeš:

1. **Upravit import script** aby nepoužíval `area`:
   - Smaž `area` z `propertyData`
   - Nebo přejmenuj na `sqft`

2. **Ale to není doporučené** - lepší je mít konzistentní schéma.

---

## Kontrola schématu

**Local Supabase:**
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'properties'
ORDER BY ordinal_position;
```

**Production Supabase:**
Spusť stejný query na https://supabase.com/dashboard/project/jvklqoapjhqdmhlfmiyw

---

## Po opravě

1. ✅ Schéma updatnuto
2. ✅ Import úspěšný
3. ✅ Properties viditelné na https://luxestate-a5857nobs-cashi777s-projects.vercel.app
4. 📧 Ready pro email Sreality!
