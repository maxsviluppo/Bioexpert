const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.test_check' });
const sql = neon(process.env.NEON_DATABASE_URL);

async function testHealthyProgram() {
    try {
        const users = await sql`SELECT username FROM users LIMIT 1`;
        const username = users[0].username;

        let plantId;
        const plants = await sql`SELECT id FROM user_plants WHERE username = ${username} LIMIT 1`;
        if (plants.length > 0) {
            plantId = plants[0].id.toString(); // Ensure it's a string like from frontend
        } else {
            const [newPlant] = await sql`INSERT INTO user_plants (username, plant_name) VALUES (${username}, 'Healthy Plant') RETURNING id`;
            plantId = newPlant.id.toString();
        }

        console.log("Testing with Plant ID:", plantId);

        // Simulation of api/care-program.ts createProgram logic
        const healthScoreInitial = 80;
        const programType = 'maintenance';
        const totalPhases = 2;
        const estimatedDays = 21;
        const estimatedCompletionDate = new Date();
        estimatedCompletionDate.setDate(estimatedCompletionDate.getDate() + estimatedDays);

        console.log("1. Creating Program...");
        const [program] = await sql`
            INSERT INTO plant_care_programs (
                plant_id, username, program_type, 
                health_score_initial, health_score_current,
                total_phases, estimated_completion_date
            ) VALUES (
                ${plantId}, ${username}, ${programType},
                ${healthScoreInitial}, ${healthScoreInitial},
                ${totalPhases}, ${estimatedCompletionDate}
            )
            RETURNING *
        `;
        console.log("Program created successfuly:", program.id);

        console.log("2. Generating Phases...");
        const phasesData = [
            {
                phase_number: 1, title: 'Ottimizzazione', description: 'Verifica', duration_days: 14, actions: [
                    { type: 'photo_check', frequency: 'weekly', title: 'Check', total: 2 }
                ]
            }
        ];

        const insertedPhases = [];
        for (const phase of phasesData) {
            const [inserted] = await sql`
                INSERT INTO care_program_phases (program_id, phase_number, title, description, duration_days, actions)
                VALUES (${program.id}, ${phase.phase_number}, ${phase.title}, ${phase.description}, ${phase.duration_days}, ${JSON.stringify(phase.actions)})
                RETURNING *
            `;
            insertedPhases.push(inserted);
        }
        console.log("Phases inserted:", insertedPhases.length);

        console.log("3. Creating Checkpoints...");
        let currentDate = new Date();
        let checkpointNumber = 1;

        for (const phase of insertedPhases) {
            const photoCheckActions = phase.actions.filter((a) => a.type === 'photo_check');
            const checksPerPhase = photoCheckActions[0]?.total || 1;
            const daysBetweenChecks = Math.floor(phase.duration_days / checksPerPhase);

            for (let i = 0; i < checksPerPhase; i++) {
                const scheduledDate = new Date(currentDate);
                scheduledDate.setDate(scheduledDate.getDate() + (i * daysBetweenChecks));
                await sql`
                    INSERT INTO care_checkpoints (program_id, phase_id, checkpoint_number, scheduled_date)
                    VALUES (${program.id}, ${phase.id}, ${checkpointNumber}, ${scheduledDate})
                `;
                checkpointNumber++;
            }
            currentDate.setDate(currentDate.getDate() + phase.duration_days);
        }
        console.log("Checkpoints created:", checkpointNumber - 1);
        console.log("✅ ALL STEPS PASSED!");

        // Cleanup
        await sql`DELETE FROM plant_care_programs WHERE id = ${program.id}`;
        console.log("Cleanup done.");

    } catch (err) {
        console.error("❌ TEST FAILED:", err);
    }
}

testHealthyProgram();
