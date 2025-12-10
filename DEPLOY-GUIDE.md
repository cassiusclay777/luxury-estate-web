# Deployment Guide - Vercel

## Krok 1: Push na GitHub

Máš hotový commit, teď ho musíš pushnout na GitHub. Máš dvě možnosti:

### Možnost A: Opravi SSH klíč (doporučeno)
```bash
# 1. Zkontroluj SSH klíče
ls ~/.ssh/

# 2. Pokud nevidíš id_ed25519 nebo id_rsa, vygeneruj nový
ssh-keygen -t ed25519 -C "tvuj-email@gmail.com"

# 3. Zkopíruj public key
cat ~/.ssh/id_ed25519.pub

# 4. Přidej na GitHub:
# - Jdi na https://github.com/settings/keys
# - Klikni "New SSH key"
# - Vlož obsah id_ed25519.pub
# - Ulož

# 5. Test SSH connection
ssh -T git@github.com

# 6. Push
git push
```

### Možnost B: Změň na HTTPS (rychlejší pro jednorázový push)
```bash
# 1. Změň remote na HTTPS
git remote set-url origin https://github.com/cassiusclay777/luxury-estate-web.git

# 2. Push (GitHub se zeptá na username + Personal Access Token)
git push

# Pokud nemáš Personal Access Token:
# - Jdi na https://github.com/settings/tokens
# - Klikni "Generate new token (classic)"
# - Vyber scope: "repo" (full control)
# - Zkopíruj token a použij jako heslo při pushu
```

---

## Krok 2: Deploy na Vercel

Protože už máš Vercel účet, deployment je jednoduchý:

### Automatický deployment (DOPORUČENO)

Vercel má GitHub integration - jakmile pushneš na `main` branch, automaticky se to deployuje.

**Zkontroluj integraci:**
1. Jdi na https://vercel.com/casshi777s-projects
2. Najdi projekt "luxestate" (nebo jak se jmenuje)
3. Klikni na projekt
4. V Settings → Git → zkontroluj, že je připojený k `cassiusclay777/luxury-estate-web`

**Po pushu:**
- Vercel automaticky detekuje změnu
- Spustí build
- Deployne na production
- Dostaneš notifikaci (email + dashboard)
- URL: https://luxestate.vercel.app (nebo tvoje custom doména)

---

### Manuální deployment (pokud nechceš čekat)

```bash
# 1. Nainstaluj Vercel CLI (pokud nemáš)
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy na production
vercel --prod

# CLI se zeptá:
# - Set up and deploy? → Yes
# - Which scope? → casshi777s-projects (tvůj team)
# - Link to existing project? → Yes
# - What's the name of your existing project? → luxestate
```

---

## Krok 3: Environment Variables na Vercel

**DŮLEŽITÉ:** Musíš nastavit production environment variables!

### Přejdi do Vercel Dashboard:
https://vercel.com/casshi777s-projects/luxestate/settings/environment-variables

### Přidej tyto proměnné:

#### Supabase (PRODUCTION)
```
NEXT_PUBLIC_SUPABASE_URL=https://jvklqoapjhqdmhlfmiyw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2a2xxb2FwamhxZG1obGZtaXl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4NDc4NzYsImV4cCI6MjA4MDQyMzg3Nn0.BpYco40P5UYXMg5Y2CvOe-mFvAlnzIvIDDEl9zVGxb4
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2a2xxb2FwamhxZG1obGZtaXl3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDg0Nzg3NiwiZXhwIjoyMDgwNDIzODc2fQ.pM3xjSW7GrH89FEDcEb1MMfDpw58lrZMijXxPeLsqCA
```

#### MongoDB Atlas
```
MONGODB_URI=mongodb+srv://patrikjedlicka7_db_user:1MPbxocjNBnjW5@luxestate-cluster.mongodb.net/?retryWrites=true&w=majority&appName=luxestate-cluster
```

#### AI Services
```
NEXT_PUBLIC_GROQ_API_KEY=your_groq_api_key_here
OPENAI_API_KEY=your_openai_or_perplexity_key_here
HUGGINGFACE_API_TOKEN=your_huggingface_token_here
```

#### MapLibre
```
NEXT_PUBLIC_MAPTILER_KEY=bKjovNqAMB4Av6h7MTAT
```

#### Base URL (ZMĚŇ na svou Vercel URL!)
```
NEXT_PUBLIC_BASE_URL=https://luxestate.vercel.app
```

**Pro každou proměnnou:**
- Vyber "Production" environment (zatrhni checkbox)
- Můžeš přidat i "Preview" a "Development" pokud chceš

Po přidání klikni **"Redeploy"** aby se změny projevily.

---

## Krok 4: Test Deployment

Po úspěšném deployu:

### 1. Otevři production URL
```
https://luxestate.vercel.app
```

### 2. Zkontroluj základní funkčnost:
- [ ] Stránka se načte
- [ ] Nemovitosti se zobrazují
- [ ] Obrázky ze Sreality CDN fungují
- [ ] "Via Sreality.cz" badge je viditelný
- [ ] Kliknutí na nemovitost vede na detail
- [ ] Mapa funguje (pokud má GPS souřadnice)
- [ ] Search funguje
- [ ] AI chat funguje (pokud máš API klíče)

### 3. Zkontroluj Vercel Logs
Pokud něco nefunguje:
- Jdi do Vercel Dashboard → Deployments
- Klikni na nejnovější deployment
- Otevři "Logs" nebo "Runtime Logs"
- Hledej errory

### 4. Test na mobilu
- Otevři URL na mobilu
- Zkontroluj responsive design
- Zkontroluj rychlost načítání obrázků

---

## Krok 5: Custom Doména (volitelné)

