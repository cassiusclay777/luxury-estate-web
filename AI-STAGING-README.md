# AI Virtual Staging Module

Kompletní modul pro virtuální staging nemovitostí pomocí AI. Umožňuje nahrát fotku prázdného pokoje a vygenerovat profesionální návrh vybavení v požadovaném stylu.

---

## 🎯 Funkce

- ✅ **Upload fotky pokoje** - jednoduché nahrání obrázku
- ✅ **Výběr ze 8 stylů** - Modern, Minimalist, Industrial, Scandinavian, Classic, Loft, Rustic, Contemporary
- ✅ **Vlastní textový prompt** - upřesnění požadavků na vybavení
- ✅ **Realtime AI generování** - fotorealistický návrh za 30-60s
- ✅ **Preview a stahování** - porovnání před/po, stažení výsledku
- ✅ **Admin logging** - automatické logování požadavků do JSON

---

## 🏗️ Architektura

```
Reality-estate-web/
├── src/app/
│   ├── ai-staging/
│   │   ├── page.tsx                    # Hlavní UI stránka
│   │   └── components/
│   │       ├── ImageUpload.tsx         # Upload komponenta
│   │       ├── StyleSelector.tsx       # Výběr stylu
│   │       └── ResultPreview.tsx       # Výsledek před/po
│   │
│   └── api/
│       └── ai-staging/
│           ├── route.ts                # POST /api/ai-staging - AI generování
│           └── upload/
│               └── route.ts            # POST /api/ai-staging/upload - nahrání fotky
│
├── lib/
│   ├── aiStagingClient.ts              # Replicate API klient
│   ├── uploadHandler.ts                # File upload handler
│   └── types/
│       └── ai-staging.ts               # TypeScript typy
│
├── public/
│   └── uploads/                        # Temporary storage pro nahrané fotky
│
└── data/
    └── staging-logs.json               # Admin logy (auto-created)
```

---

## 🚀 Instalace a Spuštění

### 1. Získání Replicate API klíče

1. Jděte na **https://replicate.com**
2. Zaregistrujte se (zdarma)
3. Přejděte na **Account > API Tokens**
4. Vytvořte nový token
5. Zkopírujte API token

**Pricing:**
- První požadavky jsou ZDARMA
- Potom ~$0.0055 per image (pay-as-you-go)
- Žádný měsíční poplatek

### 2. Konfigurace prostředí

Zkopírujte `.env.example` na `.env.local`:

```bash
cp .env.example .env.local
```

Doplňte do `.env.local`:

```bash
# AI Virtual Staging (Replicate)
REPLICATE_API_TOKEN=r8_your_actual_token_here
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

V produkci změňte `NEXT_PUBLIC_BASE_URL` na vaši doménu:
```bash
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

### 3. Instalace závislostí

Všechny závislosti jsou již nainstalovány:

```bash
npm install
# nebo
pnpm install
```

Balíčky:
- `replicate` - Replicate API SDK
- `framer-motion` - Animace UI (už máte)
- `lucide-react` - Ikony (už máte)

### 4. Spuštění dev serveru

```bash
npm run dev
```

Otevřete: **http://localhost:3000/ai-staging**

---

## 📖 Použití

### Základní flow:

1. Otevřete `/ai-staging`
2. Nahrajte fotku prázdného pokoje (JPG, PNG, WEBP, max 10MB)
3. Vyberte styl (např. Modern, Industrial, Scandinavian...)
4. Volitelně přidejte textový prompt (např. "pracovna pro dva, tmavé dřevo")
5. Klikněte "Vygenerovat návrh vybavení"
6. Počkejte 30-60s na AI generování
7. Porovnejte původní a vygenerovaný obrázek
8. Stáhněte výsledek

### Integrace do detailu nemovitosti

Do stránky detailu nemovitosti přidejte link:

```tsx
import Link from 'next/link'
import { Sparkles } from 'lucide-react'

// V detailu nemovitosti:
<Link
  href="/ai-staging"
  className="btn btn-primary"
>
  <Sparkles className="w-5 h-5" />
  Navrhnout vybavení pomocí AI
</Link>
```

Nebo s předvyplněným ID nemovitosti:

```tsx
<Link
  href={`/ai-staging?propertyId=${property.id}`}
  className="btn btn-primary"
>
  <Sparkles className="w-5 h-5" />
  Virtuální staging
</Link>
```

