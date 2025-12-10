# Supabase Production Schema Fix

## Krok 1: Otevři SQL Editor

1. **Jdi na:** https://supabase.com/dashboard/project/jvklqoapjhqdmhlfmiyw/sql/new
2. Nebo:
   - Dashboard → Tvůj projekt (jvklqoapjhqdmhlfmiyw)
   - Levé menu → **SQL Editor**
   - Klikni **"New query"**

---

## Krok 2: Zkopíruj a spusť tento SQL

```sql
-- Add missing columns to properties table
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS area INTEGER,
ADD COLUMN IF NOT EXISTS main_image TEXT,
ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT true;

-- Verify all columns were added
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'properties'
ORDER BY ordinal_position;
```

---

## Krok 3: Klikni "RUN" (nebo Ctrl+Enter)

Měl bys vidět output s **všemi sloupci** tabulky properties, včetně:
- ✅ `area` (integer)
- ✅ `main_image` (text)
- ✅ `published` (boolean)

---

## Krok 4: Po úspěšném update

Po dokončení mi dej vědět a spustíme:

```bash
npm run import:production
```

To naimportuje **31 nemovitostí z Jihomoravského kraje** do production databáze.

---

## Hotovo! 🎉

Po importu:
1. Otevři https://luxestate-a5857nobs-cashi777s-projects.vercel.app
2. Uvidíš **POUZE nemovitosti z Brna a okolí**
3. **"Via Sreality.cz" badge** bude viditelný
4. Ready pro email Sreality! 📧
