# 🎨 Pollinations.ai - 100% ZDARMA AI Virtual Staging (Žádný API klíč!)

## Proč Hugging Face místo Replicate?

✅ **100% ZDARMA** - Inference API je zdarma pro public modely
✅ **Bez kreditní karty** - Nepotřebujete platební údaje
✅ **Kvalitní modely** - Stable Diffusion XL, FLUX, a další
✅ **Jednoduchá integrace** - Pouze API token
✅ **Open Source** - Všechny modely jsou open source

❌ **Replicate** - Vyžaduje zakoupení kreditů (~$0.006/obrázek)

---

## 🚀 Jak získat Hugging Face API token (5 minut)

### 1. Vytvořte účet

1. Jděte na **https://huggingface.co/join**
2. Zaregistrujte se (email + heslo)
3. Ověřte email

### 2. Vytvořte API token

1. Jděte do **Settings** (pravý horní roh, vaše profilová fotka)
2. Klikněte na **Access Tokens** v levém menu
3. Klikněte **New token**
4. Vyplňte:
   - **Name**: `AI Virtual Staging`
   - **Type**: `Read` (stačí read access)
5. Klikněte **Generate**
6. **Zkopírujte token** (začíná `hf_...`)

### 3. Přidejte token do projektu

Otevřete `.env.local` a přidejte:

```bash
HUGGINGFACE_API_TOKEN=hf_your_actual_token_here
```

### 4. Hotovo!

Restartujte dev server:

```bash
npm run dev
```

Otevřete:
```
http://localhost:3000/ai-staging
```

---

## 📊 Porovnání řešení

| Feature | Hugging Face | Replicate | Vlastní server |
|---------|-------------|-----------|----------------|
| **Cena** | ✅ ZDARMA | ❌ $0.006/img | ❌ GPU server $$$ |
| **Setup** | ✅ 5 minut | ✅ 5 minut | ❌ Hodiny |
| **Kvalita** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Rychlost** | ⭐⭐⭐ (20-40s) | ⭐⭐⭐⭐ (10-30s) | ⭐⭐⭐⭐⭐ (5-15s) |
| **Limity** | 1000 requests/měsíc zdarma | Pay-as-you-go | Žádné |
| **Platební karta** | ❌ NE | ✅ ANO | ✅ ANO |

---

## 🎨 Použité modely

Projekt používá:

1. **Stable Diffusion XL Base 1.0**
   - Model: `stabilityai/stable-diffusion-xl-base-1.0`
   - Použití: Text-to-image generování
   - Kvalita: Velmi dobrá

2. **Alternativy** (můžete vyzkoušet):
   - `runwayml/stable-diffusion-v1-5` - Rychlejší, menší kvalita
   - `prompthero/openjourney` - Umělecký styl
   - `stabilityai/stable-diffusion-2-1` - Střední kvalita/rychlost

---

## ⚠️ Limity Hugging Face Free tier

- **Rate limit**: Cca 1000 requestů/měsíc zdarma
- **Inference time**: První request může trvat 20-40s (cold start)
- **Následující requesty**: 10-20s
- **Velikost obrázku**: Max 1024x1024px

Pro více requestů:
- **PRO účet**: $9/měsíc = neomezené requesty + rychlejší inference
- **Vlastní endpoint**: Nasaďte vlastní model (pokročilé)

---

## 🔧 Troubleshooting

### "Model is loading" error
- První request trvá déle (model se načítá)
- Počkejte 30-60 sekund a zkuste znovu

### "Rate limit exceeded"
- Dosáhli jste free limitu (1000 req/měsíc)
- Počkejte do dalšího měsíce nebo upgradjte na PRO

### "Unauthorized"
- Zkontrolujte, že je token správně v `.env.local`
- Token musí začínat `hf_`

---

## 🚀 Upgrade možnosti

### 1. Hugging Face PRO ($9/měsíc)
- Neomezené requesty
- Rychlejší inference
- Priority access
- Více modelů

### 2. Vlastní Inference Endpoint ($0.60/hod)
- Dedikovaný GPU
- Nejrychlejší (5-10s)
- Škálovatelné
- Pro produkci s velkým provozem

### 3. Vlastní server
- Koupíte GPU server
- RunPod, Vast.ai (~$0.20-0.50/hod)
- Plná kontrola
- Pro >10000 req/měsíc

---

## ✅ Doporučení

**Pro vývoj a testování**: Hugging Face Free (tohle máte teď)

**Pro malý web** (<100 req/měsíc): Hugging Face Free

**Pro střední web** (100-1000 req/měsíc): Hugging Face PRO ($9/měsíc)

**Pro velký web** (>1000 req/měsíc): Vlastní Inference Endpoint nebo server

---

**Nyní máte 100% ZDARMA AI Virtual Staging! 🎉**
