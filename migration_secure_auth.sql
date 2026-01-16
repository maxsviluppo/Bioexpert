-- ============================================
-- BIOEXPERT - SECURE AUTH MIGRATION
-- Data: 13 Gennaio 2026
-- Versione: 3.0.0
-- ============================================

-- ATTENZIONE: Questo script elimina TUTTI i dati utente esistenti!
-- Eseguire solo se si è sicuri del reset completo.

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
-- Il database è ora pronto per il nuovo sistema di autenticazione sicuro.
