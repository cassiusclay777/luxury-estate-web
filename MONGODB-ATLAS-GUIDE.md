# 🍃 MongoDB Atlas - Kompletní průvodce nastavením

## 📋 Odpovědi na vaše otázky

### 1. Jak pojmenovat cluster?

**Doporučené názvy:**
- `luxestate-cluster` ✅ (nejlepší volba)
- `reality-estate-cluster`
- `luxestate-prod` (pro produkci)
- `luxestate-dev` (pro vývoj)

⚠️ **DŮLEŽITÉ:** Název nelze později změnit! Zvolte něco smysluplného.

### 2. AWS, Google Cloud nebo Azure?

**Doporučení: AWS** ✅

**Proč AWS:**
- ✅ Nejstabilnější pro MongoDB Atlas
- ✅ Nejlepší podpora a dokumentace
- ✅ Nejvíce regionů v Evropě
- ✅ Nejlepší výkon pro evropské uživatele

**Alternativy:**
- **Google Cloud** - také dobrá volba, podobný výkon
- **Azure** - OK, ale AWS je obecně lepší pro MongoDB

**Závěr:** Zvolte **AWS** (jak máte na screenshotu) ✅

### 3. Co doplnit do konfigurace?

**Povinné:**
- ✅ Name: `luxestate-cluster`
- ✅ Provider: **AWS** (nechte jak je)
- ✅ Region: **Frankfurt (eu-central-1)** (nechte jak je - nejblíže ČR)
- ✅ Tier: **M0 FREE** (přepněte na free tier!)

**Doporučené:**
- ✅ **Tags:**
  ```
  Key: project
  Value: luxestate
  ```
  nebo
  ```
  Key: environment  
  Value: development
  ```

- ✅ **Auto-scale:** Nechte zaškrtnuté (Storage Scaling + Cluster Tier Scaling)
  - Automaticky škáluje podle potřeby
  - Ušetří peníze při nízkém zatížení

**Nedoporučené:**
- ❌ **Preload sample dataset** - odškrtněte (nechcete ukázková data)
  
  **Co to je?** Tato možnost naimportuje do vaší databáze ukázková data (sample datasets):
  - AirBnB nabídky
  - Geolokační data
  - Filmová data (sample_mflix)
  - A další testovací datasety
  
  **Proč to odškrtnout?** 
  - Máte vlastní data (nemovitosti)
  - Zbytečně zabere místo (i když je to málo)
  - Můžete to přidat později, pokud budete chtít testovat

### 4. Jde to nasadit zdarma?

**ANO!** ✅ MongoDB Atlas má **FREE TIER M0**

⚠️ **DŮLEŽITÉ:** Free tier **NENÍ "Flex"**!

**Rozdíl mezi tierami:**

1. **M0 FREE TIER** (zdarma) ✅
   - ✅ 512 MB storage
   - ✅ Shared RAM a vCPU
   - ✅ Neomezené připojení
   - ✅ Základní monitoring
   - ✅ Automatické zálohy (7 dní)
   - 💰 **$0/měsíc** - zdarma navždy
   - ⚠️ Shared resources (pomalejší při vysokém zatížení)

2. **FLEX TIER** (placený) 💰
   - 5 GB storage
   - Dynamické škálování
   - Až 500 operací za sekundu
   - 💰 **$8-30/měsíc** (cena se mění podle použití)
   - ⚠️ **NENÍ zdarma!**

3. **DEDICATED TIERS** (M10, M20, M30...) (placený) 💰
   - Dedicated resources
   - Fixní cena
   - M10: ~$57/měsíc (10 GB, 2 GB RAM, 2 vCPU)
   - M20: ~$114/měsíc (20 GB, 4 GB RAM, 2 vCPU)

**Pro váš projekt:**
- ✅ Zvolte **M0 FREE TIER** (zdarma)
- ❌ **NE** Flex tier (to je placený $8-30/měsíc)

**Limity free tieru (M0):**
- ⚠️ 512 MB storage (pro produkci možná málo)
- ⚠️ Shared resources (pomalejší při vysokém zatížení)
- ⚠️ Žádná podpora (pouze komunita)

**Kdy upgradovat na placený tier:**
- Když potřebujete více než 512 MB storage
- Když máte vysoké zatížení
- Když potřebujete dedicated resources

## 🎯 Konečná doporučená konfigurace