---

## 🔧 API Dokumentace

### POST /api/ai-staging/upload

Nahraje fotku do `public/uploads/`.

**Request:**
```typescript
FormData {
  file: File  // JPG, PNG, WEBP, max 10MB
}
```

**Response:**
```json
{
  "success": true,
  "url": "/uploads/staging-1234567890-abc123.jpg",
  "message": "Soubor byl úspěšně nahrán"
}
```

---

### POST /api/ai-staging

Vygeneruje virtuálně vybavený pokoj pomocí AI.

**Request:**
```json
{
  "imageUrl": "/uploads/staging-1234567890-abc123.jpg",
  "style": "modern",
  "prompt": "pracovna pro dva, hodně úložného prostoru",
  "propertyId": "optional-property-id"
}
```

**Response (Success):**
```json
{
  "success": true,
  "imageUrl": "https://replicate.delivery/pbxt/xyz123.jpg",
  "metadata": {
    "requestId": "staging_1234567890_abc123",
    "timestamp": "2025-01-15T10:30:00.000Z",
    "processingTime": 45230
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Chybějící URL obrázku",
  "metadata": {
    "requestId": "staging_1234567890_abc123",
    "timestamp": "2025-01-15T10:30:00.000Z",
    "processingTime": 120
  }
}
```

---

## 🎨 Dostupné styly

| Styl | Popis | Use case |
|------|-------|----------|
| `modern` | Čisté linie, neutrální barvy | Moderní byty |
| `minimalist` | Jednoduchost, světlé prostory | Malé byty, studio |
| `industrial` | Odhalené cihly, kov | Lofty, přestavby |
| `scandinavian` | Světlé dřevo, hygge atmosféra | Rodinné byty |
| `classic` | Elegance, tradiční nábytek | Luxusní nemovitosti |
| `loft` | Otevřený prostor, vysoké stropy | Velké prostory |
| `rustic` | Přírodní dřevo, teplé tóny | Chalupy, venkov |
| `contemporary` | Módní, umělecké akcenty | Prémiové byty |

---

## 📊 Admin Tracking

Všechny požadavky na AI staging se automaticky logují do `data/staging-logs.json`:

```json
[
  {
    "id": "staging_1234567890_abc123",
    "timestamp": "2025-01-15T10:30:00.000Z",
    "originalImageUrl": "/uploads/staging-1234567890-abc123.jpg",
    "generatedImageUrl": "https://replicate.delivery/pbxt/xyz123.jpg",
    "style": "modern",
    "prompt": "pracovna pro dva",
    "propertyId": "property-123",
    "userId": null
  }
]
```

**Poznámka:** Ukládá se max 1000 posledních logů, starší se automaticky mažou.

### Rozšíření na databázi

Pro produkční použití doporučuji logování přesunout do databáze.

V `src/app/api/ai-staging/route.ts` upravte funkci `logStagingRequest`:

```typescript
async function logStagingRequest(data: {
  originalImageUrl: string;
  generatedImageUrl: string;
  style: InteriorStyle;
  prompt?: string;
  propertyId?: string;
  processingTime: number;
}) {
  // Místo JSON souboru použijte Supabase:
  const { error } = await supabase
    .from('ai_staging_logs')
    .insert({
      original_image_url: data.originalImageUrl,
      generated_image_url: data.generatedImageUrl,
      style: data.style,
      prompt: data.prompt,
      property_id: data.propertyId,
      processing_time: data.processingTime,
    });

  if (error) {
    console.error('Error logging to database:', error);
  }
}
```

---

## 🚀 Nasazení do produkce

### Vercel (doporučeno)

1. **Nastavte environment variables ve Vercel:**
   - `REPLICATE_API_TOKEN`
   - `NEXT_PUBLIC_BASE_URL=https://your-domain.com`

2. **File uploads:**
   - `public/uploads/` funguje na Vercelu, ale **není trvalé** (ephemeral filesystem)
   - Pro produkci doporučuji přejít na **Vercel Blob Storage** nebo **Supabase Storage**

3. **Timeout:**
   - AI generování trvá 30-60s
   - Vercel Hobby tier: max 10s timeout ❌
   - **Vercel Pro tier: 60s timeout ✅** (potřebné pro AI staging)

4. **Alternativa bez Vercel Pro:**
   - Použijte **edge API route** s webhooky
   - Nebo vlastní server (Railway, Render, Fly.io)

