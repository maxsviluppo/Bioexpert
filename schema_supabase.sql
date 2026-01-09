-- BioExpert Database Schema for Supabase
-- ⚠️ ATTENZIONE: Database condiviso con altre app
-- Tutte le tabelle hanno prefisso "bioexpert_" per evitare conflitti

-- Tabella Utenti BioExpert
CREATE TABLE IF NOT EXISTS bioexpert_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  avatar_url TEXT
);

-- Tabella Punteggi Bellezza Botanica
CREATE TABLE IF NOT EXISTS bioexpert_beauty_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES bioexpert_users(id) ON DELETE CASCADE,
  username VARCHAR(50) NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 100),
  image_url TEXT NOT NULL,
  ai_feedback TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_bioexpert_beauty_scores_score ON bioexpert_beauty_scores(score DESC);
CREATE INDEX IF NOT EXISTS idx_bioexpert_beauty_scores_created_at ON bioexpert_beauty_scores(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bioexpert_beauty_scores_user_id ON bioexpert_beauty_scores(user_id);

-- Tabella Cronologia Scansioni
CREATE TABLE IF NOT EXISTS bioexpert_plant_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES bioexpert_users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  plant_name VARCHAR(200),
  scientific_name VARCHAR(200),
  category VARCHAR(50),
  health_status VARCHAR(20),
  diagnosis TEXT,
  care_instructions JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabella Sfide Completate
CREATE TABLE IF NOT EXISTS bioexpert_completed_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES bioexpert_users(id) ON DELETE CASCADE,
  quest_id VARCHAR(50) NOT NULL,
  score INTEGER,
  completed_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, quest_id)
);

-- Vista per Classifica Top 100
CREATE OR REPLACE VIEW bioexpert_leaderboard_top100 AS
SELECT 
  bs.id,
  bs.username,
  bs.score,
  bs.image_url,
  bs.created_at,
  ROW_NUMBER() OVER (ORDER BY bs.score DESC, bs.created_at ASC) as rank
FROM bioexpert_beauty_scores bs
ORDER BY bs.score DESC, bs.created_at ASC
LIMIT 100;

-- Abilita Row Level Security (RLS) per sicurezza
ALTER TABLE bioexpert_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bioexpert_beauty_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE bioexpert_plant_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE bioexpert_completed_quests ENABLE ROW LEVEL SECURITY;

-- Policy: Tutti possono leggere la classifica
CREATE POLICY "Public read access for leaderboard" ON bioexpert_beauty_scores
  FOR SELECT USING (true);

-- Policy: Tutti possono inserire punteggi (per ora, poi aggiungeremo auth)
CREATE POLICY "Public insert access for scores" ON bioexpert_beauty_scores
  FOR INSERT WITH CHECK (true);

-- Policy: Tutti possono leggere utenti pubblici
CREATE POLICY "Public read access for users" ON bioexpert_users
  FOR SELECT USING (true);

-- Policy: Tutti possono creare utenti (per ora)
CREATE POLICY "Public insert access for users" ON bioexpert_users
  FOR INSERT WITH CHECK (true);
