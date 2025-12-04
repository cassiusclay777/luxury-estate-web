# 🚀 LuxEstate Setup Guide

Kompletní průvodce nastavením projektu LuxEstate - ultra-moderní realitní platformy s 3D vizualizacemi.

## 📋 Předpoklady

- Node.js 18+
- npm nebo yarn
- Supabase účet (zdarma na [supabase.com](https://supabase.com))

## ⚡ Quick Start (5 minut)

### 1. Instalace závislostí

```bash
npm install
```

### 2. Nastavení Supabase

#### 2.1 Vytvoření projektu
1. Přejděte na [supabase.com](https://supabase.com)
2. Vytvořte nový projekt
3. Zkopírujte API URL a anon key

#### 2.2 Environment proměnné
Vytvořte soubor `.env.local`:

```bash
cp .env.example .env.local
```

Vyplňte hodnoty:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... # Pro seed script
```

### 3. Databázové schema

Otevřete Supabase SQL Editor a spusťte soubor `supabase-schema.sql`:

```sql
-- Zkopírujte obsah supabase-schema.sql a spusťte v SQL Editoru
```

### 4. Import dat (Seed)

```bash
npm run seed
```

Toto naimportuje 50+ vzorových nemovitostí z Jihomoravského kraje.

### 5. Spuštění dev serveru

```bash
npm run dev
```

Otevřete [http://localhost:3000](http://localhost:3000)

## 🗺️ MapLibre Setup (Volitelné)

Pro produkční mapy doporučujeme MapTiler:

1. Zaregistrujte se na [maptiler.com](https://www.maptiler.com) (free tier)
2. Získejte API klíč
3. Přidejte do `.env.local`:
```env
NEXT_PUBLIC_MAPTILER_KEY=your_maptiler_key
```

## 🔍 Funkce

### Implementované:
- ✅ **Fulltext vyhledávání** - PostgreSQL s pg_trgm extension
- ✅ **3D Mapa** - MapLibre GL s 3D budovami
- ✅ **Smart Search** - Automatické návrhy při psaní
- ✅ **Reálná data** - Import z Brna a okolí
- ✅ **Responsive design** - Mobile-first přístup
- ✅ **Framer Motion** - Pokročilé animace

### Databázové funkce:
- Fulltext search s typo tolerance
- Trigram similarity matching
- Geografické vyhledávání (nearby)
- Indexy pro rychlé dotazy

## 📁 Struktura projektu

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Homepage
│   ├── search/            # Search results
│   └── properties/[id]/   # Property detail
├── components/
│   ├── map/               # MapLibre komponenty
│   │   └── MapView.tsx    # 3D mapa s pins
│   ├── sections/          # Homepage sekce
│   │   ├── Hero.tsx       # Hero s vyhledáváním
│   │   └── FeaturedProperties.tsx  # Property grid
│   └── ui/                # UI komponenty
│       ├── PropertyCard.tsx
│       └── SearchBar.tsx  # Smart search
├── lib/
│   ├── supabase.ts        # Supabase client + types
│   ├── search.ts          # Search functions
│   └── utils.ts           # Utility funkce
└── scripts/
    └── seed-properties.ts # Data import script
```

## 🔧 Užitečné příkazy

```bash
# Development
npm run dev          # Start dev server
npm run build        # Production build
npm run start        # Start production server

# Database
npm run seed         # Import sample data

# Code quality
npm run lint         # ESLint
npm run type-check   # TypeScript check
```

## 🐛 Troubleshooting

### Seed script selže
```bash
# Ujistěte se, že máte nastavený SUPABASE_SERVICE_ROLE_KEY
# Zkontrolujte, že SQL schema bylo správně nainstalováno
```

### Mapy nefungují
```bash
# Zkontrolujte browser console
# MapLibre vyžaduje moderní browser
# Případně nastavte NEXT_PUBLIC_MAPTILER_KEY
```

### Vyhledávání nevrací výsledky
```bash
# Zkontrolujte že pg_trgm extension je aktivní:
# V Supabase SQL Editor: SELECT * FROM pg_extension WHERE extname = 'pg_trgm';
```

## 📚 Další kroky

1. **Vlastní data**: Nahraďte seed data svými nemovitostmi
2. **Autentizace**: Přidejte Supabase Auth
3. **Filtry**: Rozšiřte search o více filtrů
4. **Analytics**: Integrujte tracking
5. **SEO**: Přidejte metadata a sitemap

## 🤝 Podpora

Pro problémy vytvořte issue na GitHubu nebo kontaktujte support.

---

Made with ❤️ using Next.js 14, Supabase, MapLibre GL & Framer Motion