### Upgrade na vlastní GPU server

Pokud chcete ušetřit na velkém množství požadavků:

1. Nasaďte Stable Diffusion na GPU server (RunPod, Vast.ai)
2. Upravte `lib/aiStagingClient.ts` - místo Replicate API volejte vlastní endpoint
3. Příklad Docker setup najdete v https://github.com/AUTOMATIC1111/stable-diffusion-webui

**Break-even point:** Cca 500+ requests/měsíc → vlastní server levnější

---

## 🔐 Bezpečnost

### Implementované:

✅ **Validace souborů** - typ, velikost
✅ **ENV proměnné** - žádné hardcoded API keys
✅ **Error handling** - žádné leaky citlivých dat
✅ **Rate limiting** - přes Vercel Edge Config (doporučeno nastavit)

### Doporučení pro produkci:

1. **Přidejte autentifikaci:**
   ```tsx
   // V page.tsx:
   import { useSession } from 'next-auth/react'

   const { data: session } = useSession()
   if (!session) return <LoginPrompt />
   ```

2. **Rate limiting:**
   - Limitujte počet požadavků na uživatele/IP
   - Použijte Vercel Edge Config nebo Upstash Redis

3. **Storage security:**
   - Přesuňte uploads do zabezpečeného storage (Supabase, S3)
   - Generujte signed URLs s expirací

4. **Cost protection:**
   - Nastavte budget alerts v Replicate dashboard
   - Implementujte denní/týdenní limity na uživatele

---

## 🐛 Troubleshooting

### "AI služba není nakonfigurována"
➡️ Zkontrolujte, že `REPLICATE_API_TOKEN` je správně nastavený v `.env.local`

### "Failed to generate staged room"
➡️ Zkontrolujte:
- Je image URL veřejně přístupná?
- Je Replicate API token validní?
- Máte kredit na Replicate účtu?

### Generování trvá >60s a timeout
➡️ Vercel Hobby tier má 10s limit. Potřebujete Vercel Pro nebo jiný hosting.

### Nahrané obrázky se neukážou
➡️ Zkontrolujte, že složka `public/uploads/` existuje a má write permissions

### Next.js Image error: "Invalid src prop"
➡️ Přidejte Replicate domény do `next.config.js` (už je hotovo v této instalaci)

---

## 📈 Monitoring a Analytics

Doporučené metriky ke sledování:

- **Počet požadavků** - denně/týdně/měsíčně
- **Úspěšnost** - success rate generování
- **Processing time** - průměrný čas generování
- **Náklady** - cost per request, celkové náklady
- **Oblíbené styly** - jaké styly uživatelé preferují
- **Conversion rate** - kolik lidí stáhne výsledek

Implementace:

```typescript
// Přidejte do logStagingRequest nebo samostatný analytics service
import { analytics } from '@/lib/analytics'

analytics.track('ai_staging_generated', {
  style: data.style,
  hasPrompt: !!data.prompt,
  processingTime: data.processingTime,
  propertyId: data.propertyId,
})
```

---

## 🔄 Budoucí vylepšení

Nápady pro rozšíření:

- [ ] **Batch processing** - více fotek najednou
- [ ] **Room detection** - AI detekce typu pokoje (ložnice, obývák...)
- [ ] **Style mixing** - kombinace více stylů
- [ ] **Before/After slider** - interaktivní porovnání
- [ ] **Furniture catalog** - výběr konkrétních kusů nábytku
- [ ] **Cost estimation** - odhad ceny vybavení
- [ ] **AR preview** - AR náhled v reálném čase (mobile)
- [ ] **Team collaboration** - sdílení návrhů s klienty
- [ ] **Version history** - ukládání verzí návrhů
- [ ] **Export to PDF** - prezentace pro klienty

---

## 📞 Podpora

Pro otázky nebo problémy:

1. Zkontrolujte tuto dokumentaci
2. Otevřete issue na GitHubu
3. Kontaktujte vývojáře

---

## 📝 Licence

Tento modul je součástí vašeho realitního webu. Pro komerční použití ověřte licenční podmínky:
- **Replicate**: https://replicate.com/terms
- **ControlNet model**: MIT License

---

**Úspěšné nasazení! 🎉**

Nyní můžete nabídnout klientům profesionální virtuální staging v reálném čase.
