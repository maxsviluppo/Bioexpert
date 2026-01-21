require('dotenv').config({ path: '.env.test_check' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL });

async function checkConstraints() {
    try {
        const res = await pool.query(`
            SELECT 
                conname as constraint_name, 
                pg_get_constraintdef(c.oid) as constraint_definition
            FROM pg_constraint c
            JOIN pg_namespace n ON n.oid = c.connamespace
            WHERE conrelid = 'plant_care_programs'::regclass
        `);
        res.rows.forEach(row => {
            console.log(`Constraint: ${row.constraint_name}`);
            console.log(`Definition: ${row.constraint_definition}`);
            console.log('---');
        });
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}
checkConstraints();
