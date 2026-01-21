require('dotenv').config({ path: '.env.test_check' });
const { Pool } = require('pg');

const connectionString = process.env.NEON_DATABASE_URL;
const pool = new Pool({ connectionString });

async function checkSchema() {
    const client = await pool.connect();
    try {
        const tables = ['plant_care_programs', 'care_program_phases', 'care_checkpoints'];
        for (const table of tables) {
            console.log(`\n--- Schema for ${table} ---`);
            const res = await client.query(`
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns
                WHERE table_name = $1
            `, [table]);
            console.table(res.rows);
        }
    } catch (err) {
        console.error(err);
    } finally {
        client.release();
        pool.end();
    }
}

checkSchema();
