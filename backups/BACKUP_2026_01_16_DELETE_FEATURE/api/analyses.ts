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
        // GET: Recupera cronologia analisi
        if (request.method === 'GET') {
            const { username } = request.query;
            if (!username) return response.status(400).json({ error: 'Username required' });

            const result = await pool.query(`
                SELECT * FROM user_analyses 
                WHERE username = $1 
                ORDER BY created_at DESC
                LIMIT 100
            `, [username]);

            return response.status(200).json({ success: true, data: result.rows });
        }

        // POST: Salva nuova analisi
        if (request.method === 'POST') {
            const body = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
            const { username, analysis_data } = body;

            if (!username || !analysis_data) {
                return response.status(400).json({ error: 'Dati mancanti' });
            }

            // Ensure table exists (lazy migration)
            await pool.query(`
                CREATE TABLE IF NOT EXISTS user_analyses (
                    id SERIAL PRIMARY KEY,
                    username VARCHAR(50) NOT NULL,
                    analysis_data JSONB NOT NULL,
                    created_at TIMESTAMP DEFAULT NOW()
                )
            `);

            await pool.query(`
                CREATE INDEX IF NOT EXISTS idx_user_analyses_username 
                ON user_analyses(username)
            `);

            const result = await pool.query(`
                INSERT INTO user_analyses (username, analysis_data)
                VALUES ($1, $2)
                RETURNING *
            `, [username, JSON.stringify(analysis_data)]);

            // Cleanup: mantieni solo le ultime 100 analisi per utente
            await pool.query(`
                DELETE FROM user_analyses
                WHERE username = $1
                AND id NOT IN (
                    SELECT id FROM user_analyses
                    WHERE username = $1
                    ORDER BY created_at DESC
                    LIMIT 100
                )
            `, [username]);

            return response.status(200).json({ success: true, data: result.rows[0] });
        }

        return response.status(405).json({ error: 'Method not allowed' });

    } catch (e) {
        console.error('API Analyses Error:', e);
        return response.status(500).json({ success: false, error: e.message });
    } finally {
        await pool.end();
    }
}
