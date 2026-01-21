require('dotenv').config({ path: '.env.test_check' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL });

async function migrate() {
    const client = await pool.connect();
    try {
        console.log("Starting migration...");
        await client.query('BEGIN');

        console.log("1. Dropping view and changing plant_id to VARCHAR in plant_care_programs...");
        await client.query('DROP VIEW IF EXISTS active_care_programs');
        await client.query('ALTER TABLE plant_care_programs ALTER COLUMN plant_id TYPE VARCHAR(100)');

        console.log("2. Updating active_care_programs view...");
        await client.query(`
            CREATE OR REPLACE VIEW active_care_programs AS
            SELECT 
              p.id,
              p.plant_id,
              p.username,
              p.status,
              p.current_phase,
              p.total_phases,
              p.health_score_initial,
              p.health_score_current,
              (p.health_score_current - p.health_score_initial) as health_improvement,
              ROUND((p.current_phase::numeric / p.total_phases::numeric) * 100) as completion_percentage,
              up.plant_name,
              up.scientific_name,
              up.image_url,
              (SELECT COUNT(*) FROM care_checkpoints WHERE program_id = p.id AND is_completed = TRUE) as completed_checkpoints,
              (SELECT COUNT(*) FROM care_checkpoints WHERE program_id = p.id) as total_checkpoints,
              p.start_date,
              p.estimated_completion_date
            FROM plant_care_programs p
            JOIN user_plants up ON (
                CASE 
                    WHEN p.plant_id ~ '^[0-9]+$' THEN p.plant_id::integer = up.id
                    ELSE FALSE
                END
            )
            WHERE p.status = 'active'
        `);

        console.log("3. Ensuring ai_analysis is JSONB in care_checkpoints...");
        // This is safe because existing data should be JSON strings or null
        await client.query('ALTER TABLE care_checkpoints ALTER COLUMN ai_analysis TYPE JSONB USING ai_analysis::jsonb');

        await client.query('COMMIT');
        console.log("✅ Migration successful!");

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("❌ Migration failed:", err.message);
    } finally {
        client.release();
        pool.end();
    }
}

migrate();
