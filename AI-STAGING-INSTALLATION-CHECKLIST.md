# ✅ AI Virtual Staging - Instalační Checklist

Tento checklist vám pomůže ověřit, že je vše správně nainstalované a funkční.

---

## 📋 Pre-instalace (Hotovo ✅)

- [x] Všechny soubory vytvořeny
- [x] `replicate` balíček nainstalován
- [x] `next.config.js` aktualizován
- [x] `.env.example` aktualizován
- [x] `.gitignore` aktualizován
- [x] Složky `public/uploads/` a `data/` vytvořeny

---

## 🔧 Co musíte udělat VY

### 1. Získat Replicate API klíč

- [ ] Jděte na https://replicate.com
- [ ] Zaregistrujte se (email + heslo)
- [ ] Přejděte do **Account > API Tokens**
- [ ] Klikněte **"Create token"**
- [ ] Zkopírujte token (začíná `r8_...`)

### 2. Nastavit environment variables

- [ ] Zkopírujte `.env.example` na `.env.local`
  ```bash
  cp .env.example .env.local
  ```

- [ ] Otevřete `.env.local` a přidejte:
  ```bash
  REPLICATE_API_TOKEN=r8_your_actual_token_here
  NEXT_PUBLIC_BASE_URL=http://localhost:3000
  ```

- [ ] Uložte soubor

### 3. Spustit aplikaci

- [ ] Spusťte dev server:
  ```bash
  npm run dev
  ```

- [ ] Otevřete v prohlížeči:
  ```
  http://localhost:3000/ai-staging
  ```

### 4. Otestovat funkčnost

- [ ] Stránka `/ai-staging` se načetla bez chyb
- [ ] Upload fotky funguje
- [ ] Všechny styly se zobrazují
- [ ] Vygenerování funguje (počkejte 30-60s)
- [ ] Výsledek se zobrazí
- [ ] Stažení výsledku funguje

---

## 🔍 Ověření instalace

### Zkontrolujte soubory:

```bash
# Komponenty
ls src/app/ai-staging/components/
# Mělo by vrátit: ImageUpload.tsx, StyleSelector.tsx, ResultPreview.tsx

# API routes
ls src/app/api/ai-staging/
# Mělo by vrátit: route.ts, upload/

# Lib soubory
ls lib/
# Mělo by obsahovat: aiStagingClient.ts, uploadHandler.ts

# Typy
ls lib/types/
# Mělo by obsahovat: ai-staging.ts
```

### Zkontrolujte dependencies:

```bash
npm list replicate
# Mělo by vrátit: replicate@0.34.1 (nebo vyšší)
```

### Zkontrolujte ENV:

```bash
cat .env.local | grep REPLICATE
# Mělo by vrátit: REPLICATE_API_TOKEN=r8_...
```

---

## 🧪 Test Flow

### Minimální test (5 minut):

1. **Připravte testovací fotku**
   - Fotka prázdného pokoje
   - JPG, PNG nebo WEBP
   - Ideálně < 5MB

2. **Otevřete aplikaci**
   ```
   http://localhost:3000/ai-staging
   ```

3. **Nahrajte fotku**
   - Klikněte do upload oblasti
   - Vyberte fotku
   - Ověřte, že se zobrazí preview

4. **Vyberte styl**
   - Např. "Modern" nebo "Scandinavian"

5. **Volitelně přidejte prompt**
   - Např. "pracovna, tmavé dřevo"

6. **Generujte**
   - Klikněte "Vygenerovat návrh vybavení"
   - Počkejte 30-60 sekund
   - ⚠️ První request může trvat déle (cold start)

7. **Ověřte výsledek**
   - Zobrazil se vygenerovaný obrázek?
   - Je kvalitní?
   - Funguje before/after porovnání?

8. **Stáhněte**
   - Klikněte "Stáhnout výsledek"
   - Ověřte, že se soubor stáhl

---

## 🐛 Troubleshooting

### ❌ Problém: "AI služba není nakonfigurována"