```
Name: luxestate-cluster
Provider: AWS ✅
Region: Frankfurt (eu-central-1) ✅
Tier: M0 FREE (přepněte na free tier!)
  ⚠️ POZOR: NENÍ to "Flex" (Flex je placený $8-30/měsíc)
  ✅ M0 = zdarma, Shared resources
Storage: 512 MB (automaticky)
RAM: Shared (automaticky)
vCPU: Shared (automaticky)

Tags:
  project: luxestate
  environment: development

Auto-scale: ✅ Zapnuto (Storage + Tier)
Preload sample dataset: ❌ Vypnuto
  (Ukázková data - AirBnB, filmy, geolokace - nepotřebujete)
```

## 📝 Postup krok za krokem

### Krok 1: Přepněte na FREE TIER
Na screenshotu vidíte placený tier (10 GB, 2 GB RAM). 
**Přepněte na M0 FREE** - je to úplně vlevo nebo nahoře v seznamu tierů.

### Krok 2: Vyplňte konfiguraci
- Name: `luxestate-cluster`
- Provider: AWS (nechte)
- Region: Frankfurt (nechte)
- Tags: přidejte `project: luxestate`

### Krok 3: Vytvořte cluster
Klikněte na **"Create Deploy"** (zelené tlačítko vpravo dole)

### Krok 4: Po vytvoření clusteru

1. **Database Access** (v levém menu):
   - Klikněte "Add New Database User"
   - Username: `luxestate-admin` (nebo jak chcete)
   - Password: Vygenerujte silné heslo (uložte si ho!)
   - Database User Privileges: "Atlas admin" (pro začátek)

2. **Network Access** (v levém menu):
   - Klikněte "Add IP Address"
   - Pro testování: `0.0.0.0/0` (povolí všechny IP - jen pro vývoj!)
   - Pro produkci: Přidejte konkrétní IP adresy

3. **Connect** (v levém menu):
   - Klikněte "Connect"
   - Vyberte "Connect your application"
   - Zkopírujte connection string
   - Vypadá takto:
     ```
     mongodb+srv://luxestate-admin:<password>@luxestate-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```

### Krok 5: Přidejte do projektu

Vytvořte/upravte `.env.local`:
```env
MONGODB_URI=mongodb+srv://luxestate-admin:VAŠE_HESLO@luxestate-cluster.xxxxx.mongodb.net/reality-estate?retryWrites=true&w=majority
```

**Důležité:** 
- Nahraďte `<password>` vaším skutečným heslem
- Nahraďte `xxxxx` vaším skutečným cluster ID
- Přidejte název databáze: `/reality-estate` (před `?`)

### Krok 6: Otestujte připojení

```bash
npm run test:mongodb
```

Měli byste vidět:
```
✅ MongoDB connection successful!
✅ All tests passed! MongoDB is working correctly.
```

## 🔒 Bezpečnostní tipy

1. **Nikdy nesdílejte connection string** s heslem v kódu
2. **Pro produkci:** Použijte konkrétní IP adresy v Network Access
3. **Pravidelně rotujte hesla** databázových uživatelů
4. **Použijte read-only uživatele** pro frontend aplikace

## 💰 Odhad nákladů

**FREE TIER (M0):** ✅ ZVOLTE TOTO!
- 💰 **$0/měsíc** - zdarma navždy
- 512 MB storage, Shared resources
- Dostatečné pro vývoj a malé projekty
- ⚠️ **NENÍ to "Flex"** - Flex je placený!

**FLEX TIER:** 💰 Placený!
- 💰 **$8-30/měsíc** (~200-750 Kč)
- 5 GB storage, dynamické škálování
- ⚠️ **NENÍ zdarma!** Nezaměňujte s M0

**DEDICATED TIER (M10):**
- 💰 **~$57/měsíc** (~1,400 Kč)
- Pro střední projekty
- 10 GB storage, dedicated resources

**DEDICATED TIER (M20):**
- 💰 **~$114/měsíc** (~2,800 Kč)
- Pro větší projekty
- 20 GB storage, více RAM

## 🆘 Troubleshooting

**"Connection refused"**
- Zkontrolujte Network Access - přidejte vaši IP adresu
- Zkontrolujte, zda cluster běží (status v Atlas dashboardu)

**"Authentication failed"**
- Zkontrolujte username a password v connection stringu
- Ověřte, že uživatel má správná oprávnění

**"Cluster not found"**
- Zkontrolujte název clusteru v connection stringu
- Ověřte, že cluster je vytvořený a běží

## 📚 Užitečné odkazy

- [MongoDB Atlas Documentation](https://www.mongodb.com/docs/atlas/)
- [Free Tier Limits](https://www.mongodb.com/docs/atlas/reference/free-shared-limits/)
- [Connection String Guide](https://www.mongodb.com/docs/atlas/tutorial/connect-to-your-cluster/)

