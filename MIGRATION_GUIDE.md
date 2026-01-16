# 🔧 GUIDA: Applicare Migrazione Database su Vercel

**IMPORTANTE**: Questo step è necessario per attivare il sistema di cura in produzione!

## 📋 STEP-BY-STEP

### Step 1: Login a Vercel
1. Vai su https://vercel.com/dashboard
2. Fai login con il tuo account

### Step 2: Seleziona Progetto
1. Nella dashboard, cerca il progetto **"bioexpert"**
2. Clicca sul progetto per aprirlo

### Step 3: Apri Database
1. Nel menu laterale, clicca su **"Storage"**
2. Clicca sul database Postgres (dovrebbe essere l'unico)
3. Si aprirà la pagina del database

### Step 4: Apri SQL Editor
1. Nella pagina del database, cerca il tab **"Query"** o **"SQL Editor"**
2. Clicca per aprire l'editor SQL

### Step 5: Copia la Migrazione
Apri il file `migration_care_program.sql` e copia TUTTO il contenuto.

Oppure copia da qui:

```sql
-- ============================================
-- SISTEMA DI CURA PROGRESSIVO - SCHEMA DATABASE
-- ============================================

-- Tabella principale: Programmi di cura
CREATE TABLE IF NOT EXISTS plant_care_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plant_id UUID NOT NULL,
    username VARCHAR(255) NOT NULL,
    program_type VARCHAR(50) NOT NULL CHECK (program_type IN ('recovery', 'maintenance')),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
    
    -- Metriche iniziali
    health_score_initial INTEGER CHECK (health_score_initial >= 0 AND health_score_initial <= 100),
    lux_initial INTEGER,
    photo_initial_url TEXT,
    
    -- Metriche correnti
    health_score_current INTEGER CHECK (health_score_current >= 0 AND health_score_current <= 100),
    lux_current INTEGER,
    
    -- Target
    lux_target_min INTEGER,
    lux_target_max INTEGER,
    
    -- Fasi
    current_phase INTEGER DEFAULT 1,
    total_phases INTEGER NOT NULL,
    
    -- Date
    start_date TIMESTAMP DEFAULT NOW(),
    estimated_completion_date TIMESTAMP,
    completed_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabella: Fasi del programma
CREATE TABLE IF NOT EXISTS care_program_phases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID NOT NULL REFERENCES plant_care_programs(id) ON DELETE CASCADE,
    phase_number INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration_days INTEGER NOT NULL,
    
    -- Azioni della fase (JSON array)
    actions JSONB,
    
    -- Stato
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(program_id, phase_number)
);

-- Tabella: Checkpoint fotografici
CREATE TABLE IF NOT EXISTS care_checkpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID NOT NULL REFERENCES plant_care_programs(id) ON DELETE CASCADE,
    phase_id UUID REFERENCES care_program_phases(id) ON DELETE CASCADE,
    checkpoint_number INTEGER NOT NULL,
    
    -- Programmazione
    scheduled_date TIMESTAMP NOT NULL,
    
    -- Dati checkpoint
    photo_url TEXT,
    lux_reading INTEGER,
    health_score INTEGER CHECK (health_score >= 0 AND health_score <= 100),
    
    -- Analisi AI
    ai_analysis JSONB,
    ai_recommendations TEXT,
    improvements_detected TEXT[],
    
    -- Note utente
    user_notes TEXT,
    
    -- Stato
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(program_id, checkpoint_number)
);

-- Tabella: Azioni del programma
CREATE TABLE IF NOT EXISTS care_program_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID NOT NULL REFERENCES plant_care_programs(id) ON DELETE CASCADE,
    phase_id UUID REFERENCES care_program_phases(id) ON DELETE CASCADE,
    
    action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('water', 'fertilize', 'prune', 'photo_check', 'relocate', 'other')),
    action_title VARCHAR(255),
    action_description TEXT,
    
    -- Programmazione
    scheduled_date TIMESTAMP,
    frequency VARCHAR(50),
    
    -- Stato
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_care_programs_plant ON plant_care_programs(plant_id);
CREATE INDEX IF NOT EXISTS idx_care_programs_username ON plant_care_programs(username);
CREATE INDEX IF NOT EXISTS idx_care_programs_status ON plant_care_programs(status);
CREATE INDEX IF NOT EXISTS idx_care_phases_program ON care_program_phases(program_id);
CREATE INDEX IF NOT EXISTS idx_care_checkpoints_program ON care_checkpoints(program_id);
CREATE INDEX IF NOT EXISTS idx_care_checkpoints_scheduled ON care_checkpoints(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_care_actions_program ON care_program_actions(program_id);

-- Vista: Programmi attivi con statistiche
CREATE OR REPLACE VIEW active_care_programs AS
SELECT 
    p.*,
    COUNT(DISTINCT c.id) as total_checkpoints,
    COUNT(DISTINCT c.id) FILTER (WHERE c.is_completed = TRUE) as completed_checkpoints,
    ROUND((p.current_phase::DECIMAL / p.total_phases) * 100) as completion_percentage,
    (p.health_score_current - p.health_score_initial) as health_improvement
FROM plant_care_programs p
LEFT JOIN care_checkpoints c ON c.program_id = p.id
WHERE p.status = 'active'
GROUP BY p.id;

-- Funzione: Auto-update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger: Auto-update per plant_care_programs
DROP TRIGGER IF EXISTS update_plant_care_programs_updated_at ON plant_care_programs;
CREATE TRIGGER update_plant_care_programs_updated_at
    BEFORE UPDATE ON plant_care_programs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Auto-update per care_program_phases
DROP TRIGGER IF EXISTS update_care_program_phases_updated_at ON care_program_phases;
CREATE TRIGGER update_care_program_phases_updated_at
    BEFORE UPDATE ON care_program_phases
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Auto-update per care_checkpoints
DROP TRIGGER IF EXISTS update_care_checkpoints_updated_at ON care_checkpoints;
CREATE TRIGGER update_care_checkpoints_updated_at
    BEFORE UPDATE ON care_checkpoints
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- MIGRAZIONE COMPLETATA
-- ============================================
```

### Step 6: Incolla ed Esegui
1. Incolla il codice SQL nell'editor
2. Clicca sul pulsante **"Run"** o **"Execute"**
3. Attendi il completamento (dovrebbe richiedere 2-3 secondi)

### Step 7: Verifica
Esegui questa query per verificare che le tabelle siano state create:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'care%'
ORDER BY table_name;
```

Dovresti vedere:
- `care_checkpoints`
- `care_program_actions`
- `care_program_phases`
- `plant_care_programs`

---

## ✅ COMPLETAMENTO

Se vedi le 4 tabelle, la migrazione è completata con successo! 🎉

Il sistema di cura è ora **completamente funzionante in produzione**!

---

## 🧪 TEST FINALE

1. Vai su https://bioexpert.vercel.app
2. Login
3. Scansiona una pianta malata
4. Aggiungi al giardino
5. Vai al tab CURA
6. Clicca "AVVIA PROGRAMMA DI RECUPERO"
7. Scatta foto → Il programma viene creato!

---

## ⚠️ TROUBLESHOOTING

### Errore: "relation already exists"
Significa che le tabelle sono già state create. Va bene, puoi ignorare.

### Errore: "permission denied"
Verifica di essere nel database corretto del progetto bioexpert.

### Errore: "syntax error"
Assicurati di aver copiato TUTTO il codice SQL, dall'inizio alla fine.

---

## 📞 SUPPORTO

Se hai problemi, controlla:
1. Sei loggato su Vercel?
2. Sei nel progetto "bioexpert"?
3. Sei nella sezione Storage → Postgres?
4. Hai copiato tutto il codice SQL?

**Tutto pronto per il test finale!** 🚀
