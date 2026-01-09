# 🌱 BioExpert - Roadmap Sviluppo Futuro

**Data Creazione**: 2026-01-09  
**Priorità**: Alta  
**Obiettivo**: Trasformare BioExpert in una piattaforma educativa completa e coinvolgente

---

## 🎯 FASE 1: Sistema Database e Classifica Globale (PRIORITÀ MASSIMA)

### 1.1 Database Vercel/Supabase
- [ ] Implementare Vercel Postgres o Supabase
- [ ] Schema database per utenti, punteggi, cronologia
- [ ] API endpoints per sincronizzazione dati
- [ ] Sistema di autenticazione opzionale (login/registrazione)

### 1.2 Classifica Globale Bellezza Botanica
- [ ] **Classifica sincronizzata** per "Concorso di Bellezza"
- [ ] Visualizzazione **Top 100 utenti** globali
- [ ] Username reali degli sfidanti
- [ ] Filtri: giornaliero, settimanale, mensile, all-time
- [ ] Sistema di **badge e medaglie** (🥇🥈🥉)
- [ ] Notifiche quando qualcuno supera il tuo punteggio
- [ ] Possibilità di **rivedere le foto vincitrici**

### 1.3 Sistema Premi e Ricompense
- [ ] Premi settimanali per primi classificati
- [ ] Badge speciali per achievement
- [ ] Sistema di **livelli globali** (non solo XP locale)
- [ ] Sblocco contenuti esclusivi per top player

---

## 🎮 FASE 2: Espansione Sfide (10 Fotografiche + Quiz Multi-Livello + Multiplayer)

### 2.1 Completare 10 Sfide Fotografiche
**Attualmente: 9 sfide**  
**Obiettivo: 10 sfide fotografiche**

Nuova sfida da aggiungere:
- [ ] **"Cacciatore di Stagioni"** - Fotografa la stessa pianta in 4 stagioni diverse
- [ ] **"Micro Mondo"** - Fotografa dettagli microscopici (polline, venature, ecc.)
- [ ] **"Giardino Urbano"** - Trova piante in contesti urbani insoliti

### 2.2 Quiz Botanico Multi-Livello
**Attualmente: 1 livello**  
**Obiettivo: 5+ livelli progressivi**

- [ ] **Maestro Botanico 1° Livello** ✅ (già implementato)
- [ ] **Maestro Botanico 2° Livello** - Domande intermedie (15 domande, 60% richiesto)
- [ ] **Maestro Botanico 3° Livello** - Domande avanzate (20 domande, 70% richiesto)
- [ ] **Maestro Botanico 4° Livello** - Domande esperto (25 domande, 75% richiesto)
- [ ] **Maestro Botanico 5° Livello - MASTER** - Domande difficilissime (30 domande, 80% richiesto)

**Caratteristiche Quiz Avanzati:**
- [ ] Domande con timer (30 secondi per risposta)
- [ ] Modalità "Vita" (3 errori = game over)
- [ ] Domande con immagini da riconoscere
- [ ] Domande a risposta multipla complessa

### 2.3 Nuove Sfide Multiplayer
**Attualmente: 1 sfida multiplayer (Bellezza Botanica)**  
**Obiettivo: 5+ sfide competitive**

#### Idee Sfide Multiplayer:
1. **"Velocità Botanica"** ⚡
   - Chi identifica più piante in 60 secondi
   - Classifica in tempo reale
   - Punteggio basato su velocità + accuratezza

2. **"Battaglia di Conoscenza"** 🎓
   - Quiz 1vs1 in tempo reale
   - Matchmaking automatico
   - Sistema ELO per ranking

3. **"Caccia al Tesoro Botanico"** 🗺️
   - Lista di piante da trovare e fotografare
   - Prima persona che completa la lista vince
   - Sfide settimanali tematiche

4. **"Giardino Più Vario"** 🌈
   - Chi fotografa più specie diverse in una settimana
   - Bonus per rarità
   - Classifica settimanale

5. **"Fotografo dell'Anno"** 📸
   - Concorso mensile di fotografia botanica
   - Votazione community
   - Premi speciali

---

## 🌿 FASE 2.5: Il Mio Giardino - Sistema di Cura e Monitoraggio Piante (PRIORITÀ ALTA!)

### 2.5.1 Gestione Collezione Personale
**Funzionalità Core:**

