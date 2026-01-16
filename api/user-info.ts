import pg from 'pg';
const { Pool } = pg;

export const config = {
    runtime: 'nodejs',
};

export default async function handler(request, response) {
    if (request.method !== 'GET' && request.method !== 'POST') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    const connectionString = process.env.NEON_DATABASE_URL || process.env.POSTGRES_URL;
    if (!connectionString) return response.status(500).json({ error: 'DB Config Missing' });

    const pool = new Pool({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        if (request.method === 'GET') {
            const { username } = request.query;
            if (!username) return response.status(400).json({ error: 'Username required' });

            const result = await pool.query('SELECT xp, level FROM users WHERE username = $1', [username]);

            if (result.rows.length === 0) {
                // Utente non trovato. Con AUTH SICURA non possiamo crearlo automaticamente qui.
                // Ritorniamo default senza salvare nulla.
                return response.status(200).json({ xp: 0, level: 1 });
            }

            return response.status(200).json(result.rows[0]);
        }

        if (request.method === 'POST') {
            const body = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
            const { username, xp, level } = body;

            if (!username) return response.status(400).json({ error: 'Username required' });

            // Aggiorna XP e Level SOLO se l'utente esiste
            const check = await pool.query('SELECT id FROM users WHERE username = $1', [username]);

            if (check.rows.length === 0) {
                 // Utente non esiste? Non facciamo nulla. Deve registrarsi.
                 return response.status(404).json({ error: 'User not found' });
            } else {
                await pool.query('UPDATE users SET xp = $1, level = $2 WHERE username = $3', [xp, level, username]);
            }

            return response.status(200).json({ success: true });
        }

    } catch (error) {
        console.error('User Info Error:', error);
        return response.status(500).json({ success: false, error: error.message });
    } finally {
        await pool.end();
    }
}
