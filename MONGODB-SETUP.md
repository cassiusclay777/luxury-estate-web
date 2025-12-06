# 🍃 MongoDB Setup Guide

Tento projekt nyní podporuje MongoDB kromě Supabase (PostgreSQL).

## 📋 Předpoklady

- MongoDB server (lokální nebo cloud - MongoDB Atlas)
- Node.js 18+

## ⚡ Quick Start

### 1. Instalace závislostí

Závislosti jsou již nainstalované:
```bash
npm install
```

### 2. Nastavení MongoDB

#### Možnost A: Lokální MongoDB

1. Nainstalujte MongoDB lokálně:
   - **Windows/Mac**: [MongoDB Community Server](https://www.mongodb.com/try/download/community)
   - **Linux**: `sudo apt-get install mongodb` nebo použijte Docker

2. Spusťte MongoDB server:
   ```bash
   # Linux/Mac
   mongod
   
   # Nebo pomocí Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

3. Přidejte do `.env.local`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/reality-estate
   ```

#### Možnost B: MongoDB Atlas (Cloud) - DOPORUČENO

1. Vytvořte účet na [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

2. **Vytvořte nový cluster - DOPORUČENÁ KONFIGURACE:**
   
   **Název clusteru:**
   ```
   luxestate-cluster
   ```
   nebo
   ```
   reality-estate-cluster
   ```
   *(Název nelze později změnit, zvolte něco smysluplného)*

   **Cloud Provider:**
   - ✅ **AWS** (doporučeno) - nejstabilnější, nejlepší podpora
   - Google Cloud - také dobrá volba
   - Azure - OK, ale AWS je lepší pro MongoDB

   **Region:**
   - ✅ **Frankfurt (eu-central-1)** - nejblíže ČR, nízká latence
   - Nebo Amsterdam (eu-west-1) - také dobrá volba

   **Tier (velikost):**
   - 🆓 **M0 FREE TIER** - pro začátek zdarma!
     - Storage: 512 MB (dostatečné pro testování)
     - RAM: Shared
     - vCPU: Shared
     - ⚠️ Poznámka: Na screenshotu vidíte placené tier, ale můžete přepnout na M0 (Free)
   
   - 💰 Placené tier (pokud potřebujete více):
     - M10: 10 GB storage, 2 GB RAM, 2 vCPU (~$57/měsíc)
     - M20: 20 GB storage, 4 GB RAM, 2 vCPU (~$114/měsíc)

   **Auto-scale:**
   - ✅ Nechte zaškrtnuté (Storage Scaling + Cluster Tier Scaling)
   - Automaticky škáluje podle potřeby

   **Tags (volitelné, ale doporučeno):**
   ```
   Key: project
   Value: luxestate
   ```
   nebo
   ```
   Key: environment
   Value: development
   ```

   **Preload sample dataset:**
   - ❌ Odškrtněte (nechcete ukázková data)

3. **Po vytvoření clusteru:**
   - Vytvořte databázového uživatele (Database Access)
   - Přidejte IP adresu do Network Access (0.0.0.0/0 pro testování, nebo vaši IP)
   - Získejte connection string (Connect → Drivers)

4. Přidejte do `.env.local`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@luxestate-cluster.xxxxx.mongodb.net/reality-estate?retryWrites=true&w=majority
   ```

### 3. Test připojení

```bash
npm run test:mongodb
```

Měli byste vidět:
```
✅ MongoDB connection successful!
✅ All tests passed! MongoDB is working correctly.
```

## 📁 Struktura

```
src/lib/mongodb/
├── mongodb.ts              # Connection helper
├── models/
│   └── Property.ts         # Property model/schema
├── properties.ts           # Property CRUD operations
└── index.ts                # Central exports
```

## 🔧 Použití

### Import connection helperu

```typescript
import connectMongoDB from '@/lib/mongodb';
```

### Použití v API routes

```typescript
// app/api/properties/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import { getProperties, createProperty } from '@/lib/mongodb/properties';

export async function GET(request: NextRequest) {
  await connectMongoDB();
  
  const properties = await getProperties();
  return NextResponse.json(properties);
}

export async function POST(request: NextRequest) {
  await connectMongoDB();
  
  const data = await request.json();
  const property = await createProperty(data);
  return NextResponse.json(property);
}
```

### Použití v Server Components

```typescript
// app/properties/page.tsx
import connectMongoDB from '@/lib/mongodb';
import { getProperties } from '@/lib/mongodb/properties';

export default async function PropertiesPage() {
  await connectMongoDB();
  
  const { data: properties } = await getProperties();
  
  return (
    <div>
      {properties.map(property => (
        <div key={property._id}>{property.title}</div>
      ))}
    </div>
  );
}
```

## 🎯 Funkce

### Property Operations

- `getProperties(filters?, page?, pageSize?)` - Získat nemovitosti s filtrováním
- `getProperty(idOrSlug)` - Získat jednu nemovitost
- `createProperty(data)` - Vytvořit novou nemovitost
- `updateProperty(id, data)` - Aktualizovat nemovitost
- `deleteProperty(id)` - Smazat nemovitost
- `searchProperties(query, limit?)` - Fulltext vyhledávání

### Filtry

```typescript
const filters = {
  city: 'Praha',
  type: 'apartment',
  status: 'sale',
  minPrice: 1000000,
  maxPrice: 5000000,
  minBedrooms: 2,
  published: true
};

const result = await getProperties(filters, 1, 12);
```

## 🔄 Souběžné použití s Supabase

Projekt podporuje obě databáze současně:

- **Supabase (PostgreSQL)**: Pro hlavní data a real-time funkce
- **MongoDB**: Pro flexibilní schémata, logování, nebo specifické use cases

Můžete použít obě databáze v různých částech aplikace podle potřeby.

## 🐛 Troubleshooting

### Connection refused
- Zkontrolujte, zda MongoDB server běží
- Ověřte port (defaultně 27017)

### Authentication failed
- Zkontrolujte username a password v connection stringu
- Ujistěte se, že IP adresa je whitelisted v MongoDB Atlas

### Model not found
- Ujistěte se, že jste zavolali `connectMongoDB()` před použitím modelů
- Zkontrolujte, že model je správně importován

## 📚 Dokumentace

- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [MongoDB Node.js Driver](https://www.mongodb.com/docs/drivers/node/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