- [ ] **"Le Mie Piante"** - Sezione dedicata nel menu principale
- [ ] **Aggiungi pianta** tramite:
  - Scansione con fotocamera (riconoscimento automatico)
  - Ricerca manuale nel database
  - Import da analisi precedenti
- [ ] **Scheda pianta dettagliata** con:
  - Nome comune e scientifico
  - Foto principale + galleria
  - Data di acquisizione
  - Posizione (interno/esterno, stanza, balcone, giardino)
  - Note personali
  - Stato di salute attuale

### 2.5.2 Diario Fotografico e Crescita
**Monitoraggio Visivo:**

- [ ] **Timeline fotografica** della pianta
- [ ] **Confronto foto** (prima/dopo) con slider
- [ ] **Time-lapse automatico** della crescita
- [ ] **Annotazioni su foto** (nuove foglie, fiori, problemi)
- [ ] **Statistiche crescita**:
  - Altezza stimata (con riferimento nella foto)
  - Numero foglie/fiori
  - Salute generale (grafico trend)
- [ ] **Reminder foto periodiche** (settimanale/mensile)

### 2.5.3 Calendario Cure e Promemoria
**Sistema Notifiche Intelligente:**

#### Cure Automatiche:
- [ ] **Annaffiatura** 💧
  - Frequenza personalizzata per specie
  - Adattamento stagionale automatico
  - Notifiche push/email
  - Segna come "fatto" con un tap
  - Storico annaffiature

- [ ] **Fertilizzazione** 🌱
  - Calendario concimazione
  - Tipo di fertilizzante consigliato
  - Dosaggio suggerito dall'AI
  - Reminder stagionali

- [ ] **Potatura** ✂️
  - Periodo ottimale per specie
  - Video tutorial integrati
  - Checklist pre-potatura
  - Foto prima/dopo

- [ ] **Rinvaso** 🪴
  - Quando rinvasare (segnali da cercare)
  - Dimensione vaso consigliata
  - Tipo di terriccio ideale
  - Guida passo-passo

- [ ] **Controllo Parassiti** 🐛
  - Ispezioni periodiche programmate
  - Riconoscimento malattie con AI
  - Trattamenti consigliati
  - Prevenzione stagionale

#### Cure Personalizzate:
- [ ] **Aggiungi cure custom** (es. "Ruotare vaso", "Pulire foglie")
- [ ] **Promemoria una-tantum** o ricorrenti
- [ ] **Notifiche intelligenti** basate su:
  - Meteo locale
  - Stagione
  - Condizioni pianta
  - Storico cure

### 2.5.4 Analisi Salute e Diagnosi
**AI Health Monitor:**

- [ ] **Scansione salute settimanale**
  - Fotografa la pianta
  - AI analizza foglie, colore, forma
  - Report salute automatico
  - Confronto con settimana precedente

- [ ] **Alert problemi** 🚨
  - Foglie gialle/marroni
  - Crescita rallentata
  - Segni di malattie
  - Suggerimenti immediati

- [ ] **Diagnosi malattie**
  - Carica foto del problema
  - AI identifica malattia/parassita
  - Trattamento step-by-step
  - Prodotti consigliati

- [ ] **Trend salute** 📊
  - Grafico salute nel tempo
  - Correlazione cure ↔ salute
  - Previsioni crescita

### 2.5.5 Condizioni Ambientali
**Monitoraggio Ambiente:**

- [ ] **Integrazione meteo locale**
  - Temperature min/max
  - Umidità
  - Ore di sole
  - Precipitazioni

- [ ] **Consigli basati su meteo**
  - "Oggi pioverà, salta annaffiatura"
  - "Ondata di caldo, annaffia di più"
  - "Gelo previsto, proteggi piante"

- [ ] **Sensori smart** (opzionale)
  - Integrazione con sensori umidità terreno
  - Sensori luce
  - Termometri smart
  - Dashboard dati in tempo reale

### 2.5.6 Statistiche e Achievement
**Gamification Giardinaggio:**

- [ ] **Streak annaffiature** 🔥
  - Giorni consecutivi senza dimenticare
  - Badge per milestone (7, 30, 100 giorni)

- [ ] **Collezione completa**
  - Numero piante totali
  - Specie diverse
  - Piante più longeve

- [ ] **Giardiniere dell'Anno** 🏆
  - Pianta cresciuta di più
  - Miglior recupero da malattia
  - Collezione più varia

