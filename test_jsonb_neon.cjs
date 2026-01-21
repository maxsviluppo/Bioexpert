const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.test_check' });
const sql = neon(process.env.NEON_DATABASE_URL);

async function testJsonb() {
    try {
        const [res] = await sql`SELECT '{"a": 1}'::jsonb as data`;
        console.log("Data type:", typeof res.data);
        console.log("Data value:", res.data);
    } catch (err) {
        console.error(err);
    }
}
testJsonb();
