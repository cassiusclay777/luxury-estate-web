# 🏠 LuxEstate - Ultra-Modern Real Estate Platform

Prémiová realitní platforma s 3D vizualizacemi, chytrým vyhledáváním a reálnými daty z Jihomoravského kraje.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)

## 🚀 Live Demo

**Demo:** [https://luxestate-9qyjq2tyy-cashi777s-projects.vercel.app](https://luxestate-9qyjq2tyy-cashi777s-projects.vercel.app) *(live!)*

## ✨ Features

- 🔍 **Smart Fulltext Search** - PostgreSQL s pg_trgm (typo tolerance)
- 🗺️ **3D Interactive Map** - MapLibre GL s 3D budovami a animovanými pins
- 🎨 **Ultra-Modern UI** - Framer Motion animace, glassmorphism design
- 📊 **Real Data** - 50+ nemovitostí z Brna a okolí
- ⚡ **Blazing Fast** - Next.js 14 App Router, optimalizovaný výkon
- 📱 **Responsive** - Mobile-first design

## 🚀 Quick Start

```bash
# 1. Install
npm install

# 2. Setup Environment
cp .env.example .env.local
# Add your Supabase credentials

# 3. Run SQL Schema
# Open supabase-schema.sql in Supabase SQL Editor

# 4. Seed Data
npm run seed

# 5. Start
npm run dev
```

📖 **[Kompletní setup guide →](./SETUP.md)**

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Maps**: MapLibre GL JS
- **3D**: Three.js + React Three Fiber
- **Icons**: Lucide React

## 📁 Project Structure

```
src/
├── app/                    # Next.js pages
│   ├── page.tsx           # Homepage
│   ├── search/            # Search results
│   └── properties/[id]/   # Property detail
├── components/
│   ├── map/               # 3D map components
│   ├── sections/          # Page sections
│   └── ui/                # Reusable UI
├── lib/
│   ├── supabase.ts        # DB client
│   ├── search.ts          # Search logic
│   └── utils.ts           # Helpers
└── scripts/
    └── seed-properties.ts # Data seeder
```

## 🗺️ Database Schema

Complete schema with indexes and fulltext search is in `supabase-schema.sql`.

Key features:
- **pg_trgm extension** for fuzzy search
- **GIN indexes** for fast fulltext queries
- **Trigram indexes** for typo tolerance
- **RLS policies** for security

## 🔍 Search Capabilities

```typescript
// Example: "byt Brno 2+kk do 7 milionů"
// Finds: apartments in Brno, 2 bedrooms, up to 7M CZK

const results = await searchProperties({
  query: 'Brno 2+kk',
  maxPrice: 7000000
})
```

## 🗺️ Map Features

- 3D terrain and buildings
- Animated property pins
- Price labels on hover
- Smooth flyTo animations
- Clustering for many properties

## 📦 Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Start production
npm run seed         # Import sample data
npm run lint         # Run ESLint
```

## 🌍 Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional for production maps
NEXT_PUBLIC_MAPTILER_KEY=your_maptiler_key
```

## 📸 Screenshots

![Homepage 3D Map](https://i.imgur.com/placeholder-hero.png)  
*Interaktivní 3D mapa s nemovitostmi*

![Search in Action](https://i.imgur.com/placeholder-search.png)  
*Chytré vyhledávání s filtry*

## 🗺️ Roadmap 2026

- **AI Virtual Staging** – Stable Diffusion via HuggingFace (zdarma)
- **Voice Search** – Web Speech API pro hlasové vyhledávání
- **AR Prohlídky** – model-viewer.dev pro AR prohlídky na mobilech
- **Dark Mode Auto‑Switch** – automatické přepínání podle barvy nemovitosti
- **Predictive Analytics** – AI odhady cen a trendů

## 🐛 Debug & Support

**Mapa bez klíče?** Získej free MapTiler key z [jejich dashboardu](https://cloud.maptiler.com/).

**Seed chyby?** Spusť `npm run seed` a pošli error log – opravím v jednom commitu.

**Chceš přidat dark mode auto‑switch?** Kontaktuj mě, hodím snippet do `components/ui/theme-toggle.tsx`.

## 🛠️ Fix CSS Build Error (Next.js 15 + Tailwind CSS v4)

Pokud se objeví chyba:
```
Module parse failed: Unexpected character '@' (1:0)
> @tailwind base;
| @tailwind components;
| @tailwind utilities;
```

Spusť tyto příkazy:

```bash
# 1. Odstraň node_modules a cache
rm -rf node_modules .next package-lock.json

# 2. Vyčisti npm cache
npm cache clean --force

# 3. Nainstaluj závislosti znovu
npm install

# 4. Spusť dev server
npm run dev
```

**Ujisti se, že máš správné konfigurační soubory:**
- `tailwind.config.ts` (viz výše)
- `postcss.config.mjs` (ES module)
- `app/globals.css` (s @tailwind direktivami na začátku)
- `tsconfig.json` (správné paths)

Pokud problém přetrvává, zkontroluj verze Next.js a Tailwind CSS v `package.json`.

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please read [SETUP.md](./SETUP.md) first.

---

Made with ❤️ using Next.js, Supabase & MapLibre GL
# luxury-estate-web
