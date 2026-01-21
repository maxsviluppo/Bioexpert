require('dotenv').config({ path: '.env.test_check' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL });

async function check() {
    const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users'");
    console.table(res.rows);
    pool.end();
}
check();
