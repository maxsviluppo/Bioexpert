# 🚀 Deploy con Supabase - Checklist Finale

## ✅ Fatto Localmente:
- [x] Schema SQL eseguito su Supabase
- [x] Bucket storage creato (`bioexpert-beauty-photos`)
- [x] File `.env.local` creato
- [x] Supabase integrato nel codice
- [x] Build locale funzionante

---

## 🌐 Da Fare su Vercel (IMPORTANTE!)

### Step 1: Aggiungi Variabili d'Ambiente

1. Vai su: https://vercel.com/castromassimo-4092s-projects/bioexpert
2. Click su **Settings** (in alto)
3. Sidebar sinistra → **Environment Variables**
4. Aggiungi queste 2 variabili:

#### Variabile 1:
- **Name**: `VITE_SUPABASE_URL`
- **Value**: `https://zhgpccmzgyertwnyvyiaz.supabase.co`
- **Environments**: ✅ Production, ✅ Preview, ✅ Development
- Click **Save**

#### Variabile 2:
- **Name**: `VITE_SUPABASE_ANON_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoZ3BjY216Z3llcnR3bnZ5aWF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5OTU4NDQsImV4cCI6MjA3OTU3MTg0NH0.A0WxSn-8JKpd4tXTxSxLQIoq3M-654vGpw_guAHpQQc`
- **Environments**: ✅ Production, ✅ Preview, ✅ Development
- Click **Save**

---

## 🚀 Step 2: Deploy

Dopo aver aggiunto le variabili, fai il deploy:

```bash
npm run build
npx vercel --prod
```

Oppure:
- Vercel farà auto-deploy dal prossimo push su GitHub

---

## 🧪 Step 3: Test Production

Dopo il deploy, testa:

1. Vai su https://bioexpert.vercel.app
2. Apri "Sfide Botaniche"
3. Gioca "Concorso di Bellezza"
4. Scatta una foto
5. Ricevi punteggio
6. **Verifica che la foto sia salvata su Supabase!**

### Come Verificare:
1. Dashboard Supabase → **Storage** → `bioexpert-beauty-photos`
2. Dovresti vedere la foto caricata
3. Dashboard Supabase → **Table Editor** → `bioexpert_beauty_scores`
4. Dovresti vedere il punteggio salvato

---

## 🔍 Troubleshooting

### Errore: "Supabase credentials not found"
→ Verifica che le env vars siano state aggiunte su Vercel
→ Fai re-deploy dopo aver aggiunto le vars

### Foto non si carica
→ Verifica policy storage su Supabase (deve essere pubblica)

### Classifica vuota
→ Normale se è la prima volta! Gioca e vedrai i punteggi

---

## 📊 Monitoring

### Dashboard Supabase:
- **Storage** → Vedi foto caricate
- **Table Editor** → `bioexpert_beauty_scores` → Vedi classifica
- **Logs** → Monitora errori

### Console Browser:
- Apri DevTools (F12)
- Console → Cerca:
  - ✅ "Punteggio salvato su Supabase!"
  - ⚠️ "Fallback a localStorage" (se Supabase non configurato)

---

## 🎉 Successo!

Se vedi:
- ✅ Foto in Supabase Storage
- ✅ Punteggio in tabella `bioexpert_beauty_scores`
- ✅ Classifica globale funzionante

**Hai completato l'integrazione database! 🚀**

---

**Prossimi Step:**
- Aggiungere autenticazione utenti
- Implementare altre sfide multiplayer
- Sezione "Il Mio Giardino"
