# 🗄️ Setup Supabase - Guida Rapida

## ⚠️ IMPORTANTE: Database Condiviso
Questo progetto usa un database Supabase condiviso con altre app.
Tutte le tabelle hanno prefisso **`bioexpert_`** per evitare conflitti.

---

## Step 1: Esegui Schema SQL

1. Vai su https://supabase.com/dashboard
2. Seleziona il progetto **"progetto 3"**
3. Vai su **SQL Editor** (icona </> nella sidebar)
4. Click **"New Query"**
5. Copia e incolla il contenuto di `schema_supabase.sql`
6. Click **"Run"** (o Ctrl+Enter)
7. Verifica che vedi: ✅ Success. No rows returned

---

## Step 2: Crea Storage Bucket per Foto

1. Vai su **Storage** nella sidebar
2. Click **"Create a new bucket"**
3. Nome: `bioexpert-beauty-photos`
4. **Public bucket**: ✅ SI (le foto devono essere pubbliche)
5. Click **"Create bucket"**

### Configura Policy Storage:
1. Click sul bucket `bioexpert-beauty-photos`
2. Vai su **Policies** tab
3. Click **"New Policy"**
4. Template: **"Allow public access"**
5. Policy name: `Public Access`
6. Operations: ✅ SELECT, ✅ INSERT
7. Click **"Review"** → **"Save policy"**

---

## Step 3: Ottieni Credenziali

1. Vai su **Settings** → **API**
2. Copia:
   - **Project URL**: `https://xxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (chiave lunga)

---

## Step 4: Aggiungi Variabili d'Ambiente

### Opzione A: File .env.local (per sviluppo locale)
Crea file `.env.local` nella root:
```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### Opzione B: Vercel (per production)
1. Vai su https://vercel.com/dashboard
2. Seleziona progetto **bioexpert**
3. **Settings** → **Environment Variables**
4. Aggiungi:
   - Name: `VITE_SUPABASE_URL`
   - Value: `https://xxx.supabase.co`
   - Environments: ✅ Production, ✅ Preview, ✅ Development
5. Aggiungi:
   - Name: `VITE_SUPABASE_ANON_KEY`
   - Value: `eyJhbGc...`
   - Environments: ✅ Production, ✅ Preview, ✅ Development

---

## Step 5: Verifica Setup

### Test SQL:
Nel SQL Editor di Supabase, esegui:
```sql
-- Verifica tabelle create
SELECT table_name 
FROM information_schema.tables 
WHERE table_name LIKE 'bioexpert_%';

-- Dovrebbe mostrare:
-- bioexpert_users
-- bioexpert_beauty_scores
-- bioexpert_plant_scans
-- bioexpert_completed_quests
```

### Test Storage:
1. Vai su **Storage** → `bioexpert-beauty-photos`
2. Prova a caricare un'immagine di test
3. Verifica che sia visibile pubblicamente

---

## Step 6: Test Locale

```bash
# Crea .env.local con le credenziali
npm run dev
```

Apri l'app e prova la sfida "Concorso di Bellezza"!

---

## 🔒 Sicurezza

### Row Level Security (RLS) Abilitato:
- ✅ Tutti possono leggere la classifica
- ✅ Tutti possono inserire punteggi (per ora)
- 🔜 Dopo aggiungeremo autenticazione utenti

### Storage:
- ✅ Bucket pubblico (necessario per mostrare foto)
- ✅ Policy: solo INSERT e SELECT
- ❌ No DELETE/UPDATE (sicurezza)

---

## 📊 Monitoraggio

### Dashboard Supabase:
- **Database** → Vedi tabelle e dati
- **Storage** → Vedi foto caricate
- **Logs** → Monitora errori
- **Reports** → Uso storage e bandwidth

### Limiti Free Tier:
- 500 MB database
- 1 GB storage
- 2 GB bandwidth/mese
- 50 MB file upload max

---

## 🚨 Troubleshooting

### Errore: "relation does not exist"
→ Esegui di nuovo `schema_supabase.sql`

### Errore: "bucket not found"
→ Crea bucket `bioexpert-beauty-photos` in Storage

### Errore: "Invalid API key"
→ Verifica VITE_SUPABASE_ANON_KEY in .env.local

### Foto non si caricano
→ Verifica policy storage (deve essere pubblica)

---

## ✅ Checklist Finale

- [ ] Schema SQL eseguito
- [ ] Bucket storage creato
- [ ] Policy storage configurata
- [ ] Variabili d'ambiente aggiunte (.env.local)
- [ ] Variabili d'ambiente aggiunte (Vercel)
- [ ] Test locale funzionante

---

**Prossimo Step**: Integra Supabase nel frontend React! 🚀
