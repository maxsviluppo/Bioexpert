require('dotenv').config({ path: '.env.test_check' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL });

async function checkAll() {
    const tables = ['users', 'user_plants', 'plant_care_programs', 'leaderboard', 'care_events'];
    for (const t of tables) {
        try {
            const res = await pool.query(`SELECT COUNT(*) FROM ${t}`);
            console.log(`Table ${t}: ${res.rows[0].count} rows`);
        } catch (e) {
            console.log(`Table ${t}: Error or not found`);
        }
    }
    pool.end();
}
checkAll();