- [ ] **Condivisione progressi**
  - Post su social "La mia pianta dopo 6 mesi!"
  - Confronto con community
  - Tips & tricks da altri utenti

### 2.5.7 Database Piante Personale
**Schema Database Aggiuntivo:**

```sql
-- Tabella Piante Utente
user_plants (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  plant_name VARCHAR(200),
  scientific_name VARCHAR(200),
  nickname VARCHAR(100), -- es. "Monstera di nonna"
  acquisition_date DATE,
  location VARCHAR(100), -- "Soggiorno", "Balcone", etc.
  pot_size VARCHAR(50),
  soil_type VARCHAR(100),
  notes TEXT,
  health_status VARCHAR(20), -- healthy, warning, critical
  is_active BOOLEAN, -- false se pianta morta/regalata
  created_at TIMESTAMP
)

-- Tabella Timeline Foto
plant_photos (
  id UUID PRIMARY KEY,
  plant_id UUID REFERENCES user_plants(id),
  photo_url TEXT,
  height_cm DECIMAL,
  notes TEXT,
  health_score INTEGER, -- 1-100 da AI
  taken_at TIMESTAMP
)

-- Tabella Calendario Cure
care_schedule (
  id UUID PRIMARY KEY,
  plant_id UUID REFERENCES user_plants(id),
  care_type VARCHAR(50), -- watering, fertilizing, pruning, etc.
  frequency_days INTEGER,
  last_done TIMESTAMP,
  next_due TIMESTAMP,
  is_active BOOLEAN,
  custom_notes TEXT
)

-- Tabella Storico Cure
care_history (
  id UUID PRIMARY KEY,
  plant_id UUID REFERENCES user_plants(id),
  care_type VARCHAR(50),
  completed_at TIMESTAMP,
  notes TEXT,
  photo_url TEXT -- opzionale, foto dopo la cura
)

-- Tabella Problemi e Diagnosi
plant_issues (
  id UUID PRIMARY KEY,
  plant_id UUID REFERENCES user_plants(id),
  issue_type VARCHAR(100), -- disease, pest, nutrient deficiency
  severity VARCHAR(20), -- low, medium, high
  diagnosis TEXT,
  treatment TEXT,
  photo_url TEXT,
  detected_at TIMESTAMP,
  resolved_at TIMESTAMP,
  resolved BOOLEAN
)
```

### 2.5.8 UI/UX Sezione "Il Mio Giardino"
**Design Proposto:**

#### Vista Principale:
```
┌─────────────────────────────────┐
│  🌿 Il Mio Giardino (12 piante) │
├─────────────────────────────────┤
│  [+ Aggiungi Pianta]            │
├─────────────────────────────────┤
│  🔔 Promemoria Oggi (3)         │
│  • Annaffia Monstera 💧         │
│  • Fertilizza Basilico 🌱      │
│  • Controlla Orchidea 🔍       │
├─────────────────────────────────┤
│  📊 Le Tue Piante:              │
│  ┌──────┐ ┌──────┐ ┌──────┐   │
│  │ 🌿   │ │ 🌵   │ │ 🌸   │   │
│  │Monst.│ │Cactus│ │Orchid│   │
│  │ ✅   │ │ ⚠️   │ │ ✅   │   │
│  └──────┘ └──────┘ └──────┘   │
└─────────────────────────────────┘
```

#### Scheda Pianta:
```
┌─────────────────────────────────┐
│  ← Monstera Deliciosa          │
│  "Monty" 🌿                     │
├─────────────────────────────────┤
│  [Foto Principale - Grande]     │
│  📸 Galleria (24 foto)          │
├─────────────────────────────────┤
│  ❤️ Salute: Ottima (95/100)    │
│  📅 Con te da: 245 giorni       │
│  📍 Posizione: Soggiorno        │
├─────────────────────────────────┤
│  🔔 Prossime Cure:              │
│  • Annaffiatura: Domani         │
│  • Fertilizzazione: 12 giorni   │
│  • Potatura: 2 mesi             │
├─────────────────────────────────┤
│  📊 Crescita                    │
│  [Grafico altezza nel tempo]    │
├─────────────────────────────────┤
│  📝 Note                        │
│  [Area testo libero]            │
├─────────────────────────────────┤
│  [Scatta Foto] [Modifica]      │
└─────────────────────────────────┘
```

