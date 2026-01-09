# 🗄️ Setup Database Vercel - Guida Passo-Passo

## Step 1: Crea Vercel Postgres Database

1. Vai su https://vercel.com/dashboard
2. Seleziona il progetto **bioexpert**
3. Vai su **Storage** tab
4. Click **Create Database**
5. Seleziona **Postgres**
6. Nome: `bioexpert-db`
7. Region: Scegli la più vicina (es. `fra1` per Europa)
8. Click **Create**

## Step 2: Connetti Database al Progetto

1. Dopo la creazione, vai su **Settings** del database
2. Click **Connect Project**
3. Seleziona il progetto `bioexpert`
4. Conferma

Questo aggiungerà automaticamente le variabili d'ambiente:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

## Step 3: Esegui Schema SQL

1. Nel dashboard del database, vai su **Query** tab
2. Copia e incolla il contenuto di `schema.sql`
3. Click **Run Query**
4. Verifica che tutte le tabelle siano create

Oppure usa CLI:
```bash
vercel env pull .env.local
psql $POSTGRES_URL < schema.sql
```

## Step 4: Setup Vercel Blob Storage

1. Torna su **Storage** tab del progetto
2. Click **Create Database**
3. Seleziona **Blob**
4. Nome: `bioexpert-images`
5. Click **Create**
6. Connetti al progetto `bioexpert`

Questo aggiungerà:
- `BLOB_READ_WRITE_TOKEN`

## Step 5: (Opzionale) Setup Vercel KV per Cache

1. **Storage** tab → **Create Database**
2. Seleziona **KV** (Redis)
3. Nome: `bioexpert-cache`
4. Click **Create**
5. Connetti al progetto

Questo aggiungerà:
- `KV_URL`
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN`

## Step 6: Verifica Variabili d'Ambiente

Nel progetto Vercel, vai su **Settings** → **Environment Variables**

Dovresti vedere:
- ✅ `POSTGRES_URL`
- ✅ `BLOB_READ_WRITE_TOKEN`
- ✅ `GEMINI_API_KEY` (già presente)
- ✅ `KV_URL` (se hai creato KV)

## Step 7: Deploy

```bash
npm run build
npx vercel --prod
```

## Step 8: Testa API

Dopo il deploy, testa gli endpoint:

### Get Leaderboard
```bash
curl https://bioexpert.vercel.app/api/leaderboard
```

### Save Score (esempio)
```bash
curl -X POST https://bioexpert.vercel.app/api/save-beauty-score \
  -H "Content-Type: application/json" \
  -d '{
    "username": "TestUser",
    "score": 95,
    "imageData": "data:image/jpeg;base64,..."
  }'
```

## Troubleshooting

### Errore: "relation does not exist"
→ Esegui di nuovo lo schema SQL nel Query tab

### Errore: "BLOB_READ_WRITE_TOKEN not found"
→ Assicurati di aver creato e connesso Vercel Blob

### Errore: "Cannot connect to database"
→ Verifica che il database sia connesso al progetto

## Note Importanti

- **Free Tier Limits**:
  - Postgres: 256 MB storage, 60 ore compute/mese
  - Blob: 100 GB bandwidth/mese
  - KV: 256 MB storage

- **Costi**: Monitora l'uso nel dashboard Vercel

- **Backup**: Vercel fa backup automatici

---

**Prossimi Passi**: Dopo il setup, integra le API nel frontend React!
