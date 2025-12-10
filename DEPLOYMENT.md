# Deployment na Vercel - Krok za krokem

## Příprava před deploymentem

### 1. Vytvoř Vercel účet
- Jdi na https://vercel.com
- Přihlaš se přes GitHub
- Propoj své GitHub repo

### 2. Přidej do .gitignore (už by mělo být)
```
.env.local
node_modules/
.next/
```

### 3. Nastav environment variables

V Vercel dashboardu → Settings → Environment Variables přidej:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=tvoje_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tvoje_anon_key
SUPABASE_SERVICE_ROLE_KEY=tvoje_service_role_key

# MongoDB (pokud používáš)
MONGODB_URI=tvoje_mongodb_uri

# AI služby (pokud používáš)
GROQ_API_KEY=tvůj_groq_key
OPENAI_API_KEY=tvůj_openai_key
```

### 4. Commit a push

```bash
git add .
git commit -m "feat: Production ready - Sreality integration with images"
git push origin main
```

### 5. Deploy na Vercel

**Automaticky:**
- Vercel automaticky detekuje push
- Sestaví a deployuje web
- Dostaneš URL: https://tvuj-projekt.vercel.app

**Manuálně:**
```bash
npm install -g vercel
vercel login
vercel --prod
```

## Po deploymentu

1. **Otestuj funkčnost:**
   - Otevři https://tvuj-projekt.vercel.app
   - Zkontroluj, že se nemovitosti načítají
   - Ověř, že obrázky fungují

2. **Nastav vlastní doménu (volitelné):**
   - Settings → Domains
   - Přidej např. luxestate.cz

3. **Zkopíruj URL pro email Sreality**

## Troubleshooting

### Build failuje
- Zkontroluj TypeScript errors: `npm run build`
- Zkontroluj environment variables

### Obrázky se nenačítají
- Ověř `next.config.js` - remote patterns
- Zkontroluj CORS

### Database connection issues
- Ověř Supabase credentials
- Zkontroluj IP allowlist v Supabase
