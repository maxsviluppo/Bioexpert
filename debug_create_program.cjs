require('dotenv').config({ path: '.env.test_check' });
const { Pool } = require('pg');

const connectionString = process.env.NEON_DATABASE_URL;
const pool = new Pool({ connectionString });

async function debugCreate() {
    console.log("🔌 Connessione DB...");
    const client = await pool.connect();

    try {
        // 1. Trova un utente e una pianta
        const userRes = await client.query("SELECT username FROM users LIMIT 1");
        if (userRes.rows.length === 0) {
            console.error("No users found");
            return;
        }
        const username = userRes.rows[0].username;

        // Find a plant for this user or any user
        const plantRes = await client.query("SELECT id, plant_name, scientific_name FROM user_plants WHERE username = $1 LIMIT 1", [username]);

        let plantId, plantName, scientificName;
        if (plantRes.rows.length === 0) {
            // Create a dummy plant
            console.log("Creating dummy plant...");
            const insertPlant = await client.query(`
                INSERT INTO user_plants (username, plant_name, scientific_name) 
                VALUES ($1, 'Test Plant', 'Testus Plantus') RETURNING id`, [username]);
            plantId = insertPlant.rows[0].id;
            plantName = 'Test Plant';
            scientificName = 'Testus Plantus';
        } else {
            plantId = plantRes.rows[0].id;
            plantName = plantRes.rows[0].plant_name;
            scientificName = plantRes.rows[0].scientific_name;
        }

        console.log(`Testing for User: ${username}, Plant: ${plantId} (${plantName})`);

        // 2. Simulate Create Program (Maintenance - Healthy)
        const healthScoreInitial = 80;
        const luxInitial = 500;
        const photoInitialUrl = "test_url";

        const programType = healthScoreInitial < 60 ? 'recovery' : 'maintenance'; // 'maintenance'
        const totalPhases = programType === 'recovery' ? 4 : 2;
        const luxTargetMin = 500;
        const luxTargetMax = 1000;
        const estimatedDays = programType === 'recovery' ? 52 : 21;
        const estimatedCompletionDate = new Date();
        estimatedCompletionDate.setDate(estimatedCompletionDate.getDate() + estimatedDays);

        console.log(`Creating program type: ${programType}`);

        const insertProgramQuery = `
            INSERT INTO plant_care_programs (
              plant_id, username, program_type, 
              health_score_initial, health_score_current,
              lux_initial, lux_current,
              photo_initial_url,
              lux_target_min, lux_target_max,
              total_phases, estimated_completion_date
            ) VALUES (
              $1, $2, $3,
              $4, $5,
              $6, $7,
              $8,
              $9, $10,
              $11, $12
            )
            RETURNING *
        `;

        const values = [
            plantId, username, programType,
            healthScoreInitial, healthScoreInitial,
            luxInitial, luxInitial,
            photoInitialUrl,
            luxTargetMin, luxTargetMax,
            totalPhases, estimatedCompletionDate
        ];

        console.error("DEBUG: Plant ID used:", plantId);
        console.error("DEBUG: Values array:", JSON.stringify(values, null, 2));
        console.error("DEBUG: Executing Program Insert...");
        const programRes = await client.query(insertProgramQuery, values);
        const program = programRes.rows[0];
        console.log("Program created:", program.id);

        // 3. Generate Phases
        console.log("Generating Phases...");
        const phases = [
            {
                phase_number: 1, title: 'Ottimizzazione', description: 'Verificare e ottimizzare le condizioni di crescita', duration_days: 14, actions: [
                    { type: 'photo_check', frequency: 'weekly', title: 'Check fotografico', total: 2 },
                    { type: 'water', frequency: 'as_needed', title: 'Irrigazione calibrata', total: 4 },
                    { type: 'relocate', frequency: 'once', title: 'Verifica posizione/lux', total: 1 }
                ]
            },
            {
                phase_number: 2, title: 'Mantenimento', description: 'Routine standard per pianta in salute', duration_days: 7, actions: [
                    { type: 'water', frequency: 'as_needed', title: 'Irrigazione standard', total: 2 },
                    { type: 'photo_check', frequency: 'monthly', title: 'Check mensile', total: 1 }
                ]
            }
        ];

        const insertedPhases = [];
        for (const phase of phases) {
            const phaseQuery = `
               INSERT INTO care_program_phases (program_id, phase_number, title, description, duration_days, actions)
               VALUES ($1, $2, $3, $4, $5, $6)
               RETURNING *
             `;
            const pRes = await client.query(phaseQuery, [program.id, phase.phase_number, phase.title, phase.description, phase.duration_days, JSON.stringify(phase.actions)]);
            insertedPhases.push(pRes.rows[0]);
        }
        console.log(`Created ${insertedPhases.length} phases`);

        // 4. Checkpoints
        console.log("Creating checkpoints...");
        let currentDate = new Date();
        let checkpointNumber = 1;

        for (const phase of insertedPhases) {
            const photoCheckActions = phase.actions.filter(a => a.type === 'photo_check');
            // Bug potential: actions is coming from DB as object, assuming pg parses jsonb automatically. 
            // pg driver parses jsonb to object automatically.

            const checksPerPhase = photoCheckActions[0]?.total || 1;
            const daysBetweenChecks = Math.floor(phase.duration_days / checksPerPhase);

            for (let i = 0; i < checksPerPhase; i++) {
                const scheduledDate = new Date(currentDate);
                scheduledDate.setDate(scheduledDate.getDate() + (i * daysBetweenChecks));

                await client.query(`
                    INSERT INTO care_checkpoints (program_id, phase_id, checkpoint_number, scheduled_date)
                    VALUES ($1, $2, $3, $4)
                 `, [program.id, phase.id, checkpointNumber, scheduledDate]);
                checkpointNumber++;
            }
            currentDate.setDate(currentDate.getDate() + phase.duration_days);
        }
        console.log(`Checkpoints created successfully. Total: ${checkpointNumber - 1}`);
        console.log("✅ SUCCESS: Program created correctly in DB.");

        // Cleanup
        await client.query("DELETE FROM plant_care_programs WHERE id = $1", [program.id]);
        console.log("Cleanup done.");

    } catch (err) {
        console.error("❌ ERROR caught:", err);
    } finally {
        client.release();
        pool.end();
    }
}

debugCreate();
