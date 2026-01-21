-- Schema per Neon Database (BioExpert)
-- Esegui questo script nel SQL Editor di Neon (Vercel Storage)

-- Abilita estensione UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabella utenti (solo nome avatar)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabella punteggi beauty contest
CREATE TABLE IF NOT EXISTS beauty_scores (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    score INTEGER NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabella Storico Vincitori Settimanali
CREATE TABLE IF NOT EXISTS winners_log (
    id SERIAL PRIMARY KEY,
    week_start_date DATE NOT NULL, -- Data del lunedì di quella settimana
    username VARCHAR(50) NOT NULL,
    rank INTEGER NOT NULL, -- 1, 2, 3
    xp_awarded INTEGER NOT NULL,
    awarded_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(week_start_date, rank) -- Un solo vincitore per posizione a settimana
);

-- SECTION 2: IL MIO GIARDINO

-- Tabella Piante Utente
CREATE TABLE IF NOT EXISTS user_plants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) REFERENCES users(username) ON DELETE CASCADE,
  plant_name VARCHAR(200) NOT NULL,
  scientific_name VARCHAR(200),
  nickname VARCHAR(100),
  acquisition_date DATE DEFAULT CURRENT_DATE,
  location VARCHAR(100), -- "Soggiorno", "Balcone", etc.
  pot_size VARCHAR(50),
  soil_type VARCHAR(100),
  notes TEXT,
  health_status VARCHAR(20) DEFAULT 'healthy', -- healthy, warning, critical
  is_active BOOLEAN DEFAULT TRUE,
  image_url TEXT,
  watering_guide TEXT,
  sunlight_guide TEXT,
  pruning_guide TEXT,
  repotting_guide TEXT,
  last_care_at TIMESTAMP DEFAULT NOW(),
  next_check_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabella Storico Cure (Eventi)
CREATE TABLE IF NOT EXISTS care_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_id UUID REFERENCES user_plants(id) ON DELETE CASCADE,
  username VARCHAR(50) REFERENCES users(username) ON DELETE CASCADE,
  event_type VARCHAR(50), -- "watering", "pruning", "photo_check", "fertilizing"
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabella Timeline Foto Piante
CREATE TABLE IF NOT EXISTS plant_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_id UUID REFERENCES user_plants(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  height_cm DECIMAL,
  notes TEXT,
  health_score INTEGER, -- 1-100 da AI
  taken_at TIMESTAMP DEFAULT NOW()
);

-- Tabella Calendario Cure (Schedule Recurrent)
CREATE TABLE IF NOT EXISTS care_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_id UUID REFERENCES user_plants(id) ON DELETE CASCADE,
  care_type VARCHAR(50) NOT NULL, -- watering, fertilizing, pruning, pest_control
  frequency_days INTEGER NOT NULL,
  last_done TIMESTAMP,
  next_due TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  custom_notes TEXT
);

-- Tabella Storico Cure (Log Actions)
CREATE TABLE IF NOT EXISTS care_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_id UUID REFERENCES user_plants(id) ON DELETE CASCADE,
  care_type VARCHAR(50) NOT NULL,
  completed_at TIMESTAMP DEFAULT NOW(),
  notes TEXT,
  photo_url TEXT
);

-- Tabella Problemi e Diagnosi
CREATE TABLE IF NOT EXISTS plant_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_id UUID REFERENCES user_plants(id) ON DELETE CASCADE,
  issue_type VARCHAR(100), -- disease, pest, nutrient deficiency
  severity VARCHAR(20), -- low, medium, high
  diagnosis TEXT,
  treatment TEXT,
  photo_url TEXT,
  detected_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP,
  resolved BOOLEAN DEFAULT FALSE
);

-- Indici
CREATE INDEX IF NOT EXISTS idx_beauty_scores_created_at ON beauty_scores(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_beauty_scores_score ON beauty_scores(score DESC);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_user_plants_username ON user_plants(username);
CREATE INDEX IF NOT EXISTS idx_care_schedule_next_due ON care_schedule(next_due ASC);

-- Vista per leaderboard (top 100)
CREATE OR REPLACE VIEW leaderboard AS
SELECT 
    username,
    score,
    image_url,
    created_at,
    ROW_NUMBER() OVER (ORDER BY score DESC, created_at ASC) as rank
FROM beauty_scores
ORDER BY score DESC, created_at ASC
LIMIT 100;
