-- Migration: Care Program System
-- Data: 2026-01-14
-- Descrizione: Sistema di cura progressivo con fasi, checkpoint e luxometro

-- Tabella programmi di cura
CREATE TABLE IF NOT EXISTS plant_care_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_id VARCHAR(100) NOT NULL, -- Supports both Integer IDs and UUID strings
  username VARCHAR(50) REFERENCES users(username) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed', 'paused', 'cancelled'
  program_type VARCHAR(20) DEFAULT 'recovery', -- 'recovery' (4 fasi), 'maintenance' (2 fasi)
  
  -- Metriche iniziali
  health_score_initial INTEGER DEFAULT 0, -- 0-100
  lux_initial INTEGER,
  photo_initial_url TEXT,
  
  -- Metriche correnti
  health_score_current INTEGER DEFAULT 0,
  lux_current INTEGER,
  
  -- Target e range
  lux_target_min INTEGER,
  lux_target_max INTEGER,
  
  -- Progressione
  current_phase INTEGER DEFAULT 1,
  total_phases INTEGER DEFAULT 4,
  
  -- Date
  start_date TIMESTAMP DEFAULT NOW(),
  estimated_completion_date TIMESTAMP,
  completed_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabella fasi del programma
CREATE TABLE IF NOT EXISTS care_program_phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID REFERENCES plant_care_programs(id) ON DELETE CASCADE,
  
  phase_number INTEGER NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  duration_days INTEGER NOT NULL,
  
  -- Azioni da completare (JSON array)
  -- Esempio: [{"type": "water", "frequency": "daily", "completed": 3, "total": 7}, ...]
  actions JSONB DEFAULT '[]'::jsonb,
  
  -- Stato
  is_completed BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabella checkpoint fotografici
CREATE TABLE IF NOT EXISTS care_checkpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID REFERENCES plant_care_programs(id) ON DELETE CASCADE,
  phase_id UUID REFERENCES care_program_phases(id) ON DELETE SET NULL,
  
  checkpoint_number INTEGER NOT NULL,
  scheduled_date TIMESTAMP NOT NULL,
  
  -- Dati raccolti
  photo_url TEXT,
  lux_reading INTEGER,
  health_score INTEGER, -- Analisi AI
  
  -- Feedback AI
  ai_analysis JSONB,
  ai_recommendations TEXT,
  improvements_detected TEXT[], -- Array di miglioramenti rilevati
  
  -- Note utente
  user_notes TEXT,
  
  -- Stato
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabella azioni programma (tracking granulare)
CREATE TABLE IF NOT EXISTS care_program_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID REFERENCES plant_care_programs(id) ON DELETE CASCADE,
  phase_id UUID REFERENCES care_program_phases(id) ON DELETE CASCADE,
  
  action_type VARCHAR(50) NOT NULL, -- 'water', 'fertilize', 'prune', 'photo_check', 'relocate'
  action_title VARCHAR(200),
  action_description TEXT,
  
  scheduled_date TIMESTAMP,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  
  -- Dati specifici azione
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_care_programs_plant_id ON plant_care_programs(plant_id);
CREATE INDEX IF NOT EXISTS idx_care_programs_status ON plant_care_programs(status);
CREATE INDEX IF NOT EXISTS idx_care_phases_program_id ON care_program_phases(program_id);
CREATE INDEX IF NOT EXISTS idx_care_checkpoints_program_id ON care_checkpoints(program_id);
CREATE INDEX IF NOT EXISTS idx_care_checkpoints_scheduled ON care_checkpoints(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_care_actions_program_id ON care_program_actions(program_id);
CREATE INDEX IF NOT EXISTS idx_care_actions_scheduled ON care_program_actions(scheduled_date, is_completed);

-- Vista per dashboard programmi attivi
CREATE OR REPLACE VIEW active_care_programs AS
SELECT 
  p.id,
  p.plant_id,
  p.username,
  p.status,
  p.current_phase,
  p.total_phases,
  p.health_score_initial,
  p.health_score_current,
  (p.health_score_current - p.health_score_initial) as health_improvement,
  ROUND((p.current_phase::numeric / p.total_phases::numeric) * 100) as completion_percentage,
  up.plant_name,
  up.scientific_name,
  up.image_url,
  (SELECT COUNT(*) FROM care_checkpoints WHERE program_id = p.id AND is_completed = TRUE) as completed_checkpoints,
  (SELECT COUNT(*) FROM care_checkpoints WHERE program_id = p.id) as total_checkpoints,
  p.start_date,
  p.estimated_completion_date
FROM plant_care_programs p
JOIN user_plants up ON p.plant_id::text = up.id::text
WHERE p.status = 'active';

-- Funzione per aggiornare timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger per auto-update timestamp
CREATE TRIGGER update_care_programs_updated_at BEFORE UPDATE ON plant_care_programs
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Commenti per documentazione
COMMENT ON TABLE plant_care_programs IS 'Programmi di cura progressivi per piante malate o in mantenimento';
COMMENT ON TABLE care_program_phases IS 'Fasi del programma di cura (es. Stabilizzazione, Ripresa, ecc.)';
COMMENT ON TABLE care_checkpoints IS 'Checkpoint fotografici con analisi AI e luxometro';
COMMENT ON TABLE care_program_actions IS 'Azioni specifiche da completare (irrigazione, concimazione, ecc.)';
