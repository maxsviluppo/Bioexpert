require('dotenv').config({ path: '.env.test_check' });
const { Pool } = require('pg');

const connectionString = process.env.NEON_DATABASE_URL;
const pool = new Pool({ connectionString });

async function debugCreate() {
    const client = await pool.connect();
    try {
        console.log("1. Finding user...");
        const userRes = await client.query("SELECT username FROM users LIMIT 1");
        const username = userRes.rows[0].username;
        console.log("User:", username);

        console.log("2. Finding/Creating plant...");
        let plantId;
        const plantRes = await client.query("SELECT id FROM user_plants WHERE username = $1 LIMIT 1", [username]);
        if (plantRes.rows.length > 0) {
            plantId = plantRes.rows[0].id;
        } else {
            console.log("Creating dummy plant...");
            const insertPlant = await client.query("INSERT INTO user_plants (username, plant_name) VALUES ($1, 'Test') RETURNING id", [username]);
            plantId = insertPlant.rows[0].id;
        }
        console.log("Plant ID:", plantId);

        console.log("3. Inserting program...");
        const res = await client.query(`
            INSERT INTO plant_care_programs (
                plant_id, username, program_type, 
                health_score_initial, total_phases, estimated_completion_date
            ) VALUES ($1, $2, $3, $4, $5, NOW())
            RETURNING id
        `, [plantId, username, 'maintenance', 80, 2]);
        console.log("Program ID:", res.rows[0].id);

    } catch (err) {
        console.error("CRITICAL ERROR:", err.message);
        console.error("CODE:", err.code);
        console.error("QUERY:", err.query);
        console.error("STACK:", err.stack);
    } finally {
        client.release();
        pool.end();
    }
}

debugCreate();