### 2.5.9 Funzionalità Premium "Giardino Pro"
**Upgrade Opzionale:**

- [ ] **Numero piante illimitato** (free: max 10)
- [ ] **Backup cloud automatico** foto
- [ ] **Consulenza esperto** via chat
- [ ] **Sensori smart integrati**
- [ ] **Report mensili dettagliati** PDF
- [ ] **Accesso a database piante premium** (50.000+ specie)
- [ ] **Pianificazione giardino** con layout 3D
- [ ] **Marketplace piante** integrato

### 2.5.10 Integrazione con Sfide
**Connessione Gamification:**

- [ ] Sfida: **"Giardiniere Costante"** - Non dimenticare annaffiature per 30 giorni
- [ ] Sfida: **"Pollice Verde"** - Porta una pianta da "critica" a "sana"
- [ ] Sfida: **"Collezionista"** - Raggiungi 20 piante diverse
- [ ] Sfida: **"Fotografo Botanico"** - 100 foto timeline
- [ ] XP bonus per ogni cura completata
- [ ] Badge speciali per piante longeve (1 anno, 2 anni, 5 anni)

---

## 👶 FASE 3: Modalità Bambini (5-10 anni)

### 3.1 Sezione Dedicata "BioExpert Kids"
- [ ] **UI semplificata** con colori vivaci e animazioni
- [ ] **Mascotte animata** (es. "Germoglio" il personaggio guida)
- [ ] **Voce narrante** per istruzioni (text-to-speech)
- [ ] **Sistema di stelle** invece di XP
- [ ] **Certificati stampabili** per achievement

### 3.2 Sfide Fotografiche per Bambini
**10 sfide adatte ai piccoli:**

1. **"Trova il Rosso"** 🔴 - Fotografa 5 fiori rossi
2. **"Conta le Foglie"** 🍃 - Trova piante con 3, 5, 7 foglie
3. **"Albero Amico"** 🌳 - Fotografa il tuo albero preferito
4. **"Fiore Arcobaleno"** 🌈 - Trova fiori di tutti i colori
5. **"Piccolo Grande"** 📏 - Fotografa la pianta più piccola e più grande
6. **"Profumo Magico"** 👃 - Trova 3 piante profumate
7. **"Casa degli Insetti"** 🐛 - Fotografa piante con insetti
8. **"Forme Strane"** 🔷 - Trova foglie di forme diverse
9. **"Giardino di Casa"** 🏡 - Crea un piccolo orto
10. **"Stagioni Magiche"** ❄️☀️ - Osserva cambiamenti stagionali

### 3.3 Quiz per Bambini
- [ ] **Domande semplici** con immagini grandi
- [ ] **Solo 3 risposte** invece di 4
- [ ] **Feedback positivo** sempre (anche se sbagliano)
- [ ] **Animazioni celebrative** per risposte corrette
- [ ] **Livelli progressivi**: Facile → Medio → Difficile

**Temi Quiz Kids:**
- Riconoscere frutta e verdura
- Colori dei fiori
- Dove crescono le piante (terra, acqua, alberi)
- Parti della pianta (radice, fusto, foglie, fiori)
- Animali che aiutano le piante (api, farfalle)

### 3.4 Giochi Multiplayer Kids
1. **"Gara di Raccolta"** 🏃
   - Chi fotografa più fiori in 5 minuti
   - Classifica amichevole
   - Tutti vincono premi

2. **"Memory Botanico"** 🎴
   - Gioco di memoria con carte di piante
   - Multiplayer locale o online
   - Livelli di difficoltà

3. **"Indovina la Pianta"** 🤔
   - Un bambino fotografa, altri indovinano
   - Sistema di turni
   - Punti per tutti

### 3.5 Sicurezza e Controllo Parentale
- [ ] **Modalità sicura** senza chat
- [ ] **Contenuti verificati** e adatti all'età
- [ ] **Report per genitori** sui progressi
- [ ] **Tempo di gioco limitabile**
- [ ] **Privacy totale** (no dati sensibili)

---

## 🎨 FASE 4: Miglioramenti UX e Funzionalità Extra

### 4.1 Sistema Social (Opzionale)
- [ ] Condivisione achievement sui social
- [ ] Gruppi/Team di esploratori botanici
- [ ] Sfide tra amici
- [ ] Feed di scoperte recenti della community

