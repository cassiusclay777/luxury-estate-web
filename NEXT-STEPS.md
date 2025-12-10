# Next Steps - Co dělat po souhlasu Sreality

## Scénář 1: Sreality souhlasí ✅

### Fáze 1 - Legální základ (Týden 1-2)

#### 1.1 Právní dokumenty
- [ ] **Smlouva o spolupráci**
  - Revenue sharing model (např. 15-25% z provize za uzavřený obchod)
  - Definice "kvalifikovaného leadu"
  - SLA (Service Level Agreement) - jak rychle musí Sreality reagovat na lead
  - Výpovědní lhůty

- [ ] **API License Agreement**
  - Rate limits (kolik requestů/den)
  - Data usage policy
  - Caching pravidla
  - Attribution requirements

- [ ] **NDA (Non-Disclosure Agreement)**
  - Ochrana citlivých dat klientů
  - Obchodní tajemství

#### 1.2 Technické detaily
- [ ] **Získat produkční API klíč**
  - Vyšší rate limits než veřejné API
  - Prioritní support
  - Webhooks pro real-time updates

- [ ] **Tracking & Analytics**
  - UTM parametry v odkazech na Sreality: `?utm_source=luxestate&utm_medium=referral&utm_campaign=jmk`
  - Conversion tracking pixel od Sreality
  - Google Analytics 4 pro měření chování uživatelů

---

### Fáze 2 - Implementace (Týden 3-4)

#### 2.1 Frontend úpravy
```typescript
// src/components/ui/PropertyCard.tsx
<div className="flex items-center gap-2 mt-4">
  <Image src="/sreality-logo.svg" alt="Sreality.cz" width={80} height={20} />
  <span className="text-sm text-gray-500">Via Sreality.cz</span>
</div>

// Tlačítko s trackingem
<a
  href={`https://www.sreality.cz/detail/${property.link}?utm_source=luxestate&utm_medium=referral`}
  onClick={() => trackClick(property.id)}
  target="_blank"
  rel="noopener noreferrer"
>
  Zobrazit na Sreality.cz
