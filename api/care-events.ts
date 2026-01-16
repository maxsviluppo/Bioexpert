import pg from 'pg';
const { Pool } = pg;

export const config = {
    runtime: 'nodejs',
};

export default async function handler(request, response) {
    const connectionString = process.env.NEON_DATABASE_URL || process.env.POSTGRES_URL;
    if (!connectionString) return response.status(500).json({ error: 'DB Config Missing' });

    const pool = new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        if (request.method === 'GET') {
            const { plant_id } = request.query;
            if (!plant_id) return response.status(400).json({ error: 'Plant ID required' });

            const result = await pool.query('SELECT * FROM care_events WHERE plant_id = $1 ORDER BY created_at DESC', [plant_id]);
            return response.status(200).json({ success: true, data: result.rows });
        }

        if (request.method === 'POST') {
            const body = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
            const { plant_id, username, event_type, notes } = body;

            if (!plant_id || !username || !event_type) return response.status(400).json({ error: 'Dati mancanti' });

            await pool.query('BEGIN');

            // 1. Inserisci evento
            const eventResult = await pool.query(
                'INSERT INTO care_events (plant_id, username, event_type, notes) VALUES ($1, $2, $3, $4) RETURNING *',
                [plant_id, username, event_type, notes || '']
            );

            // 2. Aggiorna last_care_at sulla pianta
            await pool.query('UPDATE user_plants SET last_care_at = NOW() WHERE id = $1', [plant_id]);

            await pool.query('COMMIT');

            return response.status(200).json({ success: true, data: eventResult.rows[0] });
        }

        if (request.method === 'DELETE') {
            const { id } = request.query;
            if (!id) return response.status(400).json({ error: 'Event ID required' });

            await pool.query('DELETE FROM care_events WHERE id = $1', [id]);
            return response.status(200).json({ success: true });
        }

        return response.status(405).json({ error: 'Method not allowed' });

    } catch (e) {
        await pool.query('ROLLBACK');
        console.error('API Care Events Error:', e);
        return response.status(500).json({ success: false, error: e.message });
    } finally {
        await pool.end();
    }
}
