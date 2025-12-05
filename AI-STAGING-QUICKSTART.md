# 🚀 AI Virtual Staging - Quick Start

## Rychlý start za 5 minut

### 1️⃣ Získejte Replicate API klíč

```bash
# 1. Jděte na https://replicate.com
# 2. Zaregistrujte se (email + heslo)
# 3. Jděte do Account > API Tokens
# 4. Klikněte "Create token"
# 5. Zkopírujte token (začíná "r8_...")
```

### 2️⃣ Nastavte environment variables

```bash
# Zkopírujte .env.example
cp .env.example .env.local

# Otevřete .env.local a přidejte:
REPLICATE_API_TOKEN=r8_your_token_here
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3️⃣ Vytvořte upload složku

```bash
# Windows:
mkdir public\uploads

# macOS/Linux:
mkdir -p public/uploads
```

### 4️⃣ Spusťte dev server

```bash
npm run dev
```

### 5️⃣ Otevřete aplikaci

```
http://localhost:3000/ai-staging
```

---

## ✅ Checklist před prvním použitím

- [ ] Replicate účet vytvořen
- [ ] API token zkopírován do `.env.local`
- [ ] `REPLICATE_API_TOKEN` nastaveno
- [ ] `NEXT_PUBLIC_BASE_URL` nastaveno
- [ ] Složka `public/uploads` existuje
- [ ] Dev server běží (`npm run dev`)
- [ ] Stránka `/ai-staging` se načítá

---

## 🧪 Test funkčnosti

1. **Nahrajte testovací fotku**
   - Použijte fotku prázdného pokoje
   - Formát: JPG, PNG, nebo WEBP
   - Max velikost: 10MB

2. **Vyberte styl**
   - Např. "Modern" nebo "Scandinavian"

3. **Klikněte "Vygenerovat"**
   - Počkejte 30-60 sekund
   - AI vygeneruje návrh vybavení

4. **Stáhněte výsledek**
   - Klikněte na tlačítko "Stáhnout výsledek"

---

## 💰 Pricing info

**Replicate - Free tier:**
- První požadavky ZDARMA (cca 10-20)
- Potom ~$0.006 per image
- Pay-as-you-go (bez měsíčního poplatku)

**Příklad:**
- 100 requests = ~$0.60
- 1000 requests = ~$6.00

---

## 🐛 Rychlé řešení problémů

### "AI služba není nakonfigurována"
```bash
# Zkontrolujte .env.local:
cat .env.local | grep REPLICATE

# Mělo by vrátit:
# REPLICATE_API_TOKEN=r8_...
```

### Nahrání fotky nefunguje
```bash
# Zkontrolujte, že složka existuje:
ls public/uploads

# Pokud ne, vytvořte:
mkdir public/uploads
```

### "Failed to generate"
```bash
# 1. Zkontrolujte Replicate kredit na https://replicate.com/account
# 2. Zkuste menší obrázek (< 5MB)
# 3. Zkontrolujte konzoli prohlížeče (F12) pro detaily
```

---

## 📚 Další kroky

Po úspěšném testu:

1. Přečtěte plnou dokumentaci: [AI-STAGING-README.md](./AI-STAGING-README.md)
2. Integrujte do detailu nemovitosti
3. Nastavte rate limiting pro produkci
4. Přidejte autentifikaci uživatelů

---

**Hotovo! Můžete začít používat AI Virtual Staging. 🎉**
