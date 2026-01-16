# 🌱 Sistema di Cura Progressivo - Progettazione

**Data**: 14 Gennaio 2026  
**Versione**: 2.0.0 (Major Update)

## 🎯 Obiettivo

Creare un **sistema di cura progressivo e interattivo** che guidi l'utente attraverso fasi concrete per migliorare la salute della pianta, con tracking fotografico, luxometro integrato, e piano d'azione strutturato.

---

## 🔄 Flusso del Sistema di Cura

### Fase 1: Diagnosi Iniziale
1. **Foto della pianta** con luxometro attivo
2. **Analisi AI** dello stato di salute
3. **Misurazione lux** per verificare esposizione corretta
4. **Generazione piano di recupero** (se malata) o mantenimento (se sana)

### Fase 2: Piano di Recupero Strutturato
Il sistema crea un **piano a fasi** con:
- ✅ **Checkpoint fotografici** (ogni X giorni)
- 💧 **Irrigazioni programmate** (con reminder)
- ✂️ **Interventi di manutenzione** (potatura, concimazione)
- 🌞 **Monitoraggio esposizione** (luxometro ad ogni foto)
- 📊 **Progress tracking** (% di miglioramento)

### Fase 3: Monitoraggio Continuo
- **Timeline fotografica** con confronto prima/dopo
- **Grafici di progresso** (salute, lux, crescita)
- **Notifiche intelligenti** per azioni da compiere
- **Completamento fasi** con feedback visivo

---

## 🗂️ Struttura Dati (Database)

### Tabella: `plant_care_programs`
```sql
CREATE TABLE plant_care_programs (
  id UUID PRIMARY KEY,
  plant_id UUID REFERENCES user_plants(id),
  status VARCHAR(20), -- 'active', 'completed', 'paused'
  health_score_initial INTEGER, -- 0-100
  health_score_current INTEGER, -- 0-100
  lux_initial INTEGER,
  lux_target_min INTEGER,
  lux_target_max INTEGER,
  start_date TIMESTAMP,
  estimated_completion_date TIMESTAMP,
  current_phase INTEGER, -- 1, 2, 3, 4
  total_phases INTEGER,
  created_at TIMESTAMP
);
```

### Tabella: `care_program_phases`
```sql
CREATE TABLE care_program_phases (
  id UUID PRIMARY KEY,
  program_id UUID REFERENCES plant_care_programs(id),
  phase_number INTEGER,
  title VARCHAR(200), -- "Fase 1: Stabilizzazione"
  description TEXT,
  duration_days INTEGER,
  actions JSONB, -- [{type: 'water', frequency: 'daily'}, ...]
  is_completed BOOLEAN,
  completed_at TIMESTAMP,
  created_at TIMESTAMP
);
```

### Tabella: `care_checkpoints`
```sql
CREATE TABLE care_checkpoints (
  id UUID PRIMARY KEY,
  program_id UUID REFERENCES plant_care_programs(id),
  phase_id UUID REFERENCES care_program_phases(id),
  checkpoint_date TIMESTAMP,
  photo_url TEXT,
  lux_reading INTEGER,
  health_score INTEGER, -- AI analysis
  notes TEXT,
  ai_feedback TEXT, -- Feedback AI sul progresso
  is_completed BOOLEAN,
  created_at TIMESTAMP
);
```

---

## 🎨 Design UI/UX

### 1. **Schermata Piano di Cura** (Nuovo)

#### Header con Progress Bar
```
┌─────────────────────────────────────┐
│ 🌱 Piano di Recupero                │
│ ████████░░░░░░░░░░░░ 40% Completato │
│ Fase 2 di 4: Ripresa Vegetativa     │
└─────────────────────────────────────┘
```

#### Card Fase Corrente
```
┌─────────────────────────────────────┐
│ 🌿 FASE 2: RIPRESA VEGETATIVA       │
│ Durata: 14 giorni (5 rimanenti)     │
│                                      │
│ Azioni da completare:                │
│ ✅ Irrigazione (3/3 questa settimana)│
│ ⏳ Check fotografico (tra 2 giorni)  │
│ ⏳ Concimazione (tra 5 giorni)       │
│                                      │
│ [📸 FAI CHECK FOTO]                  │
└─────────────────────────────────────┘
```

#### Timeline Fotografica con Lux
```
┌─────────────────────────────────────┐
│ 📊 PROGRESSO FOTOGRAFICO             │
│                                      │
│ ┌──────┐  ┌──────┐  ┌──────┐        │
│ │ IMG  │  │ IMG  │  │ IMG  │        │
│ │      │→ │      │→ │      │        │
│ └──────┘  └──────┘  └──────┘        │
│ 10/01     13/01     Oggi            │
│ 200 lux  450 lux   600 lux ✅       │
│ Salute:   Salute:   Salute:         │
│ 30%       55%       75%              │
└─────────────────────────────────────┘
```