### 4.2 Contenuti Educativi Avanzati
- [ ] **Enciclopedia botanica** integrata
- [ ] **Video tutorial** su cura delle piante
- [ ] **Guide stagionali** per giardinaggio
- [ ] **Ricette** con erbe aromatiche
- [ ] **Progetti DIY** con piante

### 4.3 Gamification Avanzata
- [ ] **Missioni giornaliere** (3 al giorno)
- [ ] **Eventi speciali** stagionali
- [ ] **Pass stagionale** con ricompense
- [ ] **Collezioni** da completare
- [ ] **Titoli e badge** personalizzati

### 4.4 Funzionalità Premium (Opzionale)
- [ ] Analisi AI illimitate
- [ ] Accesso a quiz avanzati
- [ ] Statistiche dettagliate
- [ ] Backup cloud automatico
- [ ] Supporto prioritario

---

## 📊 METRICHE DI SUCCESSO

### KPI da Monitorare:
- [ ] Numero utenti attivi giornalieri
- [ ] Tasso di completamento sfide
- [ ] Engagement multiplayer
- [ ] Retention rate (7 giorni, 30 giorni)
- [ ] Numero foto caricate
- [ ] Punteggio medio quiz
- [ ] Tempo medio sessione

---

## 🗓️ TIMELINE PROPOSTA

### Sprint 1 (Settimana 1-2): Database e Classifica
- Setup database
- API autenticazione
- Classifica globale Bellezza Botanica
- Sistema sincronizzazione

### Sprint 2 (Settimana 3-4): Espansione Sfide
- Completare 10 sfide fotografiche
- Aggiungere livelli 2-3 quiz
- 2 nuove sfide multiplayer

### Sprint 3 (Settimana 5-6): Modalità Bambini
- UI Kids
- 10 sfide fotografiche bambini
- Quiz semplificati
- 2 giochi multiplayer kids

### Sprint 4 (Settimana 7-8): Polish e Launch
- Testing completo
- Ottimizzazioni performance
- Marketing e lancio ufficiale
- Feedback utenti e iterazioni

---

## 💡 IDEE FUTURE (Backlog)

### Funzionalità Avanzate:
- [ ] **Realtà Aumentata** - Visualizzare info piante in AR
- [ ] **Riconoscimento malattie** con suggerimenti cura
- [ ] **Calendario giardinaggio** personalizzato
- [ ] **Marketplace piante** (compra/vendi)
- [ ] **Consulenza esperto** via chat
- [ ] **Integrazione meteo** per consigli cura
- [ ] **Notifiche smart** per annaffiatura
- [ ] **Diario botanico** personale
- [ ] **Mappe piante** nella tua zona
- [ ] **Collaborazioni con vivai** e garden center

### Espansione Contenuti:
- [ ] Sezione **funghi e licheni**
- [ ] Sezione **alberi monumentali**
- [ ] Sezione **piante medicinali**
- [ ] Sezione **piante tossiche** (sicurezza)
- [ ] Sezione **bonsai e piante rare**

---

## 🎯 VISIONE FINALE

**BioExpert diventerà:**
- 🌍 La **piattaforma educativa #1** per botanica
- 👨‍👩‍👧‍👦 Adatta a **tutte le età** (5-99 anni)
- 🎮 **Divertente come un gioco**, educativa come una scuola
- 🏆 **Competitiva** ma anche collaborativa
- 📚 **Ricca di contenuti** sempre aggiornati
- 🌱 Promuovere **amore per la natura** e sostenibilità

---

## 📝 NOTE TECNICHE

### Stack Tecnologico Futuro:
- **Frontend**: React + Vite (attuale) ✅
- **Backend**: Vercel Serverless Functions
- **Database**: Vercel Postgres o Supabase
- **Storage**: Vercel Blob Storage
- **Auth**: NextAuth.js o Supabase Auth
- **Real-time**: Supabase Realtime per multiplayer
- **Analytics**: Vercel Analytics + Posthog
- **Monitoring**: Sentry per error tracking

### Ottimizzazioni Performance:
- [ ] Image optimization (WebP, lazy loading)
- [ ] Code splitting per route
- [ ] Service Worker per offline mode
- [ ] Caching intelligente
- [ ] CDN per assets statici

---

**🚀 PROSSIMA SESSIONE: Iniziare con FASE 1 - Database e Classifica Globale**

---

*Documento creato il 2026-01-09*  
*Ultima modifica: 2026-01-09*  
*Versione: 1.0*
