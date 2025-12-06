# 🚀 MongoDB Quick Start - Getting Started Example

Praktický příklad použití MongoDB + Mongoose v projektu LuxEstate.

## 📝 Co příklad ukazuje

1. ✅ Definice Schema (Property model)
2. ✅ Přidání custom metod (getFormattedPrice, getDescription)
3. ✅ Vytváření dokumentů
4. ✅ Ukládání do databáze
5. ✅ Query operace (find, filter, count)
6. ✅ Vytváření více dokumentů najednou

## 🔧 Nastavení

### 1. Přidejte MongoDB URI do `.env.local`

```env
MONGODB_URI=mongodb+srv://luxestate-admin:VAŠE_HESLO@luxestate-cluster.xxxxx.mongodb.net/reality-estate?retryWrites=true&w=majority
```

**Důležité:**
- Nahraďte `VAŠE_HESLO` vaším skutečným heslem
- Nahraďte `xxxxx` vaším cluster ID z MongoDB Atlas
- Heslo **NIKDY** neukládejte do kódu! Pouze do `.env.local`

### 2. Spusťte příklad

```bash
npm run mongodb:demo
```

## 📖 Co příklad dělá

### Krok 1: Připojení
```typescript
await mongoose.connect(MONGODB_URI);
```

### Krok 2: Vytvoření dokumentu
```typescript
const property = new Property({
  title: 'Luxusní byt v centru Prahy',
  price: 8500000,
  city: 'Praha 1',
  // ...
});
```

### Krok 3: Použití custom metod
```typescript
property.getFormattedPrice(); // "8 500 000 Kč"
property.getDescription();    // "Luxusní byt v centru Prahy v Praha 1 (3 pokojů, 2 koupelen, 120 m²)"
```

### Krok 4: Uložení
```typescript
await property.save();
```

### Krok 5: Query
```typescript
// Všechny nemovitosti
const all = await Property.find();

// Filtrování
const praha = await Property.find({ city: /^Praha/ });
const apartments = await Property.find({ type: 'apartment' });
const affordable = await Property.find({ price: { $lt: 10000000 } });
```

## 🎯 Výstup příkladu

```
🔄 Connecting to MongoDB...
✅ Connected to MongoDB!

📝 Creating property document...
Property title: Luxusní byt v centru Prahy
Formatted price: 8 500 000 Kč
Description: Luxusní byt v centru Prahy v Praha 1 (3 pokojů, 2 koupelen, 120 m²)

💾 Saving to database...
✅ Property saved!

🔍 Finding all properties...
Found 1 properties:
  1. Luxusní byt v centru Prahy v Praha 1 (3 pokojů, 2 koupelen, 120 m²) - 8 500 000 Kč

...
```

## 🔐 Bezpečnost

⚠️ **DŮLEŽITÉ:** Heslo je v `.env.local`, které je v `.gitignore` a **NENÍ** v repository!

- ✅ Heslo je v `.env.local` (lokální soubor)
- ✅ `.env.local` je v `.gitignore`
- ❌ Heslo **NENÍ** v kódu
- ❌ Heslo **NENÍ** v repository

## 📚 Další kroky

Po spuštění příkladu můžete:

1. **Upravit schema** v `scripts/getting-started-mongodb.ts`
2. **Přidat více metod** do propertySchema.methods
3. **Vytvořit další modely** (User, Booking, atd.)
4. **Použít v API routes** - viz `/src/app/api/mongodb/properties/route.ts`

## 🆘 Troubleshooting

**"Missing MONGODB_URI"**
- Zkontrolujte, že máte `.env.local` s `MONGODB_URI`

**"Authentication failed"**
- Zkontrolujte heslo v connection stringu
- Ověřte, že uživatel má správná oprávnění v MongoDB Atlas

**"Connection refused"**
- Zkontrolujte Network Access v MongoDB Atlas
- Přidejte vaši IP adresu (nebo `0.0.0.0/0` pro testování)