#### Luxometro Live (durante foto)
```
┌─────────────────────────────────────┐
│ 🌞 ESPOSIZIONE LUMINOSA              │
│                                      │
│        ████████████ 650 lux         │
│                                      │
│ ✅ OTTIMALE per questa pianta        │
│ Range ideale: 500-1000 lux          │
│                                      │
│ 💡 Consiglio: Posizione perfetta!   │
└─────────────────────────────────────┘
```

### 2. **Fasi del Programma**

#### Per Piante Malate (4 Fasi):
1. **Fase 1: Stabilizzazione** (7-10 giorni)
   - Rimozione parti malate
   - Irrigazione controllata
   - Monitoraggio quotidiano

2. **Fase 2: Ripresa Vegetativa** (14 giorni)
   - Concimazione leggera
   - Irrigazione regolare
   - Check fotografici settimanali

3. **Fase 3: Consolidamento** (21 giorni)
   - Concimazione normale
   - Potatura formativa
   - Check fotografici bisettimanali

4. **Fase 4: Mantenimento** (Continuo)
   - Routine standard
   - Check mensili
   - Monitoraggio preventivo

#### Per Piante Sane (2 Fasi):
1. **Fase 1: Ottimizzazione** (14 giorni)
   - Verifica esposizione
   - Calibrazione irrigazione
   - Check settimanali

2. **Fase 2: Mantenimento** (Continuo)
   - Routine standard
   - Check mensili

---

## 🔧 Funzionalità Tecniche

### 1. **Luxometro Integrato**
```typescript
interface LuxReading {
  value: number;
  timestamp: number;
  isOptimal: boolean;
  recommendation: string;
}

const getLuxRecommendation = (lux: number, plantType: string) => {
  // Logica basata sul tipo di pianta
  if (lux < minLux) return "Troppo buio - sposta in zona più luminosa";
  if (lux > maxLux) return "Troppo sole - riduci esposizione diretta";
  return "Esposizione ottimale!";
};
```

### 2. **AI Health Scoring**
```typescript
interface HealthAnalysis {
  score: number; // 0-100
  issues: string[];
  improvements: string[];
  nextActions: Action[];
}
```

### 3. **Smart Notifications**
- Reminder irrigazione
- Alert check fotografico
- Notifica fase completata
- Avviso esposizione non ottimale

---

## 📱 User Journey

### Scenario: Pianta Malata

1. **Utente aggiunge pianta malata**
   → Sistema rileva health_status = 'sick'
   → Propone: "Vuoi avviare un programma di recupero?"

2. **Utente accetta**
   → AI genera piano 4 fasi personalizzato
   → Prima foto con luxometro
   → Sistema salva baseline (salute 30%, lux 200)

3. **Giorno 3: Notifica**
   → "È ora del check fotografico!"
   → Utente fa foto con luxometro
   → AI analizza: salute 45% (+15%), lux 450 ✅
   → Feedback: "Ottimo progresso! Continua così"

4. **Giorno 7: Fase 1 Completata**
   → Sistema mostra celebrazione
   → "Fase 1 completata! Passiamo alla Fase 2"
   → Nuove azioni sbloccate

5. **Giorno 45: Programma Completato**
   → Salute finale: 90%
   → Timeline completa con tutte le foto
   → Badge "Guaritore di Piante" 🏆

---

## 🎨 Palette Colori per Fasi

- **Fase 1 (Stabilizzazione)**: Rosso/Arancione `#FF6B6B`
- **Fase 2 (Ripresa)**: Giallo `#FFD93D`
- **Fase 3 (Consolidamento)**: Verde Chiaro `#6BCF7F`
- **Fase 4 (Mantenimento)**: Verde Scuro `#2E7D32`

---

## 🚀 Implementazione

### Step 1: Database Schema
- Creare nuove tabelle
- Migrare dati esistenti

### Step 2: API Endpoints
- `POST /api/care-program/create`
- `GET /api/care-program/:id`
- `POST /api/care-program/checkpoint`
- `PATCH /api/care-program/complete-phase`

### Step 3: Frontend Components
- `CareProgramDashboard.tsx`
- `PhaseCard.tsx`
- `CheckpointTimeline.tsx`
- `LuxMeter.tsx`
- `ProgressChart.tsx`

### Step 4: AI Integration
- Prompt per generazione fasi
- Analisi progresso fotografico
- Scoring automatico salute

---

## 📊 Metriche di Successo

- % piante che completano il programma
- Tempo medio di recupero
- Miglioramento medio health score
- Engagement (foto caricate, azioni completate)

---

## 🎯 Next Steps

1. ✅ Backup completato
2. ⏳ Creare schema database
3. ⏳ Implementare luxometro live
4. ⏳ Creare UI programma di cura
5. ⏳ Integrare AI per fasi personalizzate
6. ⏳ Testing locale
7. ⏳ Deploy produzione