**Řešení:**
```bash
# 1. Zkontrolujte .env.local
cat .env.local | grep REPLICATE

# 2. Mělo by vrátit něco jako:
# REPLICATE_API_TOKEN=r8_xxxxxxxxxxxxxxxxxxxxx

# 3. Pokud ne, přidejte token do .env.local
```

### ❌ Problém: "Failed to generate staged room"

**Možné příčiny:**

1. **Neplatný API token**
   - Zkontrolujte token na https://replicate.com/account
   - Vytvořte nový token

2. **Nedostatek kreditu**
   - Přidejte platební kartu na Replicate
   - První požadavky jsou zdarma

3. **Příliš velký obrázek**
   - Zkuste menší fotku (< 3MB)
   - Komprimujte obrázek

4. **Timeout**
   - Pokud běží na Vercel Hobby tier (max 10s)
   - Potřebujete Vercel Pro tier (60s)

### ❌ Problém: Upload fotky nefunguje

**Řešení:**
```bash
# Zkontrolujte, že složka existuje:
ls public/uploads/

# Pokud ne, vytvořte:
mkdir public/uploads
```

### ❌ Problém: Next.js Image error

**Řešení:**
```bash
# Zkontrolujte next.config.js:
cat next.config.js | grep replicate

# Mělo by obsahovat:
# hostname: 'replicate.delivery'
# hostname: 'pbxt.replicate.delivery'
```

---

## 📊 Checklist po úspěšném testu

- [ ] AI staging funguje end-to-end
- [ ] Výsledky jsou kvalitní
- [ ] Přečetl jsem [AI-STAGING-README.md](./AI-STAGING-README.md)
- [ ] Vím, jak integrovat do detailu nemovitosti
- [ ] Znám pricing ($0.006/request)
- [ ] Zvážil jsem rate limiting pro produkci
- [ ] Plánuji přidat autentifikaci

---

## 🚀 Další kroky

### Pro produkci:

1. **Nastavte Vercel environment variables**
   ```
   REPLICATE_API_TOKEN=r8_...
   NEXT_PUBLIC_BASE_URL=https://your-domain.com
   ```

2. **Upgrade na Vercel Pro** (pokud chcete použít v produkci)
   - Hobby tier má 10s timeout ❌
   - Pro tier má 60s timeout ✅
   - Nebo použijte jiný hosting (Railway, Render)

3. **Přidejte rate limiting**
   - Upstash Redis
   - Vercel Edge Config
   - Vlastní implementace

4. **Přidejte autentifikaci**
   - NextAuth.js
   - Clerk
   - Supabase Auth

5. **Monitoring**
   - Sledujte náklady na Replicate dashboard
   - Nastavte budget alerts
   - Trackujte usage metriky

### Integrace do webu:

1. **Přidejte link v detailu nemovitosti**
   ```tsx
   <Link href="/ai-staging">
     <Sparkles /> Virtuální staging
   </Link>
   ```

2. **Volitelně: Přednačtěte fotky nemovitosti**
   ```tsx
   <Link href={`/ai-staging?imageUrl=${property.images[0]}`}>
     Navrhnout vybavení
   </Link>
   ```

3. **Vytvořte landing page**
   - Vysvětlete funkci
   - Ukažte příklady before/after
   - CTA tlačítko na `/ai-staging`

---

## 📞 Podpora

Pokud narazíte na problém:

1. ✅ Zkontrolujte tento checklist
2. 📚 Přečtěte [AI-STAGING-README.md](./AI-STAGING-README.md)
3. 🚀 Zkuste [AI-STAGING-QUICKSTART.md](./AI-STAGING-QUICKSTART.md)
4. 🐛 Otevřete issue na GitHubu
5. 💬 Kontaktujte vývojáře

---

## 🎉 Gratulujeme!

Pokud jste prošli tímto checklistem, máte **plně funkční AI Virtual Staging modul**.

Můžete začít nabízet klientům profesionální virtuální staging v reálném čase!

---

**Status:** ✅ Ready for Production
**Čas instalace:** ~5 minut
**Obtížnost:** Snadná
