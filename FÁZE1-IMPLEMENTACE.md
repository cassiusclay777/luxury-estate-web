# FÁZE 1 - Databáze nemovitostí + Admin rozhraní

## ✅ Co bylo implementováno

### 1. Supabase Database Schema
- **Soubor**: `supabase-schema.sql`
- **Obsah**: Kompletní schéma pro tabulku `properties` s:
  - Všechny potřebné sloupce (title, description, price, address, city, type, status, area, images, atd.)
  - Indexy pro optimalizaci vyhledávání
  - Full-text search funkce `search_properties`
  - Geolokační funkce `nearby_properties`
  - Row Level Security (RLS) policies
  - Ukázková data pro testování

### 2. API Routes pro CRUD operace
- **Soubor**: `src/app/api/properties/route.ts`
- **Metody**:
  - `GET` - získání nemovitostí s filtry
  - `POST` - vytvoření nové nemovitosti
  - `PUT` - aktualizace existující nemovitosti
  - `DELETE` - smazání nemovitosti

### 3. Admin rozhraní
- **Cesta**: `/admin`
- **Komponenty**:
  - `PropertyForm` - formulář pro přidání/úpravu nemovitostí
  - `PropertyList` - tabulka se seznamem nemovitostí s filtry
  - `UploadImages` - nahrávání více fotek k nemovitostem
- **Funkce**:
  - Přidávání, úprava, mazání nemovitostí
  - Přepínání stavu zveřejnění
  - Filtrování a vyhledávání
  - Nahrávání obrázků do Supabase Storage
  - Statistiky nemovitostí

### 4. Aktualizace property listingu
- **Soubor**: `src/app/actions/properties.ts`
- **Změny**: Aktualizace pro nové schéma (type místo property_type, area místo sqft)
- **Funkce**: Všechny existující funkce nyní pracují s reálnou Supabase databází

### 5. TypeScript typy
- **Soubor**: `types/database.types.ts`
- **Aktualizace**: Synchronizováno s novým databázovým schématem

### 6. Seed script
- **Soubor**: `scripts/seed-properties.ts`
- **Funkce**: Naplnění databáze 8 ukázkovými nemovitostmi

## 🚀 Jak nasadit FÁZI 1

### Krok 1: Vytvořit databázi v Supabase
1. Otevřete [Supabase Dashboard](https://supabase.com/dashboard)
2. Vyberte svůj projekt nebo vytvořte nový
3. Přejděte do **SQL Editor**
4. Zkopírujte celý obsah `supabase-schema.sql`
5. Spusťte SQL příkaz

### Krok 2: Vytvořit Storage bucket pro obrázky
1. V Supabase Dashboard přejděte do **Storage**
2. Klikněte na **Create new bucket**
3. Zadejte název: `property-images`
4. Nastavte: **Public bucket** (pro veřejný přístup k obrázkům)

### Krok 3: Spustit seed script
```bash
# Nainstalovat závislosti pokud ještě nejsou
npm install

# Spustit seed script
npx tsx scripts/seed-properties.ts

# Pokud chcete přepsat existující data
npx tsx scripts/seed-properties.ts --clear
```

### Krok 4: Spustit vývojový server
```bash
npm run dev
```

### Krok 5: Otestovat
1. Otevřete `http://localhost:3000/admin`
2. Přihlaste se pomocí Supabase Auth (pokud je nastaveno)
3. Otestujte:
   - Zobrazení seznamu nemovitostí
   - Přidání nové nemovitosti
   - Úpravu existující nemovitosti
   - Nahrávání obrázků
   - Filtrování a vyhledávání

## 🔧 Technické detaily

### Databázové schéma
- **Tabulka**: `properties` s 18 sloupci
- **Indexy**: Optimalizováno pro vyhledávání podle města, ceny, typu, statusu
- **Full-text search**: Podpora českého jazyka a fuzzy matching
- **Geolokace**: Funkce pro hledání nemovitostí v okruhu

### Bezpečnost
- **Row Level Security**: Povoleno
- **Policies**:
  - Veřejnost může číst pouze zveřejněné nemovitosti
  - Autentizovaní uživatelé mají plný přístup (CRUD)
- **Storage**: Public bucket pro obrázky

### Upload obrázků
- **Max velikost**: 5MB na soubor
- **Formáty**: JPEG, PNG, WebP, GIF
- **Storage**: Supabase Storage bucket `property-images`
- **Automatické**: První nahraný obrázek se stane hlavním

## 🐛 Řešení problémů

### "Property type does not exist"
- **Příčina**: Staré typy v TypeScript
- **Řešení**: Restartovat TypeScript server v VS Code (Ctrl+Shift+P → "TypeScript: Restart TS Server")

### "Bucket does not exist"
- **Příčina**: Storage bucket nebyl vytvořen
- **Řešení**: Vytvořit bucket `property-images` v Supabase Storage

### "RLS policy violation"
- **Příčina**: Chybějící autentizace
- **Řešení**: Přidat autentizaci nebo upravit RLS policies

## 📈 Další kroky (FÁZE 2)

1. **Filtry a vyhledávání** - Rozšíření existujícího vyhledávání
2. **Loading states** - Skeleton screens místo prázdna
3. **SEO optimalizace** - Meta tagy, sitemap.xml
4. **Uživatelské účty** - Registrace/přihlášení
5. **Oblíbené nemovitosti** - Srdíčko → uložit
6. **Historie AI stagingu** - Uložené výsledky

## 📞 Podpora

Pokud narazíte na problémy:
1. Zkontrolujte konzoli pro chyby
2. Ověřte připojení k Supabase
3. Zkontrolujte RLS policies
4. Ověřte existenci Storage bucketu

---

**Status**: ✅ FÁZE 1 kompletně implementována
**Časová náročnost**: 1-2 hodiny
**Následující fáze**: FÁZE 2 - UX vylepšení
