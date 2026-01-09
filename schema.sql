-- BioExpert Database Schema
-- Vercel Postgres

-- Tabella Utenti
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  avatar_url TEXT
);

-- Tabella Punteggi Bellezza Botanica
CREATE TABLE IF NOT EXISTS beauty_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  username VARCHAR(50) NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 100),
  image_url TEXT NOT NULL,
  ai_feedback TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_beauty_scores_score ON beauty_scores(score DESC);
CREATE INDEX IF NOT EXISTS idx_beauty_scores_created_at ON beauty_scores(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_beauty_scores_user_id ON beauty_scores(user_id);

-- Tabella Cronologia Scansioni (per futuro)
CREATE TABLE IF NOT EXISTS plant_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
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
CREATE TABLE IF NOT EXISTS completed_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  quest_id VARCHAR(50) NOT NULL,
  score INTEGER,
  completed_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, quest_id)
);

-- Vista per Classifica Top 100
CREATE OR REPLACE VIEW leaderboard_top100 AS
SELECT 
  bs.id,
  bs.username,
  bs.score,
  bs.image_url,
  bs.created_at,
  ROW_NUMBER() OVER (ORDER BY bs.score DESC, bs.created_at ASC) as rank
FROM beauty_scores bs
ORDER BY bs.score DESC, bs.created_at ASC
LIMIT 100;
