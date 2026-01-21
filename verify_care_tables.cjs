require('dotenv').config({ path: '.env.test_check' });
const { Pool } = require('pg');

const connectionString = process.env.NEON_DATABASE_URL;

if (!connectionString) {
    console.error("❌ NEON_DATABASE_URL mancante in .env.test_check");
    process.exit(1);
}

const pool = new Pool({ connectionString });

async function checkTables() {
    console.log("🔌 Connessione al database Neon in corso...");

    try {
        const client = await pool.connect();
        console.log("✅ Connessione riuscita!");

        const res = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);

        const tables = res.rows.map(r => r.table_name);
        console.log("📊 Tabelle esistenti:", tables);

        const requiredTables = ['plant_care_programs', 'care_program_phases', 'care_checkpoints', 'care_program_actions'];
        const missingTables = requiredTables.filter(t => !tables.includes(t));

        if (missingTables.length > 0) {
            console.error("❌ Tabelle mancanti:", missingTables);
        } else {
            console.log("✅ Tutte le tabelle del piano di cura sono presenti.");
        }

        client.release();
        pool.end();

    } catch (err) {
        console.error("❌ ERRORE CRITICO DATABASE:", err);
        process.exit(1);
    }
}

checkTables();
