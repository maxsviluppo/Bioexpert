require('dotenv').config({ path: '.env.test_check' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL });

async function check() {
    const res = await pool.query("SELECT COUNT(*) FROM users");
    console.log("Users count:", res.rows[0].count);
    pool.end();
}
check();
