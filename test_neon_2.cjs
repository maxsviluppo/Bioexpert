const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.test_check' });

const sql = neon(process.env.NEON_DATABASE_URL);

async function testNeon() {
    try {
        const users = await sql`SELECT username FROM users LIMIT 1`;
        const username = users[0].username;

        let plantId;
        const plants = await sql`SELECT id FROM user_plants WHERE username = ${username} LIMIT 1`;
        if (plants.length > 0) {
            plantId = plants[0].id;
        } else {
            const [newPlant] = await sql`INSERT INTO user_plants (username, plant_name) VALUES (${username}, 'Test') RETURNING id`;
            plantId = newPlant.id;
        }

        console.log("Plant ID value:", plantId);
        console.log("Plant ID type:", typeof plantId);

        try {
            await sql`
                INSERT INTO plant_care_programs (
                    plant_id, username, program_type, 
                    health_score_initial, total_phases, estimated_completion_date
                ) VALUES (${plantId}, ${username}, 'maintenance', 80, 2, NOW())
            `;
            console.log("Success!");
        } catch (innerErr) {
            console.error("FAILED INSERT:", innerErr.message);
            console.error("DETAIL:", innerErr.detail);
            console.error("WHERE:", innerErr.where);
        }

    } catch (err) {
        console.error("OUTER ERROR:", err);
    }
}

testNeon();
