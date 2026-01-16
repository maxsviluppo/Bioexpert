-- ============================================
-- BIOEXPERT - SECURE AUTH MIGRATION
-- Data: 13 Gennaio 2026
-- Versione: 3.0.0
-- ============================================

-- ATTENZIONE: Questo script elimina TUTTI i dati utente esistenti!
-- Eseguire solo se si Ã¨ sicuri del reset completo.

-- ============================================
-- STEP 1: Enable Extensions
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- STEP 2: Drop vecchie tabelle

-- CREATE TABLE users_backup AS SELECT * FROM users;
-- CREATE TABLE user_plants_backup AS SELECT * FROM user_plants;
-- CREATE TABLE leaderboard_backup AS SELECT * FROM leaderboard;

-- ============================================
-- STEP 2: Drop vecchie tabelle
-- ============================================
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS user_plants CASCADE;
DROP TABLE IF EXISTS leaderboard CASCADE;
DROP TABLE IF EXISTS user_analyses CASCADE;
DROP TABLE IF EXISTS care_events CASCADE;
DROP TABLE IF EXISTS plant_photos CASCADE;

-- ============================================
-- STEP 3: Crea nuova tabella users (SICURA)
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP,
    
    -- Constraints
    CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 20),
    CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]+$')
);

-- Indici per performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email) WHERE email IS NOT NULL;
CREATE INDEX idx_users_xp ON users(xp DESC);

-- ============================================
-- STEP 4: Ricrea tabelle dipendenti
-- ============================================

-- Leaderboard (con foreign key a users)
CREATE TABLE leaderboard (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) NOT NULL,
    score INTEGER NOT NULL,
    plant_name VARCHAR(255),
    image_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    challenge_id VARCHAR(50),
    
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
);

CREATE INDEX idx_leaderboard_score ON leaderboard(score DESC);
CREATE INDEX idx_leaderboard_challenge ON leaderboard(challenge_id);
CREATE INDEX idx_leaderboard_created ON leaderboard(created_at DESC);

-- User Plants
CREATE TABLE user_plants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) NOT NULL,
    plant_name VARCHAR(255) NOT NULL,
    scientific_name VARCHAR(255),
    nickname VARCHAR(255),
    image_url TEXT,
    health_status VARCHAR(50),
    diagnosis TEXT,
    notes TEXT,
    watering_guide TEXT,
    sunlight_guide TEXT,
    pruning_guide TEXT,
    repotting_guide TEXT,
    next_check_at TIMESTAMP,
    last_care_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
);

CREATE INDEX idx_user_plants_username ON user_plants(username);
CREATE INDEX idx_user_plants_next_check ON user_plants(next_check_at);

-- Care Events
CREATE TABLE care_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) NOT NULL,
    plant_id UUID NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE,
    FOREIGN KEY (plant_id) REFERENCES user_plants(id) ON DELETE CASCADE
);

CREATE INDEX idx_care_events_plant ON care_events(plant_id);
CREATE INDEX idx_care_events_created ON care_events(created_at DESC);

-- Plant Photos
CREATE TABLE plant_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) NOT NULL,
    plant_id UUID NOT NULL,
    image_url TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE,
    FOREIGN KEY (plant_id) REFERENCES user_plants(id) ON DELETE CASCADE
);

CREATE INDEX idx_plant_photos_plant ON plant_photos(plant_id);
CREATE INDEX idx_plant_photos_created ON plant_photos(created_at DESC);

-- User Analyses (Erbario)
CREATE TABLE user_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) NOT NULL,
    analysis_data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
);

CREATE INDEX idx_user_analyses_username ON user_analyses(username);
CREATE INDEX idx_user_analyses_created ON user_analyses(created_at DESC);

-- ============================================
-- STEP 5: Inserisci utente di test (opzionale)
-- ============================================
-- Password: "test123" (hashata con bcrypt)
-- INSERT INTO users (username, password_hash, email, xp, level) 
-- VALUES ('testuser', '$2a$10$YourHashedPasswordHere', 'test@example.com', 100, 2);

-- ============================================
-- STEP 6: Verifica
-- ============================================
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
ORDER BY table_name;

-- ============================================
-- FINE MIGRAZIONE
-- ============================================
-- Tutti i dati precedenti sono stati eliminati.
-- Il database Ã¨ ora pronto per il nuovo sistema di autenticazione sicuro.
-- Migration: Care Program System
-- Data: 2026-01-14
-- Descrizione: Sistema di cura progressivo con fasi, checkpoint e luxometro

-- Tabella programmi di cura
CREATE TABLE IF NOT EXISTS plant_care_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_id UUID REFERENCES user_plants(id) ON DELETE CASCADE,
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
  ai_analysis TEXT,
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
JOIN user_plants up ON p.plant_id = up.id
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