</a>
```

#### 2.2 Backend - Lead tracking
- [ ] **Databázová tabulka: `leads`**
  ```sql
  CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id),
    user_name TEXT,
    user_email TEXT,
    user_phone TEXT,
    message TEXT,
    source TEXT DEFAULT 'luxestate',
    status TEXT DEFAULT 'new', -- new, contacted, converted, lost
    sreality_notified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
  );
  ```

- [ ] **API endpoint: `/api/leads/create`**
  - Uloží lead do DB
  - Pošle email Sreality.cz
  - Pošle email makléřce Jitce Jedličkové
  - Vrátí tracking ID

- [ ] **Webhook od Sreality** (pokud poskytnou)
  - Aktualizace stavu leadu (kontaktován, prodáno, zamítnuto)

#### 2.3 Email notifikace
```typescript
// src/lib/email.ts
export async function notifySreality(lead: Lead) {
  await sendEmail({
    to: 'leads@sreality.cz', // nebo specifický email
    subject: `Nový lead z LuxEstate - ${lead.property.city}`,
    html: `
      <h2>Nový zájemce o nemovitost</h2>
      <p><strong>Nemovitost:</strong> ${lead.property.title}</p>
      <p><strong>Link:</strong> https://www.sreality.cz/detail/${lead.property.link}</p>

      <h3>Kontaktní údaje:</h3>
      <ul>
        <li>Jméno: ${lead.user_name}</li>
        <li>Email: ${lead.user_email}</li>
        <li>Telefon: ${lead.user_phone}</li>
      </ul>

      <p><strong>Zpráva:</strong><br>${lead.message}</p>

      <p><em>Lead vygenerován z LuxEstate.cz</em></p>
    `
  })
}
```

---

### Fáze 3 - Marketing & Promotion (Měsíc 2)

#### 3.1 SEO optimalizace
- [ ] **Meta tags pro každou nemovitost**
  ```typescript
  export const metadata = {
    title: `${property.title} - ${property.city} | LuxEstate`,
    description: `${property.description} | Cena: ${formatPrice(property.price)} | ${property.area}m²`,
    openGraph: {
      images: [property.main_image],
    }
  }
  ```

- [ ] **Sitemap.xml** s odkazy na všechny nemovitosti
- [ ] **Schema.org markup** (RealEstateListing)

#### 3.2 PPC kampaně (volitelné)
- [ ] **Google Ads** - targetování "prodej nemovitostí Brno", "byty Brno" atd.
- [ ] **Facebook Ads** - lokální targeting (Jihomoravský kraj, 25-55 let, zájem o nemovitosti)
- [ ] Budget: 5 000 - 10 000 Kč/měsíc na test

#### 3.3 Content marketing
- [ ] **Blog články:**
  - "10 tipů jak vybrat byt v Brně"
  - "Jak správně ocenit nemovitost?"
  - "Hypotéka v roce 2025 - kompletní průvodce"
- [ ] **Video walkthrough** nemovitostí (spolupráce s Jitkou)

---

### Fáze 4 - Monitoring & Optimalizace (Průběžně)

#### 4.1 KPIs (Key Performance Indicators)
Měsíční reporty pro Sreality:

| Metrika | Cíl (Měsíc 1) | Cíl (Měsíc 3) | Cíl (Měsíc 6) |
|---------|---------------|---------------|---------------|
| Návštěvníci webu | 500 | 2 000 | 5 000 |
| Leady odeslané | 10 | 50 | 150 |
| Kliknutí na Sreality.cz | 100 | 500 | 1 500 |
| CTR (Click-Through Rate) | 5% | 8% | 10% |
| Conversion rate (lead/návštěva) | 2% | 2.5% | 3% |

#### 4.2 A/B testování
- [ ] **Varianta A:** "Zobrazit na Sreality.cz" vs **Varianta B:** "Domluvit prohlídku"
- [ ] **CTA button** umístění (nahoře vs dole)
- [ ] **Formulář** délka (3 pole vs 5 polí)

#### 4.3 Měsíční review meeting
- Videohovor s Sreality team
- Prezentace výsledků
- Diskuse o optimalizacích
- Plánování dalšího měsíce

---

## Scénář 2: Sreality nesouhlasí ❌

### Plán B - Alternativní zdroje dat

#### Option 1: Bezrealitky.cz
- **Výhoda:** Menší provize (2% vs 5% realitky)
- **API:** Mají veřejné API (https://www.bezrealitky.cz/api-dokumentace)
- **Target:** Lidé, co chtějí ušetřit na provizi

#### Option 2: Reality Mix
- **API:** Custom scraper nebo partnership
- **Kontakt:** info@realitymix.cz

#### Option 3: Vlastní databáze
- Jitka Jedličková přidává vlastní nemovitosti ručně
- Agregace z více zdrojů (Sreality bez API, jen scraping)
- Fokus na premium segment

#### Option 4: Multi-source agregace
```typescript
// Kombinace více zdrojů
const properties = [
  ...await fetchBezrealitky(),
  ...await fetchRealityMix(),
  ...await fetchJitkaProperties(), // vlastní nemovitosti
]
```

---

## Scénář 3: Sreality chce revenue share ⚖️

### Možné modely

#### Model A: Pay-per-lead
- **10 - 50 Kč za kvalifikovaný lead**
- Kvalifikovaný = validní kontakt + vážný zájem
- Platba měsíčně

#### Model B: Revenue sharing
- **15-25% z provize makléřky**
- Pouze při úspěšném prodeji
- Trackování přes unikátní kódy

#### Model C: Hybridní
- **Základní fee:** 2 000 Kč/měsíc za API přístup
- **+ Bonus:** 10% z provize při úspěšném prodeji

### Kalkulace - Je to ziskové?

**Příklad:**
- Průměrná cena bytu v Brně: **4 000 000 Kč**
- Provize makléře (Jitka): **3-5%** = **120 000 - 200 000 Kč**
- Share pro Sreality (20%): **24 000 - 40 000 Kč**
- **Zůstává Jitce: 96 000 - 160 000 Kč**

Pokud:
- Prodáš **1 byt za měsíc** = **96 000 Kč čistého**
- Prodáš **3 byty za měsíc** = **288 000 Kč čistého**

→ **Ano, je to výhodné i při 20% revenue share!**

---

## Technické ToDo před kontaktováním Sreality

### Musíš mít hotové:

1. **Vercel deployment**
   - ✅ Production build bez errorů
   - ✅ SSL certifikát (HTTPS)
   - ✅ Custom doména (volitelné, ale profesionálnější)

2. **Analytics & Tracking**
   - [ ] Google Analytics 4
   - [ ] Google Search Console
   - [ ] Facebook Pixel (pro případné ads)

3. **GDPR Compliance**
   - [ ] Cookie consent banner
   - [ ] Privacy Policy stránka
   - [ ] Terms of Service

4. **Kontaktní formulář**
   - [ ] `/contact` stránka
   - [ ] Email notifikace pro Jitku
   - [ ] Anti-spam (reCAPTCHA)

5. **Professional touches**
   - [ ] Custom logo (ne jen "LuxEstate" text)
   - [ ] Favicon
   - [ ] OG image (pro social sharing)
   - [ ] 404 error page
   - [ ] Loading states

---

## Timeline - Celkový plán

| Týden | Akce | Odpovědnost |
|-------|------|-------------|
| W1 | Deploy na Vercel + Analytics | Patrik |
| W1 | Přidat "Via Sreality" badge | Patrik |
| W2 | Odeslat email Sreality | Patrik |
| W2 | Kontaktovat Bezrealitky (backup) | Patrik |
| W3 | Follow-up s Sreality | Patrik |
| W4 | Právní dokumenty (pokud souhlas) | Obě strany |
| W5-6 | Implementace leadů + tracking | Patrik |
| W7 | Soft launch (beta testování) | Oba + Jitka |
| W8 | Public launch + marketing | Všichni |

---

## Rizika & Mitigation

| Riziko | Pravděpodobnost | Dopad | Mitigation |
|--------|----------------|-------|------------|
| Sreality odmítne API | 40% | Vysoký | Plán B: Bezrealitky, vlastní DB |
| Nízký traffic | 60% | Střední | PPC kampaně, SEO, social media |
| GDPR problémy | 20% | Vysoký | Konzultace s právníkem, cookie consent |
| Technické výpadky | 30% | Střední | Vercel má 99.9% uptime, monitoring |
| Konkurence | 50% | Nízký | Lokální fokus (JMK), osobní servis Jitky |

---

## Důležité kontakty

### Sreality.cz
- Email: podpora@sreality.cz, marketing@sreality.cz
- Telefon: +420 296 183 111
- Adresa: Seznam.cz, a.s., Radlická 3294/10, 150 00 Praha 5

### Bezrealitky.cz
- Email: info@bezrealitky.cz
- API docs: https://www.bezrealitky.cz/api-dokumentace

### Právník (doporučení)
- Najít specializovaného na IT právo a GDPR
- Budget: 10 000 - 20 000 Kč za review smluv

---

## Motivační závěr

**Máš skvělý nápad a technické skills ho realizovat!**

Klíčové body úspěchu:
1. **Trpělivost** - partnership se nedomluví přes noc
2. **Persistence** - pokud Sreality odmítne, zkus jiné portály
3. **Professionalism** - kvalitní web = seriózní dojem
4. **Lokální výhoda** - Jitka zná trh, to je huge asset
5. **Win-Win mentalita** - ukazuj, jak to pomůže i jim

Hodně štěstí! 🚀
