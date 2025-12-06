# Oprava projektu Reality-estate-web - Kompletní analýza a požadavky

## Projektové informace
- **Název projektu**: Reality-estate-web (luxusní realitní platforma)
- **Operační systém**: Windows 11
- **Cesta k projektu**: `c:\Projekty\Reality-estate-web`
- **Tech stack**: Next.js 14, TypeScript, Supabase (PostgreSQL), Tailwind CSS, MapLibre GL, Three.js
- **AI služby**: Hugging Face (plánováno), Pollinations.ai (aktuálně), Groq API

## Hlavní cíle
1. Opravit AI virtual staging aby skutečně pracoval s nahranými obrázky (image-to-image místo text-to-image)
2. Synchronizovat TypeScript typy s databázovým schématem
3. Opravit konfiguraci proměnných prostředí pro produkční prostředí
4. Optimalizovat import dat z Sreality.cz a geokódování adres
5. Opravit kódové chyby a architektonické problémy

## Detailní seznam problémů

### 1. AI Virtual Staging - nefunkční image-to-image
**Soubor**: `src/lib/huggingfaceClient.ts`
**Problém**: Funkce `generateStagedRoom()` volá Pollinations.ai API s textovým promptem, ale ignoruje nahraný obrázek. Výsledkem je generování zcela nového obrázku místo úpravy existujícího.
**Řešení**: Implementovat skutečné image-to-image generování pomocí Hugging Face Inference API (model `stable-diffusion-2-inpainting`) nebo Replicate API.

### 2. Nesynchronizované TypeScript typy
**Soubory**: `src/lib/supabase.ts` (ruční typ `Property`) vs `types/database.types.ts` (generované typy)
**Problém**: Ruční typ chybí sloupce: `area`, `main_image`, `published`, `slug`, `status`, `type`, `updated_at`
**Řešení**: Nahradit ruční typ generovanými typy v celém projektu.

### 3. Problémy s environment variables
**Soubory**: `src/lib/supabase.ts`, `src/lib/uploadHandler.ts`
**Problémy**:
- `NEXT_PUBLIC_BASE_URL` defaultuje na `http://localhost:3000` (produkční problém)
- Supabase credentials používají placeholder (`https://placeholder.supabase.co`)
- Chybí validace před použitím
**Řešení**: Přidat validaci na app start, použít lepší defaulty, clear error messages.

### 4. Import dat a geokódování
**Soubory**: `scripts/import-sreality.ts`, `src/app/api/cron/import-properties/route.ts`
**Problémy**:
- Hardcoded DB credentials v kódu
- Geokódování vypnuté → properties bez souřadnic
- Cron job timeout (geokódování 1s/request, 25+ sekund)
**Řešení**: Přesunout credentials do .env, implementovat batch geokódování, optimalizovat pro Vercel timeout.

### 5. Kódové chyby
**Soubor**: `src/app/api/ai-staging/route.ts`
- `require('fs/promises')` v ES modulech → použít `import`
**Soubor**: `src/app/layout.tsx`
- `suppressHydrationWarning` maskuje problémy
- Externí CSS z CDN zpomaluje načítání
**Řešení**: Opravit importy, odstranit suppressHydrationWarning, načíst CSS lokálně.

### 6. Neúplná funkcionalita
**Soubor**: `src/app/ai-staging/page.tsx`
- Načítá `propertyId` z URL ale nemá implementované načítání obrázků property
**Soubor**: `src/components/providers/AIProvider.tsx`
- Načítá properties bez clear use case
**Řešení**: Dokončit nebo odstranit.

### 7. Konfigurace
**Soubor**: `tailwind.config.ts`
- Chybí fallback fonty
**Soubor**: `next.config.js`
- Omezené `remotePatterns` (chybí sreality.cz atd.)
**Řešení**: Přidat fallbacky, rozšířit remotePatterns.

### 8. Bezpečnost
**Soubor**: `scripts/import-sreality.ts`
- Hardcoded database credentials
**Řešení**: Přesunout do .env proměnných.

### 9. Logování
**Soubor**: `src/app/api/ai-staging/route.ts`
- Loguje do JSON souboru → problém na serverless (Vercel)
**Řešení**: Ukládat do DB nebo použít externí logging.

### 10. Error handling
**Problém**: Chybí error boundaries a loading stavy v mnoha komponentách
**Řešení**: Přidat error boundaries a skeleton loadery.

### 11. Optimalizace obrázků
**Problém**: Nepoužívá se Next.js Image komponenta konzistentně
**Řešení**: Migrovat všechny obrázky na Next.js Image.

### 12. Lokalizace
**Problém**: Mix českého a anglického textu
**Řešení**: Implementovat i18n nebo zvolit konzistentní jazyk.

## Požadavky na implementaci
1. **Postupovat iterativně** - jedna změna, test, commit
2. **Zachovat working features** - neporušit existující funkcionalitu
3. **Dodržet code style** - používat existující konvence
4. **Komentovat změny** - zejména komplexní opravy
5. **Windows kompatibilita** - všechny příkazy musí fungovat na Windows CMD/PowerShell
6. **Produkční ready** - řešení musí fungovat na Vercel/cloudu

## Očekávaný výsledek
- Funkční AI staging s image-to-image generováním
- Synchronizované typy, žádné TypeScript chyby
- Správně nakonfigurované environment variables
- Optimalizovaný import dat s geokódováním
- Opravené kódové chyby
- Lepší UX s error boundaries a loading stavy

## Instrukce pro Claude
1. Projdi projektovou strukturu (`src/`, `scripts/`, `types/`)
2. Identifikuj všechny zmíněné soubory
3. Začni s nejkritičtějšími problémy (AI staging, typy, env vars)
4. Proveď změny a otestuj (`npm run dev`)
5. Dokumentuj provedené změny
6. Pokud objevíš další problémy, uprav tento seznam

**Windows specific**: Používej `npm` (ne yarn), `type` (ne cat), PowerShell příkazy.

---

*Tento prompt obsahuje vše potřebné pro opravu projektu. Začni analýzou a postupuj podle priority.*
