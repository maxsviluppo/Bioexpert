# BioExpert - Note di Sviluppo Futuro

## 📋 TODO: Database e Sistema di Autenticazione

### Obiettivo
Implementare un database persistente su Vercel per salvare:
- Punteggi e classifiche delle sfide
- Premi e achievement degli utenti
- Cronologia completa degli scatti fotografici
- Statistiche globali e progressi

### Tecnologie Consigliate
1. **Database**: Vercel Postgres o Supabase
2. **Autenticazione**: NextAuth.js o Supabase Auth
3. **Storage Immagini**: Vercel Blob Storage o Supabase Storage

### Funzionalità da Implementare

#### 1. Sistema di Autenticazione
- Login opzionale (solo per chi vuole competere)
- Profilo utente con username
- Accesso anonimo per uso base dell'app

#### 2. Database Schema
```sql
-- Tabella Utenti
users (
  id UUID PRIMARY KEY,
  username VARCHAR(50) UNIQUE,
  email VARCHAR(100),
  created_at TIMESTAMP,
  total_xp INTEGER,
  level INTEGER
)

-- Tabella Punteggi Bellezza
beauty_scores (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  score INTEGER,
  image_url TEXT,
  timestamp TIMESTAMP,
  ai_feedback TEXT
)

-- Tabella Cronologia Scatti
plant_history (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  image_url TEXT,
  plant_name VARCHAR(200),
  scientific_name VARCHAR(200),
  category VARCHAR(50),
  health_status VARCHAR(20),
  diagnosis TEXT,
  care_instructions JSONB,
  timestamp TIMESTAMP
)

-- Tabella Sfide Completate
completed_quests (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  quest_id VARCHAR(50),
  score INTEGER,
  completed_at TIMESTAMP
)
```

#### 3. API Endpoints da Creare
- `POST /api/auth/login` - Login utente
- `POST /api/auth/register` - Registrazione
- `GET /api/leaderboard` - Classifica globale
- `POST /api/beauty-score` - Salva punteggio bellezza
- `GET /api/user/history` - Cronologia utente
- `POST /api/plant-scan` - Salva scansione pianta
- `GET /api/user/stats` - Statistiche utente

#### 4. Modifiche UI Necessarie
- Schermata login/registrazione opzionale
- Badge "Online" per utenti autenticati
- Classifica globale con username reali
- Sincronizzazione dati locale → cloud
- Backup automatico cronologia

#### 5. Privacy e Sicurezza
- GDPR compliance
- Opzione per eliminare account e dati
- Immagini private vs pubbliche (scelta utente)
- Rate limiting per API

### Priorità
1. **Alta**: Database punteggi bellezza + classifica globale
2. **Media**: Cronologia scatti persistente
3. **Bassa**: Sistema achievement avanzato

### Note Tecniche
- Mantenere funzionalità offline/locale per utenti non registrati
- Sincronizzazione bidirezionale localStorage ↔ Database
- Compressione immagini prima dell'upload
- CDN per servire immagini velocemente

---
**Data Creazione**: 2026-01-09
**Stato**: Da Implementare
**Priorità**: Alta per competizione multiplayer
