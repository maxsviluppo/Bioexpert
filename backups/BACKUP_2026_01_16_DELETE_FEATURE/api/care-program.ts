// API: Unified Care Program Endpoint
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const { action } = req.query;

    try {
        switch (action) {
            case 'create':
                return await createProgram(req, res);
            case 'get':
                return await getProgram(req, res);
            case 'checkpoint':
                return await completeCheckpoint(req, res);
            default:
                return res.status(400).json({ error: 'Invalid action. Use: create, get, or checkpoint' });
        }
    } catch (error: any) {
        console.error('Care program API error:', error);
        return res.status(500).json({ error: error.message });
    }
}

// ========== CREATE PROGRAM ==========
async function createProgram(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const {
        plantId,
        username,
        healthScoreInitial,
        luxInitial,
        photoInitialUrl,
        plantName,
        scientificName
    } = req.body;

    if (!plantId || !username) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const programType = healthScoreInitial < 60 ? 'recovery' : 'maintenance';
    const totalPhases = programType === 'recovery' ? 4 : 2;
    const luxTargetMin = 500;
    const luxTargetMax = 1000;
    const estimatedDays = programType === 'recovery' ? 52 : 21;
    const estimatedCompletionDate = new Date();
    estimatedCompletionDate.setDate(estimatedCompletionDate.getDate() + estimatedDays);

    const [program] = await sql`
    INSERT INTO plant_care_programs (
      plant_id, username, program_type, 
      health_score_initial, health_score_current,
      lux_initial, lux_current,
      photo_initial_url,
      lux_target_min, lux_target_max,
      total_phases, estimated_completion_date
    ) VALUES (
      ${plantId}, ${username}, ${programType},
      ${healthScoreInitial}, ${healthScoreInitial},
      ${luxInitial}, ${luxInitial},
      ${photoInitialUrl},
      ${luxTargetMin}, ${luxTargetMax},
      ${totalPhases}, ${estimatedCompletionDate}
    )
    RETURNING *
  `;

    const phases = await generateProgramPhases(program.id, programType, plantName, scientificName, healthScoreInitial);
    await createInitialCheckpoints(program.id, phases);

    return res.status(200).json({
        success: true,
        program,
        phases,
        message: `Programma di ${programType === 'recovery' ? 'recupero' : 'mantenimento'} creato con successo!`
    });
}

// ========== GET PROGRAM ==========
async function getProgram(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { plantId, programId } = req.query;

    let program;

    if (programId) {
        [program] = await sql`SELECT * FROM plant_care_programs WHERE id = ${programId as string}`;
    } else if (plantId) {
        [program] = await sql`
      SELECT * FROM plant_care_programs 
      WHERE plant_id = ${plantId as string} AND status = 'active'
      ORDER BY created_at DESC LIMIT 1
    `;
    } else {
        return res.status(400).json({ error: 'Missing plantId or programId' });
    }

    if (!program) {
        return res.status(404).json({ error: 'Program not found', hasProgram: false });
    }

    const phases = await sql`
    SELECT * FROM care_program_phases 
    WHERE program_id = ${program.id}
    ORDER BY phase_number ASC
  `;

    const checkpoints = await sql`
    SELECT * FROM care_checkpoints 
    WHERE program_id = ${program.id}
    ORDER BY checkpoint_number ASC
  `;

    const completedCheckpoints = checkpoints.filter((c: any) => c.is_completed).length;
    const nextCheckpoint = checkpoints.find((c: any) => !c.is_completed);
    const currentPhase = phases.find((p: any) => p.phase_number === program.current_phase);
    const completionPercentage = Math.round((program.current_phase / program.total_phases) * 100);
    const healthImprovement = program.health_score_current - program.health_score_initial;

    return res.status(200).json({
        success: true,
        program: { ...program, completionPercentage, healthImprovement },
        phases,
        checkpoints,
        currentPhase,
        nextCheckpoint,
        stats: {
            completedCheckpoints,
            totalCheckpoints: checkpoints.length,
            completionPercentage,
            healthImprovement,
            daysActive: Math.floor((Date.now() - new Date(program.start_date).getTime()) / (1000 * 60 * 60 * 24))
        }
    });
}

