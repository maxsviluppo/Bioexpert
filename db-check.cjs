require('dotenv').config({ path: '.env.test_check' });
const { Pool } = require('pg');

const connectionString = process.env.NEON_DATABASE_URL;

if (!connectionString) {
    console.error("❌ NEON_DATABASE_URL mancante in .env.test_check");
    process.exit(1);
}

const pool = new Pool({ connectionString });

async function checkAndResetDB() {
    console.log("🔌 Connessione al database Neon in corso...");

    try {
        const client = await pool.connect();
        console.log("✅ Connessione riuscita!");

        // 1. Verifica tabelle esistenti
        const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
        console.log("📊 Tabelle esistenti:", res.rows.map(r => r.table_name));

        // 2. Creazione Tabella Users semplificata
        console.log("🛠️ Configurazione tabella 'users' semplificata...");
        await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        username TEXT PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
        console.log("✅ Tabella 'users' pronta.");

        // 3. Creazione Tabella Beauty Scores
        console.log("🛠️ Configurazione tabella 'beauty_scores'...");
        await client.query(`
      CREATE TABLE IF NOT EXISTS beauty_scores (
        id SERIAL PRIMARY KEY,
        username TEXT REFERENCES users(username),
        score INTEGER NOT NULL,
        image_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
        console.log("✅ Tabella 'beauty_scores' pronta.");

        // 4. Test Inserimento (PING)
        const testUser = "PingUser_" + Math.floor(Math.random() * 1000);
        console.log(`📨 Invio utente di prova: ${testUser}...`);

        await client.query('INSERT INTO users (username) VALUES ($1) ON CONFLICT (username) DO NOTHING', [testUser]);

        const checkUser = await client.query('SELECT * FROM users WHERE username = $1', [testUser]);
        if (checkUser.rows.length > 0) {
            console.log("✅ TEST RIUSCITO: Utente inserito e letto dal database:", checkUser.rows[0]);
        } else {
            console.error("❌ ERRORE: Utente inserito ma non trovato. Qualcosa non va.");
        }

        client.release();
        pool.end();

    } catch (err) {
        console.error("❌ ERRORE CRITICO DATABASE:", err);
        process.exit(1);
    }
}

checkAndResetDB();
