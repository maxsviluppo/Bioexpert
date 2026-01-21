const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.test_check' });

const sql = neon(process.env.NEON_DATABASE_URL);

async function testNeon() {
    try {
        console.log("1. Finding user...");
        const users = await sql`SELECT username FROM users LIMIT 1`;
        if (users.length === 0) {
            console.error("No users found");
            return;
        }
        const username = users[0].username;
        console.log("User:", username);

        console.log("2. Finding/Creating plant...");
        let plantId;
        const plants = await sql`SELECT id FROM user_plants WHERE username = ${username} LIMIT 1`;
        if (plants.length > 0) {
            plantId = plants[0].id;
        } else {
            console.log("Creating dummy plant...");
            const [newPlant] = await sql`INSERT INTO user_plants (username, plant_name) VALUES (${username}, 'Test') RETURNING id`;
            plantId = newPlant.id;
        }
        console.log("Plant ID:", plantId);

        console.log("3. Inserting program...");
        // This is where it failed in debug_simple.cjs with 22P02
        try {
            const [program] = await sql`
                INSERT INTO plant_care_programs (
                    plant_id, username, program_type, 
                    health_score_initial, total_phases, estimated_completion_date
                ) VALUES (${plantId}, ${username}, 'maintenance', 80, 2, NOW())
                RETURNING id
            `;
            console.log("Program ID:", program.id);

            // Cleanup
            await sql`DELETE FROM plant_care_programs WHERE id = ${program.id}`;
            console.log("Cleanup done.");
        } catch (innerErr) {
            console.error("INNER ERROR (Program Insert):", innerErr);
        }

    } catch (err) {
        console.error("OUTER ERROR:", err);
    }
}

testNeon();