// ========== COMPLETE CHECKPOINT ==========
async function completeCheckpoint(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { checkpointId, photoBase64, luxReading, aiAnalysis, userNotes } = req.body;

    if (!checkpointId || !photoBase64) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const photoUrl = photoBase64;
    const healthScore = aiAnalysis?.healthScore || 50;
    const improvements = aiAnalysis?.improvements || [];
    const recommendations = aiAnalysis?.recommendations || '';

    const [checkpoint] = await sql`
    UPDATE care_checkpoints 
    SET 
      photo_url = ${photoUrl},
      lux_reading = ${luxReading},
      health_score = ${healthScore},
      ai_analysis = ${JSON.stringify(aiAnalysis)},
      ai_recommendations = ${recommendations},
      improvements_detected = ${improvements},
      user_notes = ${userNotes || ''},
      is_completed = TRUE,
      completed_at = NOW()
    WHERE id = ${checkpointId}
    RETURNING *
  `;

    const [program] = await sql`SELECT * FROM plant_care_programs WHERE id = ${checkpoint.program_id}`;

    await sql`
    UPDATE plant_care_programs 
    SET health_score_current = ${healthScore}, lux_current = ${luxReading}, updated_at = NOW()
    WHERE id = ${checkpoint.program_id}
  `;

    const [phaseCheckpoints] = await sql`
    SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE is_completed = TRUE) as completed
    FROM care_checkpoints 
    WHERE phase_id = ${checkpoint.phase_id}
  `;

    let phaseCompleted = false;
    if (phaseCheckpoints.total === phaseCheckpoints.completed) {
        await sql`UPDATE care_program_phases SET is_completed = TRUE, completed_at = NOW() WHERE id = ${checkpoint.phase_id}`;

        if (program.current_phase < program.total_phases) {
            await sql`UPDATE plant_care_programs SET current_phase = current_phase + 1 WHERE id = ${program.id}`;
            phaseCompleted = true;
        } else {
            await sql`UPDATE plant_care_programs SET status = 'completed', completed_at = NOW() WHERE id = ${program.id}`;
        }
    }

    return res.status(200).json({
        success: true,
        checkpoint,
        healthScore,
        luxReading,
        improvements,
        phaseCompleted,
        programCompleted: program.current_phase >= program.total_phases,
        message: phaseCompleted ? '🎉 Fase completata! Passiamo alla prossima.' : '✅ Checkpoint completato!'
    });
}

// ========== HELPER FUNCTIONS ==========
async function generateProgramPhases(programId: string, programType: string, plantName: string, scientificName: string, healthScore: number) {
    const phases = programType === 'recovery' ? [
        {
            phase_number: 1, title: 'Stabilizzazione', description: 'Fase critica per stabilizzare la pianta e fermare il deterioramento', duration_days: 7, actions: [
                { type: 'water', frequency: 'daily', title: 'Irrigazione controllata', total: 7 },
                { type: 'photo_check', frequency: 'every_3_days', title: 'Check fotografico', total: 2 },
                { type: 'prune', frequency: 'once', title: 'Rimozione parti malate', total: 1 }
            ]
        },
        {
            phase_number: 2, title: 'Ripresa Vegetativa', description: 'Stimolare la crescita di nuove foglie e radici', duration_days: 14, actions: [
                { type: 'water', frequency: 'every_2_days', title: 'Irrigazione regolare', total: 7 },
                { type: 'fertilize', frequency: 'weekly', title: 'Concimazione leggera', total: 2 },
                { type: 'photo_check', frequency: 'weekly', title: 'Check fotografico', total: 2 }
            ]
        },
        {
            phase_number: 3, title: 'Consolidamento', description: 'Rafforzare la pianta e consolidare i miglioramenti', duration_days: 21, actions: [
                { type: 'water', frequency: 'every_3_days', title: 'Irrigazione standard', total: 7 },
                { type: 'fertilize', frequency: 'biweekly', title: 'Concimazione normale', total: 1 },
                { type: 'prune', frequency: 'once', title: 'Potatura formativa', total: 1 },
                { type: 'photo_check', frequency: 'biweekly', title: 'Check fotografico', total: 1 }
            ]
        },
        {
            phase_number: 4, title: 'Mantenimento', description: 'Routine di cura standard per mantenere la salute ottimale', duration_days: 10, actions: [
                { type: 'water', frequency: 'as_needed', title: 'Irrigazione al bisogno', total: 3 },
                { type: 'photo_check', frequency: 'monthly', title: 'Check fotografico', total: 1 }
            ]
        }
    ] : [
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
        const [inserted] = await sql`
      INSERT INTO care_program_phases (program_id, phase_number, title, description, duration_days, actions)
      VALUES (${programId}, ${phase.phase_number}, ${phase.title}, ${phase.description}, ${phase.duration_days}, ${JSON.stringify(phase.actions)})
      RETURNING *
    `;
        insertedPhases.push(inserted);
    }
    return insertedPhases;
}

async function createInitialCheckpoints(programId: string, phases: any[]) {
    let currentDate = new Date();
    let checkpointNumber = 1;

    for (const phase of phases) {
        const photoCheckActions = phase.actions.filter((a: any) => a.type === 'photo_check');
        const checksPerPhase = photoCheckActions[0]?.total || 1;
        const daysBetweenChecks = Math.floor(phase.duration_days / checksPerPhase);

        for (let i = 0; i < checksPerPhase; i++) {
            const scheduledDate = new Date(currentDate);
            scheduledDate.setDate(scheduledDate.getDate() + (i * daysBetweenChecks));
            await sql`
        INSERT INTO care_checkpoints (program_id, phase_id, checkpoint_number, scheduled_date)
        VALUES (${programId}, ${phase.id}, ${checkpointNumber}, ${scheduledDate})
      `;
            checkpointNumber++;
        }
        currentDate.setDate(currentDate.getDate() + phase.duration_days);
    }
}
