require('dotenv').config({ path: '.env.test_check' });
const { Pool } = require('pg');
const connectionString = process.env.NEON_DATABASE_URL;
const pool = new Pool({ connectionString });

async function check() {
    const client = await pool.connect();
    const res = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'plant_care_programs'");
    console.table(res.rows);
    client.release();
    pool.end();
}
check();
