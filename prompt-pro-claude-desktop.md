# Prompt pro Claude Desktop (Claude Opus 4.5) - Oprava projektu Reality-estate-web

## Kontext
Jsem vývojář pracující na projektu **Reality-estate-web** (luxusní realitní platforma s AI stagingem). Projekt běží na **Windows 11**, cesta: `c:\Projekty\Reality-estate-web`. Jedná se o Next.js 14 aplikaci s TypeScript, Supabase (PostgreSQL), Tailwind CSS, MapLibre GL a AI funkcionalitami.

## Cíl
Opravit všechny identifikované problémy v projektu, aby aplikace fungovala správně v produkčním prostředí. Zaměřit se zejména na:
1. Funkční AI virtual staging (image-to-image generování)
2. Synchronizaci typů a datových struktur
3. Správnou konfiguraci proměnných prostředí
4. Optimalizaci importu dat a cron jobů
5. Opravu kódových chyb a architektonických problémů

## Seznam problémů k řešení

### 1. AI Virtual Staging nefunguje správně
- **Soubor**: `src/lib/huggingfaceClient.ts`
- **Problém**: Funkce `generateStagedRoom()` používá Pollinations.ai pro text-to-image generování, ale nezpracovává nahraný obrázek. Měla by implementovat image-to-image generování.
- **Požadavek**: Implementovat skutečné image-to-image generování pomocí Hugging Face Inference API (model `stable-diffusion-2-inpainting` nebo podobný) nebo jiné služby, která umí upravovat nahrané obrázky.

### 2. Nesynchronizované typy
- **Soubory**: `src/lib/supabase.ts` vs `types/database.types.ts`
- **Problém**: Ručně definovaný typ `Property` neodpovídá databázovému schématu.
- **Požadavek**: Použít generované typy z `types/database.types.ts` v celém projektu. Aktualizovat všechny importy a použití typu `Property`.

### 3. Problémy s proměnnými prostředí
- **Soubory**: `src/lib/supabase.ts`, `src/lib/uploadHandler.ts`
- **Problémy**:
  1. `NEXT_PUBLIC_BASE_URL` defaultuje na `http://localhost:3000` - problém v produkci
  2. Supabase credentials používají placeholder pokud nejsou nastaveny
  3. Chybí validace proměnných prostředí
- **Požadavek**: Přidat robustní validaci na začátku aplikace, použít správné default hodnoty pro produkci, přidat clear error messages.

### 4. Problémy s importem dat
- **Soubory**: `scripts/import-sreality.ts`, `src/app/api/cron/import-properties/route.ts`
- **Problémy**:
  1. Hardcoded database credentials v import scriptu
  2. Geokódování vypnuté → nemovitosti nemají souřadnice
  3. Cron job může timeoutnout kvůli pomalému geokódování (rate limiting 1s/request)
- **Požadavek**:
  - Použít proměnné prostředí pro database credentials
  - Implementovat batch geokódování nebo caching
  - Optimalizovat cron job pro Vercel timeout limity

### 5. Kódové chyby a architektonické problémy
- **Soubor**: `src/app/api/ai-staging/route.ts`
  - Používá `require('fs/promises')` místo importu v ES modulech
- **Soubor**: `src/app/layout.tsx`
  - `suppressHydrationWarning` může maskovat hydration problémy
  - Externí CSS z unpkg.com zpomaluje načítání
- **Požadavek**: Opravit ES module importy, odstranit zbytečné suppressHydrationWarning, načíst CSS lokálně.

### 6. Chybějící nebo nekompletní funkcionalita
- **Soubor**: `src/app/ai-staging/page.tsx`
  - Načítá `propertyId` z URL, ale není implementováno načítání obrázků nemovitosti
- **Soubor**: `src/components/providers/AIProvider.tsx`
  - Načítá properties bez clear use case
- **Požadavek**: Dokončit funkcionalitu nebo odstranit zbytečný kód.

### 7. Konfigurační problémy
- **Soubor**: `tailwind.config.ts`
  - Chybí fallback fonty
- **Soubor**: `next.config.js`
  - Omezené `remotePatterns` blokují obrázky z jiných domén
- **Požadavek**: Přidat fallback fonty, rozšířit remotePatterns pro Sreality.cz a další zdroje.

### 8. Bezpečnostní problémy
- **Soubor**: `scripts/import-sreality.ts`
  - Hardcoded database credentials
- **Požadavek**: Přesunout credentials do proměnných prostředí.

### 9. Problémy s logováním
- **Soubor**: `src/app/api/ai-staging/route.ts`
  - Loguje do JSON souboru, což může selhat na serverless prostředích
- **Požadavek**: Ukládat logy do databáze nebo použít externí logging service.

### 10. Chybějící error boundaries a loading stavy
- **Problém**: V mnoha komponentách chybí proper error handling
- **Požadavek**: Přidat error boundaries a skeleton loadery pro lepší UX.

### 11. Neoptimalizované obrázky
- **Problém**: Projekt nepoužívá Next.js Image komponentu konzistentně
- **Požadavek**: Migrovat všechny obrázky na Next.js Image komponentu.

### 12. Lokalizační problémy
- **Problém**: Mix českého a anglického textu v kódu a UI
- **Požadavek**: Implementovat i18n nebo alespoň konzistentní jazyk.

## Technické detaily
- **OS**: Windows 11
- **Cesta projektu**: `c:\Projekty\Reality-estate-web`
- **Tech stack**: Next.js 14, TypeScript, Supabase, Tailwind CSS, MapLibre GL, Three.js
- **AI služby**: Hugging Face (plánováno), Pollinations.ai (aktuálně), Groq API
- **Databáze**: PostgreSQL přes Supabase

## Požadavky na řešení
1. **Postupovat iterativně** - opravit jeden problém po druhém, testovat po každé změně
2. **Zachovat stávající funkcionalitu** - neporušit working features
3. **Dodržet code style projektu** - používat existující konvence
4. **Přidat komentáře** k významným změnám
5. **Testovat na Windows** - všechny příkazy musí fungovat na Windows CMD/PowerShell
6. **Zvážit produkční nasazení** - řešení musí fungovat na Vercel/cloudových prostředích

## Očekávaný výstup
- Funkční AI virtual staging (image-to-image)
- Synchronizované typy a bez TypeScript chyb
- Správně nakonfigurované proměnné prostředí pro vývoj i produkci
- Optimalizovaný import dat s geokódováním
- Opravené kódové chyby a architektonické problémy
- Lepší UX s error boundaries a loading stavy

## Instrukce pro Claude
1. Nejprve projdi projektovou strukturu a pochop kontext
2. Identifikuj všechny soubory zmíněné v problémech
3. Začni s nejkritičtějšími problémy (AI staging, typy, environment variables)
4. Proveď změny a otestuj je lokálně (můžeš použít `npm run dev`)
5. Dokumentuj provedené změny
6. Pokud narazíš na další problémy, uprav tento seznam

**Důležité**: Všechny příkazy musí být kompatibilní s Windows (použij `npm` místo `yarn`, `type` místo `cat`, atd.).

---

*Tento prompt obsahuje kompletní analýzu problémů. Claude by měl být schopen podle něj provést potřebné opravy.*
