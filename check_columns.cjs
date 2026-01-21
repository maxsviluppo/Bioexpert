require('dotenv').config({ path: '.env.test_check' });
const { Pool } = require('pg');

const connectionString = process.env.NEON_DATABASE_URL;
const pool = new Pool({ connectionString });

async function checkColumns() {
    const client = await pool.connect();
    try {
        const res = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'care_program_phases'
        `);
        console.log("Columns in care_program_phases:");
        res.rows.forEach(r => console.log(`${r.column_name}: ${r.data_type}`));
    } finally {
        client.release();
        pool.end();
    }
}
checkColumns();