Pokud chceš profesionálnější URL (např. `luxestate.cz` místo `luxestate.vercel.app`):

### 1. Kup doménu
- Wedos.cz (150 Kč/rok pro .cz)
- Namecheap.com
- Google Domains

### 2. Přidej do Vercel
- Vercel Dashboard → Settings → Domains
- Klikni "Add Domain"
- Zadej `luxestate.cz`
- Vercel ti dá DNS záznamy (A record nebo CNAME)

### 3. Nastav DNS u registrátora
Přidej záznamy které ti Vercel ukáže, například:
```
Type: A
Name: @
Value: 76.76.21.21 (Vercel IP)

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 4. Počkej na propagaci (15 minut - 48 hodin)
Zkontroluj stav:
```bash
dig luxestate.cz
```

---

## Krok 6: Google Analytics & Tracking (pro email Sreality)

Před odesláním emailu Sreality přidej analytics:

### 1. Vytvoř Google Analytics 4 property
- https://analytics.google.com
- Admin → Create Property
- Property name: "LuxEstate"
- Zkopíruj Measurement ID (např. `G-XXXXXXXXXX`)

### 2. Přidej do projektu

**Install:**
```bash
npm install @next/third-parties
```

**Update layout.tsx:**
```typescript
// src/app/layout.tsx
import { GoogleAnalytics } from '@next/third-parties/google'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <GoogleAnalytics gaId="G-XXXXXXXXXX" />
      </body>
    </html>
  )
}
```

### 3. Track kliknutí na "Zobrazit na Sreality.cz"

V PropertyCard.tsx přidej event:
```typescript
import { sendGAEvent } from '@next/third-parties/google'

<a
  href={`https://www.sreality.cz/detail/${property.link}?utm_source=luxestate&utm_medium=referral`}
  onClick={() => {
    sendGAEvent('event', 'sreality_click', {
      property_id: property.id,
      property_title: property.title,
    })
  }}
  target="_blank"
>
  Zobrazit na Sreality.cz
</a>
```

### 4. Commit & Push
```bash
git add .
git commit -m "feat: Add Google Analytics tracking"
git push
```

Po týdnu budeš mít data:
- Kolik lidí kliklo na Sreality.cz
- Jaké nemovitosti jsou nejpopulárnější
- CTR (Click-Through Rate)

→ **Tyto metriky použiješ v druhém emailu Sreality!**

---

## Krok 7: GDPR Compliance

Pro produkci potřebuješ:

### Cookie Consent Banner

**Install:**
```bash
npm install @cookieyes/cookie-consent-react
```

**Add to layout:**
```typescript
import { CookieConsent } from '@cookieyes/cookie-consent-react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <CookieConsent
          websiteId="YOUR_COOKIEYES_ID"
        />
      </body>
    </html>
  )
}
```

### Privacy Policy & Terms

Vytvoř stránky:
- `/privacy` - GDPR policy
- `/terms` - Podmínky používání

Můžeš použít generátor:
- https://www.freeprivacypolicy.com/
- https://www.termsfeed.com/

---

## Troubleshooting

### Build failuje na Vercel
**Error:** `Module not found`
**Fix:**
```bash
# Locally
rm -rf node_modules package-lock.json
npm install
npm run build

# If works, push
git add package-lock.json
git commit -m "fix: Update dependencies"
git push
```

### Obrázky ze Sreality se nenačítají
**Error:** 403 Forbidden nebo CORS
**Fix:** Zkontroluj `next.config.js`:
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

### Database connection fails
**Error:** `Connection timeout`
**Fix:**
1. Zkontroluj Supabase credentials v Vercel env vars
2. Zkontroluj Supabase dashboard → Settings → Database → Connection pooling
3. Přidej Vercel IP do allowlist (pokud máš restricted access)

### Environment variables nefungují
**Error:** `undefined` values
**Fix:**
1. Zkontroluj že jsou v Vercel Dashboard → Settings → Environment Variables
2. Zkontroluj že jsi zaškrtl "Production"
3. Po změně musíš udělat **Redeploy**!

---

## Shrnutí - Checklist

Před odesláním emailu Sreality:

- [ ] ✅ Build prošel lokálně (`npm run build`)
- [ ] ✅ Commit vytvořen
- [ ] 🔄 Push na GitHub (SSH nebo HTTPS)
- [ ] 🔄 Vercel deployment úspěšný
- [ ] 🔄 Environment variables nastavené
- [ ] 🔄 Web funguje na production URL
- [ ] 🔄 Obrázky ze Sreality se načítají
- [ ] ✅ "Via Sreality.cz" badge je viditelný
- [ ] ⏳ Google Analytics přidán (volitelné ale doporučené)
- [ ] ⏳ Cookie consent banner (pro GDPR)
- [ ] ⏳ Custom doména (volitelné)

**Až budeš mít všechno hotové:**
1. Otevři EMAIL-SREALITY.md
2. Zkopíruj **Variantu A** (doporučená)
3. Doplň své kontaktní údaje
4. Změň URL na svou production URL
5. Odešli na `marketing@sreality.cz` nebo `podpora@sreality.cz`

---

## Kdy odeslat email?

**IDEÁLNĚ:**
- Týden po deployu (ať máš trochu dat z GA)
- V úterý nebo středu (9:00 - 11:00) - nejlepší čas pro B2B emaily
- Po otestování všech funkcí

**MŮŽEŠ I HNED**, ale bude to působit profesionálněji pokud počkáš a napíšeš:
> "Za první týden naše platforma zaznamenala 127 kliknutí na Sreality.cz s průměrným CTR 8.3%"

→ To zní mnohem lépe než "právě jsme to spustili" 😉

Hodně štěstí! 🚀
