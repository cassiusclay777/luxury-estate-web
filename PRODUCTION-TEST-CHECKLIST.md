# Production Test Checklist

## URL
**Production:** https://luxestate-a5857nobs-cashi777s-projects.vercel.app

---

## ✅ Co otestovat:

### 1. Homepage (/)
- [ ] Stránka se načte bez errorů
- [ ] Hero sekce je viditelná
- [ ] PropertyCard komponenty se zobrazují
- [ ] Obrázky ze Sreality CDN se načítají
- [ ] **"Via Sreality.cz" badge je viditelný** na každé kartě
- [ ] Animace fungují (hover efekty)

### 2. Properties (/properties)
- [ ] Seznam nemovitostí se načte
- [ ] Filtry fungují
- [ ] Pagination funguje (pokud je více než 12 nemovitostí)
- [ ] Obrázky ze Sreality se načítají
- [ ] Kliknutí na nemovitost vede na detail

### 3. Property Detail (/properties/[id])
- [ ] Detail se načte
- [ ] Galerie obrázků funguje
- [ ] Mapa se zobrazuje (pokud má GPS)
- [ ] Všechny informace jsou zobrazené (cena, plocha, pokoje, atd.)

### 4. Search (/search)
- [ ] Vyhledávání funguje
- [ ] Voice search funguje (pokud prohlížeč podporuje)
- [ ] Advanced search funguje

### 5. AI Features
- [ ] AI Chat funguje (/ai-demo)
- [ ] AI Virtual Staging funguje (/ai-staging) - pokud používáš

### 6. Responsive Design
- [ ] Otevři na mobilu - vše funguje
- [ ] Tablet view OK
- [ ] Desktop view OK

### 7. Performance
- [ ] Rychlost načítání < 3 sekundy
- [ ] Obrázky se načítají postupně (lazy loading)
- [ ] Žádné console errory

---

## 🐛 Pokud něco nefunguje:

### Zkontroluj Vercel Logs:
1. Jdi na https://vercel.com/casshi777s-projects/luxestate/deployments
2. Klikni na nejnovější deployment
3. Otevři "Runtime Logs"
4. Načti stránku a sleduj logy

### Běžné problémy:

**1. "Internal Server Error" nebo 500**
→ Chybí environment variables nebo špatné Supabase credentials

**2. Obrázky ze Sreality se nenačítají (403 Forbidden)**
→ Next.js Image config není správně nastaven (ale měl by být OK)

**3. Nemovitosti se nezobrazují**
→ Supabase není správně připojený, nebo databáze je prázdná

**4. AI features nefungují**
→ API keys nejsou nastavené v Vercel env vars

---

## 📸 Screenshot test

Udělej screenshot homepage a pošli:
- Jitce (ukázat web)
- Sobě (pro dokumentaci)
- Případně do emailu Sreality

---

## 🚀 Pokud všechno funguje:

### 1. Custom doména (volitelné)
- Kup doménu (např. luxestate.cz)
- Přidej v Vercel → Settings → Domains

### 2. Google Analytics
- Přidej GA tracking kód
- Počkej týden na data
- Použij čísla v emailu Sreality

### 3. Email Sreality
- Otevři EMAIL-SREALITY.md
- Zkopíruj Variantu A
- Změň URL na production URL
- Odešli!

---

## ✅ Production Ready Checklist

- [x] Build úspěšný
- [x] Environment variables nastavené
- [x] Deployed na Vercel
- [ ] Homepage funguje
- [ ] Nemovitosti se zobrazují
- [ ] Obrázky ze Sreality fungují
- [ ] "Via Sreality.cz" badge viditelný
- [ ] Mobile responsive
- [ ] Žádné console errory

---

**Až projdeš všechny testy, jsi ready pro launch! 🎉**
